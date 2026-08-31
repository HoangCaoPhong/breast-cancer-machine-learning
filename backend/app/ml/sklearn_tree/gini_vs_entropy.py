"""Controlled Gini-versus-Entropy comparison for custom and sklearn trees.

The experiment imports both estimators but does not modify either implementation.
Dataset splitting and metric calculation remain delegated to shared project modules.
"""

from __future__ import annotations

import math
from collections.abc import Callable, Mapping, Sequence
from dataclasses import dataclass
from typing import Any

import numpy as np
import pandas as pd
from numpy.typing import ArrayLike
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.tree import DecisionTreeClassifier, export_text

from app.ml.custom_tree import DecisionTreeClassifierScratch
from app.ml.evaluation import (
    BinaryClassificationMetrics,
    compute_binary_classification_metrics,
)
from app.ml.sklearn_tree.baseline import BaselineConfig

CRITERIA = ("gini", "entropy")
MODEL_FAMILIES = ("custom", "sklearn")
TreeEstimator = DecisionTreeClassifierScratch | DecisionTreeClassifier
VariantFitter = Callable[
    [pd.DataFrame, pd.Series, BaselineConfig, Sequence[str]],
    dict[str, "CriterionRun"],
]


@dataclass(frozen=True)
class CriterionRun:
    """One fitted criterion variant from either model family."""

    criterion: str
    estimator: TreeEstimator
    model_parameters: Mapping[str, Any]
    tree_depth: int
    leaf_count: int
    feature_importances: tuple[float, ...] = ()
    rules: str | None = None


@dataclass(slots=True)
class CriterionFamilyResult:
    """Cross-validation and selected-model results for one tree family."""

    model_family: str
    runs: dict[str, CriterionRun]
    train_metrics: dict[str, BinaryClassificationMetrics]
    training_cv_mean_metrics: dict[str, dict[str, float | None]]
    training_cv_std_metrics: dict[str, dict[str, float | None]]
    validation_mean_metrics: dict[str, dict[str, float | None]]
    validation_std_metrics: dict[str, dict[str, float | None]]
    selected_criterion: str
    selected_test_metrics: BinaryClassificationMetrics
    feature_names: tuple[str, ...]
    class_names: tuple[str, ...]


@dataclass(slots=True)
class GiniEntropyExperimentResult:
    """Shared-split comparison across custom and sklearn Decision Trees."""

    families: dict[str, CriterionFamilyResult]
    train_size: int
    test_size: int
    cv_folds: int


# Backward-compatible result name kept for the package-level API.
CriterionExperimentResult = CriterionFamilyResult


def gini_impurity(class_probabilities: Sequence[float]) -> float:
    """Calculate Gini impurity for a class-probability distribution."""

    probabilities = _validate_probabilities(class_probabilities)
    return float(1.0 - np.square(probabilities).sum())


def entropy_impurity(class_probabilities: Sequence[float]) -> float:
    """Calculate base-2 Shannon entropy for a class-probability distribution."""

    probabilities = _validate_probabilities(class_probabilities)
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
    """Fit sklearn Gini and Entropy trees with all other settings fixed."""

    parameters = dict(model_parameters)
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
    fit_features = X_train if isinstance(X_train, pd.DataFrame) else train_features

    runs: dict[str, CriterionRun] = {}
    for criterion in CRITERIA:
        estimator = DecisionTreeClassifier(criterion=criterion, **parameters)
        estimator.fit(fit_features, train_targets)
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

    _assert_only_criterion_differs(runs)
    return runs


def run_gini_vs_entropy_experiment(
    features: pd.DataFrame,
    target: pd.Series,
    config: BaselineConfig | None = None,
    *,
    cv_folds: int = 5,
) -> GiniEntropyExperimentResult:
    """Run both model families on one split and the same stratified folds."""

    settings = config or BaselineConfig()
    _validate_dataset(features, target, settings)
    if isinstance(cv_folds, bool) or not isinstance(cv_folds, int) or cv_folds < 2:
        raise ValueError("cv_folds must be an integer of at least 2")

    X_train, X_test, y_train, y_test = train_test_split(
        features,
        target,
        test_size=settings.test_size,
        random_state=settings.random_state,
        shuffle=True,
        stratify=target,
    )
    cross_validator = StratifiedKFold(
        n_splits=cv_folds,
        shuffle=True,
        random_state=settings.random_state,
    )
    folds = tuple(cross_validator.split(X_train, y_train))
    fitters: dict[str, VariantFitter] = {
        "custom": _fit_custom_variants,
        "sklearn": _fit_sklearn_variants,
    }
    families = {
        family: _run_family(
            family,
            fitter,
            X_train,
            X_test,
            y_train,
            y_test,
            folds,
            settings,
        )
        for family, fitter in fitters.items()
    }
    return GiniEntropyExperimentResult(
        families=families,
        train_size=len(X_train),
        test_size=len(X_test),
        cv_folds=cv_folds,
    )


def run_criterion_experiment(
    features: pd.DataFrame,
    target: pd.Series,
    config: BaselineConfig | None = None,
    *,
    cv_folds: int = 5,
) -> CriterionFamilyResult:
    """Return the sklearn-family result through the original public API."""

    return run_gini_vs_entropy_experiment(
        features,
        target,
        config,
        cv_folds=cv_folds,
    ).families["sklearn"]


def _run_family(
    model_family: str,
    fitter: VariantFitter,
    X_train: pd.DataFrame,
    X_test: pd.DataFrame,
    y_train: pd.Series,
    y_test: pd.Series,
    folds: tuple[tuple[np.ndarray, np.ndarray], ...],
    config: BaselineConfig,
) -> CriterionFamilyResult:
    training_metrics: dict[str, list[BinaryClassificationMetrics]] = {
        criterion: [] for criterion in CRITERIA
    }
    validation_metrics: dict[str, list[BinaryClassificationMetrics]] = {
        criterion: [] for criterion in CRITERIA
    }
    for fold_train_indices, validation_indices in folds:
        fold_features = X_train.iloc[fold_train_indices]
        fold_target = y_train.iloc[fold_train_indices]
        validation_features = X_train.iloc[validation_indices]
        validation_target = y_train.iloc[validation_indices]
        fold_runs = fitter(fold_features, fold_target, config, X_train.columns)
        for criterion, run in fold_runs.items():
            training_metrics[criterion].append(
                _evaluate(run.estimator, fold_features, fold_target, config)
            )
            validation_metrics[criterion].append(
                _evaluate(run.estimator, validation_features, validation_target, config)
            )

    training_means, training_stds = _aggregate_by_criterion(training_metrics)
    validation_means, validation_stds = _aggregate_by_criterion(validation_metrics)
    selected_criterion = _select_criterion(validation_means)
    runs = fitter(X_train, y_train, config, X_train.columns)
    final_train_metrics = {
        criterion: _evaluate(run.estimator, X_train, y_train, config)
        for criterion, run in runs.items()
    }
    selected_test_metrics = _evaluate(
        runs[selected_criterion].estimator,
        X_test,
        y_test,
        config,
    )
    classes = runs[selected_criterion].estimator.classes_
    if classes is None:
        raise RuntimeError("Selected estimator must expose fitted classes")
    return CriterionFamilyResult(
        model_family=model_family,
        runs=runs,
        train_metrics=final_train_metrics,
        training_cv_mean_metrics=training_means,
        training_cv_std_metrics=training_stds,
        validation_mean_metrics=validation_means,
        validation_std_metrics=validation_stds,
        selected_criterion=selected_criterion,
        selected_test_metrics=selected_test_metrics,
        feature_names=tuple(str(column) for column in X_train.columns),
        class_names=tuple(str(label) for label in classes),
    )


def _fit_sklearn_variants(
    features: pd.DataFrame,
    target: pd.Series,
    config: BaselineConfig,
    feature_names: Sequence[str],
) -> dict[str, CriterionRun]:
    return fit_gini_and_entropy(
        features,
        target,
        model_parameters={
            "max_depth": config.max_depth,
            "min_samples_split": config.min_samples_split,
            "min_samples_leaf": config.min_samples_leaf,
            "random_state": config.random_state,
        },
        feature_names=feature_names,
    )


def _fit_custom_variants(
    features: pd.DataFrame,
    target: pd.Series,
    config: BaselineConfig,
    feature_names: Sequence[str],
) -> dict[str, CriterionRun]:
    del feature_names
    parameters: dict[str, Any] = {
        "max_depth": config.max_depth,
        "min_samples_split": config.min_samples_split,
        "min_samples_leaf": config.min_samples_leaf,
    }
    runs: dict[str, CriterionRun] = {}
    for criterion in CRITERIA:
        estimator = DecisionTreeClassifierScratch(criterion=criterion, **parameters)
        estimator.fit(features, target)
        runs[criterion] = CriterionRun(
            criterion=criterion,
            estimator=estimator,
            model_parameters={"criterion": criterion, **parameters},
            tree_depth=estimator.get_depth(),
            leaf_count=estimator.get_n_leaves(),
        )
    _assert_only_criterion_differs(runs)
    return runs


def _evaluate(
    estimator: TreeEstimator,
    features: pd.DataFrame,
    target: pd.Series,
    config: BaselineConfig,
) -> BinaryClassificationMetrics:
    classes = estimator.classes_
    if classes is None:
        raise RuntimeError("Estimator must be fitted before evaluation")
    positive_index = list(classes).index(config.positive_class)
    predictions = estimator.predict(features)
    positive_scores = estimator.predict_proba(features)[:, positive_index]
    return compute_binary_classification_metrics(
        target,
        predictions,
        positive_class=config.positive_class,
        negative_class=config.negative_class,
        positive_scores=positive_scores,
    )


def _aggregate_by_criterion(
    metrics_by_criterion: Mapping[str, Sequence[BinaryClassificationMetrics]],
) -> tuple[
    dict[str, dict[str, float | None]],
    dict[str, dict[str, float | None]],
]:
    means_by_criterion: dict[str, dict[str, float | None]] = {}
    stds_by_criterion: dict[str, dict[str, float | None]] = {}
    for criterion, fold_results in metrics_by_criterion.items():
        means: dict[str, float | None] = {}
        standard_deviations: dict[str, float | None] = {}
        for name in BinaryClassificationMetrics.__dataclass_fields__:
            values = [getattr(metrics, name) for metrics in fold_results]
            if any(value is None for value in values):
                means[name] = None
                standard_deviations[name] = None
            else:
                numeric_values = np.asarray(values, dtype=float)
                means[name] = float(numeric_values.mean())
                standard_deviations[name] = float(numeric_values.std())
        means_by_criterion[criterion] = means
        stds_by_criterion[criterion] = standard_deviations
    return means_by_criterion, stds_by_criterion


def _select_criterion(
    validation_mean_metrics: Mapping[str, Mapping[str, float | None]],
) -> str:
    def selection_key(criterion: str) -> tuple[float, float, int]:
        metrics = validation_mean_metrics[criterion]
        malignant_f2 = metrics["malignant_f2"]
        malignant_recall = metrics["malignant_recall"]
        if malignant_f2 is None or malignant_recall is None:
            raise RuntimeError("Selection metrics must be available for every criterion")
        return malignant_f2, malignant_recall, -CRITERIA.index(criterion)

    return max(CRITERIA, key=selection_key)


def _validate_probabilities(class_probabilities: Sequence[float]) -> np.ndarray:
    probabilities = np.asarray(class_probabilities, dtype=float)
    if probabilities.ndim != 1 or len(probabilities) == 0:
        raise ValueError("class_probabilities must be a non-empty one-dimensional sequence")
    if not np.isfinite(probabilities).all() or (probabilities < 0).any():
        raise ValueError("class probabilities must be finite and non-negative")
    if not np.isclose(probabilities.sum(), 1.0):
        raise ValueError("class probabilities must sum to 1")
    return probabilities


def _validate_training_data(X_train: np.ndarray, y_train: np.ndarray) -> None:
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


def _resolve_feature_names(
    original_features: ArrayLike,
    feature_count: int,
    feature_names: Sequence[str] | None,
) -> list[str]:
    if feature_names is None and hasattr(original_features, "columns"):
        feature_names = [str(column) for column in original_features.columns]
    if feature_names is None:
        return [f"feature_{index}" for index in range(feature_count)]
    if len(feature_names) != feature_count:
        raise ValueError("feature_names must match the feature count")
    return [str(name) for name in feature_names]


def _assert_only_criterion_differs(runs: Mapping[str, CriterionRun]) -> None:
    gini_parameters = dict(runs["gini"].model_parameters)
    entropy_parameters = dict(runs["entropy"].model_parameters)
    gini_parameters.pop("criterion")
    entropy_parameters.pop("criterion")
    if gini_parameters != entropy_parameters:
        raise RuntimeError("criterion variants differ in parameters other than criterion")
