"""Versioned I1 preset selected by the canonical max-depth experiment."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any, Literal

from sklearn.tree import DecisionTreeClassifier

from app.ml.custom_tree import DecisionTreeClassifierScratch

SelectedImplementation = Literal["custom", "sklearn"]
SelectedMaxDepthModel = DecisionTreeClassifierScratch | DecisionTreeClassifier


@dataclass(frozen=True, slots=True)
class SelectedMaxDepthConfig:
    """Stable parameters and provenance for the selected I1 model preset."""

    model_id: str = "I1"
    version: str = "i1-max-depth-v1"
    criterion: str = "gini"
    max_depth: int = 8
    min_samples_split: int = 2
    min_samples_leaf: int = 1
    random_seed: int = 42
    selection_metric: str = "malignant_f2_beta_2"
    cv_folds: int = 5
    positive_class: str = "M"
    negative_class: str = "B"


SELECTED_MAX_DEPTH_CONFIG = SelectedMaxDepthConfig()


def build_selected_max_depth_model(
    implementation: SelectedImplementation = "sklearn",
    *,
    config: SelectedMaxDepthConfig = SELECTED_MAX_DEPTH_CONFIG,
) -> SelectedMaxDepthModel:
    """Build an unfitted custom or sklearn tree using the selected I1 preset."""

    common_parameters = {
        "criterion": config.criterion,
        "max_depth": config.max_depth,
        "min_samples_split": config.min_samples_split,
        "min_samples_leaf": config.min_samples_leaf,
    }
    if implementation == "custom":
        return DecisionTreeClassifierScratch(**common_parameters)
    if implementation == "sklearn":
        return DecisionTreeClassifier(
            random_state=config.random_seed,
            **common_parameters,
        )
    raise ValueError(f"Unsupported implementation: {implementation}")


def selected_max_depth_metadata() -> dict[str, Any]:
    """Return serializable preset metadata for a future API or model registry."""

    return asdict(SELECTED_MAX_DEPTH_CONFIG)
