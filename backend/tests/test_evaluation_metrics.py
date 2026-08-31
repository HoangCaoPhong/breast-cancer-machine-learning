import numpy as np
import pytest
from app.ml.evaluation import compute_binary_classification_metrics


def test_binary_metrics_use_malignant_as_positive_class() -> None:
    metrics = compute_binary_classification_metrics(
        ["B", "B", "B", "M", "M", "M"],
        ["B", "M", "B", "M", "B", "M"],
        positive_scores=[0.1, 0.7, 0.2, 0.9, 0.4, 0.8],
    )

    assert metrics.true_negatives == 2
    assert metrics.false_positives == 1
    assert metrics.false_negatives == 1
    assert metrics.true_positives == 2
    assert metrics.accuracy == pytest.approx(4 / 6)
    assert metrics.error_rate == pytest.approx(2 / 6)
    assert metrics.malignant_precision == pytest.approx(2 / 3)
    assert metrics.malignant_recall == pytest.approx(2 / 3)
    assert metrics.malignant_f1 == pytest.approx(2 / 3)
    assert metrics.malignant_f2 == pytest.approx(2 / 3)
    assert metrics.benign_recall_specificity == pytest.approx(2 / 3)
    assert metrics.balanced_accuracy == pytest.approx(2 / 3)
    assert metrics.roc_auc == pytest.approx(8 / 9)


def test_binary_metrics_handle_zero_division_without_nan() -> None:
    metrics = compute_binary_classification_metrics(
        ["B", "B", "M"],
        ["B", "B", "B"],
    )

    assert metrics.malignant_precision == 0.0
    assert metrics.malignant_recall == 0.0
    assert metrics.malignant_f1 == 0.0
    assert metrics.malignant_f2 == 0.0
    assert metrics.roc_auc is None
    assert np.isfinite(list(metrics.to_dict().values())[:-1]).all()
