"""
predict_model.py
----------------
Production inference module used by the FastAPI backend.

Given a raw sensor DataFrame (or uploaded CSV), this module:
  1. Runs the full feature engineering pipeline
  2. Loads the saved model
  3. Returns predicted exercise label + confidence + rep count

Usage:
    from ml.models.predict_model import predict_exercise, predict_from_csv
"""

import os
import sys
import json
import numpy as np
import pandas as pd

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../features"))
sys.path.insert(0, os.path.dirname(__file__))

from train_model import load_model, MODELS_PATH
from count_repetitions import count_reps_for_set


# ── Config ────────────────────────────────────────────────────────────────────
MODELS_DIR = os.path.dirname(__file__)


# ── Lazy model loader (singleton) ─────────────────────────────────────────────
_model_cache: dict = {}

def _get_model():
    """Load model once and cache it in memory."""
    global _model_cache
    if not _model_cache:
        learner, meta = load_model(MODELS_DIR)
        _model_cache["learner"]  = learner
        _model_cache["meta"]     = meta
        _model_cache["features"] = meta["feature_names"]
        _model_cache["classes"]  = meta["classes"]
        print(f"[predict_model] Model loaded. Accuracy: {meta['accuracy']:.4f}")
    return _model_cache


# ── Feature engineering for a single session ─────────────────────────────────

def _prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Lightweight feature engineering for a single uploaded session.
    Applies only the transforms needed to produce the model's expected columns.
    For full pipeline (training), use build_features.py.
    """
    # Needed for lazy import inside this module
    from features.build_features import (
        impute_missing, calculate_set_duration, apply_lowpass_filter,
        apply_pca, add_scalar_magnitudes, add_temporal_features,
        add_frequency_features, BASE_SENSOR_COLS,
    )
    from sklearn.cluster import KMeans

    sensor_cols = BASE_SENSOR_COLS.copy()
    df = impute_missing(df, sensor_cols)
    df = calculate_set_duration(df)
    df = apply_lowpass_filter(df, sensor_cols)
    df = apply_pca(df, sensor_cols)
    df = add_scalar_magnitudes(df)
    extended = sensor_cols + ["acc_r", "gyr_r"]
    df = add_temporal_features(df, extended)
    df = add_frequency_features(df, extended)
    df = df.dropna()

    # Assign cluster using a fresh KMeans (approximate, not the trained one)
    # For production quality, save & reload the kmeans from training
    if len(df) >= 5:
        km = KMeans(n_clusters=5, n_init=20, random_state=0)
        df["cluster"] = km.fit_predict(df[["acc_x", "acc_y", "acc_z"]])
    else:
        df["cluster"] = 0

    return df


# ── Core prediction functions ─────────────────────────────────────────────────

def predict_exercise(df: pd.DataFrame) -> dict:
    """
    Predict the exercise label from a feature-engineered DataFrame.

    Args:
        df: DataFrame that has already been through the feature pipeline
            (must contain all columns in model_meta.json feature_names)

    Returns:
        dict with keys:
          predicted_label  : str   (e.g. "bench")
          confidence       : float (0–1)
          probabilities    : dict  {label: probability}
          rep_count        : int
          row_count        : int   (number of samples analysed)
    """
    cache    = _get_model()
    learner  = cache["learner"]
    features = cache["features"]
    classes  = cache["classes"]

    # Keep only columns the model was trained on
    available = [f for f in features if f in df.columns]
    missing   = set(features) - set(available)
    if missing:
        print(f"[predict_model] Warning: {len(missing)} features missing — using zeros")
        for col in missing:
            df[col] = 0.0

    X = df[features]

    # Random Forest predict_proba via the learner's internal RF
    rf_model = learner.rf  if hasattr(learner, "rf")  else \
               learner.random_forest_model if hasattr(learner, "random_forest_model") else None

    if rf_model is not None:
        proba = rf_model.predict_proba(X)
        pred_idx = np.argmax(proba.mean(axis=0))
        predicted_label = rf_model.classes_[pred_idx]
        confidence = float(proba.mean(axis=0)[pred_idx])
        probabilities = {
            cls: float(proba.mean(axis=0)[i])
            for i, cls in enumerate(rf_model.classes_)
        }
    else:
        # Fallback: use the learner's forward-facing random_forest method
        _, class_test_y, _, class_test_prob_y = learner.random_forest(
            X, pd.Series(["bench"] * len(X)), X, gridsearch=False
        )
        predicted_label = class_test_y.iloc[0] if hasattr(class_test_y, "iloc") else class_test_y[0]
        confidence      = 0.0
        probabilities   = {}

    # Rep counting on raw signal
    rep_count = count_reps_for_set(df) if "label" in df.columns else 0

    return {
        "predicted_label": predicted_label,
        "confidence":      round(confidence, 4),
        "probabilities":   probabilities,
        "rep_count":       rep_count,
        "row_count":       len(df),
    }


def predict_from_dataframe(df_raw: pd.DataFrame) -> dict:
    """
    End-to-end prediction from a raw (unprocessed) sensor DataFrame.

    The DataFrame must have columns:
        acc_x, acc_y, acc_z, gyr_x, gyr_y, gyr_z
        participant, label (optional), category, set
    and a DatetimeIndex.

    Returns:
        Same dict as predict_exercise()
    """
    print("[predict_model] Running feature engineering on raw data …")
    df_features = _prepare_features(df_raw.copy())
    return predict_exercise(df_features)


def predict_from_csv(csv_path: str) -> dict:
    """
    Load a MetaMotion-format CSV and run end-to-end prediction.
    Handles both accelerometer and gyroscope single-sensor files.

    Args:
        csv_path: Path to a preprocessed sensor CSV
                  (must have acc_x … gyr_z columns)

    Returns:
        prediction dict
    """
    df = pd.read_csv(csv_path)

    # Handle epoch index
    if "epoch (ms)" in df.columns:
        df.index = pd.to_datetime(df["epoch (ms)"], unit="ms")
        df = df.drop(columns=["epoch (ms)", "time (01:00)", "elapsed (s)"], errors="ignore")

    required = ["acc_x", "acc_y", "acc_z", "gyr_x", "gyr_y", "gyr_z"]
    missing  = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(f"CSV is missing required columns: {missing}")

    # Add dummy metadata if missing
    for col, default in [("participant", "X"), ("label", "unknown"),
                         ("category", "heavy"), ("set", 1)]:
        if col not in df.columns:
            df[col] = default

    return predict_from_dataframe(df)


def get_model_info() -> dict:
    """Return model metadata — used by GET /metrics endpoint."""
    cache = _get_model()
    meta  = cache["meta"]
    return {
        "accuracy":         meta.get("accuracy"),
        "classes":          meta.get("classes"),
        "feature_count":    len(meta.get("feature_names", [])),
        "confusion_matrix": meta.get("confusion_matrix"),
        "report":           meta.get("report"),
    }


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        csv_path = sys.argv[1]
        print(f"[predict_model] Predicting from: {csv_path}")
        result = predict_from_csv(csv_path)
        print(f"\nPredicted exercise : {result['predicted_label']}")
        print(f"Confidence         : {result['confidence']:.2%}")
        print(f"Repetitions        : {result['rep_count']}")
        print(f"Probabilities      : {result['probabilities']}")
    else:
        info = get_model_info()
        print("Model Info:", json.dumps(info, indent=2))
