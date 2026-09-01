"""Tests for the versioned I3 selected-model preset."""

import json

import pytest
from app.ml.custom_tree import DecisionTreeClassifierScratch
from app.ml.selected_models import (
    SELECTED_MIN_SAMPLES_CONFIG,
    build_selected_min_samples_model,
    selected_min_samples_metadata,
)
from sklearn.tree import DecisionTreeClassifier


@pytest.mark.parametrize(
    ("implementation", "expected_type"),
    [("custom", DecisionTreeClassifierScratch), ("sklearn", DecisionTreeClassifier)],
)
def test_selected_min_samples_factory_builds_selected_models(
    implementation: str,
    expected_type: type,
) -> None:
    model = build_selected_min_samples_model(implementation)  # type: ignore[arg-type]

    assert isinstance(model, expected_type)
    assert model.min_samples_split == 5
    assert model.min_samples_leaf == 1
    assert model.max_depth is None
    assert model.criterion == "gini"


def test_selected_min_samples_metadata_is_versioned_and_serializable() -> None:
    metadata = selected_min_samples_metadata()

    assert metadata["model_id"] == "I3"
    assert metadata["version"] == "i3-min-samples-v1"
    assert metadata["selection_family"] == "sklearn"
    assert metadata["selection_metric"] == "malignant_f2_beta_2"
    assert metadata["result"]["validation_f2_mean"] == 0.8974
    assert SELECTED_MIN_SAMPLES_CONFIG.min_samples_split == 5
    json.dumps(metadata)


def test_selected_min_samples_factory_rejects_unknown_implementation() -> None:
    with pytest.raises(ValueError, match="Unsupported implementation"):
        build_selected_min_samples_model("unknown")  # type: ignore[arg-type]
