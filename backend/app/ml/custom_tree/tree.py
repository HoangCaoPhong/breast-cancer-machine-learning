"""A deterministic, from-scratch Decision Tree classifier for numeric features."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

import numpy as np
from numpy.typing import ArrayLike, NDArray

Criterion = Literal["gini", "entropy"]

_GAIN_TOLERANCE = 1e-12


@dataclass(slots=True)
class TreeNode:
    """One node in a fitted binary classification tree."""

    prediction_index: int
    class_counts: NDArray[np.int64]
    impurity: float
    n_samples: int
    feature_index: int | None = None
    threshold: float | None = None
    gain: float = 0.0
    left: TreeNode | None = None
    right: TreeNode | None = None

    @property
    def is_leaf(self) -> bool:
        """Return whether this node has no children."""

        return self.feature_index is None


@dataclass(frozen=True, slots=True)
class _Split:
    feature_index: int
    threshold: float
    gain: float


class DecisionTreeClassifierScratch:
    """Binary decision tree classifier built without a tree library.

    At each node, all thresholds between distinct sorted values are considered.
    Equal-gain splits are resolved deterministically by choosing the lower feature
    index and then the lower threshold. A tied class vote chooses the first class
    in ``classes_`` (the sorted class order produced by NumPy).

    Parameters mirror the subset of scikit-learn controls needed by this project.
    The implementation accepts finite numeric features and any labels supported by
    ``numpy.unique``.
    """

    def __init__(
        self,
        *,
        criterion: Criterion = "gini",
        max_depth: int | None = None,
        min_samples_split: int = 2,
        min_samples_leaf: int = 1,
        min_impurity_decrease: float = 0.0,
    ) -> None:
        self._validate_hyperparameters(
            criterion,
            max_depth,
            min_samples_split,
            min_samples_leaf,
            min_impurity_decrease,
        )
        self.criterion = criterion
        self.max_depth = max_depth
        self.min_samples_split = min_samples_split
        self.min_samples_leaf = min_samples_leaf
        self.min_impurity_decrease = float(min_impurity_decrease)

        self.classes_: NDArray | None = None
        self.n_classes_: int | None = None
        self.n_features_in_: int | None = None
        self.tree_: TreeNode | None = None

    def fit(self, X: ArrayLike, y: ArrayLike) -> DecisionTreeClassifierScratch:
        """Build a classification tree from finite numeric training samples."""

        features = self._validate_features(X, fitting=True)
        targets = np.asarray(y)
        if targets.ndim != 1:
            raise ValueError("y must be a one-dimensional array")
        if targets.shape[0] != features.shape[0]:
            raise ValueError("X and y must contain the same number of samples")
        if targets.shape[0] == 0:
            raise ValueError("X and y must contain at least one sample")

        try:
            classes, encoded_targets = np.unique(targets, return_inverse=True)
        except TypeError as error:
            raise ValueError("y labels must be mutually comparable") from error
        if self._contains_missing_label(classes):
            raise ValueError("y must not contain missing labels")

        self.classes_ = classes
        self.n_classes_ = int(classes.size)
        self.n_features_in_ = int(features.shape[1])
        self.tree_ = self._build_tree(features, encoded_targets.astype(np.int64), depth=0)
        return self

    def predict(self, X: ArrayLike) -> NDArray:
        """Predict one class label for each sample in ``X``."""

        features = self._validate_prediction_input(X)
        leaf_indices = self._apply(features)
        assert self.classes_ is not None
        return self.classes_[leaf_indices]

    def predict_proba(self, X: ArrayLike) -> NDArray[np.float64]:
        """Return the empirical class distribution of each reached leaf."""

        features = self._validate_prediction_input(X)
        probabilities = np.empty((features.shape[0], self._fitted_n_classes()), dtype=float)
        for row_index, row in enumerate(features):
            leaf = self._find_leaf(row)
            probabilities[row_index] = leaf.class_counts / leaf.n_samples
        return probabilities

    def get_depth(self) -> int:
        """Return the maximum number of edges from the root to a leaf."""

        root = self._fitted_tree()

        def node_depth(node: TreeNode) -> int:
            if node.is_leaf:
                return 0
            assert node.left is not None and node.right is not None
            return 1 + max(node_depth(node.left), node_depth(node.right))

        return node_depth(root)

    def get_n_leaves(self) -> int:
        """Return the number of terminal nodes in the fitted tree."""

        root = self._fitted_tree()

        def leaf_count(node: TreeNode) -> int:
            if node.is_leaf:
                return 1
            assert node.left is not None and node.right is not None
            return leaf_count(node.left) + leaf_count(node.right)

        return leaf_count(root)

    def _build_tree(
        self,
        features: NDArray[np.float64],
        targets: NDArray[np.int64],
        *,
        depth: int,
    ) -> TreeNode:
        counts = np.bincount(targets, minlength=self._fitted_n_classes()).astype(np.int64)
        impurity = self._impurity(counts)
        node = TreeNode(
            prediction_index=int(np.argmax(counts)),
            class_counts=counts,
            impurity=impurity,
            n_samples=int(targets.size),
        )

        if self._must_stop(node, depth):
            return node

        split = self._best_split(features, targets, impurity)
        if split is None:
            return node

        left_mask = features[:, split.feature_index] <= split.threshold
        node.feature_index = split.feature_index
        node.threshold = split.threshold
        node.gain = split.gain
        node.left = self._build_tree(features[left_mask], targets[left_mask], depth=depth + 1)
        node.right = self._build_tree(features[~left_mask], targets[~left_mask], depth=depth + 1)
        return node

    def _must_stop(self, node: TreeNode, depth: int) -> bool:
        return (
            node.impurity <= _GAIN_TOLERANCE
            or (self.max_depth is not None and depth >= self.max_depth)
            or node.n_samples < self.min_samples_split
            or node.n_samples < 2 * self.min_samples_leaf
        )

    def _best_split(
        self,
        features: NDArray[np.float64],
        targets: NDArray[np.int64],
        parent_impurity: float,
    ) -> _Split | None:
        n_samples, n_features = features.shape
        n_classes = self._fitted_n_classes()
        best: _Split | None = None

        for feature_index in range(n_features):
            order = np.argsort(features[:, feature_index], kind="mergesort")
            sorted_values = features[order, feature_index]
            sorted_targets = targets[order]
            left_counts = np.zeros(n_classes, dtype=np.int64)
            right_counts = np.bincount(sorted_targets, minlength=n_classes).astype(np.int64)

            for position in range(n_samples - 1):
                class_index = sorted_targets[position]
                left_counts[class_index] += 1
                right_counts[class_index] -= 1

                n_left = position + 1
                n_right = n_samples - n_left
                if n_left < self.min_samples_leaf or n_right < self.min_samples_leaf:
                    continue
                if sorted_values[position] == sorted_values[position + 1]:
                    continue

                weighted_impurity = (
                    n_left * self._impurity(left_counts) + n_right * self._impurity(right_counts)
                ) / n_samples
                gain = parent_impurity - weighted_impurity
                if gain <= _GAIN_TOLERANCE:
                    continue
                if gain + _GAIN_TOLERANCE < self.min_impurity_decrease:
                    continue

                threshold = self._midpoint(
                    float(sorted_values[position]), float(sorted_values[position + 1])
                )
                candidate = _Split(feature_index, threshold, float(gain))
                if best is None or candidate.gain > best.gain + _GAIN_TOLERANCE:
                    best = candidate

        return best

    def _impurity(self, counts: NDArray[np.int64]) -> float:
        total = int(counts.sum())
        if total == 0:
            return 0.0
        probabilities = counts[counts > 0] / total
        if self.criterion == "gini":
            return float(1.0 - np.dot(probabilities, probabilities))
        return float(-np.dot(probabilities, np.log2(probabilities)))

    def _apply(self, features: NDArray[np.float64]) -> NDArray[np.int64]:
        return np.fromiter(
            (self._find_leaf(row).prediction_index for row in features),
            dtype=np.int64,
            count=features.shape[0],
        )

    def _find_leaf(self, row: NDArray[np.float64]) -> TreeNode:
        node = self._fitted_tree()
        while not node.is_leaf:
            assert node.feature_index is not None and node.threshold is not None
            assert node.left is not None and node.right is not None
            node = node.left if row[node.feature_index] <= node.threshold else node.right
        return node

    def _validate_prediction_input(self, X: ArrayLike) -> NDArray[np.float64]:
        features = self._validate_features(X, fitting=False)
        expected_features = self._fitted_n_features()
        if features.shape[1] != expected_features:
            raise ValueError(
                f"X has {features.shape[1]} features, but the fitted tree expects "
                f"{expected_features}"
            )
        return features

    @staticmethod
    def _validate_features(X: ArrayLike, *, fitting: bool) -> NDArray[np.float64]:
        try:
            features = np.asarray(X, dtype=float)
        except (TypeError, ValueError) as error:
            raise ValueError("X must contain only numeric values") from error
        if features.ndim != 2:
            raise ValueError("X must be a two-dimensional array")
        if fitting and features.shape[0] == 0:
            raise ValueError("X and y must contain at least one sample")
        if fitting and features.shape[1] == 0:
            raise ValueError("X must contain at least one feature")
        if not np.isfinite(features).all():
            raise ValueError("X must contain only finite values")
        return features

    @staticmethod
    def _contains_missing_label(classes: NDArray) -> bool:
        for label in classes:
            if label is None:
                return True
            try:
                if bool(np.isnan(label)):
                    return True
            except TypeError:
                pass
        return False

    @staticmethod
    def _midpoint(left: float, right: float) -> float:
        midpoint = left / 2.0 + right / 2.0
        if midpoint <= left or midpoint >= right:
            return left
        return midpoint

    def _fitted_tree(self) -> TreeNode:
        if self.tree_ is None:
            raise RuntimeError("DecisionTreeClassifierScratch must be fitted before prediction")
        return self.tree_

    def _fitted_n_classes(self) -> int:
        if self.n_classes_ is None:
            raise RuntimeError("DecisionTreeClassifierScratch must be fitted before prediction")
        return self.n_classes_

    def _fitted_n_features(self) -> int:
        if self.n_features_in_ is None:
            raise RuntimeError("DecisionTreeClassifierScratch must be fitted before prediction")
        return self.n_features_in_

    @staticmethod
    def _validate_hyperparameters(
        criterion: str,
        max_depth: int | None,
        min_samples_split: int,
        min_samples_leaf: int,
        min_impurity_decrease: float,
    ) -> None:
        if criterion not in {"gini", "entropy"}:
            raise ValueError("criterion must be either 'gini' or 'entropy'")
        if max_depth is not None and (
            isinstance(max_depth, bool) or not isinstance(max_depth, int) or max_depth < 1
        ):
            raise ValueError("max_depth must be None or an integer greater than or equal to 1")
        if (
            isinstance(min_samples_split, bool)
            or not isinstance(min_samples_split, int)
            or min_samples_split < 2
        ):
            raise ValueError("min_samples_split must be an integer greater than or equal to 2")
        if (
            isinstance(min_samples_leaf, bool)
            or not isinstance(min_samples_leaf, int)
            or min_samples_leaf < 1
        ):
            raise ValueError("min_samples_leaf must be an integer greater than or equal to 1")
        if isinstance(min_impurity_decrease, bool) or not isinstance(
            min_impurity_decrease, (int, float)
        ):
            raise ValueError("min_impurity_decrease must be a non-negative finite number")
        if not np.isfinite(min_impurity_decrease) or min_impurity_decrease < 0:
            raise ValueError("min_impurity_decrease must be a non-negative finite number")
