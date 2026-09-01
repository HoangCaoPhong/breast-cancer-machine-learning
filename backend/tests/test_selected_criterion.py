"""Tests for the versioned I2 criterion preset."""

import numpy as np
import pytest
from app.ml.custom_tree import DecisionTreeClassifierScratch
from app.ml.selected_models import (
    SELECTED_CRITERION_CONFIG,
    build_selected_criterion_model,
    selected_criterion_metadata,
)
from sklearn.tree import DecisionTreeClassifier


@pytest.mark.parametrize(
    ("implementation", "expected_type"),
    [
        ("custom", DecisionTreeClassifierScratch),
        ("sklearn", DecisionTreeClassifier),
    ],
)
def test_selected_criterion_factory_builds_canonical_gini_models(
    implementation: str,
    expected_type: type,
) -> None:
    model = build_selected_criterion_model(implementation)  # type: ignore[arg-type]

    assert isinstance(model, expected_type)
    assert model.criterion == "gini"
    assert model.max_depth is None
    assert model.min_samples_split == 2
    assert model.min_samples_leaf == 1

    features = np.arange(24, dtype=float).reshape(12, 2)
    target = np.array(["B"] * 6 + ["M"] * 6)
    model.fit(features, target)
    assert model.get_depth() >= 1


def test_selected_criterion_metadata_matches_canonical_results() -> None:
    metadata = selected_criterion_metadata()

    assert metadata["model_id"] == "I2"
    assert metadata["version"] == "i2-criterion-v1"
    assert metadata["criteria_tested"] == ("gini", "entropy")
    assert metadata["max_depth"] is None
    assert metadata["selection_metric"] == "malignant_f2_beta_2"
    assert metadata["custom_result"]["selected_criterion"] == "gini"
    assert metadata["custom_result"]["validation_f2_mean"] == pytest.approx(0.9027)
    assert metadata["sklearn_result"]["selected_criterion"] == "gini"
    assert metadata["sklearn_result"]["validation_f2_mean"] == pytest.approx(0.8948)
    assert SELECTED_CRITERION_CONFIG.cv_folds == 5


def test_selected_criterion_factory_rejects_unknown_implementation() -> None:
    with pytest.raises(ValueError, match="Unsupported implementation"):
        build_selected_criterion_model("unknown")  # type: ignore[arg-type]
