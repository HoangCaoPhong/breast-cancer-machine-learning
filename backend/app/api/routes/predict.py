"""FastAPI route handlers for breast cancer prediction, models, and experiments."""

from fastapi import APIRouter, Query, status

from app.schemas.prediction import (
    BreastCancerFeaturesSchema,
    ExperimentMetricSchema,
    ModelOptionInfoSchema,
    PredictionResponseSchema,
    TreeNodeSchema,
)
from app.services.prediction_service import prediction_service

router = APIRouter(tags=["Predictions & Experiments"])


@router.post(
    "/predict",
    response_model=PredictionResponseSchema,
    status_code=status.HTTP_200_OK,
    summary="Predict breast cancer malignancy and trace decision path",
)
def predict_breast_cancer(
    features: BreastCancerFeaturesSchema,
    model_id: str | None = Query(
        "I3",
        description="Target model identifier (e.g. 'I3', 'C0', 'B0', 'I1', 'I2')",
    ),
) -> PredictionResponseSchema:
    """Predict Malignant vs Benign using the selected Decision Tree model.

    Validates all 30 real-valued biological features, runs inference through
    the chosen model, and returns the decision tree traversal path and actual metrics.
    """
    return prediction_service.predict(features, model_id=model_id)


@router.get(
    "/models",
    response_model=list[ModelOptionInfoSchema],
    status_code=status.HTTP_200_OK,
    summary="List all available Decision Tree models with actual benchmark metrics",
)
def get_available_models() -> list[ModelOptionInfoSchema]:
    """Retrieve metadata and test metrics for all 5 trained models."""
    return prediction_service.get_model_options()


@router.get(
    "/experiments",
    response_model=list[ExperimentMetricSchema],
    status_code=status.HTTP_200_OK,
    summary="Get 5-experiment comparative metrics matrix",
)
def get_experiment_comparison() -> list[ExperimentMetricSchema]:
    """Retrieve the comparison table data across Baseline, Scratch, and 3 Improvements."""
    return prediction_service.get_experiments()


@router.get(
    "/tree-structure",
    response_model=TreeNodeSchema,
    status_code=status.HTTP_200_OK,
    summary="Get hierarchical tree structure for diagram visualization",
)
def get_decision_tree_structure(
    model_id: str | None = Query(
        "I3",
        description="Model ID to extract tree structure for",
    ),
) -> TreeNodeSchema:
    """Return JSON hierarchical tree representing nodes, thresholds, criteria, and leaves."""
    return prediction_service.get_tree_structure(model_id=model_id)
