"""Scikit-learn Decision Tree baselines and controlled experiments."""

from app.ml.sklearn_tree.baseline import (
    BASELINE_PARAMS,
    build_baseline,
    fit_baseline,
)
from app.ml.sklearn_tree.max_depth import (
    MaxDepthExperimentConfig,
    MaxDepthExperimentResult,
    run_max_depth_experiment,
)
from app.ml.sklearn_tree.criterion_experiment import (
    CriterionRun,
    entropy_impurity,
    fit_gini_and_entropy,
    gini_impurity,
)
from app.ml.sklearn_tree.min_samples_experiment import (
    ExperimentResult,
    SingleRunMetrics,
    run_min_samples_experiment,
    run_single_config,
)

__all__ = [
    "BASELINE_PARAMS",
    "build_baseline",
    "fit_baseline",
    "MaxDepthExperimentConfig",
    "MaxDepthExperimentResult",
    "run_max_depth_experiment",
    "CriterionRun",
    "entropy_impurity",
    "fit_gini_and_entropy",
    "gini_impurity",
    "ExperimentResult",
    "SingleRunMetrics",
    "run_min_samples_experiment",
    "run_single_config",
]
