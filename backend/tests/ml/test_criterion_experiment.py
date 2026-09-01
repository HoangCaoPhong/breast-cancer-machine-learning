import numpy as np
import pytest
from app.ml.sklearn_tree.criterion_experiment import (
    entropy_impurity,
    fit_gini_and_entropy,
    gini_impurity,
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
