"""
count_repetitions.py
--------------------
Counts exercise repetitions using peak detection on filtered sensor signals.
Each exercise uses a tuned cutoff frequency and sensor column.

Usage:
    from ml.features.count_repetitions import count_reps, count_reps_for_set
"""

import os
import sys
import numpy as np
import pandas as pd
from scipy.signal import argrelextrema

sys.path.insert(0, os.path.dirname(__file__))
from DataTransformation import LowPassFilter


# ── Config ────────────────────────────────────────────────────────────────────
FS = 1000 / 200   # 5 Hz

# Per-exercise tuning: (cutoff_hz, column, use_minima)
# use_minima=True  → count valleys (deadlift, ohp)
# use_minima=False → count peaks   (everything else)
EXERCISE_CONFIG = {
    "bench": {"cutoff": 0.4,  "column": "acc_r", "use_minima": False},
    "squat": {"cutoff": 0.35, "column": "acc_r", "use_minima": False},
    "row":   {"cutoff": 0.65, "column": "gyr_x", "use_minima": False},
    "ohp":   {"cutoff": 0.35, "column": "acc_r", "use_minima": True},
    "dead":  {"cutoff": 0.4,  "column": "acc_r", "use_minima": True},
}

DEFAULT_CONFIG = {"cutoff": 0.4, "column": "acc_r", "use_minima": False}

_lowpass = LowPassFilter()


# ── Core function ─────────────────────────────────────────────────────────────

def count_reps(
    dataset:    pd.DataFrame,
    cutoff:     float = 0.4,
    order:      int   = 10,
    column:     str   = "acc_r",
    use_minima: bool  = False,
) -> int:
    """
    Count repetitions in a single exercise set using peak/valley detection.

    Steps:
      1. Apply Butterworth low-pass filter to smooth the signal
      2. Find local maxima (or minima) in the filtered signal
      3. Return the count

    Args:
        dataset    : DataFrame for one exercise set (must contain `column`)
        cutoff     : Low-pass filter cutoff frequency in Hz
        order      : Butterworth filter order
        column     : Sensor column to analyse
        use_minima : If True, count valleys instead of peaks (for deadlift/OHP)

    Returns:
        int: Number of detected repetitions
    """
    # Add acc_r / gyr_r if missing
    if "acc_r" not in dataset.columns:
        dataset = dataset.copy()
        dataset["acc_r"] = np.sqrt(
            dataset["acc_x"]**2 + dataset["acc_y"]**2 + dataset["acc_z"]**2
        )
    if "gyr_r" not in dataset.columns:
        dataset = dataset.copy()
        dataset["gyr_r"] = np.sqrt(
            dataset["gyr_x"]**2 + dataset["gyr_y"]**2 + dataset["gyr_z"]**2
        )

    data = _lowpass.low_pass_filter(
        dataset.copy(), col=column,
        sampling_frequency=FS,
        cutoff_frequency=cutoff,
        order=order,
    )

    signal = data[column + "_lowpass"].values

    if use_minima:
        indexes = argrelextrema(signal, np.less)[0]
    else:
        indexes = argrelextrema(signal, np.greater)[0]

    return len(indexes)

def evaluate_reps(
    dataset:    pd.DataFrame,
    cutoff:     float = 0.4,
    order:      int   = 10,
    column:     str   = "acc_r",
    use_minima: bool  = False,
) -> tuple[int, list, list]:
    """
    Extends count_reps to also calculate Rep metrics (Form Score, Rhythm).
    Returns (rep_count, rep_details_list, rhythm_waveform)
    """
    if dataset.empty:
        return 0, [], []

    # Add acc_r / gyr_r if missing
    if "acc_r" not in dataset.columns:
        dataset = dataset.copy()
        dataset["acc_r"] = np.sqrt(dataset["acc_x"]**2 + dataset["acc_y"]**2 + dataset["acc_z"]**2)
    if "gyr_r" not in dataset.columns:
        dataset = dataset.copy()
        dataset["gyr_r"] = np.sqrt(dataset["gyr_x"]**2 + dataset["gyr_y"]**2 + dataset["gyr_z"]**2)

    data = _lowpass.low_pass_filter(dataset.copy(), col=column, sampling_frequency=FS, cutoff_frequency=cutoff, order=order)
    signal = data[column + "_lowpass"].values

    if use_minima:
        indexes = argrelextrema(signal, np.less)[0]
    else:
        indexes = argrelextrema(signal, np.greater)[0]

    rep_count = len(indexes)
    if rep_count == 0:
        return 0, [], []

    # Extract amplitudes
    amplitudes = signal[indexes]
    median_amp = np.median(amplitudes)
    
    # Extract durations/rhythm (sample distance between peaks)
    # The first rep duration is estimated as the time from the start until the first peak
    durations = []
    durations.append(indexes[0])
    for i in range(1, rep_count):
        durations.append(indexes[i] - indexes[i-1])
    median_dur = np.median(durations) if durations else 1

    rep_details = []
    for i in range(rep_count):
        amp = amplitudes[i]
        dur = durations[i]
        
        # Form Score (amplitude variance)
        amp_diff = abs(amp - median_amp)
        # normalize against typical range. Say max expected is median_amp * 2
        form_loss = min((amp_diff / (abs(median_amp) + 1e-6)) * 100 * 2, 50)
        form_score = max(50, 100 - form_loss)
        
        # Rhythm Score (duration variance)
        dur_diff = abs(dur - median_dur)
        rhythm_loss = min((dur_diff / (median_dur + 1e-6)) * 100 * 3, 50)
        rhythm_score = max(50, 100 - rhythm_loss)
        
        rep_details.append({
            "rep": i + 1,
            "score": round(form_score, 1),
            "rhythm": round(rhythm_score, 1),
            "peak_index": int(indexes[i])
        })

    # Downsample signal to exactly ~60 points for waveform charting
    n = len(signal)
    target = 60
    rhythm_waveform = []
    if n > 0:
        step = max(1, n // target)
        for i in range(0, n, step):
            if len(rhythm_waveform) < target:
                point_val = float(signal[i])
                rhythm_waveform.append({
                    "time": len(rhythm_waveform),
                    "ideal": float(median_amp),
                    "actual": point_val
                })

    return rep_count, rep_details, rhythm_waveform


def count_reps_for_set(dataset: pd.DataFrame) -> int:
    """
    Auto-detect exercise type from the dataset label and apply the correct config.

    Args:
        dataset: DataFrame for a single exercise set

    Returns:
        int: Detected rep count
    """
    if dataset.empty:
        return 0

    label  = dataset["label"].iloc[0].lower()
    config = EXERCISE_CONFIG.get(label, DEFAULT_CONFIG)

    return count_reps(
        dataset,
        cutoff     = config["cutoff"],
        column     = config["column"],
        use_minima = config["use_minima"],
    )

def evaluate_reps_for_set(dataset: pd.DataFrame) -> tuple[int, list, list]:
    if dataset.empty:
        return 0, [], []
    label  = dataset["label"].iloc[0].lower()
    config = EXERCISE_CONFIG.get(label, DEFAULT_CONFIG)
    return evaluate_reps(
        dataset,
        cutoff     = config["cutoff"],
        column     = config["column"],
        use_minima = config["use_minima"],
    )


def count_all_sets(df: pd.DataFrame) -> pd.DataFrame:
    """
    Run rep counting across all sets in a DataFrame and return a summary.

    Returns:
        pd.DataFrame with columns: [label, category, set, reps_actual, reps_predicted]
    """
    df = df[df["label"] != "rest"].copy()

    # Add magnitude columns if missing
    if "acc_r" not in df.columns:
        df["acc_r"] = np.sqrt(df["acc_x"]**2 + df["acc_y"]**2 + df["acc_z"]**2)
    if "gyr_r" not in df.columns:
        df["gyr_r"] = np.sqrt(df["gyr_x"]**2 + df["gyr_y"]**2 + df["gyr_z"]**2)

    # Ground truth: heavy=5 reps, medium=10 reps
    df["reps_actual"] = df["category"].apply(lambda x: 5 if x == "heavy" else 10)

    summary = df.groupby(["label", "category", "set"])["reps_actual"].max().reset_index()
    summary["reps_predicted"] = 0

    for s in df["set"].unique():
        subset = df[df["set"] == s]
        predicted = count_reps_for_set(subset)
        summary.loc[summary["set"] == s, "reps_predicted"] = predicted

    return summary


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    data_path = os.path.join(os.path.dirname(__file__), "../../data/interim/01_data_processed.pkl")
    if os.path.exists(data_path):
        df = pd.read_pickle(data_path)
        summary = count_all_sets(df)
        print(summary)
        mae = (summary["reps_actual"] - summary["reps_predicted"]).abs().mean()
        print(f"\nMean Absolute Error: {mae:.2f} reps")
    else:
        print(f"Data file not found: {data_path}")
        print("Run make_dataset.py first.")
