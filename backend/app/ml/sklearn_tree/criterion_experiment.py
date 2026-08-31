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
import pandas as pd
from numpy.typing import ArrayLike
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.tree import DecisionTreeClassifier, export_text

from app.ml.evaluation import (
    BinaryClassificationMetrics,
    compute_binary_classification_metrics,
)
from app.ml.sklearn_tree.baseline import BaselineConfig

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


@dataclass(slots=True)
class CriterionExperimentResult:
    """Canonical cross-validation comparison and selected-model test result."""

    runs: dict[str, CriterionRun]
    train_metrics: dict[str, BinaryClassificationMetrics]
    validation_metrics: dict[str, tuple[BinaryClassificationMetrics, ...]]
    validation_mean_metrics: dict[str, dict[str, float | None]]
    validation_std_metrics: dict[str, dict[str, float | None]]
    selected_criterion: str
    selected_test_metrics: BinaryClassificationMetrics
    feature_names: tuple[str, ...]
    class_names: tuple[str, ...]
    train_size: int
    test_size: int
    cv_folds: int


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


def run_criterion_experiment(
    features: pd.DataFrame,
    target: pd.Series,
    config: BaselineConfig | None = None,
    *,
    cv_folds: int = 5,
) -> CriterionExperimentResult:
    """Compare criteria on training CV, then test only the selected variant."""

    settings = config or BaselineConfig()
    _validate_dataset(features, target, settings)
    if isinstance(cv_folds, bool) or not isinstance(cv_folds, int) or cv_folds < 2:
        raise ValueError("cv_folds must be an integer of at least 2")
    X_train, X_test, y_train, y_test = train_test_split(
        features,
        target,
        test_size=settings.test_size,
        random_state=settings.random_state,
        stratify=target,
    )
    model_parameters = {
        "max_depth": settings.max_depth,
        "min_samples_split": settings.min_samples_split,
        "min_samples_leaf": settings.min_samples_leaf,
        "random_state": settings.random_state,
    }
    validation_metrics: dict[str, list[BinaryClassificationMetrics]] = {
        criterion: [] for criterion in CRITERIA
    }
    cross_validator = StratifiedKFold(
        n_splits=cv_folds,
        shuffle=True,
        random_state=settings.random_state,
    )
    for fold_train_indices, validation_indices in cross_validator.split(X_train, y_train):
        fold_features = X_train.iloc[fold_train_indices]
        fold_target = y_train.iloc[fold_train_indices]
        validation_features = X_train.iloc[validation_indices]
        validation_target = y_train.iloc[validation_indices]
        fold_runs = fit_gini_and_entropy(
            fold_features,
            fold_target,
            model_parameters=model_parameters,
            feature_names=features.columns,
        )
        for criterion, fold_run in fold_runs.items():
            validation_metrics[criterion].append(
                _evaluate(
                    fold_run.estimator,
                    validation_features,
                    validation_target,
                    settings,
                )
            )

    frozen_validation_metrics = {
        criterion: tuple(metrics) for criterion, metrics in validation_metrics.items()
    }
    validation_mean_metrics: dict[str, dict[str, float | None]] = {}
    validation_std_metrics: dict[str, dict[str, float | None]] = {}
    for criterion, metrics in frozen_validation_metrics.items():
        means, standard_deviations = _aggregate_metrics(metrics)
        validation_mean_metrics[criterion] = means
        validation_std_metrics[criterion] = standard_deviations
    selected_criterion = _select_criterion(validation_mean_metrics)

    runs = fit_gini_and_entropy(
        X_train,
        y_train,
        model_parameters=model_parameters,
        feature_names=features.columns,
    )

    train_metrics: dict[str, BinaryClassificationMetrics] = {}
    for criterion, run in runs.items():
        train_metrics[criterion] = _evaluate(
            run.estimator,
            X_train,
            y_train,
            settings,
        )
    selected_test_metrics = _evaluate(
        runs[selected_criterion].estimator,
        X_test,
        y_test,
        settings,
    )

    class_names = tuple(str(label) for label in runs[CRITERIA[0]].estimator.classes_)
    return CriterionExperimentResult(
        runs=runs,
        train_metrics=train_metrics,
        validation_metrics=frozen_validation_metrics,
        validation_mean_metrics=validation_mean_metrics,
        validation_std_metrics=validation_std_metrics,
        selected_criterion=selected_criterion,
        selected_test_metrics=selected_test_metrics,
        feature_names=tuple(str(column) for column in features.columns),
        class_names=class_names,
        train_size=len(X_train),
        test_size=len(X_test),
        cv_folds=cv_folds,
    )


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


def _validate_dataset(
    features: pd.DataFrame,
    target: pd.Series,
    config: BaselineConfig,
) -> None:
    if not isinstance(features, pd.DataFrame):
        raise TypeError("features must be a pandas DataFrame")
    if not isinstance(target, pd.Series):
        raise TypeError("target must be a pandas Series")
    if features.empty or features.shape[1] == 0:
        raise ValueError("features must not be empty")
    if len(features) != len(target):
        raise ValueError("features and target must contain the same number of samples")
    if features.isna().any().any() or target.isna().any():
        raise ValueError("features and target must not contain missing values")
    expected_labels = {config.negative_class, config.positive_class}
    if set(target) != expected_labels:
        raise ValueError(f"target labels must be exactly {sorted(expected_labels)}")


def _evaluate(
    estimator: DecisionTreeClassifier,
    features: pd.DataFrame,
    target: pd.Series,
    config: BaselineConfig,
) -> BinaryClassificationMetrics:
    positive_index = list(estimator.classes_).index(config.positive_class)
    predictions = estimator.predict(features.to_numpy())
    positive_scores = estimator.predict_proba(features.to_numpy())[:, positive_index]
    return compute_binary_classification_metrics(
        target,
        predictions,
        positive_class=config.positive_class,
        negative_class=config.negative_class,
        positive_scores=positive_scores,
    )


def _aggregate_metrics(
    metrics: tuple[BinaryClassificationMetrics, ...],
) -> tuple[dict[str, float | None], dict[str, float | None]]:
    means: dict[str, float | None] = {}
    standard_deviations: dict[str, float | None] = {}
    for name in BinaryClassificationMetrics.__dataclass_fields__:
        values = [getattr(fold_metrics, name) for fold_metrics in metrics]
        if any(value is None for value in values):
            means[name] = None
            standard_deviations[name] = None
            continue
        numeric_values = np.asarray(values, dtype=float)
        means[name] = float(numeric_values.mean())
        standard_deviations[name] = float(numeric_values.std())
    return means, standard_deviations


def _select_criterion(
    validation_mean_metrics: Mapping[str, Mapping[str, float | None]],
) -> str:
    """Select by malignant F2, then recall, then stable Gini-first order."""

    def selection_key(criterion: str) -> tuple[float, float, int]:
        metrics = validation_mean_metrics[criterion]
        malignant_f2 = metrics["malignant_f2"]
        malignant_recall = metrics["malignant_recall"]
        if malignant_f2 is None or malignant_recall is None:
            raise RuntimeError("Selection metrics must be available for every criterion")
        return malignant_f2, malignant_recall, -CRITERIA.index(criterion)

    return max(CRITERIA, key=selection_key)


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
