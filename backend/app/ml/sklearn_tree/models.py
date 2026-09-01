from typing import Any

from sklearn.tree import DecisionTreeClassifier

from app.ml.custom_tree.decision_tree import CustomDecisionTreeClassifier


def build_model(model_id: str, random_state: int = 42) -> Any:
    model_id_upper = model_id.upper()
    if model_id_upper == "C0":
        return CustomDecisionTreeClassifier()
    return DecisionTreeClassifier(random_state=random_state)
