"""
train_model.py
--------------
Trains multiple classifiers on the engineered feature dataset,
selects the best model (Random Forest with Feature Set 4),
and saves it as model.pkl for use by the FastAPI backend.

Usage:
    python train_model.py
    or: from ml.models.train_model import train_model
"""

import os
import sys
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report

sys.path.insert(0, os.path.dirname(__file__))
from LearningAlgorithms import ClassificationAlgorithms


# ── Config ────────────────────────────────────────────────────────────────────
INTERIM_PATH   = os.path.join(os.path.dirname(__file__), "../../data/interim/")
MODELS_PATH    = os.path.dirname(__file__)
INPUT_FILENAME = "03_data_feature.pkl"
MODEL_FILENAME = "model.pkl"
META_FILENAME  = "model_meta.json"

RANDOM_STATE   = 42
TEST_SIZE      = 0.25

# Feature subsets
BASIC_FEATURES   = ["acc_x", "acc_y", "acc_z", "gyr_x", "gyr_y", "gyr_z"]
SQUARE_FEATURES  = ["acc_r", "gyr_r"]
PCA_FEATURES     = ["pca_1", "pca_2", "pca_3"]
CLUSTER_FEATURES = ["cluster"]

# Top 10 forward-selected features (pre-computed)
SELECTED_FEATURES = [
    "acc_y_freq_0.0_Hz_ws_14",
    "gyr_r_freq_0.0_Hz_ws_14",
    "duration",
    "acc_z_freq_0.0_Hz_ws_14",
    "acc_x_max_freq",
    "acc_r_freq_1.071_Hz_ws_14",
    "gyr_z_freq_1.429_Hz_ws_14",
    "gyr_r_freq_1.429_Hz_ws_14",
    "gyr_y_temp_mean_ws_5",
    "acc_y_freq_0.714_Hz_ws_14",
]


# ── Helpers ───────────────────────────────────────────────────────────────────

def build_feature_sets(df_train: pd.DataFrame) -> dict[str, list[str]]:
    time_features = [f for f in df_train.columns if "_temp_" in f]
    freq_features = [f for f in df_train.columns if ("_freq" in f) or ("_pse" in f)]

    fs1 = list(set(BASIC_FEATURES))
    fs2 = list(set(BASIC_FEATURES + SQUARE_FEATURES + PCA_FEATURES))
    fs3 = list(set(fs2 + time_features))
    fs4 = list(set(fs3 + freq_features + CLUSTER_FEATURES))

    return {
        "Feature Set 1 (basic)":    fs1,
        "Feature Set 2 (+mag+pca)": fs2,
        "Feature Set 3 (+temporal)":fs3,
        "Feature Set 4 (all)":      fs4,
        "Selected Features":         SELECTED_FEATURES,
    }


# ── Training ──────────────────────────────────────────────────────────────────

def train_and_evaluate(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_test:  pd.DataFrame,
    y_test:  pd.Series,
    feature_sets: dict[str, list[str]],
) -> pd.DataFrame:
    """
    Train all classifiers on each feature set and return a scores DataFrame.
    """
    learner  = ClassificationAlgorithms()
    all_rows = []

    for fs_name, features in feature_sets.items():
        # Guard: skip features not present in this dataset
        available = [f for f in features if f in X_train.columns]
        if not available:
            print(f"  [skip] {fs_name} — no matching columns")
            continue

        Xtr = X_train[available]
        Xte = X_test[available]

        print(f"\n  Training on '{fs_name}' ({len(available)} features) …")

        # Neural Network
        _, ct, _, _ = learner.feedforward_neural_network(Xtr, y_train, Xte, gridsearch=False)
        all_rows.append({"model": "NN",  "feature_set": fs_name, "accuracy": accuracy_score(y_test, ct)})

        # Random Forest
        _, ct, _, _ = learner.random_forest(Xtr, y_train, Xte, gridsearch=True)
        all_rows.append({"model": "RF",  "feature_set": fs_name, "accuracy": accuracy_score(y_test, ct)})

        # KNN
        _, ct, _, _ = learner.k_nearest_neighbor(Xtr, y_train, Xte, gridsearch=True)
        all_rows.append({"model": "KNN", "feature_set": fs_name, "accuracy": accuracy_score(y_test, ct)})

        # Decision Tree
        _, ct, _, _ = learner.decision_tree(Xtr, y_train, Xte, gridsearch=True)
        all_rows.append({"model": "DT",  "feature_set": fs_name, "accuracy": accuracy_score(y_test, ct)})

        # Naive Bayes
        _, ct, _, _ = learner.naive_bayes(Xtr, y_train, Xte)
        all_rows.append({"model": "NB",  "feature_set": fs_name, "accuracy": accuracy_score(y_test, ct)})

    return pd.DataFrame(all_rows).sort_values("accuracy", ascending=False)


def train_best_model(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_test:  pd.DataFrame,
    y_test:  pd.Series,
    feature_set_4: list[str],
) -> dict:
    """
    Train the final Random Forest on Feature Set 4 and return evaluation metrics.
    """
    learner   = ClassificationAlgorithms()
    available = [f for f in feature_set_4 if f in X_train.columns]

    print(f"\n[train_model] Training final Random Forest on {len(available)} features …")
    _, class_test_y, _, class_test_prob_y = learner.random_forest(
        X_train[available], y_train,
        X_test[available],
        gridsearch=True,
    )

    classes  = list(class_test_prob_y.columns)
    accuracy = accuracy_score(y_test, class_test_y)
    cm       = confusion_matrix(y_test, class_test_y, labels=classes)
    report   = classification_report(y_test, class_test_y, output_dict=True)

    print(f"  Accuracy: {accuracy:.4f}")
    print(classification_report(y_test, class_test_y))

    return {
        "model":            learner,
        "feature_names":    available,
        "classes":          classes,
        "accuracy":         accuracy,
        "confusion_matrix": cm.tolist(),
        "report":           report,
    }


# ── Save / Load ───────────────────────────────────────────────────────────────

def save_model(result: dict, models_path: str = MODELS_PATH) -> None:
    """
    Persist the trained model and its metadata.
    model.pkl      — the ClassificationAlgorithms object (contains the RF)
    model_meta.json — accuracy, feature names, classes, confusion matrix
    """
    os.makedirs(models_path, exist_ok=True)

    model_file = os.path.join(models_path, MODEL_FILENAME)
    meta_file  = os.path.join(models_path, META_FILENAME)

    joblib.dump(result["model"], model_file)

    meta = {
        "feature_names":    result["feature_names"],
        "classes":          result["classes"],
        "accuracy":         result["accuracy"],
        "confusion_matrix": result["confusion_matrix"],
        "report":           result["report"],
    }
    with open(meta_file, "w") as f:
        json.dump(meta, f, indent=2)

    print(f"[train_model] Model saved → {model_file}")
    print(f"[train_model] Metadata   → {meta_file}")


def load_model(models_path: str = MODELS_PATH) -> tuple:
    """
    Load the saved model and metadata.

    Returns:
        (learner, meta_dict)
    """
    model_file = os.path.join(models_path, MODEL_FILENAME)
    meta_file  = os.path.join(models_path, META_FILENAME)

    if not os.path.exists(model_file):
        raise FileNotFoundError(f"Model not found: {model_file}. Run train_model.py first.")

    learner = joblib.load(model_file)
    with open(meta_file) as f:
        meta = json.load(f)

    return learner, meta


# ── Main entry ────────────────────────────────────────────────────────────────

def train_model(
    input_path:  str = INTERIM_PATH,
    models_path: str = MODELS_PATH,
) -> dict:
    """
    Full training pipeline:
      1. Load feature dataset
      2. Train/test split
      3. Compare all models across all feature sets
      4. Train final Random Forest on Feature Set 4
      5. Save model + metadata

    Returns:
        result dict with accuracy, feature_names, confusion_matrix, report
    """
    in_file = os.path.join(input_path, INPUT_FILENAME)
    print(f"[train_model] Loading {in_file} …")
    df = pd.read_pickle(in_file)

    # Drop non-feature columns
    df_train = df.drop(["participant", "category", "set"], axis=1)
    X = df_train.drop("label", axis=1)
    y = df_train["label"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE, stratify=y
    )
    print(f"  Train: {len(X_train)} | Test: {len(X_test)}")
    print(f"  Labels: {sorted(y.unique())}")

    feature_sets = build_feature_sets(df_train)

    print("\n[train_model] Comparing all classifiers …")
    scores_df = train_and_evaluate(X_train, y_train, X_test, y_test, feature_sets)
    print("\n── Score Summary ──")
    print(scores_df.to_string(index=False))

    # Final model: RF on Feature Set 4
    fs4 = feature_sets["Feature Set 4 (all)"]
    result = train_best_model(X_train, y_train, X_test, y_test, fs4)

    save_model(result, models_path)
    return result


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    train_model()
