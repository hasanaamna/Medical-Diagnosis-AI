
from pathlib import Path
import json

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException

from backend.app.schemas import (
    DiabetesInput,
    DiabetesPrediction,
)
from fastapi.middleware.cors import CORSMiddleware

ROOT = Path(__file__).resolve().parents[2]
MODEL_PATH = ROOT / "models" / "diabetes_model.joblib"
FEATURE_PATH = ROOT / "models" / "feature_columns.json"
METADATA_PATH = ROOT / "models" / "model_metadata.json"
app = FastAPI(
    title="Medical Diagnosis AI",
    description=(
        "Educational diabetes survey-classification prototype. "
        "Not for clinical diagnosis or treatment decisions."
    ),
    version="0.2.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)
model = None
feature_columns = None
model_name = "Unknown Model"

@app.on_event("startup")
def load_model():
    global model, feature_columns, model_name

    if not MODEL_PATH.exists() or not FEATURE_PATH.exists():
        raise RuntimeError(
            "Model files are missing. Train the model first."
        )

    model = joblib.load(MODEL_PATH)

    with open(FEATURE_PATH, "r", encoding="utf-8") as file:
        feature_columns = json.load(file)

    if METADATA_PATH.exists():
        with open(METADATA_PATH, "r", encoding="utf-8") as file:
            model_metadata = json.load(file)

        model_name = model_metadata.get(
            "model_name", "Unknown Model"
        )
    else:
        model_name = "Unknown Model"

    print(f"Loaded model: {model_name}")


@app.get("/")
def root():
    return {
        "message": "Medical Diagnosis AI API is running",
        "status": "healthy",
        "version": "0.2.0",
    }


@app.get("/health")
def health_check():
    return {"status": "ok", "model_loaded": model is not None}


@app.post("/predict", response_model=DiabetesPrediction)
def predict_diabetes(data: DiabetesInput):
    if model is None or feature_columns is None:
        raise HTTPException(
            status_code=503,
            detail="Prediction model is not available.",
        )

    input_data = data.model_dump()

    # Preserve the feature order used during training.
    input_df = pd.DataFrame(
        [[input_data[column] for column in feature_columns]],
        columns=feature_columns,
    )

    predicted_class = int(model.predict(input_df)[0])
    probabilities = model.predict_proba(input_df)[0]

    # Class 1 is the positive survey category.
    class_positions = list(model.classes_)
    positive_position = class_positions.index(1)
    probability = float(probabilities[positive_position])

    return DiabetesPrediction(
        predicted_class=predicted_class,
        estimated_probability=round(probability, 4),
        model_name=model_name,
        disclaimer=(
            "This educational model estimates a category recorded "
            "in survey data. It is not a diagnosis or a validated "
            "estimate of an individual's future diabetes risk. "
            "Consult a qualified healthcare professional for "
            "medical assessment."
        ),
    )
