"""Run Gini versus Entropy on custom and sklearn Decision Trees."""

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

from app.ml.custom_tree import TreeNode  # noqa: E402
from app.ml.preprocessing import load_breast_cancer_dataset  # noqa: E402
from app.ml.sklearn_tree.baseline import BaselineConfig  # noqa: E402
from app.ml.sklearn_tree.gini_vs_entropy import (  # noqa: E402
    CRITERIA,
    MODEL_FAMILIES,
    CriterionFamilyResult,
    GiniEntropyExperimentResult,
    run_gini_vs_entropy_experiment,
)

DEFAULT_CONFIG = REPOSITORY_ROOT / "experiments/configs/criterion.json"
FAMILY_LABELS = {
    "custom": "Custom Decision Tree",
    "sklearn": "Sklearn Decision Tree",
}


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Compare Gini and Entropy on custom and sklearn Decision Trees."
    )
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG)
    parser.add_argument(
        "--output-dir",
        type=Path,
        help="Override output_dir from config; relative paths use the repository root.",
    )
    return parser


def main() -> None:
    args = build_parser().parse_args()
    raw_config = _load_json(args.config)
    config = BaselineConfig.from_mapping(raw_config)
    dataset_path = _resolve_repo_path(Path(raw_config["dataset"]))
    configured_output = args.output_dir or Path(raw_config["output_dir"])
    output_dir = _resolve_repo_path(configured_output)
    cv_folds = int(raw_config.get("cv_folds", 5))

    dataset = load_breast_cancer_dataset(dataset_path)
    result = run_gini_vs_entropy_experiment(
        dataset.features,
        dataset.target,
        config,
        cv_folds=cv_folds,
    )
    paths = export_results(result, config, raw_config, dataset_path, output_dir)
    _print_summary(result, paths)


def export_results(
    result: GiniEntropyExperimentResult,
    config: BaselineConfig,
    raw_config: dict[str, Any],
    dataset_path: Path,
    output_dir: Path,
) -> dict[str, Path]:
    """Write one compact output set covering both model families."""

    output_dir.mkdir(parents=True, exist_ok=True)
    paths = {
        "cv_results": output_dir / "cv_results.csv",
        "summary": output_dir / "summary.json",
        "comparison_plot": output_dir / "criterion_comparison.png",
        "selected_trees": output_dir / "selected_trees.png",
    }
    frame = _build_comparison_frame(result)
    frame.to_csv(paths["cv_results"], index=False)
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
    _save_selected_trees(result, paths["selected_trees"])
    return paths


def _build_comparison_frame(result: GiniEntropyExperimentResult) -> pd.DataFrame:
    rows: list[dict[str, Any]] = []
    for family_name in MODEL_FAMILIES:
        family = result.families[family_name]
        for criterion in CRITERIA:
            means = family.validation_mean_metrics[criterion]
            standard_deviations = family.validation_std_metrics[criterion]
            run = family.runs[criterion]
            rows.append(
                {
                    "family": family_name,
                    "criterion": criterion,
                    "selected": criterion == family.selected_criterion,
                    "val_f2": means["malignant_f2"],
                    "val_f2_std": standard_deviations["malignant_f2"],
                    "val_recall": means["malignant_recall"],
                    "val_accuracy": means["accuracy"],
                    "depth": run.tree_depth,
                    "leaves": run.leaf_count,
                }
            )
    return pd.DataFrame(rows)


def _build_summary(
    result: GiniEntropyExperimentResult,
    config: BaselineConfig,
    raw_config: dict[str, Any],
    dataset_path: Path,
) -> dict[str, Any]:
    family_results: dict[str, Any] = {}
    for family_name in MODEL_FAMILIES:
        family = result.families[family_name]
        variants: dict[str, Any] = {}
        for criterion in CRITERIA:
            run = family.runs[criterion]
            variants[criterion] = {
                "parameters": dict(run.model_parameters),
                "training_metrics": family.train_metrics[criterion].to_dict(),
                "validation_mean_metrics": family.validation_mean_metrics[criterion],
                "validation_std_metrics": family.validation_std_metrics[criterion],
                "tree_depth": run.tree_depth,
                "leaf_count": run.leaf_count,
            }
        family_results[family_name] = {
            "variants": variants,
            "selection": {
                "selected_criterion": family.selected_criterion,
                "selected_test_metrics": family.selected_test_metrics.to_dict(),
            },
        }

    return {
        "experiment_name": raw_config.get("experiment_name", "gini_vs_entropy"),
        "created_at_utc": datetime.now(timezone.utc).isoformat(),
        "scikit_learn_version": sklearn.__version__,
        "dataset": str(dataset_path),
        "dataset_sha256": _sha256(dataset_path),
        "protocol": {
            "model_families": list(MODEL_FAMILIES),
            "controlled_variable": "criterion",
            "criteria": list(CRITERIA),
            "split": "stratified_80_20",
            "shuffle": True,
            "test_size": config.test_size,
            "random_state": config.random_state,
            "cv_folds": result.cv_folds,
            "primary_metric": "mean_validation_malignant_f2",
            "tie_breakers": ["mean_validation_malignant_recall", "gini_first"],
            "test_set_used_for_selection": False,
        },
        "sample_counts": {"train": result.train_size, "test": result.test_size},
        "model_family_results": family_results,
        "medical_disclaimer": "Educational classification demo; not a medical diagnosis.",
    }


def _save_comparison_plot(
    result: GiniEntropyExperimentResult,
    output_path: Path,
) -> None:
    metric_specs = (
        ("malignant_f2", "Malignant F2\n(primary)"),
        ("malignant_recall", "Malignant recall\n(tie-breaker)"),
        ("accuracy", "Accuracy\n(reference)"),
    )
    criterion_colors = {"gini": "#2878B5", "entropy": "#F28E2B"}
    observed_bounds: list[float] = []
    for family in result.families.values():
        for metric, _ in metric_specs:
            for criterion in CRITERIA:
                mean = family.validation_mean_metrics[criterion][metric]
                standard_deviation = family.validation_std_metrics[criterion][metric]
                if mean is None or standard_deviation is None:
                    raise RuntimeError(f"Validation metric {metric} must be available")
                observed_bounds.extend((mean - standard_deviation, mean + standard_deviation))

    lower_bound = max(0.0, min(observed_bounds) - 0.03)
    upper_bound = min(1.08, max(observed_bounds) + 0.08)
    figure, axes = plt.subplots(1, 2, figsize=(16, 6.5), sharey=True)
    positions = np.arange(len(metric_specs))
    width = 0.34
    offsets = (-width / 2, width / 2)
    for axis, family_name in zip(axes, MODEL_FAMILIES, strict=True):
        family = result.families[family_name]
        axis.axvspan(
            positions[0] - 0.48,
            positions[0] + 0.48,
            color="#4E79A7",
            alpha=0.10,
            label="Primary metric",
        )
        for offset, criterion in zip(offsets, CRITERIA, strict=True):
            means = [
                family.validation_mean_metrics[criterion][metric] for metric, _ in metric_specs
            ]
            standard_deviations = [
                family.validation_std_metrics[criterion][metric] for metric, _ in metric_specs
            ]
            if any(value is None for value in (*means, *standard_deviations)):
                raise RuntimeError("All plotted validation metrics must be available")
            numeric_means = np.asarray(means, dtype=float)
            numeric_stds = np.asarray(standard_deviations, dtype=float)
            is_selected = criterion == family.selected_criterion
            bars = axis.bar(
                positions + offset,
                numeric_means,
                width,
                yerr=numeric_stds,
                capsize=4,
                color=criterion_colors[criterion],
                edgecolor="#2E7D32" if is_selected else "none",
                linewidth=2.0 if is_selected else 0.0,
                label=f"{criterion.title()} — selected" if is_selected else criterion.title(),
            )
            axis.bar_label(
                bars,
                labels=[
                    f"{'★ ' if index == 0 and is_selected else ''}{mean:.4f}\n"
                    f"±{standard_deviation:.4f}"
                    for index, (mean, standard_deviation) in enumerate(
                        zip(
                            numeric_means,
                            numeric_stds,
                            strict=True,
                        )
                    )
                ],
                padding=4,
                fontsize=7.5,
            )
        axis.set_xticks(positions, [label for _, label in metric_specs])
        axis.set_ylim(lower_bound, upper_bound)
        axis.set_title(
            f"{FAMILY_LABELS[family_name]}\nSelected criterion: {family.selected_criterion.title()}"
        )
        axis.set_ylabel("Validation score (zoomed scale)")
        axis.grid(axis="y", alpha=0.25)
        axis.legend(loc="lower left", fontsize=8)
    figure.suptitle(
        f"Experiment I2: Gini versus Entropy — {result.cv_folds}-fold CV mean ± 1 std\n"
        "Selection: highest malignant F2 mean; recall breaks ties; accuracy is reference only",
        fontsize=15,
    )
    figure.tight_layout(rect=(0, 0, 1, 0.92))
    figure.savefig(output_path, dpi=200, bbox_inches="tight")
    plt.close(figure)


def _save_selected_trees(
    result: GiniEntropyExperimentResult,
    output_path: Path,
) -> None:
    custom = result.families["custom"]
    sklearn_result = result.families["sklearn"]
    figure, axes = plt.subplots(1, 2, figsize=(24, 10))
    _draw_custom_tree(axes[0], custom)

    sklearn_run = sklearn_result.runs[sklearn_result.selected_criterion]
    plot_tree(
        sklearn_run.estimator,
        feature_names=list(sklearn_result.feature_names),
        class_names=list(sklearn_result.class_names),
        filled=True,
        rounded=True,
        impurity=True,
        max_depth=3,
        fontsize=7,
        ax=axes[1],
    )
    axes[1].set_title(f"Sklearn Decision Tree: criterion={sklearn_result.selected_criterion}")
    figure.tight_layout()
    figure.savefig(output_path, dpi=180, bbox_inches="tight")
    plt.close(figure)


def _draw_custom_tree(axis: Any, result: CriterionFamilyResult) -> None:
    run = result.runs[result.selected_criterion]
    root = run.estimator.tree_
    if root is None:
        raise RuntimeError("Selected custom tree must be fitted before plotting")
    shown_depth = min(run.tree_depth, 3)
    positions: dict[int, tuple[float, int]] = {}
    leaf_counter = 0

    def assign_positions(node: TreeNode, depth: int) -> float:
        nonlocal leaf_counter
        if node.is_leaf or depth >= shown_depth:
            x_position = float(leaf_counter)
            leaf_counter += 1
        else:
            if node.left is None or node.right is None:
                raise RuntimeError("Internal custom-tree node must have two children")
            left_position = assign_positions(node.left, depth + 1)
            right_position = assign_positions(node.right, depth + 1)
            x_position = (left_position + right_position) / 2.0
        positions[id(node)] = (x_position, depth)
        return x_position

    assign_positions(root, 0)

    def draw_node(node: TreeNode, depth: int) -> None:
        x_position, _ = positions[id(node)]
        if not node.is_leaf and depth < shown_depth:
            if node.left is None or node.right is None:
                raise RuntimeError("Internal custom-tree node must have two children")
            for child in (node.left, node.right):
                child_x, child_depth = positions[id(child)]
                axis.plot(
                    [x_position, child_x],
                    [-depth, -child_depth],
                    color="0.35",
                    linewidth=1.0,
                    zorder=1,
                )
                draw_node(child, depth + 1)

        predicted_class = result.class_names[node.prediction_index]
        counts = ", ".join(str(int(value)) for value in node.class_counts)
        if node.is_leaf:
            split_text = "leaf"
        else:
            if node.feature_index is None or node.threshold is None:
                raise RuntimeError("Internal custom-tree node must expose a split")
            split_text = f"{result.feature_names[node.feature_index]}\n<= {node.threshold:.3f}"
        label = (
            f"{split_text}\n{run.criterion}={node.impurity:.3f}\n"
            f"samples={node.n_samples}\nvalue=[{counts}]\nclass={predicted_class}"
        )
        axis.text(
            x_position,
            -depth,
            label,
            ha="center",
            va="center",
            fontsize=6.5,
            bbox={
                "boxstyle": "round,pad=0.3",
                "facecolor": "#F4A261" if node.prediction_index == 0 else "#4EA8DE",
                "edgecolor": "0.2",
                "alpha": 0.55,
            },
            zorder=2,
        )

    draw_node(root, 0)
    axis.set_xlim(-0.7, max(leaf_counter - 1, 0) + 0.7)
    axis.set_ylim(-shown_depth - 0.7, 0.7)
    axis.axis("off")
    axis.set_title(f"Custom Decision Tree: criterion={result.selected_criterion}")


def _print_summary(
    result: GiniEntropyExperimentResult,
    paths: dict[str, Path],
) -> None:
    print("Gini-versus-Entropy cross-validation results")
    print(_build_comparison_frame(result).to_string(index=False, float_format=lambda x: f"{x:.4f}"))
    print("\nHeld-out test results")
    for family_name in MODEL_FAMILIES:
        family = result.families[family_name]
        metrics = family.selected_test_metrics
        print(
            f"- {family_name}: selected={family.selected_criterion}, "
            f"F2={metrics.malignant_f2:.4f}, recall={metrics.malignant_recall:.4f}, "
            f"accuracy={metrics.accuracy:.4f}"
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
        values = json.loads(resolved.read_text(encoding="utf-8"))
    except FileNotFoundError as error:
        raise SystemExit(f"Config file was not found: {resolved}") from error
    except json.JSONDecodeError as error:
        raise SystemExit(f"Config file is not valid JSON: {error}") from error
    if not isinstance(values, dict):
        raise SystemExit("Experiment config must contain a JSON object")
    return values


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
