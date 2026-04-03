"""
ml_service.py
-------------
Bridge between the FastAPI backend and the ML prediction module.
Handles sys.path setup so the backend can import ml/ modules cleanly.
"""

import os
import sys
import io
import pandas as pd

# ── Resolve path to ml/ from inside backend/ ──────────────────────────────────
ROOT_DIR    = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../"))
ML_DIR      = os.path.join(ROOT_DIR, "ml")
MODELS_DIR  = os.path.join(ML_DIR, "models")
FEATURES_DIR = os.path.join(ML_DIR, "features")

for p in [MODELS_DIR, FEATURES_DIR, ML_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)

# Now import from ml package (safe after path setup)
from predict_model import predict_from_dataframe, get_model_info  # noqa: E402


def predict_from_csv_bytes(csv_bytes: bytes) -> dict:
    """
    Accept raw CSV bytes (from FastAPI UploadFile),
    parse into a DataFrame, run the prediction pipeline.

    Returns:
        dict with predicted_label, confidence, rep_count, probabilities
    """
    try:
        df = pd.read_csv(io.BytesIO(csv_bytes))
    except Exception as e:
        raise ValueError(f"Could not parse uploaded CSV: {e}")

    # Handle datetime index from CSV
    if "epoch (ms)" in df.columns:
        try:
            df.index = pd.to_datetime(df["epoch (ms)"], unit="ms")
        except ValueError:
            df.index = pd.to_datetime(df["epoch (ms)"])
        df = df.drop(columns=["epoch (ms)", "time (01:00)", "elapsed (s)"], errors="ignore")
    elif "Unnamed: 0" in df.columns:
        # Often the case when saving a dataframe index to CSV
        df.index = pd.to_datetime(df["Unnamed: 0"])
        df = df.drop(columns=["Unnamed: 0"], errors="ignore")

    # Validate required sensor columns
    required = ["acc_x", "acc_y", "acc_z", "gyr_x", "gyr_y", "gyr_z"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(f"CSV missing required sensor columns: {missing}")

    # Inject dummy metadata if absent
    for col, default in [("participant", "X"), ("label", "unknown"),
                         ("category", "heavy"), ("set", 1)]:
        if col not in df.columns:
            df[col] = default

    result = predict_from_dataframe(df)
    return result


def get_metrics() -> dict:
    """Return model accuracy, classes, confusion matrix — for /metrics endpoint."""
    return get_model_info()
