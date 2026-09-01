"""Tests for the versioned I1 max-depth preset."""

import numpy as np
import pytest
from app.ml.custom_tree import DecisionTreeClassifierScratch
from app.ml.sklearn_tree import (
    SELECTED_MAX_DEPTH_CONFIG,
    build_selected_max_depth_model,
    selected_max_depth_metadata,
)
from sklearn.tree import DecisionTreeClassifier


@pytest.mark.parametrize(
    ("implementation", "expected_type"),
    [
        ("custom", DecisionTreeClassifierScratch),
        ("sklearn", DecisionTreeClassifier),
    ],
)
def test_selected_max_depth_factory_builds_depth_eight_models(
    implementation: str,
    expected_type: type,
) -> None:
    model = build_selected_max_depth_model(implementation)  # type: ignore[arg-type]

    assert isinstance(model, expected_type)
    assert model.criterion == "gini"
    assert model.max_depth == 8
    assert model.min_samples_split == 2
    assert model.min_samples_leaf == 1

    features = np.arange(24, dtype=float).reshape(12, 2)
    target = np.array(["B"] * 6 + ["M"] * 6)
    model.fit(features, target)
    assert model.get_depth() <= 8


def test_selected_max_depth_metadata_is_versioned_and_serializable() -> None:
    metadata = selected_max_depth_metadata()

    assert metadata["model_id"] == "I1"
    assert metadata["version"] == "i1-max-depth-v1"
    assert metadata["max_depth"] == 8
    assert metadata["selection_metric"] == "malignant_f2_beta_2"
    assert metadata["positive_class"] == "M"
    assert metadata == selected_max_depth_metadata()
    assert SELECTED_MAX_DEPTH_CONFIG.max_depth == 8


def test_selected_max_depth_factory_rejects_unknown_implementation() -> None:
    with pytest.raises(ValueError, match="Unsupported implementation"):
        build_selected_max_depth_model("unknown")  # type: ignore[arg-type]
