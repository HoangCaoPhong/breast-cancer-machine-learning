"""Run and export the canonical Gini-versus-Entropy experiment."""

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
from app.ml.sklearn_tree.criterion_experiment import (  # noqa: E402
    CRITERIA,
    CriterionExperimentResult,
    run_criterion_experiment,
)

DEFAULT_CONFIG = REPOSITORY_ROOT / "experiments/configs/criterion.json"


def build_parser() -> argparse.ArgumentParser:
    """Create the command-line parser."""

    parser = argparse.ArgumentParser(description="Compare Gini and Entropy Decision Tree criteria.")
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG)
    parser.add_argument(
        "--output-dir",
        type=Path,
        help="Override output_dir from config; relative paths use repository root.",
    )
    return parser


def main() -> None:
    """Load canonical data, run I2, and export report-ready results."""

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
    _print_results(result, config, paths)


def export_results(
    result: CriterionExperimentResult,
    config: BaselineConfig,
    raw_config: dict[str, Any],
    dataset_path: Path,
    output_dir: Path,
) -> dict[str, Path]:
    """Write report-ready tables, metadata, and figures to ``output_dir``."""

    output_dir.mkdir(parents=True, exist_ok=True)
    paths = {
        "cv_results": output_dir / "cv_results.csv",
        "final_comparison": output_dir / "final_comparison.csv",
        "comparison": output_dir / "comparison.json",
        "accuracy_plot": output_dir / "accuracy_by_criterion.png",
        "f2_plot": output_dir / "malignant_f2_by_criterion.png",
        "tree_plot": output_dir / "selected_tree.png",
    }
    cv_results = _build_cv_results(result)
    final_comparison = _build_final_comparison(result)
    cv_results.to_csv(paths["cv_results"], index=False)
    final_comparison.to_csv(paths["final_comparison"], index=False)

    variants: dict[str, Any] = {}
    for criterion in CRITERIA:
        run = result.runs[criterion]
        variants[criterion] = {
            "parameters": {
                "criterion": criterion,
                "max_depth": config.max_depth,
                "min_samples_split": config.min_samples_split,
                "min_samples_leaf": config.min_samples_leaf,
                "random_state": config.random_state,
            },
            "model_complexity": {
                "fitted_depth": int(run.tree_depth),
                "n_leaves": int(run.leaf_count),
            },
            "feature_importances": dict(
                zip(result.feature_names, run.feature_importances, strict=True)
            ),
            "train_metrics": result.train_metrics[criterion].to_dict(),
            "training_cv_fold_metrics": [
                metrics.to_dict() for metrics in result.training_cv_metrics[criterion]
            ],
            "training_cv_mean_metrics": result.training_cv_mean_metrics[criterion],
            "training_cv_std_metrics": result.training_cv_std_metrics[criterion],
            "validation_fold_metrics": [
                metrics.to_dict() for metrics in result.validation_metrics[criterion]
            ],
            "validation_mean_metrics": result.validation_mean_metrics[criterion],
            "validation_std_metrics": result.validation_std_metrics[criterion],
            "rules_max_depth_3": run.rules,
        }

    gini_metrics = result.validation_mean_metrics["gini"]
    entropy_metrics = result.validation_mean_metrics["entropy"]
    summary = {
        "experiment_name": raw_config.get("experiment_name", "gini_vs_entropy"),
        "dataset": str(dataset_path),
        "dataset_sha256": _sha256(dataset_path),
        "created_at_utc": datetime.now(timezone.utc).isoformat(),
        "scikit_learn_version": sklearn.__version__,
        "protocol": {
            "split": "stratified_train_test",
            "train_ratio": 1.0 - config.test_size,
            "test_ratio": config.test_size,
            "random_state": config.random_state,
            "positive_class": config.positive_class,
            "negative_class": config.negative_class,
            "confusion_matrix_label_order": [config.negative_class, config.positive_class],
            "controlled_variable": "criterion",
            "selection": f"stratified_{result.cv_folds}_fold_cv_on_training_set",
        },
        "feature_order": list(result.feature_names),
        "class_order": list(result.class_names),
        "sample_counts": {"train": result.train_size, "test": result.test_size},
        "variants": variants,
        "validation_delta_entropy_minus_gini": {
            "malignant_f2": entropy_metrics["malignant_f2"] - gini_metrics["malignant_f2"],
            "malignant_recall": (
                entropy_metrics["malignant_recall"] - gini_metrics["malignant_recall"]
            ),
            "accuracy": entropy_metrics["accuracy"] - gini_metrics["accuracy"],
        },
        "selection": {
            "primary_metric": "mean_validation_malignant_f2",
            "tie_breakers": ["mean_validation_malignant_recall", "gini_first_stable_order"],
            "selected_criterion": result.selected_criterion,
            "test_set_used_for_selection": False,
        },
        "selected_test_metrics": result.selected_test_metrics.to_dict(),
        "medical_disclaimer": "Educational classification demo; not a medical diagnosis.",
    }
    paths["comparison"].write_text(
        json.dumps(summary, indent=2, ensure_ascii=True) + "\n",
        encoding="utf-8",
    )
    _save_metric_plot(
        cv_results,
        result.selected_criterion,
        metric="accuracy",
        ylabel="Accuracy",
        title="Decision Tree accuracy across splitting criteria",
        path=paths["accuracy_plot"],
    )
    _save_metric_plot(
        cv_results,
        result.selected_criterion,
        metric="malignant_f2",
        ylabel="Malignant F2 (beta=2)",
        title="Decision Tree malignant F2 across splitting criteria",
        path=paths["f2_plot"],
    )
    _save_tree_plot(result, paths["tree_plot"])
    return paths


def _build_cv_results(result: CriterionExperimentResult) -> pd.DataFrame:
    rows: list[dict[str, Any]] = []
    for order, criterion in enumerate(CRITERIA):
        run = result.runs[criterion]
        training_means = result.training_cv_mean_metrics[criterion]
        training_stds = result.training_cv_std_metrics[criterion]
        validation_means = result.validation_mean_metrics[criterion]
        validation_stds = result.validation_std_metrics[criterion]
        rows.append(
            {
                "candidate_order": order,
                "criterion": criterion,
                "selected": criterion == result.selected_criterion,
                "fitted_depth": int(run.tree_depth),
                "n_leaves": int(run.leaf_count),
                "train_accuracy_mean": training_means["accuracy"],
                "train_accuracy_std": training_stds["accuracy"],
                "validation_accuracy_mean": validation_means["accuracy"],
                "validation_accuracy_std": validation_stds["accuracy"],
                "validation_error_rate": validation_means["error_rate"],
                "train_malignant_f2_mean": training_means["malignant_f2"],
                "train_malignant_f2_std": training_stds["malignant_f2"],
                "validation_malignant_f2_mean": validation_means["malignant_f2"],
                "validation_malignant_f2_std": validation_stds["malignant_f2"],
                "validation_malignant_recall_mean": validation_means["malignant_recall"],
                "validation_malignant_recall_std": validation_stds["malignant_recall"],
            }
        )
    return pd.DataFrame(rows)


def _build_final_comparison(result: CriterionExperimentResult) -> pd.DataFrame:
    criterion = result.selected_criterion
    run = result.runs[criterion]
    train_metrics = result.train_metrics[criterion]
    test_metrics = result.selected_test_metrics
    return pd.DataFrame(
        [
            {
                "model": "Selected criterion",
                "criterion": criterion,
                "fitted_depth": int(run.tree_depth),
                "n_leaves": int(run.leaf_count),
                "train_accuracy": train_metrics.accuracy,
                "train_malignant_f2": train_metrics.malignant_f2,
                "train_malignant_recall": train_metrics.malignant_recall,
                "test_accuracy": test_metrics.accuracy,
                "test_error_rate": test_metrics.error_rate,
                "malignant_precision": test_metrics.malignant_precision,
                "malignant_recall": test_metrics.malignant_recall,
                "malignant_f1": test_metrics.malignant_f1,
                "malignant_f2": test_metrics.malignant_f2,
                "benign_recall_specificity": test_metrics.benign_recall_specificity,
                "balanced_accuracy": test_metrics.balanced_accuracy,
                "benign_true_negatives": test_metrics.true_negatives,
                "benign_false_positives": test_metrics.false_positives,
                "malignant_false_negatives": test_metrics.false_negatives,
                "malignant_true_positives": test_metrics.true_positives,
                "roc_auc": test_metrics.roc_auc,
            }
        ]
    )


def _load_json(path: Path) -> dict[str, Any]:
    resolved = path if path.is_absolute() else Path.cwd() / path
    try:
        values = json.loads(resolved.read_text(encoding="utf-8"))
    except FileNotFoundError as error:
        raise SystemExit(f"Config file was not found: {resolved}") from error
    except json.JSONDecodeError as error:
        raise SystemExit(f"Config file is not valid JSON: {error}") from error
    if not isinstance(values, dict):
        raise SystemExit("Criterion config must contain a JSON object")
    for field in ("dataset", "output_dir"):
        if field not in values:
            raise SystemExit(f"Criterion config is missing required field: {field}")
    if "criterion" in values:
        raise SystemExit("Criterion config must not fix criterion; I2 always runs both variants")
    return values


def _resolve_repo_path(path: Path) -> Path:
    return path if path.is_absolute() else REPOSITORY_ROOT / path


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _save_metric_plot(
    cv_results: pd.DataFrame,
    selected_criterion: str,
    *,
    metric: str,
    ylabel: str,
    title: str,
    path: Path,
) -> None:
    labels = [str(value).title() for value in cv_results["criterion"]]
    positions = np.arange(len(labels))
    figure, axis = plt.subplots(figsize=(9, 6))
    axis.plot(
        positions,
        cv_results[f"train_{metric}_mean"],
        marker="o",
        linewidth=2,
        label="Training CV mean",
    )
    axis.errorbar(
        positions,
        cv_results[f"validation_{metric}_mean"],
        yerr=cv_results[f"validation_{metric}_std"],
        marker="o",
        linewidth=2,
        capsize=5,
        label="Validation CV mean +/- 1 std",
    )
    selected_position = int(cv_results.index[cv_results["criterion"] == selected_criterion][0])
    axis.axvline(
        selected_position,
        color="tab:green",
        linestyle="--",
        alpha=0.8,
        label=f"Selected criterion = {selected_criterion.title()}",
    )
    axis.set_xticks(positions, labels)
    axis.set_xlabel("Splitting criterion")
    axis.set_ylabel(ylabel)
    axis.set_title(title)
    axis.set_ylim(0.0, 1.05)
    axis.grid(alpha=0.25)
    axis.legend()
    figure.tight_layout()
    figure.savefig(path, dpi=180, bbox_inches="tight")
    plt.close(figure)


def _save_tree_plot(result: CriterionExperimentResult, path: Path) -> None:
    run = result.runs[result.selected_criterion]
    shown_depth = min(run.tree_depth, 4)
    figure_width = max(18, 5 * shown_depth)
    figure_height = max(10, 3 * shown_depth)
    figure, axis = plt.subplots(figsize=(figure_width, figure_height))
    plot_tree(
        run.estimator,
        feature_names=result.feature_names,
        class_names=result.class_names,
        filled=True,
        rounded=True,
        impurity=True,
        proportion=False,
        precision=3,
        max_depth=shown_depth,
        fontsize=8,
        ax=axis,
    )
    suffix = "" if shown_depth == run.tree_depth else f" (shown through depth {shown_depth})"
    axis.set_title(f"Selected Decision Tree: criterion={result.selected_criterion.title()}{suffix}")
    figure.tight_layout()
    figure.savefig(path, dpi=180, bbox_inches="tight")
    plt.close(figure)


def _print_results(
    result: CriterionExperimentResult,
    config: BaselineConfig,
    paths: dict[str, Path],
) -> None:
    cv_results = _build_cv_results(result)
    final_comparison = _build_final_comparison(result)
    print("Gini-versus-Entropy cross-validation results")
    print("Educational classification demo; not a medical diagnosis.\n")
    print(
        cv_results.drop(columns=["candidate_order"]).to_string(
            index=False,
            float_format=lambda value: f"{value:.4f}",
        )
    )
    print(f"\nSelected criterion: {result.selected_criterion}")
    print("Selection used training CV only; the held-out test set was not searched.\n")
    print("Final held-out result")
    print(
        final_comparison.to_string(
            index=False,
            float_format=lambda value: f"{value:.4f}",
        )
    )
    print(
        f"\nProtocol: stratified split, test_size={config.test_size}, "
        f"seed={config.random_state}, {result.cv_folds}-fold CV"
    )
    print("\nGenerated files:")
    for path in paths.values():
        try:
            displayed_path = path.relative_to(REPOSITORY_ROOT)
        except ValueError:
            displayed_path = path
        print(f"- {displayed_path}")


if __name__ == "__main__":
    main()
