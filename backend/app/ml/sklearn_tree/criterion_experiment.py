"""Controlled fitting of Gini and Entropy Decision Tree variants.

This module owns only the I2 model change. Dataset splitting and shared metric
calculation belong to the preprocessing and evaluation modules respectively.
"""

from __future__ import annotations

import math
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from typing import Any

import numpy as np
from numpy.typing import ArrayLike
from sklearn.tree import DecisionTreeClassifier, export_text

CRITERIA = ("gini", "entropy")


@dataclass(frozen=True)
class CriterionRun:
    """A fitted criterion variant and its model-specific structural outputs."""

    criterion: str
    estimator: DecisionTreeClassifier
    model_parameters: Mapping[str, Any]
    tree_depth: int
    leaf_count: int
    feature_importances: tuple[float, ...]
    rules: str


def gini_impurity(class_probabilities: Sequence[float]) -> float:
    # Calculate Gini impurity for a class-probability distribution

    probabilities = _validate_probabilities(class_probabilities)
    # Gini = 1 - sum(p_k^2).
    return float(1.0 - np.square(probabilities).sum())


def entropy_impurity(class_probabilities: Sequence[float]) -> float:
    # Calculate base-2 Shannon entropy for a class-probability distribution

    probabilities = _validate_probabilities(class_probabilities)
    # Skip p=0 because its contribution is defined by limit as 0.
    return float(
        -sum(probability * math.log2(probability) for probability in probabilities if probability)
    )


def fit_gini_and_entropy(
    X_train: ArrayLike,
    y_train: ArrayLike,
    *,
    model_parameters: Mapping[str, Any],
    feature_names: Sequence[str] | None = None,
    rule_max_depth: int = 3,
) -> dict[str, CriterionRun]:
    """Fit Gini and Entropy trees while keeping every other setting identical.

    The shared evaluation module can consume each returned estimator to calculate
    the canonical metrics on validation or test data. ``model_parameters`` must
    come from the accepted baseline and include ``random_state``.
    """

    parameters = dict(model_parameters)
    # Criterion is the only independent variable in experiment I2.
    if "criterion" in parameters:
        raise ValueError("model_parameters must not contain criterion")
    if "random_state" not in parameters or parameters["random_state"] is None:
        raise ValueError("model_parameters must include the canonical random_state")
    if rule_max_depth < 0:
        raise ValueError("rule_max_depth must be non-negative")

    train_features = np.asarray(X_train)
    train_targets = np.asarray(y_train)
    _validate_training_data(train_features, train_targets)

    resolved_feature_names = _resolve_feature_names(
        X_train,
        train_features.shape[1],
        feature_names,
    )
    runs: dict[str, CriterionRun] = {}
    # Fit the same accepted baseline once for each splitting criterion.
    for criterion in CRITERIA:
        estimator = DecisionTreeClassifier(criterion=criterion, **parameters)
        estimator.fit(train_features, train_targets)
        runs[criterion] = CriterionRun(
            criterion=criterion,
            estimator=estimator,
            model_parameters=estimator.get_params(deep=False),
            tree_depth=estimator.get_depth(),
            leaf_count=estimator.get_n_leaves(),
            feature_importances=tuple(float(value) for value in estimator.feature_importances_),
            rules=export_text(
                estimator,
                feature_names=resolved_feature_names,
                max_depth=rule_max_depth,
            ),
        )

    # Catch accidental parameter drift before shared evaluation starts.
    _assert_only_criterion_differs(runs)
    return runs


def _validate_probabilities(class_probabilities: Sequence[float]) -> np.ndarray:
    # Validate and convert the probabilities used by impurity helpers

    probabilities = np.asarray(class_probabilities, dtype=float)
    if probabilities.ndim != 1 or len(probabilities) == 0:
        raise ValueError("class_probabilities must be a non-empty one-dimensional sequence")
    if not np.isfinite(probabilities).all() or (probabilities < 0).any():
        raise ValueError("class probabilities must be finite and non-negative")
    if not np.isclose(probabilities.sum(), 1.0):
        raise ValueError("class probabilities must sum to 1")
    return probabilities


def _validate_training_data(X_train: np.ndarray, y_train: np.ndarray) -> None:
    # Check the minimal binary-classification training contract.

    if X_train.ndim != 2:
        raise ValueError("X_train must be two-dimensional")
    if y_train.ndim != 1:
        raise ValueError("y_train must be one-dimensional")
    if len(X_train) == 0 or len(X_train) != len(y_train):
        raise ValueError("X_train and y_train must be non-empty and have equal length")
    if len(np.unique(y_train)) != 2:
        raise ValueError("y_train must contain exactly two classes")


def _resolve_feature_names(
    original_features: ArrayLike,
    feature_count: int,
    feature_names: Sequence[str] | None,
) -> list[str]:

    # Preserve DataFrame columns or create readable fallback names
    if feature_names is None and hasattr(original_features, "columns"):
        feature_names = [str(column) for column in original_features.columns]
    if feature_names is None:
        return [f"feature_{index}" for index in range(feature_count)]
    if len(feature_names) != feature_count:
        raise ValueError("feature_names must match the feature count")
    return [str(name) for name in feature_names]


def _assert_only_criterion_differs(runs: Mapping[str, CriterionRun]) -> None:

    # Ensure the comparison did not change any other model parameter
    gini_parameters = dict(runs["gini"].model_parameters)
    entropy_parameters = dict(runs["entropy"].model_parameters)
    gini_parameters.pop("criterion")
    entropy_parameters.pop("criterion")
    if gini_parameters != entropy_parameters:
        raise RuntimeError("criterion variants differ in parameters other than criterion")
