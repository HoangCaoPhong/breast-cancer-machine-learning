"""Run and export the canonical Gini-versus-Entropy experiment."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import tempfile
from collections.abc import Mapping
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

from app.ml.custom_tree.criterion_experiment import (  # noqa: E402
    CustomCriterionExperimentResult,
    run_custom_criterion_experiment,
)
from app.ml.preprocessing import load_breast_cancer_dataset  # noqa: E402
from app.ml.sklearn_tree.baseline import BaselineConfig  # noqa: E402
from app.ml.sklearn_tree.criterion_experiment import (  # noqa: E402
    CRITERIA,
    CriterionExperimentResult,
    run_criterion_experiment,
)

DEFAULT_CONFIG = REPOSITORY_ROOT / "experiments/configs/criterion.json"
MODEL_FAMILIES = ("custom", "sklearn")
MODEL_FAMILY_LABELS = {
    "custom": "Custom Decision Tree",
    "sklearn": "Sklearn Decision Tree",
}
FamilyResult = CriterionExperimentResult | CustomCriterionExperimentResult


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
    sklearn_result = run_criterion_experiment(
        dataset.features,
        dataset.target,
        config,
        cv_folds=cv_folds,
    )
    custom_result = run_custom_criterion_experiment(
        dataset.features,
        dataset.target,
        config,
        cv_folds=cv_folds,
    )
    results: dict[str, FamilyResult] = {
        "custom": custom_result,
        "sklearn": sklearn_result,
    }
    paths = export_results(results, config, raw_config, dataset_path, output_dir)
    _print_results(results, config, paths)


def export_results(
    results: Mapping[str, FamilyResult],
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
    for legacy_name in ("criterion_comparison.png",):
        (output_dir / legacy_name).unlink(missing_ok=True)
    cv_results = _build_cv_results(results)
    final_comparison = _build_final_comparison(results)
    cv_results.to_csv(paths["cv_results"], index=False)
    final_comparison.to_csv(paths["final_comparison"], index=False)

    model_family_results = {
        family: _build_family_summary(results[family], config) for family in MODEL_FAMILIES
    }
    reference_result = results[MODEL_FAMILIES[0]]
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
            "selection": f"stratified_{reference_result.cv_folds}_fold_cv_on_training_set",
            "model_families": list(MODEL_FAMILIES),
        },
        "feature_order": list(reference_result.feature_names),
        "class_order": list(reference_result.class_names),
        "sample_counts": {
            "train": reference_result.train_size,
            "test": reference_result.test_size,
        },
        "model_family_results": model_family_results,
        "medical_disclaimer": "Educational classification demo; not a medical diagnosis.",
    }
    paths["comparison"].write_text(
        json.dumps(summary, indent=2, ensure_ascii=True) + "\n",
        encoding="utf-8",
    )
    selections = {family: results[family].selected_criterion for family in MODEL_FAMILIES}
    _save_metric_plot(
        cv_results,
        selections,
        metric="accuracy",
        ylabel="Accuracy",
        title="Cross-validated accuracy across splitting criteria",
        path=paths["accuracy_plot"],
    )
    _save_metric_plot(
        cv_results,
        selections,
        metric="malignant_f2",
        ylabel="Malignant F2 (beta=2)",
        title="Cross-validated Malignant F2 (beta=2) across splitting criteria",
        path=paths["f2_plot"],
    )
    sklearn_result = results["sklearn"]
    assert isinstance(sklearn_result, CriterionExperimentResult)
    _save_tree_plot(sklearn_result, paths["tree_plot"])
    return paths


def _build_family_summary(
    result: FamilyResult,
    config: BaselineConfig,
) -> dict[str, Any]:
    variants: dict[str, Any] = {}
    for criterion in CRITERIA:
        run = result.runs[criterion]
        variant: dict[str, Any] = {
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
        }
        if hasattr(run, "feature_importances"):
            variant["feature_importances"] = dict(
                zip(result.feature_names, run.feature_importances, strict=True)
            )
            variant["rules_max_depth_3"] = run.rules
        variants[criterion] = variant

    gini_metrics = result.validation_mean_metrics["gini"]
    entropy_metrics = result.validation_mean_metrics["entropy"]
    return {
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
    }


def _build_cv_results(results: Mapping[str, FamilyResult]) -> pd.DataFrame:
    rows: list[dict[str, Any]] = []
    for family in MODEL_FAMILIES:
        result = results[family]
        for order, criterion in enumerate(CRITERIA):
            run = result.runs[criterion]
            training_means = result.training_cv_mean_metrics[criterion]
            training_stds = result.training_cv_std_metrics[criterion]
            validation_means = result.validation_mean_metrics[criterion]
            validation_stds = result.validation_std_metrics[criterion]
            rows.append(
                {
                    "model_family": family,
                    "model_label": MODEL_FAMILY_LABELS[family],
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


def _build_final_comparison(results: Mapping[str, FamilyResult]) -> pd.DataFrame:
    rows: list[dict[str, Any]] = []
    for family in MODEL_FAMILIES:
        result = results[family]
        criterion = result.selected_criterion
        run = result.runs[criterion]
        train_metrics = result.train_metrics[criterion]
        test_metrics = result.selected_test_metrics
        rows.append(
            {
                "model_family": family,
                "model": MODEL_FAMILY_LABELS[family],
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
        )
    return pd.DataFrame(rows)


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
    selections: Mapping[str, str],
    *,
    metric: str,
    ylabel: str,
    title: str,
    path: Path,
) -> None:
    labels = [criterion.title() for criterion in CRITERIA]
    positions = np.arange(len(labels))
    figure, axes = plt.subplots(1, 2, figsize=(15, 6), sharey=True)
    bar_width = 0.34
    all_validation_values = cv_results[f"validation_{metric}_mean"].to_numpy(dtype=float)
    all_validation_errors = cv_results[f"validation_{metric}_std"].to_numpy(dtype=float)
    lower_bound = max(
        0.0,
        np.floor((np.min(all_validation_values - all_validation_errors) - 0.04) * 20) / 20,
    )
    for axis, family in zip(axes, MODEL_FAMILIES, strict=True):
        family_results = cv_results[cv_results["model_family"] == family]
        training_values = family_results[f"train_{metric}_mean"].to_numpy(dtype=float)
        validation_values = family_results[f"validation_{metric}_mean"].to_numpy(dtype=float)
        validation_errors = family_results[f"validation_{metric}_std"].to_numpy(dtype=float)
        selected_position = CRITERIA.index(selections[family])
        training_bars = axis.bar(
            positions - bar_width / 2,
            training_values,
            width=bar_width,
            color="tab:blue",
            label="Training CV mean",
        )
        validation_bars = axis.bar(
            positions + bar_width / 2,
            validation_values,
            width=bar_width,
            yerr=validation_errors,
            capsize=5,
            color="tab:orange",
            label="Validation CV mean +/- 1 std",
        )
        axis.axvspan(
            selected_position - 0.48,
            selected_position + 0.48,
            color="tab:green",
            alpha=0.09,
            label=f"Selected = {selections[family].title()}",
        )
        axis.bar_label(training_bars, fmt="%.4f", padding=3, fontsize=9)
        axis.bar_label(validation_bars, fmt="%.4f", padding=3, fontsize=9)
        axis.set_xticks(positions, labels)
        axis.set_xlabel("Splitting criterion")
        axis.set_title(MODEL_FAMILY_LABELS[family])
        axis.set_ylim(lower_bound, 1.04)
        axis.grid(axis="y", alpha=0.25)
    axes[0].set_ylabel(f"{ylabel} (zoomed scale)")
    handles, legend_labels = axes[0].get_legend_handles_labels()
    figure.legend(handles, legend_labels, loc="lower center", ncol=3, frameon=True)
    figure.suptitle(title, fontsize=16)
    figure.subplots_adjust(bottom=0.20, top=0.86, wspace=0.08)
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
    results: Mapping[str, FamilyResult],
    config: BaselineConfig,
    paths: dict[str, Path],
) -> None:
    cv_results = _build_cv_results(results)
    final_comparison = _build_final_comparison(results)
    print("Gini-versus-Entropy cross-validation results")
    print("Educational classification demo; not a medical diagnosis.\n")
    print(
        cv_results.drop(columns=["candidate_order"]).to_string(
            index=False,
            float_format=lambda value: f"{value:.4f}",
        )
    )
    print("\nSelected criteria:")
    for family in MODEL_FAMILIES:
        print(f"- {MODEL_FAMILY_LABELS[family]}: {results[family].selected_criterion}")
    print("Selection used training CV only; the held-out test set was not searched.\n")
    print("Final held-out comparison")
    print(
        final_comparison.to_string(
            index=False,
            float_format=lambda value: f"{value:.4f}",
        )
    )
    print(
        f"\nProtocol: stratified split, test_size={config.test_size}, "
        f"seed={config.random_state}, {results[MODEL_FAMILIES[0]].cv_folds}-fold CV"
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
