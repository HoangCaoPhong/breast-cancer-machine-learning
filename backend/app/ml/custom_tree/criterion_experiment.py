"""Controlled Gini-versus-Entropy experiment for the from-scratch tree."""

from __future__ import annotations

from collections.abc import Mapping
from dataclasses import dataclass

import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold, train_test_split

from app.ml.custom_tree.tree import DecisionTreeClassifierScratch
from app.ml.evaluation import (
    BinaryClassificationMetrics,
    compute_binary_classification_metrics,
)
from app.ml.sklearn_tree.baseline import BaselineConfig

CRITERIA = ("gini", "entropy")


@dataclass(frozen=True, slots=True)
class CustomCriterionRun:
    """One fitted custom-tree criterion variant."""

    criterion: str
    estimator: DecisionTreeClassifierScratch
    model_parameters: Mapping[str, object]
    tree_depth: int
    leaf_count: int


@dataclass(slots=True)
class CustomCriterionExperimentResult:
    """Cross-validation comparison and selected custom-tree test result."""

    runs: dict[str, CustomCriterionRun]
    train_metrics: dict[str, BinaryClassificationMetrics]
    training_cv_metrics: dict[str, tuple[BinaryClassificationMetrics, ...]]
    training_cv_mean_metrics: dict[str, dict[str, float | None]]
    training_cv_std_metrics: dict[str, dict[str, float | None]]
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


def run_custom_criterion_experiment(
    features: pd.DataFrame,
    target: pd.Series,
    config: BaselineConfig | None = None,
    *,
    cv_folds: int = 5,
) -> CustomCriterionExperimentResult:
    """Compare custom-tree criteria on training CV, then test the selected variant."""

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

    training_cv_metrics: dict[str, list[BinaryClassificationMetrics]] = {
        criterion: [] for criterion in CRITERIA
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
        fold_runs = _fit_both_criteria(fold_features, fold_target, settings)
        for criterion, fold_run in fold_runs.items():
            training_cv_metrics[criterion].append(
                _evaluate(fold_run.estimator, fold_features, fold_target, settings)
            )
            validation_metrics[criterion].append(
                _evaluate(fold_run.estimator, validation_features, validation_target, settings)
            )

    frozen_training_cv_metrics = {
        criterion: tuple(metrics) for criterion, metrics in training_cv_metrics.items()
    }
    frozen_validation_metrics = {
        criterion: tuple(metrics) for criterion, metrics in validation_metrics.items()
    }
    training_cv_mean_metrics, training_cv_std_metrics = _aggregate_by_criterion(
        frozen_training_cv_metrics
    )
    validation_mean_metrics, validation_std_metrics = _aggregate_by_criterion(
        frozen_validation_metrics
    )
    selected_criterion = _select_criterion(validation_mean_metrics)

    runs = _fit_both_criteria(X_train, y_train, settings)
    train_metrics = {
        criterion: _evaluate(run.estimator, X_train, y_train, settings)
        for criterion, run in runs.items()
    }
    selected_test_metrics = _evaluate(
        runs[selected_criterion].estimator,
        X_test,
        y_test,
        settings,
    )
    selected_model = runs[selected_criterion].estimator
    assert selected_model.classes_ is not None
    return CustomCriterionExperimentResult(
        runs=runs,
        train_metrics=train_metrics,
        training_cv_metrics=frozen_training_cv_metrics,
        training_cv_mean_metrics=training_cv_mean_metrics,
        training_cv_std_metrics=training_cv_std_metrics,
        validation_metrics=frozen_validation_metrics,
        validation_mean_metrics=validation_mean_metrics,
        validation_std_metrics=validation_std_metrics,
        selected_criterion=selected_criterion,
        selected_test_metrics=selected_test_metrics,
        feature_names=tuple(str(column) for column in features.columns),
        class_names=tuple(str(label) for label in selected_model.classes_),
        train_size=len(X_train),
        test_size=len(X_test),
        cv_folds=cv_folds,
    )


def _fit_both_criteria(
    features: pd.DataFrame,
    target: pd.Series,
    config: BaselineConfig,
) -> dict[str, CustomCriterionRun]:
    parameters: dict[str, object] = {
        "max_depth": config.max_depth,
        "min_samples_split": config.min_samples_split,
        "min_samples_leaf": config.min_samples_leaf,
    }
    runs: dict[str, CustomCriterionRun] = {}
    for criterion in CRITERIA:
        estimator = DecisionTreeClassifierScratch(criterion=criterion, **parameters)
        estimator.fit(features, target)
        runs[criterion] = CustomCriterionRun(
            criterion=criterion,
            estimator=estimator,
            model_parameters={"criterion": criterion, **parameters},
            tree_depth=estimator.get_depth(),
            leaf_count=estimator.get_n_leaves(),
        )
    return runs


def _evaluate(
    estimator: DecisionTreeClassifierScratch,
    features: pd.DataFrame,
    target: pd.Series,
    config: BaselineConfig,
) -> BinaryClassificationMetrics:
    assert estimator.classes_ is not None
    positive_index = list(estimator.classes_).index(config.positive_class)
    return compute_binary_classification_metrics(
        target,
        estimator.predict(features),
        positive_class=config.positive_class,
        negative_class=config.negative_class,
        positive_scores=estimator.predict_proba(features)[:, positive_index],
    )


def _aggregate_by_criterion(
    metrics_by_criterion: Mapping[str, tuple[BinaryClassificationMetrics, ...]],
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
