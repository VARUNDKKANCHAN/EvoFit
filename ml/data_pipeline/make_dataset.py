"""
make_dataset.py
---------------
Reads raw MetaMotion CSV files, merges accelerometer + gyroscope data,
resamples to a uniform 200 ms interval, and saves a processed pickle file.

Usage:
    python make_dataset.py
    or imported as a module: from ml.data_pipeline.make_dataset import make_dataset
"""

import os
import pandas as pd
from glob import glob


# ── Config ────────────────────────────────────────────────────────────────────
RAW_DATA_PATH   = os.path.join(os.path.dirname(__file__), "../../data/raw/MetaMotion/")
INTERIM_PATH    = os.path.join(os.path.dirname(__file__), "../../data/interim/")
OUTPUT_FILENAME = "01_data_processed.pkl"

RESAMPLE_RULE = "200ms"

SAMPLING_AGG = {
    "acc_x": "mean", "acc_y": "mean", "acc_z": "mean",
    "gyr_x": "mean", "gyr_y": "mean", "gyr_z": "mean",
    "participant": "last", "label": "last",
    "category": "last", "set": "last",
}


# ── Helpers ───────────────────────────────────────────────────────────────────

def _extract_metadata(filepath: str, data_path: str) -> tuple[str, str, str]:
    """Pull participant, label, category out of the MetaMotion filename."""
    fname = os.path.basename(filepath)
    parts = fname.split("-")
    participant = parts[0]
    label       = parts[1]
    category    = parts[2].split("_")[0].rstrip("123")
    return participant, label, category


def _clean_df(df: pd.DataFrame) -> pd.DataFrame:
    """Drop the raw timestamp columns we no longer need."""
    for col in ["epoch (ms)", "time (01:00)", "elapsed (s)"]:
        if col in df.columns:
            del df[col]
    return df


# ── Core function ─────────────────────────────────────────────────────────────

def read_data_from_files(data_path: str = RAW_DATA_PATH) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Read all MetaMotion CSV files and return two DataFrames:
      acc_df  — accelerometer data
      gyr_df  — gyroscope data

    Each row has: participant, label, category, set, plus sensor readings.
    Index is a DatetimeIndex derived from the epoch (ms) column.
    """
    files = glob(os.path.join(data_path, "*.csv"))
    if not files:
        raise FileNotFoundError(f"No CSV files found in: {data_path}")

    acc_df = pd.DataFrame()
    gyr_df = pd.DataFrame()
    acc_set = 1
    gyr_set = 1

    for f in files:
        participant, label, category = _extract_metadata(f, data_path)

        df = pd.read_csv(f)
        df["participant"] = participant
        df["label"]       = label
        df["category"]    = category

        # Set datetime index from epoch column
        df.index = pd.to_datetime(df["epoch (ms)"], unit="ms")
        df = _clean_df(df)

        if "Accelerometer" in f:
            df["set"] = acc_set
            acc_set  += 1
            acc_df    = pd.concat([acc_df, df])
        else:
            df["set"] = gyr_set
            gyr_set  += 1
            gyr_df    = pd.concat([gyr_df, df])

    print(f"  Loaded {acc_set-1} accelerometer files, {gyr_set-1} gyroscope files.")
    return acc_df, gyr_df


def merge_and_resample(
    acc_df: pd.DataFrame,
    gyr_df: pd.DataFrame,
    rule: str = RESAMPLE_RULE,
) -> pd.DataFrame:
    """
    Merge acc + gyr, rename columns, and resample to a uniform time interval.
    Resampling is done per day to avoid creating empty rows across day boundaries.
    """
    # Take only x/y/z from acc, rest (including metadata) from gyr
    data_merged = pd.concat([acc_df.iloc[:, :3], gyr_df], axis=1)
    data_merged.columns = [
        "acc_x", "acc_y", "acc_z",
        "gyr_x", "gyr_y", "gyr_z",
        "participant", "label", "category", "set",
    ]

    # Resample day-by-day so we don't fill gaps between recording sessions
    days = [g for _, g in data_merged.groupby(pd.Grouper(freq="D"))]
    data_resampled = pd.concat([
        day.resample(rule=rule).apply(SAMPLING_AGG).dropna()
        for day in days
        if not day.empty
    ])

    data_resampled["set"] = data_resampled["set"].astype(int)
    print(f"  Resampled dataset shape: {data_resampled.shape}")
    return data_resampled


def make_dataset(
    data_path: str = RAW_DATA_PATH,
    output_path: str = INTERIM_PATH,
    output_filename: str = OUTPUT_FILENAME,
) -> pd.DataFrame:
    """
    Full pipeline: read CSVs → merge → resample → save pickle.

    Returns:
        data_resampled (pd.DataFrame)
    """
    print("[make_dataset] Reading raw files...")
    acc_df, gyr_df = read_data_from_files(data_path)

    print("[make_dataset] Merging and resampling...")
    data_resampled = merge_and_resample(acc_df, gyr_df)

    os.makedirs(output_path, exist_ok=True)
    out_file = os.path.join(output_path, output_filename)
    data_resampled.to_pickle(out_file)
    print(f"[make_dataset] Saved → {out_file}")
    return data_resampled


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    make_dataset()
