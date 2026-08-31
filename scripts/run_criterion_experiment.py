"""Run the sklearn Gini-versus-Entropy experiment and export its results."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

os.environ.setdefault(
    "MPLCONFIGDIR",
    str(Path(tempfile.gettempdir()) / "breast-cancer-ml-matplotlib"),
)

import matplotlib  # noqa: E402

matplotlib.use("Agg")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
import pandas as pd  # noqa: E402
import sklearn  # noqa: E402
from sklearn.tree import plot_tree  # noqa: E402

REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = REPOSITORY_ROOT / "backend"
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.ml.preprocessing import load_breast_cancer_dataset  # noqa: E402
from app.ml.sklearn_tree.baseline import BaselineConfig  # noqa: E402
from app.ml.sklearn_tree.gini_vs_entropy import (  # noqa: E402
    CRITERIA,
    CriterionExperimentResult,
    run_criterion_experiment,
)

DEFAULT_CONFIG = REPOSITORY_ROOT / "experiments/configs/criterion.json"


def build_parser() -> argparse.ArgumentParser:
    """Create the command-line parser."""

    parser = argparse.ArgumentParser(
        description="Compare Gini and Entropy with sklearn Decision Trees."
    )
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG)
    parser.add_argument(
        "--output-dir",
        type=Path,
        help="Override output_dir from config; relative paths use the repository root.",
    )
    return parser


def main() -> None:
    """Load canonical data, run I2, and export reproducible results."""

    args = build_parser().parse_args()
    raw_config = _load_json(args.config)
    config = BaselineConfig.from_mapping(raw_config)
    dataset_path = _resolve_repo_path(Path(raw_config["dataset"]))
    configured_output = args.output_dir or Path(raw_config["output_dir"])
    output_dir = _resolve_repo_path(configured_output)
    cv_folds = int(raw_config.get("cv_folds", 5))

    dataset = load_breast_cancer_dataset(dataset_path)
    result = run_criterion_experiment(
        dataset.features,
        dataset.target,
        config,
        cv_folds=cv_folds,
    )
    paths = export_results(result, config, raw_config, dataset_path, output_dir)
    _print_summary(result, paths)


def export_results(
    result: CriterionExperimentResult,
    config: BaselineConfig,
    raw_config: dict[str, Any],
    dataset_path: Path,
    output_dir: Path,
) -> dict[str, Path]:
    """Write the compact report-ready output set for experiment I2."""

    output_dir.mkdir(parents=True, exist_ok=True)
    paths = {
        "cv_results": output_dir / "cv_results.csv",
        "summary": output_dir / "summary.json",
        "comparison_plot": output_dir / "criterion_comparison.png",
        "selected_tree": output_dir / "selected_tree.png",
    }

    comparison = _build_comparison_frame(result)
    comparison.to_csv(paths["cv_results"], index=False)
    paths["summary"].write_text(
        json.dumps(
            _build_summary(result, config, raw_config, dataset_path),
            indent=2,
            ensure_ascii=False,
            default=_json_default,
        ),
        encoding="utf-8",
    )
    _save_comparison_plot(result, paths["comparison_plot"])
    _save_selected_tree(result, paths["selected_tree"])
    return paths


def _build_comparison_frame(result: CriterionExperimentResult) -> pd.DataFrame:
    rows: list[dict[str, Any]] = []
    for criterion in CRITERIA:
        means = result.validation_mean_metrics[criterion]
        standard_deviations = result.validation_std_metrics[criterion]
        run = result.runs[criterion]
        rows.append(
            {
                "criterion": criterion,
                "selected": criterion == result.selected_criterion,
                "validation_malignant_f2_mean": means["malignant_f2"],
                "validation_malignant_f2_std": standard_deviations["malignant_f2"],
                "validation_malignant_recall_mean": means["malignant_recall"],
                "validation_accuracy_mean": means["accuracy"],
                "tree_depth": run.tree_depth,
                "leaf_count": run.leaf_count,
            }
        )
    return pd.DataFrame(rows)


def _build_summary(
    result: CriterionExperimentResult,
    config: BaselineConfig,
    raw_config: dict[str, Any],
    dataset_path: Path,
) -> dict[str, Any]:
    variants: dict[str, Any] = {}
    for criterion in CRITERIA:
        run = result.runs[criterion]
        variants[criterion] = {
            "parameters": dict(run.model_parameters),
            "training_metrics": result.train_metrics[criterion].to_dict(),
            "validation_mean_metrics": result.validation_mean_metrics[criterion],
            "validation_std_metrics": result.validation_std_metrics[criterion],
            "tree_depth": run.tree_depth,
            "leaf_count": run.leaf_count,
        }

    return {
        "experiment_name": raw_config.get("experiment_name", "gini_vs_entropy"),
        "created_at_utc": datetime.now(timezone.utc).isoformat(),
        "scikit_learn_version": sklearn.__version__,
        "dataset": str(dataset_path),
        "dataset_sha256": _sha256(dataset_path),
        "protocol": {
            "model_family": "sklearn_decision_tree",
            "controlled_variable": "criterion",
            "criteria": list(CRITERIA),
            "split": "stratified_train_test",
            "test_size": config.test_size,
            "random_state": config.random_state,
            "cv_folds": result.cv_folds,
            "primary_metric": "mean_validation_malignant_f2",
            "tie_breakers": ["mean_validation_malignant_recall", "gini_first"],
            "test_set_used_for_selection": False,
        },
        "sample_counts": {"train": result.train_size, "test": result.test_size},
        "variants": variants,
        "selection": {
            "selected_criterion": result.selected_criterion,
            "selected_test_metrics": result.selected_test_metrics.to_dict(),
        },
        "medical_disclaimer": "Educational classification demo; not a medical diagnosis.",
    }


def _save_comparison_plot(result: CriterionExperimentResult, output_path: Path) -> None:
    metrics = (
        ("malignant_f2", "Mean validation malignant F2"),
        ("accuracy", "Mean validation accuracy"),
    )
    colors = ["#2f6f9f" if name != result.selected_criterion else "#e07a2d" for name in CRITERIA]
    figure, axes = plt.subplots(1, 2, figsize=(10, 4.5))
    for axis, (metric, title) in zip(axes, metrics, strict=True):
        values = [result.validation_mean_metrics[name][metric] for name in CRITERIA]
        axis.bar(CRITERIA, values, color=colors)
        axis.set_ylim(0.0, 1.0)
        axis.set_title(title)
        axis.set_ylabel("Score")
        for index, value in enumerate(values):
            if value is not None:
                axis.text(index, value + 0.015, f"{value:.4f}", ha="center")
    figure.suptitle("Experiment I2: Gini versus Entropy (sklearn)")
    figure.tight_layout()
    figure.savefig(output_path, dpi=200, bbox_inches="tight")
    plt.close(figure)


def _save_selected_tree(result: CriterionExperimentResult, output_path: Path) -> None:
    selected = result.runs[result.selected_criterion]
    figure, axis = plt.subplots(figsize=(18, 10))
    plot_tree(
        selected.estimator,
        feature_names=list(result.feature_names),
        class_names=list(result.class_names),
        filled=True,
        rounded=True,
        impurity=True,
        max_depth=4,
        ax=axis,
    )
    axis.set_title(f"Selected sklearn tree: criterion={result.selected_criterion}")
    figure.tight_layout()
    figure.savefig(output_path, dpi=200, bbox_inches="tight")
    plt.close(figure)


def _print_summary(result: CriterionExperimentResult, paths: dict[str, Path]) -> None:
    print("Gini-versus-Entropy sklearn cross-validation results")
    print(_build_comparison_frame(result).to_string(index=False, float_format=lambda x: f"{x:.4f}"))
    print(f"\nSelected criterion: {result.selected_criterion}")
    print(
        "Held-out test: "
        f"F2={result.selected_test_metrics.malignant_f2:.4f}, "
        f"recall={result.selected_test_metrics.malignant_recall:.4f}, "
        f"accuracy={result.selected_test_metrics.accuracy:.4f}"
    )
    print("\nGenerated files:")
    for path in paths.values():
        try:
            displayed_path = path.relative_to(REPOSITORY_ROOT)
        except ValueError:
            displayed_path = path
        print(f"- {displayed_path}")


def _load_json(path: Path) -> dict[str, Any]:
    resolved = path if path.is_absolute() else Path.cwd() / path
    try:
        return json.loads(resolved.read_text(encoding="utf-8"))
    except FileNotFoundError as error:
        raise SystemExit(f"Config file was not found: {resolved}") from error
    except json.JSONDecodeError as error:
        raise SystemExit(f"Config file is not valid JSON: {error}") from error


def _resolve_repo_path(path: Path) -> Path:
    return path if path.is_absolute() else REPOSITORY_ROOT / path


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _json_default(value: Any) -> Any:
    if isinstance(value, np.generic):
        return value.item()
    if isinstance(value, np.ndarray):
        return value.tolist()
    raise TypeError(f"Object of type {type(value).__name__} is not JSON serializable")


if __name__ == "__main__":
    main()
