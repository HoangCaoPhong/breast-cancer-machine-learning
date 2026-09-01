"""Scikit-learn baseline Decision Tree (B0).

Fixed reference model used by all improvement experiments.
Same parameters must not change after the first run to keep comparisons fair.
"""

from __future__ import annotations

import numpy as np
from sklearn.tree import DecisionTreeClassifier

# ── Fixed baseline parameters (D-003) ─────────────────────────────────────────

BASELINE_PARAMS: dict = {
    "criterion": "gini",
    "max_depth": None,  # unconstrained – improvement I1 will tune this
    "min_samples_split": 2,  # sklearn default
    "min_samples_leaf": 1,  # sklearn default
    "random_state": 42,
}


def build_baseline() -> DecisionTreeClassifier:
    """Return an unfitted baseline DecisionTreeClassifier with fixed params."""
    return DecisionTreeClassifier(**BASELINE_PARAMS)


def fit_baseline(
    X_train: np.ndarray,
    y_train: np.ndarray,
) -> DecisionTreeClassifier:
    """Fit and return the baseline model on training data."""
    clf = build_baseline()
    clf.fit(X_train, y_train)
    return clf
