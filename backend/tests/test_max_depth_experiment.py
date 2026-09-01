import numpy as np
import pandas as pd
import pytest
from app.ml.sklearn_tree import MaxDepthExperimentConfig, run_max_depth_experiment
from sklearn.tree import DecisionTreeClassifier


def test_max_depth_experiment_selects_from_cv_and_reports_final_metrics() -> None:
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

    assert result.selected_depth in {1, 2, 3}
    assert result.train_size == 90
    assert result.test_size == 30
    assert result.cv_results["max_depth"].tolist() == ["unlimited", "1", "2", "3"]
    assert result.final_comparison["model"].tolist() == [
        "Unlimited baseline",
        "Selected max_depth",
    ]
    assert np.allclose(
        result.final_comparison["test_error_rate"],
        1.0 - result.final_comparison["test_accuracy"],
    )
    assert "validation_malignant_f2_mean" in result.cv_results
    assert "validation_malignant_recall_mean" in result.cv_results
    assert "malignant_f2" in result.final_comparison
    assert "balanced_accuracy" in result.final_comparison
    assert (result.final_comparison["malignant_f2"].between(0.0, 1.0)).all()
    assert (result.final_comparison["balanced_accuracy"].between(0.0, 1.0)).all()
    assert (
        result.final_comparison[
            [
                "benign_true_negatives",
                "benign_false_positives",
                "malignant_false_negatives",
                "malignant_true_positives",
            ]
        ].sum(axis=1)
        == result.test_size
    ).all()
    assert (result.final_comparison["malignant_false_negatives"] >= 0).all()


def test_max_depth_selection_uses_malignant_f2_instead_of_accuracy(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    features = pd.DataFrame(
        {
            "radius": np.arange(20, dtype=float),
            "texture": np.tile([0.0, 1.0], 10),
        }
    )
    target = pd.Series(["B", "M"] * 10)
    config = MaxDepthExperimentConfig(
        depths=(None, 1, 2),
        test_size=0.2,
        random_seed=3,
        cv_folds=2,
    )

    def fake_cross_validate(
        model: DecisionTreeClassifier, *_args: object, **_kwargs: object
    ) -> dict[str, np.ndarray]:
        depth = model.max_depth
        validation_accuracy = 0.95 if depth == 1 else 0.90
        validation_f2 = 0.70 if depth == 1 else 0.80
        validation_recall = 0.65 if depth == 1 else 0.85
        return {
            "train_accuracy": np.array([0.98, 0.98]),
            "train_malignant_f2": np.array([0.96, 0.96]),
            "test_accuracy": np.array([validation_accuracy, validation_accuracy]),
            "test_malignant_f2": np.array([validation_f2, validation_f2]),
            "test_malignant_recall": np.array([validation_recall, validation_recall]),
        }

    monkeypatch.setattr(
        "app.ml.sklearn_tree.max_depth.cross_validate",
        fake_cross_validate,
    )

    result = run_max_depth_experiment(features, target, config)

    assert result.selected_depth == 2


@pytest.mark.parametrize(
    ("depths", "message"),
    [
        ((1, 2), "unlimited baseline"),
        ((None,), "finite candidate"),
        ((None, 0, 1), "positive integers"),
        ((None, 1, 1), "duplicates"),
    ],
)
def test_max_depth_config_rejects_invalid_search_space(
    depths: tuple[int | None, ...], message: str
) -> None:
    with pytest.raises(ValueError, match=message):
        MaxDepthExperimentConfig(depths=depths)
