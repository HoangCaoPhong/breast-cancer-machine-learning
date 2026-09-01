import numpy as np
import pandas as pd
import pytest
from app.ml.sklearn_tree import MaxDepthExperimentConfig, run_max_depth_experiment
from app.ml.sklearn_tree.max_depth import _select_depth


def test_max_depth_experiment_compares_both_trees_and_reports_new_metrics() -> None:
    generator = np.random.default_rng(7)
    class_b = generator.normal(loc=-1.5, scale=0.7, size=(60, 3))
    class_m = generator.normal(loc=1.5, scale=0.7, size=(60, 3))
    features = pd.DataFrame(
        np.vstack([class_b, class_m]),
        columns=["radius", "texture", "area"],
    )
    target = pd.Series(["B"] * len(class_b) + ["M"] * len(class_m))
    config = MaxDepthExperimentConfig(
        depths=(None, 1, 2, 3),
        test_size=0.25,
        random_seed=11,
        cv_folds=3,
    )

    result = run_max_depth_experiment(features, target, config)

    assert set(result.selected_depths) == {"custom", "sklearn"}
    assert set(result.selected_depths.values()) <= {1, 2, 3}
    assert result.train_size == 90
    assert result.test_size == 30
    assert len(result.cv_results) == 8
    assert result.cv_results.groupby("implementation")["max_depth"].apply(list).to_dict() == {
        "custom": ["unlimited", "1", "2", "3"],
        "sklearn": ["unlimited", "1", "2", "3"],
    }
    assert result.final_comparison["model_id"].tolist() == [
        "custom_unlimited_baseline",
        "custom_selected_max_depth",
        "sklearn_unlimited_baseline",
        "sklearn_selected_max_depth",
    ]
    required_cv_columns = {
        "validation_accuracy_mean",
        "validation_error_rate_mean",
        "validation_malignant_precision_mean",
        "validation_malignant_recall_mean",
        "validation_malignant_f1_mean",
        "validation_malignant_f2_mean",
        "validation_benign_recall_specificity_mean",
        "validation_balanced_accuracy_mean",
        "validation_false_negatives_mean",
        "validation_false_positives_mean",
        "validation_roc_auc_mean",
    }
    assert required_cv_columns <= set(result.cv_results)
    required_test_columns = {
        "test_accuracy",
        "test_error_rate",
        "test_malignant_precision",
        "test_malignant_recall",
        "test_malignant_f1",
        "test_malignant_f2",
        "test_benign_recall_specificity",
        "test_balanced_accuracy",
        "test_false_negatives",
        "test_false_positives",
        "test_roc_auc",
    }
    assert required_test_columns <= set(result.final_comparison)
    assert np.allclose(
        result.final_comparison["test_error_rate"],
        1.0 - result.final_comparison["test_accuracy"],
    )
    assert (
        result.final_comparison[
            [
                "test_true_negatives",
                "test_false_positives",
                "test_false_negatives",
                "test_true_positives",
            ]
        ].sum(axis=1)
        == result.test_size
    ).all()


def test_max_depth_selection_uses_f2_before_accuracy_and_is_per_implementation() -> None:
    rows = pd.DataFrame(
        [
            {
                "implementation": "custom",
                "max_depth_value": 1,
                "candidate_order": 1,
                "validation_accuracy_mean": 0.95,
                "validation_malignant_f2_mean": 0.70,
                "validation_malignant_recall_mean": 0.80,
                "validation_malignant_f2_std": 0.01,
                "n_leaves": 2,
                "fitted_depth": 1,
            },
            {
                "implementation": "custom",
                "max_depth_value": 2,
                "candidate_order": 2,
                "validation_accuracy_mean": 0.90,
                "validation_malignant_f2_mean": 0.80,
                "validation_malignant_recall_mean": 0.85,
                "validation_malignant_f2_std": 0.02,
                "n_leaves": 4,
                "fitted_depth": 2,
            },
            {
                "implementation": "sklearn",
                "max_depth_value": 1,
                "candidate_order": 1,
                "validation_accuracy_mean": 0.91,
                "validation_malignant_f2_mean": 0.82,
                "validation_malignant_recall_mean": 0.86,
                "validation_malignant_f2_std": 0.01,
                "n_leaves": 2,
                "fitted_depth": 1,
            },
        ]
    )

    assert _select_depth(rows, "custom") == 2
    assert _select_depth(rows, "sklearn") == 1


@pytest.mark.parametrize(
    ("kwargs", "message"),
    [
        ({"depths": (1, 2)}, "unlimited baseline"),
        ({"depths": (None,)}, "finite candidate"),
        ({"depths": (None, 0, 1)}, "positive integers"),
        ({"depths": (None, 1, 1)}, "duplicates"),
        (
            {"depths": (None, 1), "implementations": ("custom", "xgboost")},
            "Unsupported implementations",
        ),
    ],
)
def test_max_depth_config_rejects_invalid_search_space(
    kwargs: dict[str, object], message: str
) -> None:
    with pytest.raises(ValueError, match=message):
        MaxDepthExperimentConfig(**kwargs)  # type: ignore[arg-type]
