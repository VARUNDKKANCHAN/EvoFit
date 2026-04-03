"""
remove_outliers.py
------------------
Detects and removes outliers from the processed sensor dataset using
Chauvenet's Criterion (per exercise label, per sensor column).

Usage:
    python remove_outliers.py
    or: from ml.features.remove_outliers import remove_outliers
"""

import os
import math
import scipy
import numpy as np
import pandas as pd


# ── Config ────────────────────────────────────────────────────────────────────
INTERIM_PATH    = os.path.join(os.path.dirname(__file__), "../../data/interim/")
INPUT_FILENAME  = "01_data_processed.pkl"
OUTPUT_FILENAME = "02_outliers_removed_chauvenets.pkl"

OUTLIER_COLUMNS = ["acc_x", "acc_y", "acc_z", "gyr_x", "gyr_y", "gyr_z"]


# ── Detection methods ─────────────────────────────────────────────────────────

def mark_outliers_iqr(dataset: pd.DataFrame, col: str) -> pd.DataFrame:
    """
    Mark outliers using the Interquartile Range (IQR) method.
    Adds a boolean column `<col>_outlier`.
    """
    dataset = dataset.copy()
    Q1 = dataset[col].quantile(0.25)
    Q3 = dataset[col].quantile(0.75)
    IQR = Q3 - Q1
    lower = Q1 - 1.5 * IQR
    upper = Q3 + 1.5 * IQR
    dataset[col + "_outlier"] = (dataset[col] < lower) | (dataset[col] > upper)
    return dataset


def mark_outliers_chauvenet(dataset: pd.DataFrame, col: str, C: int = 2) -> pd.DataFrame:
    """
    Mark outliers using Chauvenet's Criterion.
    Adds a boolean column `<col>_outlier`.

    Args:
        dataset: Input DataFrame
        col:     Column to analyse
        C:       Certainty parameter (default 2)
    """
    dataset = dataset.copy()
    mean = dataset[col].mean()
    std  = dataset[col].std()
    N    = len(dataset)
    criterion = 1.0 / (C * N)

    deviation = abs(dataset[col] - mean) / std
    low  = -deviation / math.sqrt(C)
    high =  deviation / math.sqrt(C)

    erf_high = scipy.special.erf(high)
    erf_low  = scipy.special.erf(low)
    mask = (1.0 - 0.5 * (erf_high - erf_low)) < criterion

    dataset[col + "_outlier"] = mask
    return dataset


# ── Main removal function ─────────────────────────────────────────────────────

def remove_outliers(
    df: pd.DataFrame,
    outlier_columns: list[str] = OUTLIER_COLUMNS,
) -> tuple[pd.DataFrame, dict]:
    """
    Apply Chauvenet's Criterion per label per column.
    Replaces outlier values with NaN (will be interpolated in build_features).

    Returns:
        cleaned_df    : DataFrame with outliers set to NaN
        outlier_stats : dict with counts of removed values per column/label
    """
    cleaned_df    = df.copy()
    outlier_stats = {}

    for col in outlier_columns:
        outlier_stats[col] = {}
        for label in df["label"].unique():
            mask     = df["label"] == label
            subset   = mark_outliers_chauvenet(df[mask], col)
            n_out    = subset[col + "_outlier"].sum()
            outlier_stats[col][label] = int(n_out)

            # Replace outlier rows with NaN in the output frame using indices
            outlier_idx = subset[subset[col + "_outlier"]].index
            cleaned_df.loc[outlier_idx, col] = np.nan

            if n_out:
                print(f"  Removed {n_out:>4} outliers from '{col}' [{label}]")

    total = sum(sum(v.values()) for v in outlier_stats.values())
    print(f"[remove_outliers] Total outliers removed: {total}")
    return cleaned_df, outlier_stats


def run_outlier_removal(
    input_path:  str = INTERIM_PATH,
    output_path: str = INTERIM_PATH,
) -> pd.DataFrame:
    """
    Load processed pickle → remove outliers → save cleaned pickle.
    """
    in_file = os.path.join(input_path, INPUT_FILENAME)
    print(f"[remove_outliers] Loading {in_file} ...")
    df = pd.read_pickle(in_file)

    cleaned_df, stats = remove_outliers(df)

    os.makedirs(output_path, exist_ok=True)
    out_file = os.path.join(output_path, OUTPUT_FILENAME)
    cleaned_df.to_pickle(out_file)
    print(f"[remove_outliers] Saved → {out_file}")
    return cleaned_df


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    run_outlier_removal()
