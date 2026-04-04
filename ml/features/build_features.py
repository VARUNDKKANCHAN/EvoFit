"""
build_features.py
-----------------
Transforms cleaned sensor data into a rich feature set ready for ML training.

Steps:
  1. Impute missing values (linear interpolation)
  2. Calculate set duration
  3. Butterworth low-pass filter (noise removal)
  4. Principal Component Analysis (PCA)
  5. Scalar magnitudes  (acc_r, gyr_r)
  6. Temporal features  (rolling mean + std)
  7. Frequency features (Fourier Transform)
  8. K-Means clustering
  9. Drop overlapping windows & NaN rows

Usage:
    python build_features.py
    or: from ml.features.build_features import build_features
"""

import os
import sys
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans

# Make sure sibling modules are importable when run directly
sys.path.insert(0, os.path.dirname(__file__))

from DataTransformation import LowPassFilter, PrincipalComponentAnalysis
from TemporalAbstraction import NumericalAbstraction
from FrequencyAbstraction import FourierTransformation


# ── Config ────────────────────────────────────────────────────────────────────
INTERIM_PATH    = os.path.join(os.path.dirname(__file__), "../../data/interim/")
INPUT_FILENAME  = "02_outliers_removed_chauvenets.pkl"
OUTPUT_FILENAME = "03_data_feature.pkl"

BASE_SENSOR_COLS = ["acc_x", "acc_y", "acc_z", "gyr_x", "gyr_y", "gyr_z"]

FS          = 1000 / 200    # sampling frequency  (5 Hz)
LPF_CUTOFF  = 1.3           # Butterworth cutoff  (Hz)
LPF_ORDER   = 5
WS_TEMPORAL = int(1000/200) # temporal window size (5 samples = 1 second)
WS_FREQ     = int(2800/200) # frequency window     (14 samples = 2.8 s)
N_CLUSTERS  = 5
CLUSTER_COLS = ["acc_x", "acc_y", "acc_z"]
N_PCA_COMPONENTS = 3


# ── Step helpers ──────────────────────────────────────────────────────────────

def impute_missing(df: pd.DataFrame, columns: list[str]) -> pd.DataFrame:
    """Linear interpolation per column to fill NaN left by outlier removal."""
    for col in columns:
        df[col] = df[col].interpolate()
    return df


def calculate_set_duration(df: pd.DataFrame) -> pd.DataFrame:
    """Add a 'duration' column = seconds elapsed in each exercise set."""
    for s in df["set"].unique():
        mask  = df["set"] == s
        start = df[mask].index[0]
        stop  = df[mask].index[-1]
        diff = stop - start
        if hasattr(diff, "total_seconds"):
            duration = diff.total_seconds()
        elif hasattr(diff, "seconds"):
            duration = diff.seconds
        else:
            # Fallback if the index isn't a DatetimeIndex
            # We assume 5Hz sampling rate by default if it's row indices
            if diff > 10000:
                duration = diff / 1000.0  # Assumed epoch in ms
            else:
                duration = diff * 0.2     # Assumed rows at 5 Hz

        df.loc[mask, "duration"] = duration
    return df


def apply_lowpass_filter(
    df: pd.DataFrame,
    columns: list[str],
    fs: float    = FS,
    cutoff: float = LPF_CUTOFF,
    order: int   = LPF_ORDER,
) -> pd.DataFrame:
    """Apply Butterworth low-pass filter to each column, replacing original values."""
    lp = LowPassFilter()
    for col in columns:
        df = lp.low_pass_filter(df, col, fs, cutoff, order=order)
        df[col] = df[col + "_lowpass"]
        del df[col + "_lowpass"]
    return df


def apply_pca(df: pd.DataFrame, columns: list[str], n_components: int = N_PCA_COMPONENTS) -> pd.DataFrame:
    """Add pca_1 … pca_n columns."""
    pca = PrincipalComponentAnalysis()
    return pca.apply_pca(df.copy(), columns, n_components)


def add_scalar_magnitudes(df: pd.DataFrame) -> pd.DataFrame:
    """Add acc_r and gyr_r — orientation-independent motion intensity."""
    df["acc_r"] = np.sqrt(df["acc_x"]**2 + df["acc_y"]**2 + df["acc_z"]**2)
    df["gyr_r"] = np.sqrt(df["gyr_x"]**2 + df["gyr_y"]**2 + df["gyr_z"]**2)
    return df


def add_temporal_features(
    df: pd.DataFrame,
    columns: list[str],
    ws: int = WS_TEMPORAL,
) -> pd.DataFrame:
    """
    Add rolling mean and std over `ws` samples per set.
    Processing per set avoids window leakage across sets.
    """
    num_abs = NumericalAbstraction()
    result_list = []
    for s in df["set"].unique():
        subset = df[df["set"] == s].copy()
        for col in columns:
            subset = num_abs.abstract_numerical(subset, [col], ws, "mean")
            subset = num_abs.abstract_numerical(subset, [col], ws, "std")
        result_list.append(subset)
    return pd.concat(result_list)


def add_frequency_features(
    df: pd.DataFrame,
    columns: list[str],
    ws: int = WS_FREQ,
    fs: int = int(FS),
) -> pd.DataFrame:
    """
    Add Fourier frequency features per set.
    Processing per set avoids leakage across sets.
    """
    freq_abs = FourierTransformation()
    df = df.reset_index()
    result_list = []
    for s in df["set"].unique():
        print(f"  [freq] Processing set {s} …")
        subset = df[df["set"] == s].reset_index(drop=True).copy()
        subset = freq_abs.abstract_frequency(subset, columns, ws, fs)
        result_list.append(subset)

    df_out = pd.concat(result_list)
    # Restore the epoch datetime index
    if "epoch (ms)" in df_out.columns:
        df_out = df_out.set_index("epoch (ms)", drop=True)
    return df_out


def add_clusters(
    df: pd.DataFrame,
    cluster_cols: list[str] = CLUSTER_COLS,
    n_clusters: int          = N_CLUSTERS,
) -> tuple[pd.DataFrame, KMeans]:
    """Fit K-Means and add a 'cluster' column. Also returns the fitted model."""
    km = KMeans(n_clusters=n_clusters, n_init=20, random_state=0)
    df["cluster"] = km.fit_predict(df[cluster_cols])
    print(f"  [cluster] K-Means fitted with k={n_clusters}")
    return df, km


# ── Main pipeline ─────────────────────────────────────────────────────────────

def build_features(df: pd.DataFrame) -> tuple[pd.DataFrame, KMeans]:
    """
    Run the full feature engineering pipeline on a cleaned DataFrame.

    Returns:
        df_features  : DataFrame with all engineered features
        kmeans_model : Fitted KMeans model (needed for live predictions)
    """
    sensor_cols = BASE_SENSOR_COLS.copy()

    print("[build_features] 1/8 — Imputing missing values …")
    df = impute_missing(df, sensor_cols)

    print("[build_features] 2/8 — Calculating set durations …")
    df = calculate_set_duration(df)

    print("[build_features] 3/8 — Applying low-pass filter …")
    df = apply_lowpass_filter(df, sensor_cols)

    print("[build_features] 4/8 — Applying PCA …")
    df = apply_pca(df, sensor_cols)

    print("[build_features] 5/8 — Adding scalar magnitudes …")
    df = add_scalar_magnitudes(df)

    # Extend predictor cols to include magnitudes for temporal/freq
    extended_cols = sensor_cols + ["acc_r", "gyr_r"]

    print("[build_features] 6/8 — Adding temporal features …")
    df = add_temporal_features(df, extended_cols)

    print("[build_features] 7/8 — Adding frequency features …")
    df = add_frequency_features(df, extended_cols)

    print("[build_features] 8/8 — Adding cluster labels …")
    df = df.dropna()          # drop rows with NaN from windowed operations
    df = df.iloc[::2]         # 50 % overlap — keep every other row
    df, km = add_clusters(df)

    print(f"[build_features] Done. Final shape: {df.shape}")
    return df, km


def run_build_features(
    input_path:  str = INTERIM_PATH,
    output_path: str = INTERIM_PATH,
) -> pd.DataFrame:
    """Load cleaned pickle → build features → save feature pickle."""
    in_file = os.path.join(input_path, INPUT_FILENAME)
    print(f"[build_features] Loading {in_file} …")
    df = pd.read_pickle(in_file)

    df_features, _ = build_features(df)

    os.makedirs(output_path, exist_ok=True)
    out_file = os.path.join(output_path, OUTPUT_FILENAME)
    df_features.to_pickle(out_file)
    print(f"[build_features] Saved → {out_file}")
    return df_features


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    run_build_features()
