from typing import Optional
import numpy as np


class CustomDecisionTreeClassifier:
    def __init__(
        self,
        criterion: str = "gini",
        max_depth: Optional[int] = None,
        min_samples_split: int = 2,
        min_samples_leaf: int = 1,
    ):
        self.criterion = criterion
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.min_samples_leaf = min_samples_leaf

    def fit(self, X: np.ndarray, y: np.ndarray) -> "CustomDecisionTreeClassifier":
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        return np.zeros(len(X), dtype=np.int64)

    def predict_proba(self, X: np.ndarray) -> np.ndarray:
        return np.zeros((len(X), 2), dtype=np.float64)
