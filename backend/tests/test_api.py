
import pytest
from fastapi.testclient import TestClient

from backend.app.main import app


VALID_INPUT = {
    "HighBP": 1,
    "HighChol": 1,
    "CholCheck": 1,
    "BMI": 28,
    "Smoker": 0,
    "Stroke": 0,
    "HeartDiseaseorAttack": 0,
    "PhysActivity": 1,
    "Fruits": 1,
    "Veggies": 1,
    "HvyAlcoholConsump": 0,
    "AnyHealthcare": 1,
    "NoDocbcCost": 0,
    "GenHlth": 3,
    "MentHlth": 2,
    "PhysHlth": 1,
    "DiffWalk": 0,
    "Sex": 0,
    "Age": 8,
    "Education": 5,
    "Income": 6,
}


@pytest.fixture
def client():
    # Entering the context runs FastAPI startup events.
    with TestClient(app) as test_client:
        yield test_client


def test_root_endpoint(client):
    response = client.get("/")

    assert response.status_code == 200
    result = response.json()
    assert result["status"] == "healthy"
    assert result["message"] == "Medical Diagnosis AI API is running"


def test_health_endpoint(client):
    response = client.get("/health")

    assert response.status_code == 200
    result = response.json()
    assert result["status"] == "ok"
    assert result["model_loaded"] is True


def test_prediction_endpoint(client):
    response = client.post("/predict", json=VALID_INPUT)

    assert response.status_code == 200

    result = response.json()
    assert result["predicted_class"] in [0, 1]
    assert 0 <= result["estimated_probability"] <= 1
    assert result["model_name"] == "Logistic Regression"
    assert isinstance(result["disclaimer"], str)
    assert result["disclaimer"]


def test_prediction_rejects_invalid_bmi(client):
    invalid_input = VALID_INPUT.copy()
    invalid_input["BMI"] = 0

    response = client.post("/predict", json=invalid_input)

    assert response.status_code == 422


def test_prediction_rejects_invalid_age(client):
    invalid_input = VALID_INPUT.copy()
    invalid_input["Age"] = 14

    response = client.post("/predict", json=invalid_input)

    assert response.status_code == 422


def test_prediction_rejects_missing_field(client):
    invalid_input = VALID_INPUT.copy()
    del invalid_input["BMI"]

    response = client.post("/predict", json=invalid_input)

    assert response.status_code == 422
