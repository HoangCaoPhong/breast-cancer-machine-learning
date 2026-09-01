import numpy as np
import pandas as pd
import pytest
from app.ml.custom_tree import DecisionTreeClassifierScratch
from app.ml.sklearn_tree.baseline import BaselineConfig
from app.ml.sklearn_tree.gini_vs_entropy import (
    entropy_impurity,
    fit_gini_and_entropy,
    gini_impurity,
    run_gini_vs_entropy_experiment,
)
from sklearn.tree import DecisionTreeClassifier


def test_impurity_formulas_cover_pure_and_balanced_nodes() -> None:
    assert gini_impurity([1.0, 0.0]) == pytest.approx(0.0)
    assert entropy_impurity([1.0, 0.0]) == pytest.approx(0.0)
    assert gini_impurity([0.5, 0.5]) == pytest.approx(0.5)
    assert entropy_impurity([0.5, 0.5]) == pytest.approx(1.0)


def test_fit_changes_only_the_sklearn_criterion() -> None:
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
    assert all(isinstance(run.estimator, DecisionTreeClassifier) for run in runs.values())
    assert runs["gini"].model_parameters["criterion"] == "gini"
    assert runs["entropy"].model_parameters["criterion"] == "entropy"
    assert runs["gini"].model_parameters["random_state"] == 17
    assert runs["entropy"].model_parameters["random_state"] == 17
    assert "radius" in (runs["gini"].rules or "")


def test_fitted_sklearn_estimators_are_ready_for_evaluation() -> None:
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


def test_experiment_compares_custom_and_sklearn_on_shared_protocol() -> None:
    features = pd.DataFrame(
        {
            "radius": [1.0, 1.2, 1.4, 1.6, 1.8, 3.0, 3.2, 3.4, 3.6, 3.8],
            "texture": [0.0, 0.2, 0.1, 0.3, 0.4, 1.0, 1.2, 1.1, 1.3, 1.4],
        }
    )
    target = pd.Series(["B"] * 5 + ["M"] * 5)

    result = run_gini_vs_entropy_experiment(
        features,
        target,
        BaselineConfig(test_size=0.2, random_state=42, max_depth=2),
        cv_folds=2,
    )

    assert set(result.families) == {"custom", "sklearn"}
    assert (result.train_size, result.test_size, result.cv_folds) == (8, 2, 2)
    assert isinstance(
        result.families["custom"].runs["gini"].estimator,
        DecisionTreeClassifierScratch,
    )
    assert isinstance(
        result.families["sklearn"].runs["gini"].estimator,
        DecisionTreeClassifier,
    )
    for family in result.families.values():
        assert set(family.runs) == {"gini", "entropy"}
        assert family.selected_criterion in {"gini", "entropy"}
        assert family.feature_names == ("radius", "texture")
        assert family.class_names == ("B", "M")
        assert family.selected_test_metrics.malignant_recall == pytest.approx(1.0)
