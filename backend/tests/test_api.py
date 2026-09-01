"""Unit and integration tests for FastAPI backend endpoints."""

from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

SAMPLE_BENIGN = {
    "radius_mean": 13.54,
    "texture_mean": 14.36,
    "perimeter_mean": 87.46,
    "area_mean": 566.3,
    "smoothness_mean": 0.09779,
    "compactness_mean": 0.08129,
    "concavity_mean": 0.06664,
    "concave_points_mean": 0.04781,
    "symmetry_mean": 0.1885,
    "fractal_dimension_mean": 0.05766,
    "radius_se": 0.2699,
    "texture_se": 0.7886,
    "perimeter_se": 2.058,
    "area_se": 23.56,
    "smoothness_se": 0.008462,
    "compactness_se": 0.0146,
    "concavity_se": 0.02387,
    "concave_points_se": 0.01315,
    "symmetry_se": 0.0198,
    "fractal_dimension_se": 0.0023,
    "radius_worst": 15.11,
    "texture_worst": 19.26,
    "perimeter_worst": 99.7,
    "area_worst": 711.2,
    "smoothness_worst": 0.144,
    "compactness_worst": 0.1773,
    "concavity_worst": 0.239,
    "concave_points_worst": 0.1288,
    "symmetry_worst": 0.2977,
    "fractal_dimension_worst": 0.07259,
}

SAMPLE_MALIGNANT = {
    "radius_mean": 17.99,
    "texture_mean": 10.38,
    "perimeter_mean": 122.8,
    "area_mean": 1001.0,
    "smoothness_mean": 0.1184,
    "compactness_mean": 0.2776,
    "concavity_mean": 0.3001,
    "concave_points_mean": 0.1471,
    "symmetry_mean": 0.2419,
    "fractal_dimension_mean": 0.07871,
    "radius_se": 1.095,
    "texture_se": 0.9053,
    "perimeter_se": 8.589,
    "area_se": 153.4,
    "smoothness_se": 0.006399,
    "compactness_se": 0.04904,
    "concavity_se": 0.05373,
    "concave_points_se": 0.01587,
    "symmetry_se": 0.03003,
    "fractal_dimension_se": 0.006193,
    "radius_worst": 25.38,
    "texture_worst": 17.33,
    "perimeter_worst": 184.6,
    "area_worst": 2019.0,
    "smoothness_worst": 0.1622,
    "compactness_worst": 0.6656,
    "concavity_worst": 0.7119,
    "concave_points_worst": 0.2654,
    "symmetry_worst": 0.4601,
    "fractal_dimension_worst": 0.1189,
}


def test_health_check():
    """GET /health must return 200 OK with status='ok'."""
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "ok"
    assert data["models_loaded"] == 5
    assert "disclaimer" in data


def test_predict_benign_sample():
    """POST /api/v1/predict with benign input features."""
    res = client.post("/api/v1/predict?model_id=I3", json=SAMPLE_BENIGN)
    assert res.status_code == 200
    data = res.json()
    assert data["prediction"] == "Benign"
    assert data["benign_prob"] >= 0.5
    assert len(data["decision_path"]) > 0
    assert data["accuracy"] > 0.8
    assert "disclaimer" in data


def test_predict_malignant_sample():
    """POST /api/v1/predict with malignant input features."""
    res = client.post("/api/v1/predict?model_id=I3", json=SAMPLE_MALIGNANT)
    assert res.status_code == 200
    data = res.json()
    assert data["prediction"] == "Malignant"
    assert data["malignant_prob"] >= 0.5
    assert len(data["decision_path"]) > 0


def test_predict_with_custom_scratch_tree():
    """POST /api/v1/predict with model_id=C0 (custom tree from scratch)."""
    res = client.post("/api/v1/predict?model_id=C0", json=SAMPLE_BENIGN)
    assert res.status_code == 200
    data = res.json()
    assert data["selected_model_id"] == "C0"
    assert data["prediction"] in ("Benign", "Malignant")
    assert len(data["decision_path"]) > 0


def test_predict_invalid_negative_feature():
    """POST /api/v1/predict with negative value should fail with 422."""
    bad_sample = dict(SAMPLE_BENIGN)
    bad_sample["radius_mean"] = -5.0
    res = client.post("/api/v1/predict", json=bad_sample)
    assert res.status_code == 422


def test_get_models():
    """GET /api/v1/models should return 5 models with computed metrics."""
    res = client.get("/api/v1/models")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 5
    model_ids = [m["id"] for m in data]
    assert "I3" in model_ids
    assert "C0" in model_ids
    assert "B0" in model_ids
    assert data[0]["accuracy"] is not None


def test_get_experiments():
    """GET /api/v1/experiments should return benchmark comparison matrix."""
    res = client.get("/api/v1/experiments")
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 5
    for row in data:
        assert row["accuracy"] > 0.7
        assert row["error_rate"] >= 0.0
        assert row["f1_score"] > 0.7


def test_get_tree_structure():
    """GET /api/v1/tree-structure should return tree hierarchy."""
    res = client.get("/api/v1/tree-structure?model_id=I3")
    assert res.status_code == 200
    data = res.json()
    assert "id" in data
    assert "samples" in data
    assert "children" in data
