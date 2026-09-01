"""Model evaluation metrics calculation."""

from typing import Any

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    f1_score,
    precision_score,
    recall_score,
)


def calculate_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> dict[str, Any]:
    """Compute standard classification metrics for binary diagnosis.

    Positive class = 1 (Malignant), Negative class = 0 (Benign).
    """
    acc = float(accuracy_score(y_true, y_pred))
    err = float(1.0 - acc)
    prec = float(precision_score(y_true, y_pred, pos_label=1, zero_division=0))
    rec = float(recall_score(y_true, y_pred, pos_label=1, zero_division=0))
    f1 = float(f1_score(y_true, y_pred, pos_label=1, zero_division=0))
    cm = confusion_matrix(y_true, y_pred).tolist()

    return {
        "accuracy": round(acc, 4),
        "error_rate": round(err, 4),
        "precision": round(prec, 4),
        "recall_malignant": round(rec, 4),
        "f1_score": round(f1, 4),
        "confusion_matrix": cm,
    }
