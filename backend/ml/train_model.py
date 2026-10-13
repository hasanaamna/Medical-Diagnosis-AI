
from pathlib import Path

import joblib
import pandas as pd

from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler


ROOT = Path(__file__).resolve().parents[2]

DATA_PATH = (
    ROOT
    / "data"
    / "raw"
    / "diabetes_binary_health_indicators_BRFSS2015.csv"
)

MODEL_DIR = ROOT / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

TARGET = "Diabetes_binary"
RANDOM_STATE = 42


def evaluate(model, X, y, name):
    predictions = model.predict(X)
    probabilities = model.predict_proba(X)[:, 1]

    results = {
        "model": name,
        "accuracy": accuracy_score(y, predictions),
        "precision": precision_score(
            y, predictions, zero_division=0
        ),
        "recall": recall_score(
            y, predictions, zero_division=0
        ),
        "f1": f1_score(y, predictions, zero_division=0),
        "roc_auc": roc_auc_score(y, probabilities),
    }

    return results, predictions


def main():
    if not DATA_PATH.exists():
        raise FileNotFoundError(
            f"Dataset not found: {DATA_PATH}"
        )

    df = pd.read_csv(DATA_PATH)

    if TARGET not in df.columns:
        raise ValueError(
            f"Target column '{TARGET}' is missing."
        )

    if df.isnull().values.any():
        raise ValueError(
            "Missing values detected. Clean the dataset first."
        )

    if not set(df[TARGET].unique()).issubset({0, 1}):
        raise ValueError("Target must contain binary labels 0 and 1.")

    # Preserve identical rows: they may represent distinct respondents.
    X = df.drop(columns=[TARGET])
    y = df[TARGET].astype(int)

    print(f"Dataset shape: {df.shape}")
    print(f"Feature count: {X.shape[1]}")
    print("\nTarget distribution:")
    print(y.value_counts().sort_index())

    # First split: 80% development data, 20% final test data.
    X_dev, X_test, y_dev, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=RANDOM_STATE,
        stratify=y,
    )

    # Split development data: 60% train, 20% validation overall.
    X_train, X_val, y_train, y_val = train_test_split(
        X_dev,
        y_dev,
        test_size=0.25,
        random_state=RANDOM_STATE,
        stratify=y_dev,
    )

    print(
        "\nSplit sizes:",
        f"\nTrain: {len(X_train):,}",
        f"\nValidation: {len(X_val):,}",
        f"\nTest: {len(X_test):,}",
    )

    models = {
        "Logistic Regression": Pipeline([
            ("scaler", StandardScaler()),
            ("classifier", LogisticRegression(
                max_iter=1000,
                class_weight="balanced",
                random_state=RANDOM_STATE,
            )),
        ]),
        "Random Forest": Pipeline([
            ("classifier", RandomForestClassifier(
                n_estimators=200,
                class_weight="balanced",
                min_samples_leaf=2,
                random_state=RANDOM_STATE,
                n_jobs=-1,
            )),
        ]),
    }

    # Fit and select using validation data only.
    validation_results = {}
    trained_models = {}

    for name, model in models.items():
        print(f"\nTraining {name}...")
        model.fit(X_train, y_train)

        metrics, _ = evaluate(model, X_val, y_val, name)
        validation_results[name] = metrics
        trained_models[name] = model

    validation_df = pd.DataFrame(
        validation_results.values()
    ).sort_values("roc_auc", ascending=False)

    print("\n========== VALIDATION COMPARISON ==========")
    print(validation_df.to_string(index=False))

    best_name = validation_df.iloc[0]["model"]
    best_model = trained_models[best_name]

    # Use the untouched test set for final baseline evaluation.
    test_metrics, test_predictions = evaluate(
        best_model, X_test, y_test, best_name
    )

    print(f"\n========== FINAL TEST: {best_name} ==========")

    for metric, value in test_metrics.items():
        if metric != "model":
            print(f"{metric}: {value:.4f}")

    print("\nClassification report:")
    print(classification_report(
        y_test,
        test_predictions,
        zero_division=0,
    ))

    print("Confusion matrix:")
    print(confusion_matrix(y_test, test_predictions))

    model_path = MODEL_DIR / "diabetes_model.joblib"
    joblib.dump(best_model, model_path)

    feature_path = MODEL_DIR / "feature_columns.json"
    pd.Series(X.columns).to_json(
        feature_path, orient="values", indent=2
    )

    print(f"\nSelected using validation ROC-AUC: {best_name}")
    print(f"Model saved to: {model_path}")
    print(f"Features saved to: {feature_path}")
    print(
        "\nThis is an educational baseline, not a clinically "
        "validated diagnostic or future-risk model."
    )


if __name__ == "__main__":
    main()
