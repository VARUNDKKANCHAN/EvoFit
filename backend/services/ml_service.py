"""
ml_service.py
-------------
Bridge between FastAPI and the ML prediction pipeline.
Supports CSV and PKL (pickle) file uploads.
"""

import os
import sys
import io
import pickle
import pandas as pd

# ── Path setup ────────────────────────────────────────────────────────────────
ROOT_DIR     = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
ML_DIR       = os.path.join(ROOT_DIR, "ml")
MODELS_DIR   = os.path.join(ML_DIR, "models")
FEATURES_DIR = os.path.join(ML_DIR, "features")

for p in [MODELS_DIR, FEATURES_DIR, ML_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)

from predict_model import predict_from_dataframe, get_model_info  # noqa: E402

REQUIRED_COLS = ["acc_x", "acc_y", "acc_z", "gyr_x", "gyr_y", "gyr_z"]


def _parse_csv(raw: bytes) -> pd.DataFrame:
    """Parse CSV bytes into a sensor DataFrame."""
    try:
        df = pd.read_csv(io.BytesIO(raw))
        # Strip whitespace from column names in case they have spaces (e.g. " acc_x")
        df.columns = df.columns.str.strip()
    except Exception as e:
        raise ValueError(f"Could not parse CSV file: {e}")

    # Handle timestamp index
    time_cols = ["epoch (ms)", "Timestamp", "timestamp", "time", "date", "Unnamed: 0"]
    for col in time_cols:
        if col in df.columns:
            try:
                # Try parsing with unit='ms' first if column name suggests it
                unit = "ms" if "ms" in col.lower() or "epoch" in col.lower() else None
                df.index = pd.to_datetime(df[col], unit=unit)
                # Drop common redundant time columns
                df = df.drop(columns=[col, "time (01:00)", "elapsed (s)"], errors="ignore")
                break
            except Exception:
                try:
                    # Fallback to general parsing
                    df.index = pd.to_datetime(df[col])
                    df = df.drop(columns=[col, "time (01:00)", "elapsed (s)"], errors="ignore")
                    break
                except Exception:
                    continue

    return df


def _parse_pkl(raw: bytes) -> pd.DataFrame:
    """Parse PKL (pickle) bytes into a sensor DataFrame."""
    try:
        df = pd.read_pickle(io.BytesIO(raw))
    except Exception:
        try:
            df = pickle.loads(raw)
        except Exception as e:
            raise ValueError(f"Could not parse PKL file: {e}")

    if not isinstance(df, pd.DataFrame):
        raise ValueError("PKL file must contain a pandas DataFrame.")

    # If it has a 'label' column, it might be the processed dataset —
    # that's fine, we'll just pick the first set
    if "set" in df.columns and len(df["set"].unique()) > 1:
        first_set = df["set"].iloc[0]
        df = df[df["set"] == first_set].copy()

    return df


def _validate_and_clean(df: pd.DataFrame) -> pd.DataFrame:
    """Validate required columns and inject missing metadata."""
    missing = [c for c in REQUIRED_COLS if c not in df.columns]
    if missing:
        raise ValueError(
            f"File is missing required sensor columns: {missing}. "
            f"Required: {REQUIRED_COLS}. "
            f"Found: {list(df.columns)}"
        )

    # Inject dummy metadata columns if absent
    for col, default in [("participant", "X"), ("label", "unknown"),
                          ("category", "heavy"), ("set", 1)]:
        if col not in df.columns:
            df[col] = default

    # Ensure numeric sensor columns
    for col in REQUIRED_COLS:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df = df.dropna(subset=REQUIRED_COLS)
    if len(df) < 10:
        raise ValueError(
            f"File contains only {len(df)} valid rows after cleaning. "
            "At least 10 rows are required for a reliable prediction."
        )

    return df


def predict_from_upload(file_bytes: bytes, filename: str) -> dict:
    """
    Accept raw file bytes + filename, parse based on extension,
    validate columns, and run prediction.

    Supports: .csv, .pkl
    """
    ext = os.path.splitext(filename.lower())[1]

    if ext == ".csv":
        df = _parse_csv(file_bytes)
    elif ext == ".pkl":
        df = _parse_pkl(file_bytes)
    else:
        raise ValueError(
            f"Unsupported file format '{ext}'. "
            "Please upload a .csv or .pkl file."
        )

    df = _validate_and_clean(df)
    return predict_from_dataframe(df)


# Keep backward compat alias
def predict_from_csv_bytes(csv_bytes: bytes) -> dict:
    return predict_from_upload(csv_bytes, "upload.csv")


def get_metrics() -> dict:
    """Return model accuracy, classes, confusion matrix."""
    return get_model_info()
