import numpy as np
from app.ml.custom_tree.decision_tree import CustomDecisionTreeClassifier


def test_custom_tree_initialization():
    clf = CustomDecisionTreeClassifier(criterion="gini", max_depth=3)
    assert clf.criterion == "gini"
    assert clf.max_depth == 3


def test_custom_tree_fit_predict_shape():
    X = np.array([[1.0, 2.0], [3.0, 4.0]])
    y = np.array([0, 1])

    clf = CustomDecisionTreeClassifier()
    clf.fit(X, y)

    preds = clf.predict(X)
    assert len(preds) == 2

    probs = clf.predict_proba(X)
    assert probs.shape == (2, 2)
