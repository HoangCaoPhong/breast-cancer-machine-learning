import numpy as np
import pandas as pd
import pytest
from app.ml.sklearn_tree.baseline import BaselineConfig
from app.ml.sklearn_tree.gini_vs_entropy import (
    entropy_impurity,
    fit_gini_and_entropy,
    gini_impurity,
    run_criterion_experiment,
)


def test_impurity_formulas_cover_pure_and_balanced_nodes() -> None:
    assert gini_impurity([1.0, 0.0]) == pytest.approx(0.0)
    assert entropy_impurity([1.0, 0.0]) == pytest.approx(0.0)
    assert gini_impurity([0.5, 0.5]) == pytest.approx(0.5)
    assert entropy_impurity([0.5, 0.5]) == pytest.approx(1.0)


def test_fit_changes_only_the_criterion() -> None:
    X_train = np.array(
        [
            [0.0, 0.0],
            [0.0, 1.0],
            [1.0, 0.0],
            [1.0, 1.0],
            [2.0, 0.0],
            [2.0, 1.0],
        ]
    )
    y_train = np.array(["B", "B", "B", "M", "M", "M"])

    runs = fit_gini_and_entropy(
        X_train,
        y_train,
        model_parameters={"max_depth": 2, "random_state": 17},
        feature_names=["radius", "texture"],
    )

    assert set(runs) == {"gini", "entropy"}
    assert runs["gini"].model_parameters["criterion"] == "gini"
    assert runs["entropy"].model_parameters["criterion"] == "entropy"
    assert runs["gini"].model_parameters["random_state"] == 17
    assert runs["entropy"].model_parameters["random_state"] == 17
    assert "radius" in runs["gini"].rules


def test_fitted_estimators_are_ready_for_the_shared_evaluator() -> None:
    X_train = np.array([[0.0], [0.2], [0.8], [1.0]])
    y_train = np.array(["B", "B", "M", "M"])
    X_evaluation = np.array([[0.1], [0.9]])

    runs = fit_gini_and_entropy(
        X_train,
        y_train,
        model_parameters={"max_depth": 1, "random_state": 17},
    )

    for run in runs.values():
        assert run.estimator.predict(X_evaluation).tolist() == ["B", "M"]
        assert run.estimator.predict_proba(X_evaluation).shape == (2, 2)


def test_fit_rejects_criterion_and_missing_seed() -> None:
    X_train = np.array([[0.0], [1.0]])
    y_train = np.array(["B", "M"])

    with pytest.raises(ValueError, match="must not contain criterion"):
        fit_gini_and_entropy(
            X_train,
            y_train,
            model_parameters={"criterion": "gini", "random_state": 17},
        )

    with pytest.raises(ValueError, match="canonical random_state"):
        fit_gini_and_entropy(
            X_train,
            y_train,
            model_parameters={"max_depth": 1},
        )


def test_run_criterion_experiment_uses_one_canonical_split_and_shared_metrics() -> None:
    features = pd.DataFrame(
        {
            "radius": [1.0, 1.2, 1.4, 1.6, 1.8, 3.0, 3.2, 3.4, 3.6, 3.8],
            "texture": [0.0, 0.2, 0.1, 0.3, 0.4, 1.0, 1.2, 1.1, 1.3, 1.4],
        }
    )
    target = pd.Series(["B"] * 5 + ["M"] * 5)

    result = run_criterion_experiment(
        features,
        target,
        BaselineConfig(test_size=0.2, random_state=42, max_depth=2),
        cv_folds=2,
    )

    assert set(result.runs) == {"gini", "entropy"}
    assert set(result.train_metrics) == {"gini", "entropy"}
    assert set(result.training_cv_metrics) == {"gini", "entropy"}
    assert all(len(folds) == 2 for folds in result.training_cv_metrics.values())
    assert set(result.validation_metrics) == {"gini", "entropy"}
    assert all(len(folds) == 2 for folds in result.validation_metrics.values())
    assert result.selected_criterion in {"gini", "entropy"}
    assert result.feature_names == ("radius", "texture")
    assert result.class_names == ("B", "M")
    assert (result.train_size, result.test_size) == (8, 2)
    assert result.cv_folds == 2
    assert result.selected_test_metrics.malignant_recall == pytest.approx(1.0)
