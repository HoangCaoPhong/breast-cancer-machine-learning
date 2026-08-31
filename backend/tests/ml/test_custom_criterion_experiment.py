import pandas as pd
import pytest
from app.ml.custom_tree.criterion_experiment import run_custom_criterion_experiment
from app.ml.sklearn_tree.baseline import BaselineConfig


def test_custom_criterion_experiment_compares_both_criteria_on_shared_folds() -> None:
    features = pd.DataFrame(
        {
            "radius": [1.0, 1.2, 1.4, 1.6, 1.8, 3.0, 3.2, 3.4, 3.6, 3.8],
            "texture": [0.0, 0.2, 0.1, 0.3, 0.4, 1.0, 1.2, 1.1, 1.3, 1.4],
        }
    )
    target = pd.Series(["B"] * 5 + ["M"] * 5)

    result = run_custom_criterion_experiment(
        features,
        target,
        BaselineConfig(test_size=0.2, random_state=42, max_depth=2),
        cv_folds=2,
    )

    assert set(result.runs) == {"gini", "entropy"}
    assert all(len(folds) == 2 for folds in result.training_cv_metrics.values())
    assert all(len(folds) == 2 for folds in result.validation_metrics.values())
    assert result.selected_criterion in {"gini", "entropy"}
    assert result.feature_names == ("radius", "texture")
    assert result.class_names == ("B", "M")
    assert (result.train_size, result.test_size) == (8, 2)
    assert result.selected_test_metrics.malignant_recall == pytest.approx(1.0)
