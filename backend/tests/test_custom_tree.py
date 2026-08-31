from pathlib import Path

import numpy as np
import pandas as pd
import pytest
from app.ml.custom_tree import DecisionTreeClassifierScratch
from app.ml.preprocessing import FEATURE_NAMES, load_breast_cancer_dataset

_CANONICAL_DATASET = Path(__file__).parents[2] / "data/raw/uci_wdbc/wdbc.data"


def test_pure_targets_create_one_leaf() -> None:
    model = DecisionTreeClassifierScratch().fit([[0.0], [1.0], [2.0]], ["B", "B", "B"])

    assert model.tree_ is not None
    assert model.tree_.is_leaf
    assert model.get_depth() == 0
    assert model.get_n_leaves() == 1
    assert model.predict([[10.0], [-2.0]]).tolist() == ["B", "B"]


@pytest.mark.parametrize("criterion", ["gini", "entropy"])
def test_one_useful_split_separates_classes(criterion: str) -> None:
    X = np.array([[0.0], [1.0], [2.0], [3.0]])
    y = np.array(["B", "B", "M", "M"])

    model = DecisionTreeClassifierScratch(criterion=criterion).fit(X, y)

    assert model.tree_ is not None
    assert model.tree_.feature_index == 0
    assert model.tree_.threshold == pytest.approx(1.5)
    assert model.predict(X).tolist() == y.tolist()
    assert model.predict_proba([[0.5], [2.5]]).tolist() == [[1.0, 0.0], [0.0, 1.0]]


def test_max_depth_limits_growth() -> None:
    X = np.arange(8, dtype=float).reshape(-1, 1)
    y = np.array([0, 0, 1, 1, 0, 0, 1, 1])

    model = DecisionTreeClassifierScratch(max_depth=1).fit(X, y)

    assert model.get_depth() == 1
    assert model.get_n_leaves() == 2


def test_min_samples_split_can_keep_root_as_leaf() -> None:
    model = DecisionTreeClassifierScratch(min_samples_split=5).fit(
        [[0.0], [1.0], [2.0], [3.0]], [0, 0, 1, 1]
    )

    assert model.tree_ is not None
    assert model.tree_.is_leaf


def test_min_samples_leaf_rejects_candidate_with_too_small_child() -> None:
    X = np.arange(5, dtype=float).reshape(-1, 1)
    y = np.array([0, 1, 1, 1, 1])

    model = DecisionTreeClassifierScratch(min_samples_leaf=2).fit(X, y)

    assert model.tree_ is not None
    assert model.tree_.threshold == pytest.approx(1.5)
    assert model.tree_.left is not None and model.tree_.left.n_samples == 2
    assert model.tree_.right is not None and model.tree_.right.n_samples == 3


def test_constant_feature_creates_leaf() -> None:
    model = DecisionTreeClassifierScratch().fit([[1.0], [1.0], [1.0]], [0, 1, 1])

    assert model.tree_ is not None
    assert model.tree_.is_leaf
    assert model.predict([[1.0]]).tolist() == [1]


def test_duplicate_values_are_never_split_apart() -> None:
    X = np.array([[0.0], [0.0], [1.0], [1.0]])
    y = np.array([0, 0, 1, 1])

    model = DecisionTreeClassifierScratch().fit(X, y)

    assert model.tree_ is not None
    assert model.tree_.threshold == pytest.approx(0.5)
    assert model.predict(X).tolist() == y.tolist()


def test_equal_gain_uses_lower_feature_index_deterministically() -> None:
    X = np.array([[0.0, 0.0], [0.0, 0.0], [1.0, 1.0], [1.0, 1.0]])
    y = np.array([0, 0, 1, 1])

    roots = [DecisionTreeClassifierScratch().fit(X, y).tree_ for _ in range(3)]

    assert all(root is not None and root.feature_index == 0 for root in roots)


def test_dataframe_feature_order_is_preserved() -> None:
    X = pd.DataFrame({"radius": [1.0, 2.0, 8.0, 9.0], "texture": [2.0, 3.0, 8.0, 9.0]})
    model = DecisionTreeClassifierScratch().fit(X, ["B", "B", "M", "M"])

    assert model.feature_names_in_ is not None
    assert model.feature_names_in_.tolist() == ["radius", "texture"]
    with pytest.raises(ValueError, match="names and order"):
        model.predict(X[["texture", "radius"]])


def test_custom_tree_accepts_canonical_breast_cancer_dataset() -> None:
    dataset = load_breast_cancer_dataset(_CANONICAL_DATASET)

    assert dataset.features.shape == (569, 30)
    assert dataset.target.value_counts().to_dict() == {"B": 357, "M": 212}
    assert dataset.features.columns.tolist() == list(FEATURE_NAMES)

    model = DecisionTreeClassifierScratch(max_depth=3, min_samples_leaf=5)
    model.fit(dataset.features, dataset.target)
    predictions = model.predict(dataset.features.iloc[:10])

    assert model.n_features_in_ == 30
    assert model.feature_names_in_ is not None
    assert model.feature_names_in_.tolist() == list(FEATURE_NAMES)
    assert predictions.shape == (10,)
    assert set(predictions).issubset({"B", "M"})


def test_simple_predictions_match_sklearn_reference() -> None:
    sklearn_tree = pytest.importorskip("sklearn.tree")
    X = np.array([[0.0], [1.0], [2.0], [3.0], [4.0], [5.0]])
    y = np.array([0, 0, 0, 1, 1, 1])
    samples = np.array([[0.25], [2.25], [4.75]])

    custom = DecisionTreeClassifierScratch(max_depth=1).fit(X, y)
    reference = sklearn_tree.DecisionTreeClassifier(max_depth=1, random_state=0).fit(X, y)

    assert custom.predict(samples).tolist() == reference.predict(samples).tolist()


@pytest.mark.parametrize(
    ("X", "y", "message"),
    [
        ([[1.0], [np.nan]], [0, 1], "finite"),
        ([[1.0], [2.0]], [0], "same number"),
        ([1.0, 2.0], [0, 1], "two-dimensional"),
    ],
)
def test_fit_rejects_invalid_training_data(X: object, y: object, message: str) -> None:
    with pytest.raises(ValueError, match=message):
        DecisionTreeClassifierScratch().fit(X, y)


def test_prediction_requires_fit_and_matching_feature_count() -> None:
    model = DecisionTreeClassifierScratch()
    with pytest.raises(RuntimeError, match="fitted"):
        model.predict([[1.0]])

    model.fit([[0.0, 0.0], [1.0, 1.0]], [0, 1])
    with pytest.raises(ValueError, match="expects 2"):
        model.predict([[1.0]])


@pytest.mark.parametrize(
    "kwargs",
    [
        {"criterion": "classification_error"},
        {"max_depth": 0},
        {"min_samples_split": 1},
        {"min_samples_leaf": 0},
        {"min_impurity_decrease": -0.1},
    ],
)
def test_invalid_hyperparameters_are_rejected(kwargs: dict[str, object]) -> None:
    with pytest.raises(ValueError):
        DecisionTreeClassifierScratch(**kwargs)  # type: ignore[arg-type]
