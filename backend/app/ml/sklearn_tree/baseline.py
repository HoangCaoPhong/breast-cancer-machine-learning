"""Fixed scikit-learn Decision Tree baseline and helper constructors."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

from app.ml.evaluation import (
    BinaryClassificationMetrics,
    compute_binary_classification_metrics,
)

BASELINE_PARAMS: dict[str, Any] = {
    "criterion": "gini",
    "max_depth": None,
    "min_samples_split": 2,
    "min_samples_leaf": 1,
    "random_state": 42,
}


@dataclass(frozen=True, slots=True)
class BaselineConfig:
    """Canonical B0 settings accepted in D-006."""

    test_size: float = 0.2
    random_state: int = 42
    criterion: str = "gini"
    max_depth: int | None = None
    min_samples_split: int = 2
    min_samples_leaf: int = 1
    positive_class: str = "M"
    negative_class: str = "B"

    def __post_init__(self) -> None:
        if not 0.0 < self.test_size < 1.0:
            raise ValueError("test_size must be between 0 and 1")
        if self.criterion not in {"gini", "entropy", "log_loss"}:
            raise ValueError("criterion must be gini, entropy, or log_loss")
        if self.max_depth is not None and (
            isinstance(self.max_depth, bool)
            or not isinstance(self.max_depth, int)
            or self.max_depth < 1
        ):
            raise ValueError("max_depth must be None or a positive integer")
        if self.min_samples_split < 2:
            raise ValueError("min_samples_split must be at least 2")
        if self.min_samples_leaf < 1:
            raise ValueError("min_samples_leaf must be at least 1")
        if self.positive_class == self.negative_class:
            raise ValueError("positive_class and negative_class must be different")

    @classmethod
    def from_mapping(cls, values: dict[str, Any]) -> BaselineConfig:
        """Build a validated config from JSON-compatible values."""

        return cls(
            test_size=float(values.get("test_size", 0.2)),
            random_state=int(values.get("random_state", values.get("random_seed", 42))),
            criterion=str(values.get("criterion", "gini")),
            max_depth=values.get("max_depth"),
            min_samples_split=int(values.get("min_samples_split", 2)),
            min_samples_leaf=int(values.get("min_samples_leaf", 1)),
            positive_class=str(values.get("positive_class", "M")),
            negative_class=str(values.get("negative_class", "B")),
        )


@dataclass(slots=True)
class BaselineResult:
    """Fitted baseline and its canonical train/test evaluation."""

    model: DecisionTreeClassifier
    train_metrics: BinaryClassificationMetrics
    test_metrics: BinaryClassificationMetrics
    feature_names: tuple[str, ...]
    class_names: tuple[str, ...]
    train_size: int
    test_size: int


def build_baseline() -> DecisionTreeClassifier:
    """Return an unfitted sklearn DecisionTreeClassifier using canonical B0 settings."""
    return DecisionTreeClassifier(**BASELINE_PARAMS)


def fit_baseline(
    X_train: np.ndarray,
    y_train: np.ndarray,
) -> DecisionTreeClassifier:
    """Fit and return the baseline model on training data."""
    clf = build_baseline()
    clf.fit(X_train, y_train)
    return clf


def run_sklearn_baseline(
    features: pd.DataFrame,
    target: pd.Series,
    config: BaselineConfig | None = None,
) -> BaselineResult:
    """Fit and evaluate B0 on the canonical stratified 80/20 split."""

    settings = config or BaselineConfig()
    _validate_data(features, target, settings)
    X_train, X_test, y_train, y_test = train_test_split(
        features,
        target,
        test_size=settings.test_size,
        random_state=settings.random_state,
        stratify=target,
    )
    model = DecisionTreeClassifier(
        criterion=settings.criterion,
        max_depth=settings.max_depth,
        min_samples_split=settings.min_samples_split,
        min_samples_leaf=settings.min_samples_leaf,
        random_state=settings.random_state,
    )
    model.fit(X_train, y_train)

    positive_index = list(model.classes_).index(settings.positive_class)
    train_predictions = model.predict(X_train)
    test_predictions = model.predict(X_test)
    train_metrics = compute_binary_classification_metrics(
        y_train,
        train_predictions,
        positive_class=settings.positive_class,
        negative_class=settings.negative_class,
        positive_scores=model.predict_proba(X_train)[:, positive_index],
    )
    test_metrics = compute_binary_classification_metrics(
        y_test,
        test_predictions,
        positive_class=settings.positive_class,
        negative_class=settings.negative_class,
        positive_scores=model.predict_proba(X_test)[:, positive_index],
    )
    return BaselineResult(
        model=model,
        train_metrics=train_metrics,
        test_metrics=test_metrics,
        feature_names=tuple(features.columns),
        class_names=tuple(str(label) for label in model.classes_),
        train_size=len(X_train),
        test_size=len(X_test),
    )


def _validate_data(
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
