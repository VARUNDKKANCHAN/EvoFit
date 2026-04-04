"""
predict_model.py
----------------
Production inference module used by the FastAPI backend.

Given a raw sensor DataFrame this module:
  1. Runs the full feature engineering pipeline
  2. Loads rf_model.pkl (standalone sklearn RandomForestClassifier)
  3. Returns predicted exercise label, confidence, per-class probabilities, rep count

Usage:
    from ml.models.predict_model import predict_from_dataframe, get_model_info
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd

# Make sibling packages importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../features"))
sys.path.insert(0, os.path.dirname(__file__))

from count_repetitions import count_reps_for_set

MODELS_DIR  = os.path.dirname(__file__)
RF_PATH     = os.path.join(MODELS_DIR, "rf_model.pkl")
META_PATH   = os.path.join(MODELS_DIR, "model_meta.json")


# ── Singleton cache ────────────────────────────────────────────────────────────

_cache: dict = {}

def _get_model():
    """Load the sklearn RF and metadata once, cache in memory."""
    global _cache
    if _cache:
        return _cache

    if not os.path.exists(RF_PATH):
        raise FileNotFoundError(
            f"rf_model.pkl not found at {RF_PATH}. "
            "Run the training helper script first."
        )

    rf = joblib.load(RF_PATH)
    with open(META_PATH) as f:
        meta = json.load(f)

    _cache["rf"]       = rf
    _cache["features"] = meta["feature_names"]
    _cache["classes"]  = list(rf.classes_)
    _cache["meta"]     = meta
    print(f"[predict_model] RF loaded · accuracy={meta['accuracy']:.4f} "
          f"· classes={list(rf.classes_)}")
    return _cache


# ── Feature engineering ────────────────────────────────────────────────────────

def _prepare_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Run the same feature-engineering steps as build_features.py
    on a single uploaded session DataFrame.
    """
    from features.build_features import (
        impute_missing, calculate_set_duration, apply_lowpass_filter,
        apply_pca, add_scalar_magnitudes, add_temporal_features,
        add_frequency_features, BASE_SENSOR_COLS,
    )
    from sklearn.cluster import KMeans

    sensor_cols = list(BASE_SENSOR_COLS)
    df = impute_missing(df, sensor_cols)
    df = calculate_set_duration(df)
    df = apply_lowpass_filter(df, sensor_cols)
    df = apply_pca(df, sensor_cols)
    df = add_scalar_magnitudes(df)
    extended = sensor_cols + ["acc_r", "gyr_r"]
    df = add_temporal_features(df, extended)
    df = add_frequency_features(df, extended)
    df = df.dropna()

    if len(df) >= 5:
        km = KMeans(n_clusters=5, n_init=20, random_state=0)
        df["cluster"] = km.fit_predict(df[["acc_x", "acc_y", "acc_z"]])
    else:
        df["cluster"] = 0

    return df


# ── Core prediction ────────────────────────────────────────────────────────────

def predict_exercise(df: pd.DataFrame) -> dict:
    """
    Predict exercise from an already feature-engineered DataFrame.

    Returns dict with:
        predicted_label  : str
        confidence       : float  (0–1)
        probabilities    : dict   {label: float}
        rep_count        : int
        row_count        : int
    """
    cache    = _get_model()
    rf       = cache["rf"]
    features = cache["features"]

    # Fill any columns the model expects but are missing
    for col in features:
        if col not in df.columns:
            df[col] = 0.0

    X = df[features]

    # sklearn predict_proba → average over all timesteps in the set
    proba      = rf.predict_proba(X)          # (n_rows, n_classes)
    mean_proba = proba.mean(axis=0)
    pred_idx   = int(np.argmax(mean_proba))

    predicted_label = rf.classes_[pred_idx]
    confidence      = float(mean_proba[pred_idx])
    probabilities   = {
        cls: round(float(p), 4)
        for cls, p in zip(rf.classes_, mean_proba)
    }

    # Rep counting — needs a 'label' column in df
    df_reps = df.copy()
    df_reps["label"] = predicted_label
    rep_count = count_reps_for_set(df_reps)

    return {
        "predicted_label": predicted_label,
        "confidence":      round(confidence, 4),
        "probabilities":   probabilities,
        "rep_count":       int(rep_count),
        "row_count":       len(df),
    }


def predict_from_dataframe(df_raw: pd.DataFrame) -> dict:
    """
    Full end-to-end inference from a raw (un-engineered) sensor DataFrame.

    df_raw must have columns: acc_x acc_y acc_z gyr_x gyr_y gyr_z
    and a DatetimeIndex.  Metadata columns (participant, label, category, set)
    will be injected with safe defaults if missing.
    """
    # Inject missing metadata columns
    for col, default in [("participant", "X"), ("label", "unknown"),
                         ("category", "heavy"), ("set", 1)]:
        if col not in df_raw.columns:
            df_raw[col] = default

    print("[predict_model] Running feature engineering …")
    df_feat = _prepare_features(df_raw.copy())
    return predict_exercise(df_feat)


def predict_from_csv(csv_path: str) -> dict:
    """
    Convenience function: load a CSV → predict.
    """
    df = pd.read_csv(csv_path)

    if "epoch (ms)" in df.columns:
        try:
            df.index = pd.to_datetime(df["epoch (ms)"], unit="ms")
        except Exception:
            df.index = pd.to_datetime(df["epoch (ms)"])
        df = df.drop(columns=["epoch (ms)", "time (01:00)", "elapsed (s)"], errors="ignore")
    elif "Unnamed: 0" in df.columns:
        df.index = pd.to_datetime(df["Unnamed: 0"])
        df = df.drop(columns=["Unnamed: 0"], errors="ignore")

    required = ["acc_x", "acc_y", "acc_z", "gyr_x", "gyr_y", "gyr_z"]
    missing  = [c for c in required if c not in df.columns]
    if missing:
        raise ValueError(f"CSV missing required columns: {missing}")

    return predict_from_dataframe(df)


def get_model_info() -> dict:
    """Return model metadata for the /metrics endpoint."""
    cache = _get_model()
    meta  = cache["meta"]
    return {
        "accuracy":         meta.get("accuracy"),
        "classes":          cache["classes"],
        "feature_count":    len(cache["features"]),
        "confusion_matrix": meta.get("confusion_matrix"),
        "report":           meta.get("report"),
    }


# ── CLI entry point ────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if len(sys.argv) > 1:
        result = predict_from_csv(sys.argv[1])
        print(f"\nExercise   : {result['predicted_label']}")
        print(f"Confidence : {result['confidence']:.1%}")
        print(f"Reps       : {result['rep_count']}")
        print(f"Probs      : {result['probabilities']}")
    else:
        print(json.dumps(get_model_info(), indent=2))
