"""Unit tests for min_samples tuning module (Experiment I3).

Deterministic tests with synthetic fixtures – no network calls.
"""

from __future__ import annotations

import json

import pandas as pd
import pytest
from app.ml.sklearn_tree.min_samples import (
    GridCandidateResult,
    MinSamplesConfig,
    MinSamplesExperimentResult,
    run_min_samples_tuning,
)
from sklearn.datasets import make_classification


@pytest.fixture()
def small_synthetic_data() -> tuple[pd.DataFrame, pd.Series]:
    """100-sample, 10-feature synthetic dataset with M/B labels."""
    X, y = make_classification(
        n_samples=100,
        n_features=10,
        n_informative=6,
        n_redundant=2,
        random_state=42,
        class_sep=1.5,
    )
    feature_names = [f"feat_{i}" for i in range(10)]
    features = pd.DataFrame(X, columns=feature_names)
    target = pd.Series(["M" if label == 1 else "B" for label in y], name="diagnosis")
    return features, target


def test_min_samples_config_defaults() -> None:
    config = MinSamplesConfig()
    assert config.test_size == 0.2
    assert config.random_state == 42
    assert config.criterion == "gini"
    assert config.min_samples_split_grid == (2, 5, 10, 20, 50)
    assert config.min_samples_leaf_grid == (1, 2, 5, 10, 20)
    assert config.cv_folds == 5
    assert config.positive_class == "M"
    assert config.negative_class == "B"
    assert config.primary_metric == "malignant_f2"


def test_min_samples_config_invalid_values() -> None:
    with pytest.raises(ValueError, match="test_size"):
        MinSamplesConfig(test_size=1.5)
    with pytest.raises(ValueError, match="criterion"):
        MinSamplesConfig(criterion="invalid")
    with pytest.raises(ValueError, match="min_samples_split_grid"):
        MinSamplesConfig(min_samples_split_grid=(1, 2))
    with pytest.raises(ValueError, match="min_samples_leaf_grid"):
        MinSamplesConfig(min_samples_leaf_grid=(0, 1))
    with pytest.raises(ValueError, match="cv_folds"):
        MinSamplesConfig(cv_folds=1)
    with pytest.raises(ValueError, match="positive_class and negative_class"):
        MinSamplesConfig(positive_class="M", negative_class="M")
    with pytest.raises(ValueError, match="primary_metric"):
        MinSamplesConfig(primary_metric="malignant_recall")


def test_min_samples_config_from_mapping() -> None:
    mapping = {
        "test_size": 0.25,
        "random_state": 123,
        "criterion": "entropy",
        "min_samples_split_grid": [2, 10],
        "min_samples_leaf_grid": [1, 5],
        "cv_folds": 3,
    }
    config = MinSamplesConfig.from_mapping(mapping)
    assert config.test_size == 0.25
    assert config.random_state == 123
    assert config.criterion == "entropy"
    assert config.min_samples_split_grid == (2, 10)
    assert config.min_samples_leaf_grid == (1, 5)
    assert config.cv_folds == 3


def test_run_min_samples_tuning_output_structure(
    small_synthetic_data: tuple[pd.DataFrame, pd.Series],
) -> None:
    features, target = small_synthetic_data
    config = MinSamplesConfig(
        min_samples_split_grid=(2, 5),
        min_samples_leaf_grid=(1, 2),
        cv_folds=3,
        random_state=42,
    )
    result = run_min_samples_tuning(features, target, config)

    assert isinstance(result, MinSamplesExperimentResult)
    assert len(result.all_candidates) == 4  # 2 x 2
    assert isinstance(result.baseline_candidate, GridCandidateResult)
    assert isinstance(result.best_candidate, GridCandidateResult)
    assert result.baseline_candidate.min_samples_split == 2
    assert result.baseline_candidate.min_samples_leaf == 1
    assert result.train_size == 80
    assert result.test_size == 20
    assert "test_accuracy_delta" in result.delta_vs_baseline
    assert "test_malignant_recall_delta" in result.delta_vs_baseline
    assert "n_leaves_delta" in result.delta_vs_baseline


def test_candidate_metrics_ranges(
    small_synthetic_data: tuple[pd.DataFrame, pd.Series],
) -> None:
    features, target = small_synthetic_data
    config = MinSamplesConfig(
        min_samples_split_grid=(2, 5),
        min_samples_leaf_grid=(1, 2),
        cv_folds=3,
    )
    result = run_min_samples_tuning(features, target, config)

    for cand in result.all_candidates:
        assert 0.0 <= cand.cv_f2_mean <= 1.0
        assert 0.0 <= cand.cv_f2_std <= 1.0
        assert 0.0 <= cand.cv_recall_mean <= 1.0
        assert 0.0 <= cand.cv_recall_std <= 1.0
        assert 0.0 <= cand.test_metrics.accuracy <= 1.0
        assert 0.0 <= cand.test_metrics.malignant_recall <= 1.0
        assert 0.0 <= cand.test_metrics.malignant_f1 <= 1.0
        assert cand.fitted_depth >= 0
        assert cand.n_leaves >= 1
        assert cand.training_time_ms >= 0.0
        assert cand.inference_latency_us >= 0.0


def test_candidate_to_dict_serializable(
    small_synthetic_data: tuple[pd.DataFrame, pd.Series],
) -> None:
    features, target = small_synthetic_data
    config = MinSamplesConfig(
        min_samples_split_grid=(2,),
        min_samples_leaf_grid=(1,),
        cv_folds=2,
    )
    result = run_min_samples_tuning(features, target, config)
    d = result.best_candidate.to_dict()
    serialized = json.dumps(d)
    assert isinstance(serialized, str)


def test_validation_rejects_missing_values(
    small_synthetic_data: tuple[pd.DataFrame, pd.Series],
) -> None:
    features, target = small_synthetic_data
    corrupt_features = features.copy()
    corrupt_features.iloc[0, 0] = None

    with pytest.raises(ValueError, match="missing values"):
        run_min_samples_tuning(corrupt_features, target)


def test_validation_rejects_empty_data() -> None:
    empty_df = pd.DataFrame()
    empty_target = pd.Series(dtype=str)
    with pytest.raises(ValueError, match="empty"):
        run_min_samples_tuning(empty_df, empty_target)
