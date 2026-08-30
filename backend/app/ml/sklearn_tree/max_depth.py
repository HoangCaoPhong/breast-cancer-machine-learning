"""Reusable scikit-learn experiment for tuning Decision Tree ``max_depth``."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    fbeta_score,
    make_scorer,
    precision_recall_fscore_support,
    recall_score,
)
from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from sklearn.tree import DecisionTreeClassifier


@dataclass(frozen=True, slots=True)
class MaxDepthExperimentConfig:
    """Validated settings shared by every candidate in a max-depth experiment."""

    depths: tuple[int | None, ...]
    test_size: float = 0.2
    random_seed: int = 42
    cv_folds: int = 5
    criterion: str = "gini"
    min_samples_split: int = 2
    min_samples_leaf: int = 1
    positive_class: str = "M"

    def __post_init__(self) -> None:
        if not self.depths:
            raise ValueError("depths must contain at least one value")
        if None not in self.depths:
            raise ValueError("depths must include None as the unlimited baseline")
        finite_depths = [depth for depth in self.depths if depth is not None]
        if not finite_depths:
            raise ValueError("depths must include at least one finite candidate")
        if any(
            isinstance(depth, bool) or not isinstance(depth, int) or depth < 1
            for depth in finite_depths
        ):
            raise ValueError("finite depths must be positive integers")
        if len(set(self.depths)) != len(self.depths):
            raise ValueError("depths must not contain duplicates")
        if not 0.0 < self.test_size < 1.0:
            raise ValueError("test_size must be between 0 and 1")
        if self.cv_folds < 2:
            raise ValueError("cv_folds must be at least 2")
        if self.criterion not in {"gini", "entropy", "log_loss"}:
            raise ValueError("criterion must be gini, entropy, or log_loss")
        if self.min_samples_split < 2:
            raise ValueError("min_samples_split must be at least 2")
        if self.min_samples_leaf < 1:
            raise ValueError("min_samples_leaf must be at least 1")

    @classmethod
    def from_mapping(cls, values: dict[str, Any]) -> MaxDepthExperimentConfig:
        """Build a config from the experiment JSON representation."""

        required = "depths"
        if required not in values:
            raise ValueError(f"Missing required config field: {required}")
        return cls(
            depths=tuple(values["depths"]),
            test_size=float(values.get("test_size", 0.2)),
            random_seed=int(values.get("random_seed", 42)),
            cv_folds=int(values.get("cv_folds", 5)),
            criterion=str(values.get("criterion", "gini")),
            min_samples_split=int(values.get("min_samples_split", 2)),
            min_samples_leaf=int(values.get("min_samples_leaf", 1)),
            positive_class=str(values.get("positive_class", "M")),
        )


@dataclass(slots=True)
class MaxDepthExperimentResult:
    """Tables and fitted models produced by one max-depth experiment."""

    cv_results: pd.DataFrame
    final_comparison: pd.DataFrame
    selected_depth: int
    baseline_model: DecisionTreeClassifier
    selected_model: DecisionTreeClassifier
    feature_names: tuple[str, ...]
    class_names: tuple[str, ...]
    train_size: int
    test_size: int


def run_max_depth_experiment(
    features: pd.DataFrame,
    target: pd.Series,
    config: MaxDepthExperimentConfig,
) -> MaxDepthExperimentResult:
    """Tune finite depths with training CV, then compare baseline and selection on test.

    The held-out test split is not used to choose ``max_depth``. Every candidate uses
    exactly the same stratified folds and model settings, so depth is the only changed
    hyperparameter.
    """

    _validate_data(features, target, config.positive_class)
    X_train, X_test, y_train, y_test = train_test_split(
        features,
        target,
        test_size=config.test_size,
        random_state=config.random_seed,
        stratify=target,
    )
    cv = StratifiedKFold(
        n_splits=config.cv_folds,
        shuffle=True,
        random_state=config.random_seed,
    )
    malignant_f2_scorer = make_scorer(
        fbeta_score,
        beta=2,
        pos_label=config.positive_class,
        zero_division=0,
    )
    malignant_recall_scorer = make_scorer(
        recall_score,
        pos_label=config.positive_class,
        zero_division=0,
    )

    rows: list[dict[str, Any]] = []
    fitted_models: dict[int | None, DecisionTreeClassifier] = {}
    for order, depth in enumerate(config.depths):
        model = _new_model(config, depth)
        scores = cross_validate(
            model,
            X_train,
            y_train,
            cv=cv,
            scoring={
                "accuracy": "accuracy",
                "malignant_f2": malignant_f2_scorer,
                "malignant_recall": malignant_recall_scorer,
            },
            return_train_score=True,
            n_jobs=None,
        )
        model.fit(X_train, y_train)
        fitted_models[depth] = model
        validation_accuracy = float(np.mean(scores["test_accuracy"]))
        validation_f2 = float(np.mean(scores["test_malignant_f2"]))
        rows.append(
            {
                "candidate_order": order,
                "max_depth": "unlimited" if depth is None else str(depth),
                "max_depth_value": depth,
                "fitted_depth": model.get_depth(),
                "n_leaves": model.get_n_leaves(),
                "train_accuracy_mean": float(np.mean(scores["train_accuracy"])),
                "train_accuracy_std": float(np.std(scores["train_accuracy"])),
                "train_malignant_f2_mean": float(np.mean(scores["train_malignant_f2"])),
                "train_malignant_f2_std": float(np.std(scores["train_malignant_f2"])),
                "validation_accuracy_mean": validation_accuracy,
                "validation_accuracy_std": float(np.std(scores["test_accuracy"])),
                "validation_error_rate": 1.0 - validation_accuracy,
                "validation_malignant_f2_mean": validation_f2,
                "validation_malignant_f2_std": float(np.std(scores["test_malignant_f2"])),
                "validation_malignant_recall_mean": float(np.mean(scores["test_malignant_recall"])),
                "validation_malignant_recall_std": float(np.std(scores["test_malignant_recall"])),
            }
        )

    cv_results = pd.DataFrame(rows)
    finite_results = cv_results[cv_results["max_depth_value"].notna()].copy()
    finite_results["max_depth_value"] = finite_results["max_depth_value"].astype(int)
    selected_row = finite_results.sort_values(
        [
            "validation_malignant_f2_mean",
            "validation_malignant_recall_mean",
            "validation_malignant_f2_std",
            "n_leaves",
            "fitted_depth",
            "candidate_order",
        ],
        ascending=[False, False, True, True, True, True],
        kind="mergesort",
    ).iloc[0]
    selected_depth = int(selected_row["max_depth_value"])

    baseline_model = fitted_models[None]
    selected_model = fitted_models[selected_depth]
    final_comparison = pd.DataFrame(
        [
            _evaluate_final_model(
                "Unlimited baseline",
                None,
                baseline_model,
                X_train,
                X_test,
                y_train,
                y_test,
                config.positive_class,
            ),
            _evaluate_final_model(
                "Selected max_depth",
                selected_depth,
                selected_model,
                X_train,
                X_test,
                y_train,
                y_test,
                config.positive_class,
            ),
        ]
    )

    return MaxDepthExperimentResult(
        cv_results=cv_results,
        final_comparison=final_comparison,
        selected_depth=selected_depth,
        baseline_model=baseline_model,
        selected_model=selected_model,
        feature_names=tuple(features.columns),
        class_names=tuple(str(label) for label in selected_model.classes_),
        train_size=len(X_train),
        test_size=len(X_test),
    )


def _new_model(config: MaxDepthExperimentConfig, depth: int | None) -> DecisionTreeClassifier:
    return DecisionTreeClassifier(
        criterion=config.criterion,
        max_depth=depth,
        min_samples_split=config.min_samples_split,
        min_samples_leaf=config.min_samples_leaf,
        random_state=config.random_seed,
    )


def _evaluate_final_model(
    model_name: str,
    max_depth: int | None,
    model: DecisionTreeClassifier,
    X_train: pd.DataFrame,
    X_test: pd.DataFrame,
    y_train: pd.Series,
    y_test: pd.Series,
    positive_class: str,
) -> dict[str, Any]:
    train_predictions = model.predict(X_train)
    test_predictions = model.predict(X_test)
    train_accuracy = float(accuracy_score(y_train, train_predictions))
    test_accuracy = float(accuracy_score(y_test, test_predictions))
    train_f2 = float(
        fbeta_score(
            y_train,
            train_predictions,
            beta=2,
            pos_label=positive_class,
            zero_division=0,
        )
    )
    train_recall = float(
        recall_score(
            y_train,
            train_predictions,
            pos_label=positive_class,
            zero_division=0,
        )
    )
    precision, recall, f1, _ = precision_recall_fscore_support(
        y_test,
        test_predictions,
        labels=[positive_class],
        average=None,
        zero_division=0,
    )
    malignant_f2 = float(
        fbeta_score(
            y_test,
            test_predictions,
            beta=2,
            pos_label=positive_class,
            zero_division=0,
        )
    )
    actual_positive = np.asarray(y_test) == positive_class
    predicted_positive = np.asarray(test_predictions) == positive_class
    true_positives = int(np.sum(actual_positive & predicted_positive))
    false_negatives = int(np.sum(actual_positive & ~predicted_positive))
    false_positives = int(np.sum(~actual_positive & predicted_positive))
    true_negatives = int(np.sum(~actual_positive & ~predicted_positive))
    specificity_denominator = true_negatives + false_positives
    specificity = true_negatives / specificity_denominator if specificity_denominator else 0.0
    balanced_accuracy = (float(recall[0]) + specificity) / 2.0
    return {
        "model": model_name,
        "max_depth": "unlimited" if max_depth is None else str(max_depth),
        "fitted_depth": model.get_depth(),
        "n_leaves": model.get_n_leaves(),
        "train_accuracy": train_accuracy,
        "train_malignant_f2": train_f2,
        "train_malignant_recall": train_recall,
        "test_accuracy": test_accuracy,
        "test_error_rate": 1.0 - test_accuracy,
        "malignant_precision": float(precision[0]),
        "malignant_recall": float(recall[0]),
        "malignant_f1": float(f1[0]),
        "malignant_f2": malignant_f2,
        "benign_recall_specificity": specificity,
        "balanced_accuracy": balanced_accuracy,
        "benign_true_negatives": true_negatives,
        "benign_false_positives": false_positives,
        "malignant_false_negatives": false_negatives,
        "malignant_true_positives": true_positives,
    }


def _validate_data(
    features: pd.DataFrame,
    target: pd.Series,
    positive_class: str,
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
    if positive_class not in set(target):
        raise ValueError(f"positive_class {positive_class!r} is not present in target")
    if len(set(target)) != 2:
        raise ValueError("target must contain exactly two classes")
