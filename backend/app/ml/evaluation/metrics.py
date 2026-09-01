"""Binary-classification metrics shared by every model track."""

from __future__ import annotations

from collections.abc import Sequence
from dataclasses import asdict, dataclass
from typing import Any

import numpy as np
from sklearn.metrics import roc_auc_score


@dataclass(frozen=True, slots=True)
class BinaryClassificationMetrics:
    """Report-ready metrics using malignant samples as the positive class."""

    accuracy: float
    error_rate: float
    malignant_precision: float
    malignant_recall: float
    malignant_f1: float
    malignant_f2: float
    benign_recall_specificity: float
    balanced_accuracy: float
    true_negatives: int
    false_positives: int
    false_negatives: int
    true_positives: int
    roc_auc: float | None

    def to_dict(self) -> dict[str, Any]:
        """Return a JSON-serializable metric mapping."""

        return asdict(self)


def compute_binary_classification_metrics(
    y_true: Sequence[str],
    y_pred: Sequence[str],
    *,
    positive_class: str = "M",
    negative_class: str = "B",
    positive_scores: Sequence[float] | None = None,
) -> BinaryClassificationMetrics:
    """Compute the D-006 metric contract with explicit class and matrix semantics.

    The confusion matrix is interpreted as rows=true and columns=predicted, both in
    ``[negative_class, positive_class]`` order. Zero denominators produce ``0.0``.
    ROC-AUC is returned only when valid positive-class scores are supplied.
    """

    actual = np.asarray(y_true)
    predicted = np.asarray(y_pred)
    if actual.ndim != 1 or predicted.ndim != 1:
        raise ValueError("y_true and y_pred must be one-dimensional")
    if len(actual) == 0:
        raise ValueError("y_true and y_pred must not be empty")
    if len(actual) != len(predicted):
        raise ValueError("y_true and y_pred must contain the same number of samples")
    if positive_class == negative_class:
        raise ValueError("positive_class and negative_class must be different")

    allowed_labels = {negative_class, positive_class}
    observed_labels = set(actual) | set(predicted)
    if not observed_labels <= allowed_labels:
        unexpected = sorted(observed_labels - allowed_labels)
        raise ValueError(f"Unexpected class labels: {unexpected}")

    actual_positive = actual == positive_class
    predicted_positive = predicted == positive_class
    true_positives = int(np.sum(actual_positive & predicted_positive))
    false_negatives = int(np.sum(actual_positive & ~predicted_positive))
    false_positives = int(np.sum(~actual_positive & predicted_positive))
    true_negatives = int(np.sum(~actual_positive & ~predicted_positive))

    precision = _safe_divide(true_positives, true_positives + false_positives)
    recall = _safe_divide(true_positives, true_positives + false_negatives)
    specificity = _safe_divide(true_negatives, true_negatives + false_positives)
    f1 = _safe_divide(2 * precision * recall, precision + recall)
    f2 = _safe_divide(5 * precision * recall, 4 * precision + recall)
    accuracy = _safe_divide(true_positives + true_negatives, len(actual))
    balanced_accuracy = (recall + specificity) / 2.0

    roc_auc: float | None = None
    if positive_scores is not None:
        scores = np.asarray(positive_scores, dtype=float)
        if scores.ndim != 1 or len(scores) != len(actual):
            raise ValueError("positive_scores must be one-dimensional and match y_true")
        if not np.isfinite(scores).all():
            raise ValueError("positive_scores must contain only finite values")
        if len(set(actual)) == 2:
            roc_auc = float(roc_auc_score(actual_positive.astype(int), scores))

    return BinaryClassificationMetrics(
        accuracy=accuracy,
        error_rate=1.0 - accuracy,
        malignant_precision=precision,
        malignant_recall=recall,
        malignant_f1=f1,
        malignant_f2=f2,
        benign_recall_specificity=specificity,
        balanced_accuracy=balanced_accuracy,
        true_negatives=true_negatives,
        false_positives=false_positives,
        false_negatives=false_negatives,
        true_positives=true_positives,
        roc_auc=roc_auc,
    )


def _safe_divide(numerator: float, denominator: float) -> float:
    return float(numerator / denominator) if denominator else 0.0

