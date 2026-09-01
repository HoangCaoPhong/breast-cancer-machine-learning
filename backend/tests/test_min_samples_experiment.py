"""Unit tests for experiment I3 – min_samples_split / min_samples_leaf.

All tests use tiny, hand-crafted fixtures – no network calls and no UCI download.
These tests cover:
- Dataset loading returns correct shapes and value range
- Stratified split preserves class ratio
- run_single_config returns valid, deterministic metrics
- run_min_samples_experiment covers the full grid and returns a best config
  whose parameters are within the declared search space
- Baseline config (mss=2, msl=1) is always in the result set
- CV recall and test metrics are in [0, 1]
- False-negative count is non-negative and consistent with confusion matrix
- Tree depth and leaf count are positive integers
- Results are deterministic across repeated calls
"""

from __future__ import annotations

import json

import numpy as np
import pytest
from app.ml.preprocessing.loader import (
    SPLIT_TEST_SIZE,
    get_train_test_split,
    load_dataset,
)
from app.ml.sklearn_tree.min_samples_experiment import (
    MIN_SAMPLES_LEAF_GRID,
    MIN_SAMPLES_SPLIT_GRID,
    ExperimentResult,
    SingleRunMetrics,
    run_min_samples_experiment,
    run_single_config,
)
from sklearn.datasets import make_classification

# ── Fixtures ──────────────────────────────────────────────────────────────────


@pytest.fixture()
def small_binary_dataset() -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """100-sample, 10-feature binary dataset with no network dependency."""
    X, y = make_classification(
        n_samples=100,
        n_features=10,
        n_informative=6,
        n_redundant=2,
        random_state=42,
        class_sep=1.5,
    )
    # 80/20 split mirroring loader
    split_idx = 80
    return X[:split_idx], X[split_idx:], y[:split_idx], y[split_idx:]


# ── loader tests ──────────────────────────────────────────────────────────────


def test_load_dataset_shape() -> None:
    X, y, feature_names = load_dataset()
    assert X.shape == (569, 30), "Dataset must have 569 samples and 30 features"
    assert y.shape == (569,), "Target must have 569 labels"
    assert len(feature_names) == 30, "Must have exactly 30 feature names"


def test_load_dataset_target_binary() -> None:
    _, y, _ = load_dataset()
    unique = set(y.tolist())
    assert unique == {0, 1}, f"Target must be binary {{0, 1}}, got {unique}"


def test_load_dataset_target_remap() -> None:
    """M=1 (malignant, positive class); should be ~37 % of 569 samples."""
    _, y, _ = load_dataset()
    malignant_ratio = y.mean()
    assert 0.30 <= malignant_ratio <= 0.45, (
        f"Malignant ratio {malignant_ratio:.3f} outside expected range [0.30, 0.45]"
    )


def test_train_test_split_sizes() -> None:
    split = get_train_test_split()
    n_total = split.X_train.shape[0] + split.X_test.shape[0]
    assert n_total == 569
    expected_test = round(569 * SPLIT_TEST_SIZE)
    assert abs(split.X_test.shape[0] - expected_test) <= 1


def test_train_test_split_stratified() -> None:
    """Class ratio in train and test should be close (stratified split)."""
    split = get_train_test_split()
    train_ratio = split.y_train.mean()
    test_ratio = split.y_test.mean()
    assert abs(train_ratio - test_ratio) < 0.05, (
        f"Stratified split should keep class ratios close: "
        f"train={train_ratio:.3f}, test={test_ratio:.3f}"
    )


def test_train_test_split_deterministic() -> None:
    split1 = get_train_test_split()
    split2 = get_train_test_split()
    np.testing.assert_array_equal(split1.y_train, split2.y_train)
    np.testing.assert_array_equal(split1.y_test, split2.y_test)


# ── run_single_config tests ───────────────────────────────────────────────────


def test_run_single_config_returns_correct_type(
    small_binary_dataset: tuple,
) -> None:
    X_train, X_test, y_train, y_test = small_binary_dataset
    result = run_single_config(2, 1, X_train, y_train, X_test, y_test)
    assert isinstance(result, SingleRunMetrics)


def test_run_single_config_params_recorded(
    small_binary_dataset: tuple,
) -> None:
    X_train, X_test, y_train, y_test = small_binary_dataset
    result = run_single_config(10, 5, X_train, y_train, X_test, y_test)
    assert result.min_samples_split == 10
    assert result.min_samples_leaf == 5


@pytest.mark.parametrize("mss,msl", [(2, 1), (10, 5), (20, 10)])
def test_run_single_config_metrics_in_range(
    small_binary_dataset: tuple,
    mss: int,
    msl: int,
) -> None:
    X_train, X_test, y_train, y_test = small_binary_dataset
    r = run_single_config(mss, msl, X_train, y_train, X_test, y_test)
    assert 0.0 <= r.cv_recall_mean <= 1.0, "CV recall must be in [0, 1]"
    assert 0.0 <= r.cv_recall_std <= 1.0, "CV recall std must be in [0, 1]"
    assert 0.0 <= r.test_accuracy <= 1.0, "Test accuracy must be in [0, 1]"
    assert 0.0 <= r.test_recall_malignant <= 1.0
    assert 0.0 <= r.test_precision_malignant <= 1.0
    assert 0.0 <= r.test_f1_malignant <= 1.0
    assert r.test_false_negative_count >= 0
    assert r.tree_depth >= 0
    assert r.leaf_count >= 1


def test_run_single_config_error_rate_consistent(
    small_binary_dataset: tuple,
) -> None:
    X_train, X_test, y_train, y_test = small_binary_dataset
    r = run_single_config(2, 1, X_train, y_train, X_test, y_test)
    assert abs(r.test_error_rate - (1.0 - r.test_accuracy)) < 1e-9, (
        "error_rate must equal 1 - accuracy"
    )


def test_run_single_config_false_negative_from_cm(
    small_binary_dataset: tuple,
) -> None:
    """FN count must match the [1, 0] cell of the confusion matrix."""
    X_train, X_test, y_train, y_test = small_binary_dataset
    r = run_single_config(2, 1, X_train, y_train, X_test, y_test)
    cm = r.confusion_mat
    if cm.shape == (2, 2):
        assert r.test_false_negative_count == int(cm[1, 0])


def test_run_single_config_deterministic(
    small_binary_dataset: tuple,
) -> None:
    X_train, X_test, y_train, y_test = small_binary_dataset
    r1 = run_single_config(5, 2, X_train, y_train, X_test, y_test)
    r2 = run_single_config(5, 2, X_train, y_train, X_test, y_test)
    assert r1.cv_recall_mean == r2.cv_recall_mean
    assert r1.test_accuracy == r2.test_accuracy


# ── run_min_samples_experiment tests ─────────────────────────────────────────


def test_experiment_covers_full_grid(small_binary_dataset: tuple) -> None:
    X_train, X_test, y_train, y_test = small_binary_dataset
    mss_grid = [2, 5]
    msl_grid = [1, 2]
    result = run_min_samples_experiment(
        X_train,
        y_train,
        X_test,
        y_test,
        mss_grid=mss_grid,
        msl_grid=msl_grid,
    )
    assert len(result.all_runs) == len(mss_grid) * len(msl_grid)


def test_experiment_returns_experiment_result(small_binary_dataset: tuple) -> None:
    X_train, X_test, y_train, y_test = small_binary_dataset
    result = run_min_samples_experiment(
        X_train,
        y_train,
        X_test,
        y_test,
        mss_grid=[2, 5],
        msl_grid=[1, 2],
    )
    assert isinstance(result, ExperimentResult)


def test_best_run_in_search_space(small_binary_dataset: tuple) -> None:
    X_train, X_test, y_train, y_test = small_binary_dataset
    result = run_min_samples_experiment(
        X_train,
        y_train,
        X_test,
        y_test,
        mss_grid=MIN_SAMPLES_SPLIT_GRID,
        msl_grid=MIN_SAMPLES_LEAF_GRID,
    )
    assert result.best_run.min_samples_split in MIN_SAMPLES_SPLIT_GRID
    assert result.best_run.min_samples_leaf in MIN_SAMPLES_LEAF_GRID


def test_baseline_always_present(small_binary_dataset: tuple) -> None:
    """Baseline config (mss=2, msl=1) must always be in the results."""
    X_train, X_test, y_train, y_test = small_binary_dataset
    result = run_min_samples_experiment(
        X_train,
        y_train,
        X_test,
        y_test,
        mss_grid=MIN_SAMPLES_SPLIT_GRID,
        msl_grid=MIN_SAMPLES_LEAF_GRID,
    )
    baseline = result.baseline_run
    assert baseline.min_samples_split == 2
    assert baseline.min_samples_leaf == 1


def test_experiment_deterministic(small_binary_dataset: tuple) -> None:
    X_train, X_test, y_train, y_test = small_binary_dataset
    r1 = run_min_samples_experiment(
        X_train,
        y_train,
        X_test,
        y_test,
        mss_grid=[2, 5],
        msl_grid=[1, 2],
    )
    r2 = run_min_samples_experiment(
        X_train,
        y_train,
        X_test,
        y_test,
        mss_grid=[2, 5],
        msl_grid=[1, 2],
    )
    assert r1.best_run.min_samples_split == r2.best_run.min_samples_split
    assert r1.best_run.min_samples_leaf == r2.best_run.min_samples_leaf
    assert r1.best_run.test_accuracy == r2.best_run.test_accuracy


def test_as_dict_serialisable(small_binary_dataset: tuple) -> None:
    """SingleRunMetrics.as_dict() must return JSON-serialisable types."""
    X_train, X_test, y_train, y_test = small_binary_dataset
    r = run_single_config(2, 1, X_train, y_train, X_test, y_test)
    d = r.as_dict()
    json.dumps(d)  # should not raise
