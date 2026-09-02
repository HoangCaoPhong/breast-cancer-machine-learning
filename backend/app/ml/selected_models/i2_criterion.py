"""Versioned I2 preset selected by the canonical criterion experiment."""

from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any, Literal

from sklearn.tree import DecisionTreeClassifier

from app.ml.custom_tree import DecisionTreeClassifierScratch

Criterion = Literal["gini", "entropy"]
SelectedImplementation = Literal["custom", "sklearn"]
SelectedCriterionModel = DecisionTreeClassifierScratch | DecisionTreeClassifier


@dataclass(frozen=True, slots=True)
class CriterionResultSummary:
    """Canonical CV and held-out results for one selected implementation."""

    selected_criterion: Criterion
    validation_f2_mean: float
    validation_f2_std: float
    selected_test_f2: float
    selected_test_recall: float
    selected_test_accuracy: float
    fitted_depth: int
    leaf_count: int


@dataclass(frozen=True, slots=True)
class SelectedCriterionConfig:
    """Stable parameters and provenance for the selected I2 model preset."""

    model_id: str = "I2"
    version: str = "i2-criterion-v1"
    criteria_tested: tuple[Criterion, ...] = ("gini", "entropy")
    max_depth: int | None = None
    min_samples_split: int = 2
    min_samples_leaf: int = 1
    random_seed: int = 42
    selection_metric: str = "malignant_f2_beta_2"
    cv_folds: int = 5
    positive_class: str = "M"
    negative_class: str = "B"
    custom_result: CriterionResultSummary = CriterionResultSummary(
        selected_criterion="gini",
        validation_f2_mean=0.9027,
        validation_f2_std=0.0524,
        selected_test_f2=0.8894,
        selected_test_recall=0.8810,
        selected_test_accuracy=0.9298,
        fitted_depth=8,
        leaf_count=24,
    )
    sklearn_result: CriterionResultSummary = CriterionResultSummary(
        selected_criterion="gini",
        validation_f2_mean=0.8948,
        validation_f2_std=0.0533,
        selected_test_f2=0.9048,
        selected_test_recall=0.9048,
        selected_test_accuracy=0.9298,
        fitted_depth=8,
        leaf_count=24,
    )


SELECTED_CRITERION_CONFIG = SelectedCriterionConfig()


def build_selected_criterion_model(
    implementation: SelectedImplementation = "sklearn",
    *,
    config: SelectedCriterionConfig = SELECTED_CRITERION_CONFIG,
) -> SelectedCriterionModel:
    """Build an unfitted custom or sklearn tree using the selected I2 preset."""

    common_parameters = {
        "max_depth": config.max_depth,
        "min_samples_split": config.min_samples_split,
        "min_samples_leaf": config.min_samples_leaf,
    }
    if implementation == "custom":
        return DecisionTreeClassifierScratch(
            criterion=config.custom_result.selected_criterion,
            **common_parameters,
        )
    if implementation == "sklearn":
        return DecisionTreeClassifier(
            criterion=config.sklearn_result.selected_criterion,
            random_state=config.random_seed,
            **common_parameters,
        )
    raise ValueError(f"Unsupported implementation: {implementation}")


def selected_criterion_metadata() -> dict[str, Any]:
    """Return serializable I2 parameters and canonical selection results."""

    return asdict(SELECTED_CRITERION_CONFIG)
