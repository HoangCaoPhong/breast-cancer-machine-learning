"""Controlled max-depth experiment for custom and scikit-learn trees."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Literal, Protocol, cast

import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold, train_test_split
from sklearn.tree import DecisionTreeClassifier

from app.ml.custom_tree import DecisionTreeClassifierScratch
from app.ml.evaluation import (
    BinaryClassificationMetrics,
    compute_binary_classification_metrics,
)

Implementation = Literal["custom", "sklearn"]
SUPPORTED_IMPLEMENTATIONS: tuple[Implementation, ...] = ("custom", "sklearn")


class _TreeModel(Protocol):
    """Small common contract implemented by both compared classifiers."""

    classes_: np.ndarray

    def fit(self, X: object, y: object) -> _TreeModel: ...

    def predict(self, X: object) -> np.ndarray: ...

    def predict_proba(self, X: object) -> np.ndarray: ...

    def get_depth(self) -> int: ...

    def get_n_leaves(self) -> int: ...


@dataclass(frozen=True, slots=True)
class MaxDepthExperimentConfig:
    """Validated settings shared by every max-depth candidate."""

    depths: tuple[int | None, ...]
    implementations: tuple[Implementation, ...] = SUPPORTED_IMPLEMENTATIONS
    test_size: float = 0.2
    random_seed: int = 42
    cv_folds: int = 5
    criterion: str = "gini"
    min_samples_split: int = 2
    min_samples_leaf: int = 1
    positive_class: str = "M"
    negative_class: str = "B"

    def __post_init__(self) -> None:
        if not self.depths:
            raise ValueError("depths must contain at least one value")
        if None not in self.depths:
            raise ValueError("depths must include None as the unlimited baseline")
        finite_depths = [depth for depth in self.depths if depth is not None]
        if not finite_depths:
            raise ValueError("depths must include at least one finite candidate")
        if any(
            isinstance(depth, bool) or not isinstance(depth, int) or depth < 1
            for depth in finite_depths
        ):
            raise ValueError("finite depths must be positive integers")
        if len(set(self.depths)) != len(self.depths):
            raise ValueError("depths must not contain duplicates")
        if not self.implementations:
            raise ValueError("implementations must contain at least one model")
        if len(set(self.implementations)) != len(self.implementations):
            raise ValueError("implementations must not contain duplicates")
        unsupported = set(self.implementations) - set(SUPPORTED_IMPLEMENTATIONS)
        if unsupported:
            raise ValueError(f"Unsupported implementations: {sorted(unsupported)}")
        if not 0.0 < self.test_size < 1.0:
            raise ValueError("test_size must be between 0 and 1")
        if self.cv_folds < 2:
            raise ValueError("cv_folds must be at least 2")
        if self.criterion not in {"gini", "entropy"}:
            raise ValueError("criterion must be gini or entropy for a fair comparison")
        if self.min_samples_split < 2:
            raise ValueError("min_samples_split must be at least 2")
        if self.min_samples_leaf < 1:
            raise ValueError("min_samples_leaf must be at least 1")
        if self.positive_class == self.negative_class:
            raise ValueError("positive_class and negative_class must be different")

    @classmethod
    def from_mapping(cls, values: dict[str, Any]) -> MaxDepthExperimentConfig:
        """Build a config from the experiment JSON representation."""

        if "depths" not in values:
            raise ValueError("Missing required config field: depths")
        raw_implementations = values.get("implementations", SUPPORTED_IMPLEMENTATIONS)
        return cls(
            depths=tuple(values["depths"]),
            implementations=cast(tuple[Implementation, ...], tuple(raw_implementations)),
            test_size=float(values.get("test_size", 0.2)),
            random_seed=int(values.get("random_seed", 42)),
            cv_folds=int(values.get("cv_folds", 5)),
            criterion=str(values.get("criterion", "gini")),
            min_samples_split=int(values.get("min_samples_split", 2)),
            min_samples_leaf=int(values.get("min_samples_leaf", 1)),
            positive_class=str(values.get("positive_class", "M")),
            negative_class=str(values.get("negative_class", "B")),
        )


@dataclass(slots=True)
class MaxDepthExperimentResult:
    """Tables and fitted models produced by one dual-implementation experiment."""

    cv_results: pd.DataFrame
    final_comparison: pd.DataFrame
    selected_depths: dict[Implementation, int]
    baseline_models: dict[Implementation, _TreeModel]
    selected_models: dict[Implementation, _TreeModel]
    feature_names: tuple[str, ...]
    class_names: tuple[str, ...]
    train_size: int
    test_size: int


def run_max_depth_experiment(
    features: pd.DataFrame,
    target: pd.Series,
    config: MaxDepthExperimentConfig,
) -> MaxDepthExperimentResult:
    """Select depth on training CV and evaluate both tree implementations once on test.

    Both implementations receive the same training rows, validation folds, feature
    order, labels, criterion, and stopping parameters. Only ``max_depth`` changes
    within an implementation. The held-out test split is never used for selection.
    """

    _validate_data(features, target, config)
    X_train, X_test, y_train, y_test = train_test_split(
        features,
        target,
        test_size=config.test_size,
        random_state=config.random_seed,
        stratify=target,
    )
    cv = StratifiedKFold(
        n_splits=config.cv_folds,
        shuffle=True,
        random_state=config.random_seed,
    )
    folds = list(cv.split(X_train, y_train))

    rows: list[dict[str, Any]] = []
    fitted_models: dict[tuple[Implementation, int | None], _TreeModel] = {}
    for implementation in config.implementations:
        for candidate_order, depth in enumerate(config.depths):
            fold_results: list[tuple[BinaryClassificationMetrics, BinaryClassificationMetrics]] = []
            for train_indices, validation_indices in folds:
                model = _new_model(config, implementation, depth)
                fold_X_train = X_train.iloc[train_indices]
                fold_y_train = y_train.iloc[train_indices]
                fold_X_validation = X_train.iloc[validation_indices]
                fold_y_validation = y_train.iloc[validation_indices]
                model.fit(fold_X_train, fold_y_train)
                fold_results.append(
                    (
                        _evaluate(model, fold_X_train, fold_y_train, config),
                        _evaluate(model, fold_X_validation, fold_y_validation, config),
                    )
                )

            fitted_model = _new_model(config, implementation, depth)
            fitted_model.fit(X_train, y_train)
            fitted_models[(implementation, depth)] = fitted_model
            rows.append(
                _summarize_candidate(
                    implementation,
                    candidate_order,
                    depth,
                    fitted_model,
                    fold_results,
                )
            )

    cv_results = pd.DataFrame(rows)
    selected_depths = {
        implementation: _select_depth(cv_results, implementation)
        for implementation in config.implementations
    }
    baseline_models = {
        implementation: fitted_models[(implementation, None)]
        for implementation in config.implementations
    }
    selected_models = {
        implementation: fitted_models[(implementation, selected_depths[implementation])]
        for implementation in config.implementations
    }

    final_rows: list[dict[str, Any]] = []
    for implementation in config.implementations:
        final_rows.append(
            _evaluate_final_model(
                implementation,
                "unlimited_baseline",
                None,
                baseline_models[implementation],
                X_train,
                X_test,
                y_train,
                y_test,
                config,
            )
        )
        selected_depth = selected_depths[implementation]
        final_rows.append(
            _evaluate_final_model(
                implementation,
                "selected_max_depth",
                selected_depth,
                selected_models[implementation],
                X_train,
                X_test,
                y_train,
                y_test,
                config,
            )
        )

    return MaxDepthExperimentResult(
        cv_results=cv_results,
        final_comparison=pd.DataFrame(final_rows),
        selected_depths=selected_depths,
        baseline_models=baseline_models,
        selected_models=selected_models,
        feature_names=tuple(features.columns),
        class_names=(config.negative_class, config.positive_class),
        train_size=len(X_train),
        test_size=len(X_test),
    )


def _new_model(
    config: MaxDepthExperimentConfig,
    implementation: Implementation,
    depth: int | None,
) -> _TreeModel:
    common_parameters = {
        "criterion": config.criterion,
        "max_depth": depth,
        "min_samples_split": config.min_samples_split,
        "min_samples_leaf": config.min_samples_leaf,
    }
    if implementation == "custom":
        return cast(_TreeModel, DecisionTreeClassifierScratch(**common_parameters))
    return cast(
        _TreeModel,
        DecisionTreeClassifier(random_state=config.random_seed, **common_parameters),
    )


def _evaluate(
    model: _TreeModel,
    features: pd.DataFrame,
    target: pd.Series,
    config: MaxDepthExperimentConfig,
) -> BinaryClassificationMetrics:
    positive_index = list(model.classes_).index(config.positive_class)
    return compute_binary_classification_metrics(
        target,
        model.predict(features),
        positive_class=config.positive_class,
        negative_class=config.negative_class,
        positive_scores=model.predict_proba(features)[:, positive_index],
    )


def _summarize_candidate(
    implementation: Implementation,
    candidate_order: int,
    depth: int | None,
    fitted_model: _TreeModel,
    fold_results: list[tuple[BinaryClassificationMetrics, BinaryClassificationMetrics]],
) -> dict[str, Any]:
    row: dict[str, Any] = {
        "implementation": implementation,
        "candidate_order": candidate_order,
        "max_depth": "unlimited" if depth is None else str(depth),
        "max_depth_value": depth,
        "fitted_depth": fitted_model.get_depth(),
        "n_leaves": fitted_model.get_n_leaves(),
    }
    for split_name, position in (("train", 0), ("validation", 1)):
        metric_names = fold_results[0][position].to_dict()
        for metric_name in metric_names:
            values = [result[position].to_dict()[metric_name] for result in fold_results]
            numeric_values = np.asarray(values, dtype=float)
            row[f"{split_name}_{metric_name}_mean"] = float(np.mean(numeric_values))
            row[f"{split_name}_{metric_name}_std"] = float(np.std(numeric_values))
    return row


def _select_depth(cv_results: pd.DataFrame, implementation: Implementation) -> int:
    finite_results = cv_results[
        (cv_results["implementation"] == implementation) & cv_results["max_depth_value"].notna()
    ].copy()
    if finite_results.empty:
        raise ValueError(f"No finite max_depth candidate for {implementation}")
    selected = finite_results.sort_values(
        [
            "validation_malignant_f2_mean",
            "validation_malignant_recall_mean",
            "validation_malignant_f2_std",
            "n_leaves",
            "fitted_depth",
            "candidate_order",
        ],
        ascending=[False, False, True, True, True, True],
        kind="mergesort",
    ).iloc[0]
    return int(selected["max_depth_value"])


def _evaluate_final_model(
    implementation: Implementation,
    variant: str,
    max_depth: int | None,
    model: _TreeModel,
    X_train: pd.DataFrame,
    X_test: pd.DataFrame,
    y_train: pd.Series,
    y_test: pd.Series,
    config: MaxDepthExperimentConfig,
) -> dict[str, Any]:
    row: dict[str, Any] = {
        "model_id": f"{implementation}_{variant}",
        "implementation": implementation,
        "variant": variant,
        "max_depth": "unlimited" if max_depth is None else str(max_depth),
        "fitted_depth": model.get_depth(),
        "n_leaves": model.get_n_leaves(),
    }
    row.update(
        {
            f"train_{key}": value
            for key, value in _evaluate(model, X_train, y_train, config).to_dict().items()
        }
    )
    row.update(
        {
            f"test_{key}": value
            for key, value in _evaluate(model, X_test, y_test, config).to_dict().items()
        }
    )
    return row


def _validate_data(
    features: pd.DataFrame,
    target: pd.Series,
    config: MaxDepthExperimentConfig,
) -> None:
    if not isinstance(features, pd.DataFrame):
        raise TypeError("features must be a pandas DataFrame")
    if not isinstance(target, pd.Series):
        raise TypeError("target must be a pandas Series")
    if features.empty or features.shape[1] == 0:
        raise ValueError("features must not be empty")
    if len(features) != len(target):
        raise ValueError("features and target must contain the same number of samples")
    if features.isna().any().any() or target.isna().any():
        raise ValueError("features and target must not contain missing values")
    expected_labels = {config.negative_class, config.positive_class}
    if set(target) != expected_labels:
        raise ValueError(f"target labels must be exactly {sorted(expected_labels)}")
