
from pathlib import Path

import pandas as pd
from ucimlrepo import fetch_ucirepo


# Project root: Medical-Diagnosis-AI
PROJECT_ROOT = Path(__file__).resolve().parents[2]
RAW_DIR = PROJECT_ROOT / "data" / "raw"
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"

RAW_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


def main():
    print("Downloading CDC Diabetes Health Indicators dataset...")

    dataset = fetch_ucirepo(id=891)

    features = dataset.data.features
    targets = dataset.data.targets

    if features is None or targets is None:
        raise ValueError("UCI did not return both features and targets.")

    # Combine predictors and the original target for inspection.
    df = pd.concat(
        [
            features.reset_index(drop=True),
            targets.reset_index(drop=True),
        ],
        axis=1,
    )

    output_path = RAW_DIR / "cdc_diabetes_health_indicators.csv"
    df.to_csv(output_path, index=False)

    print("\nDataset downloaded successfully.")
    print(f"Saved to: {output_path}")
    print(f"Rows: {df.shape[0]:,}")
    print(f"Columns: {df.shape[1]}")
    print("\nColumn names:")
    print(df.columns.tolist())

    print("\nFirst five rows:")
    print(df.head().to_string())

    print("\nMissing values per column:")
    print(df.isnull().sum().to_string())

    print("\nTarget variables:")
    print(dataset.data.targets.columns.tolist())

    for column in targets.columns:
        print(f"\nDistribution for {column}:")
        print(targets[column].value_counts(dropna=False).sort_index())


if __name__ == "__main__":
    main()
