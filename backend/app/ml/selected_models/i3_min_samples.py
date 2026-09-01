"""Versioned I3 preset selected by the canonical minimum-samples experiment."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any, Literal

from sklearn.tree import DecisionTreeClassifier

from app.ml.custom_tree import DecisionTreeClassifierScratch

SelectedImplementation = Literal["custom", "sklearn"]
SelectedMinSamplesModel = DecisionTreeClassifierScratch | DecisionTreeClassifier


@dataclass(frozen=True, slots=True)
class MinSamplesResultSummary:
    """Canonical sklearn CV and held-out result used to version the preset."""

    validation_f2_mean: float = 0.8974
    validation_f2_std: float = 0.0486
    validation_recall_mean: float = 0.9000
    selected_test_f2: float = 0.9091
    selected_test_recall: float = 0.9048
    selected_test_accuracy: float = 0.9386
    fitted_depth: int = 8
    leaf_count: int = 20


@dataclass(frozen=True, slots=True)
class SelectedMinSamplesConfig:
    """Stable parameters and provenance for the selected I3 model preset."""

    model_id: str = "I3"
    version: str = "i3-min-samples-v1"
    selection_family: str = "sklearn"
    criterion: str = "gini"
    max_depth: int | None = None
    min_samples_split: int = 5
    min_samples_leaf: int = 1
    min_samples_split_grid: tuple[int, ...] = (2, 5, 10, 20, 50)
    min_samples_leaf_grid: tuple[int, ...] = (1, 2, 5, 10, 20)
    random_seed: int = 42
    selection_metric: str = "malignant_f2_beta_2"
    cv_folds: int = 5
    positive_class: str = "M"
    negative_class: str = "B"
    result: MinSamplesResultSummary = MinSamplesResultSummary()


SELECTED_MIN_SAMPLES_CONFIG = SelectedMinSamplesConfig()


def build_selected_min_samples_model(
    implementation: SelectedImplementation = "sklearn",
    *,
    config: SelectedMinSamplesConfig = SELECTED_MIN_SAMPLES_CONFIG,
) -> SelectedMinSamplesModel:
    """Build an unfitted tree with I3 parameters selected on the sklearn family.

    The same pre-pruning parameters can be instantiated on the custom estimator for
    integration comparisons; the canonical selection result itself is sklearn-only.
    """

    common_parameters = {
        "criterion": config.criterion,
        "max_depth": config.max_depth,
        "min_samples_split": config.min_samples_split,
        "min_samples_leaf": config.min_samples_leaf,
    }
    if implementation == "custom":
        return DecisionTreeClassifierScratch(**common_parameters)
    if implementation == "sklearn":
        return DecisionTreeClassifier(random_state=config.random_seed, **common_parameters)
    raise ValueError(f"Unsupported implementation: {implementation}")


def selected_min_samples_metadata() -> dict[str, Any]:
    """Return serializable I3 parameters and canonical selection result."""

    return asdict(SELECTED_MIN_SAMPLES_CONFIG)
