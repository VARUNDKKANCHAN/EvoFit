"""
pipeline.py
-----------
Master orchestrator for the EvoFit ML pipeline.

Runs all 4 stages in sequence:
  Stage 1 → make_dataset      (raw CSVs → 01_data_processed.pkl)
  Stage 2 → remove_outliers   (01 → 02_outliers_removed_chauvenets.pkl)
  Stage 3 → build_features    (02 → 03_data_feature.pkl)
  Stage 4 → train_model       (03 → model.pkl + model_meta.json)

Usage:
    # Run full pipeline from scratch
    python pipeline.py

    # Run from a specific stage
    python pipeline.py --from-stage 3

    # Import and call programmatically
    from ml.pipeline.pipeline import run_pipeline
    run_pipeline()
"""

import os
import sys
import time
import argparse

# Resolve paths so this works regardless of where it is called from
PIPELINE_DIR = os.path.dirname(__file__)
ML_DIR       = os.path.dirname(PIPELINE_DIR)

sys.path.insert(0, os.path.join(ML_DIR, "data_pipeline"))
sys.path.insert(0, os.path.join(ML_DIR, "features"))
sys.path.insert(0, os.path.join(ML_DIR, "models"))

from make_dataset      import make_dataset
from remove_outliers   import run_outlier_removal
from build_features    import run_build_features
from train_model       import train_model

INTERIM_PATH = os.path.join(ML_DIR, "../data/interim/")
MODELS_PATH  = os.path.join(ML_DIR, "models/")


# ── Stage runner ──────────────────────────────────────────────────────────────

def _run_stage(name: str, fn, *args, **kwargs):
    """Run a single pipeline stage with timing and error reporting."""
    print(f"\n{'='*60}")
    print(f"  STAGE: {name}")
    print(f"{'='*60}")
    t0 = time.time()
    try:
        result = fn(*args, **kwargs)
        elapsed = time.time() - t0
        print(f"  ✓ Completed in {elapsed:.1f}s")
        return result
    except Exception as e:
        print(f"  ✗ FAILED: {e}")
        raise


# ── Pipeline stages ───────────────────────────────────────────────────────────

STAGES = {
    1: {
        "name": "Data Ingestion (make_dataset)",
        "fn":   lambda: make_dataset(output_path=INTERIM_PATH),
    },
    2: {
        "name": "Outlier Removal (remove_outliers)",
        "fn":   lambda: run_outlier_removal(input_path=INTERIM_PATH, output_path=INTERIM_PATH),
    },
    3: {
        "name": "Feature Engineering (build_features)",
        "fn":   lambda: run_build_features(input_path=INTERIM_PATH, output_path=INTERIM_PATH),
    },
    4: {
        "name": "Model Training (train_model)",
        "fn":   lambda: train_model(input_path=INTERIM_PATH, models_path=MODELS_PATH),
    },
}


def run_pipeline(from_stage: int = 1, to_stage: int = 4) -> dict:
    """
    Execute pipeline stages from `from_stage` to `to_stage` inclusive.

    Args:
        from_stage : First stage to run (1–4)
        to_stage   : Last stage to run  (1–4)

    Returns:
        dict with per-stage results
    """
    total_start = time.time()
    results = {}

    print(f"\n{'#'*60}")
    print(f"  EvoFit ML Pipeline")
    print(f"  Running stages {from_stage} → {to_stage}")
    print(f"{'#'*60}")

    for stage_num in range(from_stage, to_stage + 1):
        stage = STAGES[stage_num]
        results[stage_num] = _run_stage(stage["name"], stage["fn"])

    total_elapsed = time.time() - total_start
    print(f"\n{'#'*60}")
    print(f"  Pipeline complete in {total_elapsed:.1f}s")
    print(f"{'#'*60}\n")

    return results


def run_inference_only() -> dict:
    """
    Skip training — just verify the model loads and return its info.
    Useful for health-check / startup validation in the FastAPI app.
    """
    sys.path.insert(0, os.path.join(ML_DIR, "models"))
    from predict_model import get_model_info
    info = get_model_info()
    print("[pipeline] Model loaded successfully.")
    print(f"  Accuracy:       {info['accuracy']:.4f}")
    print(f"  Classes:        {info['classes']}")
    print(f"  Feature count:  {info['feature_count']}")
    return info


# ── CLI ───────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="EvoFit ML Pipeline")
    parser.add_argument(
        "--from-stage", type=int, default=1, choices=[1, 2, 3, 4],
        help="Start pipeline from this stage (default: 1)"
    )
    parser.add_argument(
        "--to-stage", type=int, default=4, choices=[1, 2, 3, 4],
        help="Stop pipeline after this stage (default: 4)"
    )
    parser.add_argument(
        "--check", action="store_true",
        help="Only verify the saved model loads correctly (no training)"
    )
    args = parser.parse_args()

    if args.check:
        run_inference_only()
    else:
        if args.from_stage > args.to_stage:
            parser.error("--from-stage must be ≤ --to-stage")
        run_pipeline(from_stage=args.from_stage, to_stage=args.to_stage)


if __name__ == "__main__":
    main()
