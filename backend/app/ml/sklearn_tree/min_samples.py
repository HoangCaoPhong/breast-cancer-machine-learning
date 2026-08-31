"""Experiment I3 – Tuning and benchmarking min_samples_split and min_samples_leaf.

Owner: Huỳnh Thái Hòa (24127374)

This module integrates with:
- `app.ml.preprocessing.breast_cancer`: canonical data loader
- `app.ml.evaluation.metrics`: binary classification metrics contract
- `app.ml.sklearn_tree.baseline`: baseline B0 configuration
"""

from __future__ import annotations

import itertools
import time
from dataclasses import asdict, dataclass, field
from typing import Any

import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.tree import DecisionTreeClassifier

from app.ml.evaluation import (
    BinaryClassificationMetrics,
    compute_binary_classification_metrics,
)

# ── Search space & Defaults ───────────────────────────────────────────────────

DEFAULT_MIN_SAMPLES_SPLIT_GRID: tuple[int, ...] = (2, 5, 10, 20, 50)
DEFAULT_MIN_SAMPLES_LEAF_GRID: tuple[int, ...] = (1, 2, 5, 10, 20)


@dataclass(frozen=True, slots=True)
class MinSamplesConfig:
    """Configuration for the min_samples_split / min_samples_leaf experiment (I3)."""

    test_size: float = 0.2
    random_state: int = 42
    criterion: str = "gini"
    max_depth: int | None = None
    min_samples_split_grid: tuple[int, ...] = DEFAULT_MIN_SAMPLES_SPLIT_GRID
    min_samples_leaf_grid: tuple[int, ...] = DEFAULT_MIN_SAMPLES_LEAF_GRID
    cv_folds: int = 5
    positive_class: str = "M"
    negative_class: str = "B"
    primary_metric: str = "malignant_recall"

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
        if not self.min_samples_split_grid or any(v < 2 for v in self.min_samples_split_grid):
            raise ValueError("min_samples_split_grid values must all be >= 2")
        if not self.min_samples_leaf_grid or any(v < 1 for v in self.min_samples_leaf_grid):
            raise ValueError("min_samples_leaf_grid values must all be >= 1")
        if self.cv_folds < 2:
            raise ValueError("cv_folds must be at least 2")
        if self.positive_class == self.negative_class:
            raise ValueError("positive_class and negative_class must be different")

    @classmethod
    def from_mapping(cls, values: dict[str, Any]) -> MinSamplesConfig:
        """Build a validated config from JSON/dict values."""
        split_grid = values.get("min_samples_split_grid", DEFAULT_MIN_SAMPLES_SPLIT_GRID)
        leaf_grid = values.get("min_samples_leaf_grid", DEFAULT_MIN_SAMPLES_LEAF_GRID)
        return cls(
            test_size=float(values.get("test_size", 0.2)),
            random_state=int(values.get("random_state", values.get("random_seed", 42))),
            criterion=str(values.get("criterion", "gini")),
            max_depth=values.get("max_depth"),
            min_samples_split_grid=tuple(int(v) for v in split_grid),
            min_samples_leaf_grid=tuple(int(v) for v in leaf_grid),
            cv_folds=int(values.get("cv_folds", 5)),
            positive_class=str(values.get("positive_class", "M")),
            negative_class=str(values.get("negative_class", "B")),
            primary_metric=str(values.get("primary_metric", "malignant_recall")),
        )


@dataclass(slots=True)
class GridCandidateResult:
    """Metrics and profiling for a single (min_samples_split, min_samples_leaf) run."""

    min_samples_split: int
    min_samples_leaf: int
    cv_recall_mean: float
    cv_recall_std: float
    cv_f1_mean: float
    cv_accuracy_mean: float
    train_metrics: BinaryClassificationMetrics
    test_metrics: BinaryClassificationMetrics
    fitted_depth: int
    n_leaves: int
    training_time_ms: float
    inference_latency_us: float

    def to_dict(self) -> dict[str, Any]:
        """Return a JSON-serializable dictionary."""
        d = asdict(self)
        return d


@dataclass(slots=True)
class MinSamplesExperimentResult:
    """Full results of the min_samples experiment comparing baseline vs tuned."""

    baseline_candidate: GridCandidateResult
    best_candidate: GridCandidateResult
    all_candidates: list[GridCandidateResult]
    feature_names: tuple[str, ...]
    class_names: tuple[str, ...]
    train_size: int
    test_size: int
    best_model: DecisionTreeClassifier = field(repr=False)
    delta_vs_baseline: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self) -> None:
        if not self.delta_vs_baseline:
            bl = self.baseline_candidate
            b = self.best_candidate
            self.delta_vs_baseline = {
                "test_accuracy_delta": round(b.test_metrics.accuracy - bl.test_metrics.accuracy, 6),
                "test_malignant_recall_delta": round(
                    b.test_metrics.malignant_recall - bl.test_metrics.malignant_recall,
                    6,
                ),
                "test_malignant_f1_delta": round(
                    b.test_metrics.malignant_f1 - bl.test_metrics.malignant_f1, 6
                ),
                "false_negatives_delta": (
                    b.test_metrics.false_negatives - bl.test_metrics.false_negatives
                ),
                "n_leaves_delta": b.n_leaves - bl.n_leaves,
                "fitted_depth_delta": b.fitted_depth - bl.fitted_depth,
                "training_time_delta_ms": round(b.training_time_ms - bl.training_time_ms, 4),
            }


# ── Public API ─────────────────────────────────────────────────────────────────


def run_min_samples_tuning(
    features: pd.DataFrame,
    target: pd.Series,
    config: MinSamplesConfig | None = None,
) -> MinSamplesExperimentResult:
    """Execute grid search and evaluation across min_samples_split/leaf parameter space."""
    settings = config or MinSamplesConfig()
    _validate_input(features, target, settings)

    X_train, X_test, y_train, y_test = train_test_split(
        features,
        target,
        test_size=settings.test_size,
        random_state=settings.random_state,
        stratify=target,
    )

    all_candidates: list[GridCandidateResult] = []

    # Grid search across all combinations
    for mss, msl in itertools.product(
        settings.min_samples_split_grid, settings.min_samples_leaf_grid
    ):
        candidate = _evaluate_candidate(
            mss=mss,
            msl=msl,
            X_train=X_train,
            y_train=y_train,
            X_test=X_test,
            y_test=y_test,
            settings=settings,
        )
        all_candidates.append(candidate)

    # Selection rule: Highest CV Malignant Recall, lower std, then simpler tree
    def _selection_key(r: GridCandidateResult) -> tuple:
        return (
            r.cv_recall_mean,
            -r.cv_recall_std,
            r.cv_f1_mean,
            -r.min_samples_split,
            -r.min_samples_leaf,
        )

    best_candidate = max(all_candidates, key=_selection_key)

    # Retrieve baseline candidate (mss=2, msl=1)
    baseline_candidate = next(
        (r for r in all_candidates if r.min_samples_split == 2 and r.min_samples_leaf == 1),
        all_candidates[0],
    )

    # Refit best model for export
    best_model = DecisionTreeClassifier(
        criterion=settings.criterion,
        max_depth=settings.max_depth,
        min_samples_split=best_candidate.min_samples_split,
        min_samples_leaf=best_candidate.min_samples_leaf,
        random_state=settings.random_state,
    )
    best_model.fit(X_train, y_train)

    return MinSamplesExperimentResult(
        baseline_candidate=baseline_candidate,
        best_candidate=best_candidate,
        all_candidates=all_candidates,
        feature_names=tuple(features.columns),
        class_names=tuple(str(c) for c in best_model.classes_),
        train_size=len(X_train),
        test_size=len(X_test),
        best_model=best_model,
    )


# ── Internal Helpers ───────────────────────────────────────────────────────────


def _evaluate_candidate(
    mss: int,
    msl: int,
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_test: pd.DataFrame,
    y_test: pd.Series,
    settings: MinSamplesConfig,
) -> GridCandidateResult:
    """Evaluate one candidate parameter combination with CV and Test evaluation."""
    # 1. 5-Fold Stratified Cross-Validation on Training set only
    skf = StratifiedKFold(
        n_splits=settings.cv_folds,
        shuffle=True,
        random_state=settings.random_state,
    )

    cv_recalls: list[float] = []
    cv_f1s: list[float] = []
    cv_accuracies: list[float] = []

    for fold_train_idx, fold_val_idx in skf.split(X_train, y_train):
        fold_X_tr = X_train.iloc[fold_train_idx]
        fold_y_tr = y_train.iloc[fold_train_idx]
        fold_X_val = X_train.iloc[fold_val_idx]
        fold_y_val = y_train.iloc[fold_val_idx]

        fold_model = DecisionTreeClassifier(
            criterion=settings.criterion,
            max_depth=settings.max_depth,
            min_samples_split=mss,
            min_samples_leaf=msl,
            random_state=settings.random_state,
        )
        fold_model.fit(fold_X_tr, fold_y_tr)
        val_preds = fold_model.predict(fold_X_val)

        m = compute_binary_classification_metrics(
            fold_y_val,
            val_preds,
            positive_class=settings.positive_class,
            negative_class=settings.negative_class,
        )
        cv_recalls.append(m.malignant_recall)
        cv_f1s.append(m.malignant_f1)
        cv_accuracies.append(m.accuracy)

    # 2. Fit on full training set and measure time
    final_model = DecisionTreeClassifier(
        criterion=settings.criterion,
        max_depth=settings.max_depth,
        min_samples_split=mss,
        min_samples_leaf=msl,
        random_state=settings.random_state,
    )

    t0 = time.perf_counter()
    final_model.fit(X_train, y_train)
    t1 = time.perf_counter()
    training_time_ms = (t1 - t0) * 1000.0

    # 3. Measure inference latency
    t_inf0 = time.perf_counter()
    test_preds = final_model.predict(X_test)
    t_inf1 = time.perf_counter()
    inference_latency_us = ((t_inf1 - t_inf0) * 1_000_000.0) / max(len(X_test), 1)

    positive_index = list(final_model.classes_).index(settings.positive_class)
    train_preds = final_model.predict(X_train)

    train_metrics = compute_binary_classification_metrics(
        y_train,
        train_preds,
        positive_class=settings.positive_class,
        negative_class=settings.negative_class,
        positive_scores=final_model.predict_proba(X_train)[:, positive_index],
    )
    test_metrics = compute_binary_classification_metrics(
        y_test,
        test_preds,
        positive_class=settings.positive_class,
        negative_class=settings.negative_class,
        positive_scores=final_model.predict_proba(X_test)[:, positive_index],
    )

    return GridCandidateResult(
        min_samples_split=mss,
        min_samples_leaf=msl,
        cv_recall_mean=float(np.mean(cv_recalls)),
        cv_recall_std=float(np.std(cv_recalls)),
        cv_f1_mean=float(np.mean(cv_f1s)),
        cv_accuracy_mean=float(np.mean(cv_accuracies)),
        train_metrics=train_metrics,
        test_metrics=test_metrics,
        fitted_depth=int(final_model.get_depth()),
        n_leaves=int(final_model.get_n_leaves()),
        training_time_ms=round(training_time_ms, 4),
        inference_latency_us=round(inference_latency_us, 2),
    )


def _validate_input(
    features: pd.DataFrame,
    target: pd.Series,
    config: MinSamplesConfig,
) -> None:
    """Validate DataFrame and Series inputs according to project rules."""
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
