"""Experiment I3 – Tuning min_samples_split and min_samples_leaf.

Owner: Huỳnh Thái Hòa (24127374)

Hypothesis
----------
Requiring a minimum number of training samples to allow a node split
(min_samples_split) or to form a leaf (min_samples_leaf) discourages the tree
from learning overly specific patterns in the training data.  Higher values act
as a form of regularisation: the tree becomes shallower and broader, reducing
variance at the cost of some bias.  We expect the best configuration to improve
generalisation (validation/test recall and F1 for malignant) compared with the
default sklearn baseline (min_samples_split=2, min_samples_leaf=1).

Search space (from experiment config i3_min_samples.yaml)
----------------------------------------------------------
min_samples_split : {2, 5, 10, 20, 50}
min_samples_leaf  : {1, 2, 5, 10, 20}

All other parameters are fixed to the same values used in baseline B0.
Tuning uses 5-fold stratified cross-validation on the TRAINING set only.
The test set is touched exactly once, after the best config is chosen.

References
----------
Breiman et al. (1984) CART – original formulation of stopping criteria.
Scikit-learn documentation, §1.10.6 "Minimal cost-complexity pruning":
  https://scikit-learn.org/stable/modules/tree.html#minimal-cost-complexity-pruning
"""

from __future__ import annotations

import itertools
from dataclasses import dataclass, field
from typing import Any

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.tree import DecisionTreeClassifier

# ── Search space (mirrors i3_min_samples.yaml) ────────────────────────────────

MIN_SAMPLES_SPLIT_GRID: list[int] = [2, 5, 10, 20, 50]
MIN_SAMPLES_LEAF_GRID: list[int] = [1, 2, 5, 10, 20]

# Fixed parameters shared with baseline B0
FIXED_PARAMS: dict[str, Any] = {
    "criterion": "gini",
    "max_depth": None,
    "random_state": 42,
}

CV_FOLDS: int = 5
CV_SCORING: str = "recall"  # primary metric = malignant recall (D-006 proposal)
POSITIVE_CLASS_INDEX: int = 1  # M=1 after preprocessing remap


# ── Data structures ────────────────────────────────────────────────────────────


@dataclass
class SingleRunMetrics:
    """Metrics for one (min_samples_split, min_samples_leaf) configuration."""

    min_samples_split: int
    min_samples_leaf: int
    cv_recall_mean: float
    cv_recall_std: float
    test_accuracy: float
    test_error_rate: float
    test_precision_malignant: float
    test_recall_malignant: float
    test_f1_malignant: float
    test_false_negative_count: int
    tree_depth: int
    leaf_count: int
    confusion_mat: np.ndarray = field(repr=False)

    def as_dict(self) -> dict[str, Any]:
        """Return a JSON-serialisable dict (confusion matrix as nested list)."""
        d = {k: v for k, v in self.__dict__.items() if k != "confusion_mat"}
        d["confusion_matrix"] = self.confusion_mat.tolist()
        return d


@dataclass
class ExperimentResult:
    """Full result table for experiment I3."""

    all_runs: list[SingleRunMetrics]
    best_run: SingleRunMetrics
    baseline_run: SingleRunMetrics  # B0 re-evaluated on same test set

    def summary_rows(self) -> list[dict[str, Any]]:
        """Return all runs as a list of dicts suitable for a DataFrame."""
        return [r.as_dict() for r in self.all_runs]


# ── Helpers ────────────────────────────────────────────────────────────────────


def _evaluate_on_test(
    clf: DecisionTreeClassifier,
    X_test: np.ndarray,
    y_test: np.ndarray,
) -> dict[str, Any]:
    """Return a dict of test-set metrics for a fitted classifier."""
    y_pred = clf.predict(X_test)

    cm = confusion_matrix(y_test, y_pred)
    # cm layout: rows = true, cols = predicted; with B=0, M=1:
    # [[TN, FP],
    #  [FN, TP]]
    fn_count = int(cm[1, 0]) if cm.shape == (2, 2) else 0

    acc = float(accuracy_score(y_test, y_pred))
    return {
        "test_accuracy": acc,
        "test_error_rate": round(1.0 - acc, 6),
        "test_precision_malignant": float(
            precision_score(y_test, y_pred, pos_label=POSITIVE_CLASS_INDEX, zero_division=0)
        ),
        "test_recall_malignant": float(
            recall_score(y_test, y_pred, pos_label=POSITIVE_CLASS_INDEX, zero_division=0)
        ),
        "test_f1_malignant": float(
            f1_score(y_test, y_pred, pos_label=POSITIVE_CLASS_INDEX, zero_division=0)
        ),
        "test_false_negative_count": fn_count,
        "tree_depth": int(clf.get_depth()),
        "leaf_count": int(clf.get_n_leaves()),
        "confusion_mat": cm,
    }


def _cv_score(
    clf: DecisionTreeClassifier,
    X_train: np.ndarray,
    y_train: np.ndarray,
) -> tuple[float, float]:
    """Return (mean, std) of stratified k-fold CV on training data."""
    cv = StratifiedKFold(n_splits=CV_FOLDS, shuffle=True, random_state=FIXED_PARAMS["random_state"])
    scores = cross_val_score(clf, X_train, y_train, cv=cv, scoring=CV_SCORING)
    return float(scores.mean()), float(scores.std())


# ── Public API ─────────────────────────────────────────────────────────────────


def run_single_config(
    min_samples_split: int,
    min_samples_leaf: int,
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_test: np.ndarray,
    y_test: np.ndarray,
) -> SingleRunMetrics:
    """Fit one configuration and return its metrics.

    Cross-validation is computed on X_train/y_train only.
    Test metrics are computed on X_test/y_test (call only after config selection).
    """
    clf = DecisionTreeClassifier(
        **FIXED_PARAMS,
        min_samples_split=min_samples_split,
        min_samples_leaf=min_samples_leaf,
    )
    cv_mean, cv_std = _cv_score(clf, X_train, y_train)

    # Refit on full training set before evaluating on test
    clf.fit(X_train, y_train)
    test_metrics = _evaluate_on_test(clf, X_test, y_test)

    return SingleRunMetrics(
        min_samples_split=min_samples_split,
        min_samples_leaf=min_samples_leaf,
        cv_recall_mean=cv_mean,
        cv_recall_std=cv_std,
        **test_metrics,
    )


def run_min_samples_experiment(
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_test: np.ndarray,
    y_test: np.ndarray,
    *,
    mss_grid: list[int] | None = None,
    msl_grid: list[int] | None = None,
) -> ExperimentResult:
    """Run experiment I3 over the full grid and return all results.

    Parameters
    ----------
    X_train, y_train : training arrays (used for CV and final fit).
    X_test, y_test   : held-out test arrays (used only for final metrics).
    mss_grid : override for min_samples_split search space (default from config).
    msl_grid : override for min_samples_leaf search space (default from config).

    Returns
    -------
    ExperimentResult with every (mss, msl) combination and the best config.
    Best config is selected by highest CV recall mean (ties broken by lower std,
    then by smaller min_samples_split, then by smaller min_samples_leaf).
    """
    mss_values = mss_grid if mss_grid is not None else MIN_SAMPLES_SPLIT_GRID
    msl_values = msl_grid if msl_grid is not None else MIN_SAMPLES_LEAF_GRID

    all_runs: list[SingleRunMetrics] = []

    for mss, msl in itertools.product(mss_values, msl_values):
        run = run_single_config(mss, msl, X_train, y_train, X_test, y_test)
        all_runs.append(run)

    # Select best by CV recall (training signal only)
    def _sort_key(r: SingleRunMetrics) -> tuple:
        return (r.cv_recall_mean, -r.cv_recall_std, -r.min_samples_split, -r.min_samples_leaf)

    best = max(all_runs, key=_sort_key)

    # Baseline B0 (mss=2, msl=1) is always in the grid; retrieve it
    baseline_run = next(r for r in all_runs if r.min_samples_split == 2 and r.min_samples_leaf == 1)

    return ExperimentResult(
        all_runs=all_runs,
        best_run=best,
        baseline_run=baseline_run,
    )


def print_experiment_summary(result: ExperimentResult) -> None:
    """Print a human-readable summary of experiment I3 results."""
    print("=" * 72)
    print("Experiment I3 - min_samples_split / min_samples_leaf")
    print("=" * 72)

    header = (
        f"{'mss':>6} {'msl':>5} {'CV recall':>11} {'+/-':>6} "
        f"{'Test acc':>10} {'Test recall M':>14} {'Test F1 M':>10} "
        f"{'Depth':>6} {'Leaves':>7}"
    )
    print(header)

    print("-" * 72)

    for r in sorted(result.all_runs, key=lambda x: -x.cv_recall_mean):
        marker = " <- best" if r is result.best_run else ""
        baseline_marker = " <- B0" if r is result.baseline_run else ""
        print(
            f"{r.min_samples_split:>6} {r.min_samples_leaf:>5} "
            f"{r.cv_recall_mean:>10.4f} {r.cv_recall_std:>6.4f} "
            f"{r.test_accuracy:>10.4f} {r.test_recall_malignant:>14.4f} "
            f"{r.test_f1_malignant:>10.4f} {r.tree_depth:>6} {r.leaf_count:>7}"
            f"{marker}{baseline_marker}"
        )

    print("=" * 72)
    b = result.best_run
    bl = result.baseline_run
    print(
        f"\nBest config: min_samples_split={b.min_samples_split}, "
        f"min_samples_leaf={b.min_samples_leaf}"
    )
    print(
        f"  CV recall:           {b.cv_recall_mean:.4f} +/- {b.cv_recall_std:.4f}  "
        f"(baseline: {bl.cv_recall_mean:.4f} +/- {bl.cv_recall_std:.4f})"
    )
    print(
        f"  Test recall (M):     {b.test_recall_malignant:.4f}  "
        f"(baseline: {bl.test_recall_malignant:.4f})"
    )
    print(f"  Test accuracy:       {b.test_accuracy:.4f}  (baseline: {bl.test_accuracy:.4f})")
    print(
        f"  False negatives:     {b.test_false_negative_count}  "
        f"(baseline: {bl.test_false_negative_count})"
    )
    print(
        f"  Tree depth / leaves: {b.tree_depth} / {b.leaf_count}  "
        f"(baseline: {bl.tree_depth} / {bl.leaf_count})"
    )
    print()
