"""Run and export the reproducible dual-implementation max-depth experiment."""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, cast

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
import pandas as pd  # noqa: E402
from sklearn.tree import DecisionTreeClassifier, plot_tree  # noqa: E402

REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = REPOSITORY_ROOT / "backend"
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.ml.custom_tree import DecisionTreeClassifierScratch, TreeNode  # noqa: E402
from app.ml.preprocessing import load_breast_cancer_dataset  # noqa: E402
from app.ml.sklearn_tree import (  # noqa: E402
    MaxDepthExperimentConfig,
    MaxDepthExperimentResult,
    run_max_depth_experiment,
)

DEFAULT_CONFIG = REPOSITORY_ROOT / "experiments/configs/max_depth.json"
DISCLAIMER = "Educational classification demo; not a medical diagnosis."


def build_parser() -> argparse.ArgumentParser:
    """Create the command-line argument parser."""

    parser = argparse.ArgumentParser(
        description=(
            "Tune max_depth for custom and sklearn Decision Trees, then export "
            "report-ready tables and figures."
        )
    )
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG)
    parser.add_argument(
        "--output-dir",
        type=Path,
        help="Override output_dir from the config (relative paths use repository root).",
    )
    return parser


def main() -> None:
    """Load config and data, run the experiment, and export report-ready outputs."""

    args = build_parser().parse_args()
    raw_config = _load_json(args.config)
    config = MaxDepthExperimentConfig.from_mapping(raw_config)
    dataset_path = _resolve_repo_path(Path(raw_config["dataset"]))
    configured_output = args.output_dir or Path(raw_config["output_dir"])
    output_dir = _resolve_repo_path(configured_output)

    dataset = load_breast_cancer_dataset(dataset_path)
    result = run_max_depth_experiment(dataset.features, dataset.target, config)
    paths = export_results(result, config, raw_config, output_dir, dataset_path)
    _print_results(result, config, paths)


def export_results(
    result: MaxDepthExperimentResult,
    config: MaxDepthExperimentConfig,
    raw_config: dict[str, Any],
    output_dir: Path,
    dataset_path: Path | None = None,
) -> dict[str, Path]:
    """Write experiment tables, provenance, report notes, and figures."""

    output_dir.mkdir(parents=True, exist_ok=True)
    paths = {
        "cv_results": output_dir / "cv_results.csv",
        "final_comparison": output_dir / "final_comparison.csv",
        "summary": output_dir / "summary.json",
        "report_notes": output_dir / "report_notes.md",
        "accuracy_plot": output_dir / "accuracy_by_depth.png",
        "f2_plot": output_dir / "malignant_f2_by_depth.png",
        "complexity_plot": output_dir / "complexity_by_depth.png",
        "test_metrics_plot": output_dir / "test_metrics_comparison.png",
        "confusion_matrices": output_dir / "confusion_matrices.png",
        "custom_tree_plot": output_dir / "selected_custom_tree.png",
        "sklearn_tree_plot": output_dir / "selected_sklearn_tree.png",
    }
    result.cv_results.to_csv(paths["cv_results"], index=False)
    result.final_comparison.to_csv(paths["final_comparison"], index=False)

    source_path = dataset_path or _resolve_repo_path(Path(raw_config["dataset"]))
    generated_at = datetime.now(timezone.utc)
    git_commit, worktree_dirty = _git_state()
    summary = {
        "run_id": f"max-depth-{generated_at:%Y%m%dT%H%M%SZ}-{git_commit[:8]}",
        "generated_at_utc": generated_at.isoformat(),
        "git_commit": git_commit,
        "git_worktree_dirty": worktree_dirty,
        "experiment_name": raw_config.get("experiment_name", "dual_tree_max_depth"),
        "owner": raw_config.get("owner"),
        "protocol_status": raw_config.get("protocol_status"),
        "hypothesis": raw_config.get("hypothesis"),
        "dataset": str(source_path.relative_to(REPOSITORY_ROOT)),
        "dataset_sha256": _sha256(source_path),
        "feature_order": list(result.feature_names),
        "implementations": list(config.implementations),
        "candidate_depths": ["unlimited" if value is None else value for value in config.depths],
        "selected_max_depth": result.selected_depths,
        "primary_selection_metric": "malignant_f2_beta_2",
        "selection_rule": (
            "Per implementation: highest mean stratified training-CV malignant F2; "
            "ties use higher malignant recall, lower F2 standard deviation, fewer "
            "leaves, lower fitted depth, then declared candidate order."
        ),
        "test_set_used_for_selection": False,
        "train_samples": result.train_size,
        "test_samples": result.test_size,
        "split": "stratified_train_test",
        "random_seed": config.random_seed,
        "test_size": config.test_size,
        "cv": f"stratified_{config.cv_folds}_fold",
        "positive_class": config.positive_class,
        "negative_class": config.negative_class,
        "criterion": config.criterion,
        "min_samples_split": config.min_samples_split,
        "min_samples_leaf": config.min_samples_leaf,
        "final_comparison": json.loads(result.final_comparison.to_json(orient="records")),
        "medical_disclaimer": DISCLAIMER,
    }
    paths["summary"].write_text(
        json.dumps(summary, indent=2, ensure_ascii=True) + "\n",
        encoding="utf-8",
    )
    paths["report_notes"].write_text(_build_report_notes(result), encoding="utf-8")
    _save_cv_plot(result, paths["accuracy_plot"], "accuracy", "Accuracy")
    _save_cv_plot(
        result,
        paths["f2_plot"],
        "malignant_f2",
        "Malignant F2 (beta=2)",
    )
    _save_complexity_plot(result, paths["complexity_plot"])
    _save_test_metrics_plot(result, paths["test_metrics_plot"])
    _save_confusion_matrices(result, paths["confusion_matrices"])
    _save_custom_tree_plot(result, paths["custom_tree_plot"])
    _save_sklearn_tree_plot(result, paths["sklearn_tree_plot"])
    return paths


def _save_cv_plot(
    result: MaxDepthExperimentResult,
    path: Path,
    metric: str,
    metric_label: str,
) -> None:
    implementations = list(result.selected_depths)
    figure, axes = plt.subplots(1, len(implementations), figsize=(7 * len(implementations), 5.5))
    axes_array = np.atleast_1d(axes)
    for axis, implementation in zip(axes_array, implementations, strict=True):
        rows = result.cv_results[result.cv_results["implementation"] == implementation]
        positions = np.arange(len(rows))
        labels = rows["max_depth"].tolist()
        axis.plot(
            positions,
            rows[f"train_{metric}_mean"],
            marker="o",
            linewidth=2,
            label="Training CV mean",
        )
        axis.errorbar(
            positions,
            rows[f"validation_{metric}_mean"],
            yerr=rows[f"validation_{metric}_std"],
            marker="o",
            linewidth=2,
            capsize=4,
            label="Validation CV mean +/- 1 std",
        )
        selected_depth = result.selected_depths[implementation]
        selected_position = labels.index(str(selected_depth))
        axis.axvline(
            selected_position,
            color="tab:green",
            linestyle="--",
            alpha=0.85,
            label=f"Selected depth = {selected_depth}",
        )
        axis.set_xticks(positions, labels, rotation=30)
        axis.set_xlabel("Configured max_depth")
        axis.set_ylabel(metric_label)
        axis.set_title(f"{implementation.title()} Decision Tree")
        axis.set_ylim(0.0, 1.04)
        axis.grid(alpha=0.25)
        axis.legend(fontsize=8)
    figure.suptitle(f"Cross-validated {metric_label} across max_depth", fontsize=14)
    figure.tight_layout()
    figure.savefig(path, dpi=200, bbox_inches="tight")
    plt.close(figure)


def _save_complexity_plot(result: MaxDepthExperimentResult, path: Path) -> None:
    implementations = list(result.selected_depths)
    figure, axes = plt.subplots(1, len(implementations), figsize=(7 * len(implementations), 5.5))
    axes_array = np.atleast_1d(axes)
    for axis, implementation in zip(axes_array, implementations, strict=True):
        rows = result.cv_results[result.cv_results["implementation"] == implementation]
        positions = np.arange(len(rows))
        labels = rows["max_depth"].tolist()
        leaf_axis = axis.twinx()
        axis.plot(positions, rows["fitted_depth"], marker="o", color="tab:blue", label="Depth")
        leaf_axis.plot(
            positions,
            rows["n_leaves"],
            marker="s",
            color="tab:orange",
            label="Leaves",
        )
        axis.set_xticks(positions, labels, rotation=30)
        axis.set_xlabel("Configured max_depth")
        axis.set_ylabel("Fitted depth", color="tab:blue")
        leaf_axis.set_ylabel("Number of leaves", color="tab:orange")
        axis.set_title(f"{implementation.title()} tree complexity")
        axis.grid(alpha=0.2)
        lines = axis.lines + leaf_axis.lines
        axis.legend(lines, [line.get_label() for line in lines], loc="upper left")
    figure.suptitle("Tree complexity across max_depth", fontsize=14)
    figure.tight_layout()
    figure.savefig(path, dpi=200, bbox_inches="tight")
    plt.close(figure)


def _save_test_metrics_plot(result: MaxDepthExperimentResult, path: Path) -> None:
    metrics = [
        ("test_accuracy", "Accuracy"),
        ("test_malignant_f2", "Malignant F2"),
        ("test_malignant_recall", "Malignant recall"),
        ("test_benign_recall_specificity", "Specificity"),
        ("test_balanced_accuracy", "Balanced accuracy"),
    ]
    rows = result.final_comparison
    positions = np.arange(len(metrics))
    width = 0.8 / len(rows)
    figure, axis = plt.subplots(figsize=(13, 6))
    for index, (_, row) in enumerate(rows.iterrows()):
        values = [float(row[column]) for column, _ in metrics]
        offset = (index - (len(rows) - 1) / 2) * width
        axis.bar(positions + offset, values, width, label=_display_model_name(row))
    axis.set_xticks(positions, [label for _, label in metrics])
    axis.set_ylim(0.0, 1.08)
    axis.set_ylabel("Held-out test score")
    axis.set_title("Baseline and selected-depth performance on the held-out test set")
    axis.grid(axis="y", alpha=0.25)
    axis.legend(fontsize=8, ncol=2)
    figure.tight_layout()
    figure.savefig(path, dpi=200, bbox_inches="tight")
    plt.close(figure)


def _save_confusion_matrices(result: MaxDepthExperimentResult, path: Path) -> None:
    rows = result.final_comparison
    columns = 2
    row_count = int(np.ceil(len(rows) / columns))
    figure, axes = plt.subplots(row_count, columns, figsize=(10, 4.5 * row_count))
    axes_array = np.asarray(axes).reshape(-1)
    for axis, (_, row) in zip(axes_array, rows.iterrows(), strict=False):
        matrix = np.array(
            [
                [row["test_true_negatives"], row["test_false_positives"]],
                [row["test_false_negatives"], row["test_true_positives"]],
            ],
            dtype=int,
        )
        axis.imshow(matrix, cmap="Blues")
        for matrix_row in range(2):
            for matrix_column in range(2):
                axis.text(
                    matrix_column,
                    matrix_row,
                    str(matrix[matrix_row, matrix_column]),
                    ha="center",
                    va="center",
                    fontsize=15,
                    fontweight="bold",
                )
        axis.set_xticks([0, 1], ["Predicted B", "Predicted M"])
        axis.set_yticks([0, 1], ["Actual B", "Actual M"])
        axis.set_title(_display_model_name(row))
    for axis in axes_array[len(rows) :]:
        axis.axis("off")
    figure.suptitle("Held-out test confusion matrices (label order B, M)", fontsize=14)
    figure.tight_layout()
    figure.savefig(path, dpi=200, bbox_inches="tight")
    plt.close(figure)


def _save_sklearn_tree_plot(result: MaxDepthExperimentResult, path: Path) -> None:
    model = cast(DecisionTreeClassifier, result.selected_models["sklearn"])
    selected_depth = result.selected_depths["sklearn"]
    shown_depth = min(selected_depth, 4)
    figure, axis = plt.subplots(figsize=(max(18, 5 * shown_depth), max(10, 3 * shown_depth)))
    plot_tree(
        model,
        feature_names=result.feature_names,
        class_names=[str(label) for label in model.classes_],
        filled=True,
        rounded=True,
        impurity=True,
        proportion=False,
        precision=3,
        max_depth=shown_depth,
        fontsize=8,
        ax=axis,
    )
    suffix = "" if shown_depth == selected_depth else f" (shown through depth {shown_depth})"
    axis.set_title(f"Selected sklearn Decision Tree: max_depth={selected_depth}{suffix}")
    figure.tight_layout()
    figure.savefig(path, dpi=200, bbox_inches="tight")
    plt.close(figure)


def _save_custom_tree_plot(result: MaxDepthExperimentResult, path: Path) -> None:
    model = cast(DecisionTreeClassifierScratch, result.selected_models["custom"])
    if model.tree_ is None or model.classes_ is None:
        raise RuntimeError("Custom tree must be fitted before plotting")
    selected_depth = result.selected_depths["custom"]
    shown_depth = min(selected_depth, 4)
    figure, axis = plt.subplots(figsize=(max(18, 5 * shown_depth), max(10, 3 * shown_depth)))
    _draw_custom_node(
        axis,
        model.tree_,
        model.classes_,
        result.feature_names,
        depth=0,
        max_depth=shown_depth,
        x_min=0.0,
        x_max=1.0,
        parent=None,
    )
    suffix = "" if shown_depth == selected_depth else f" (shown through depth {shown_depth})"
    axis.set_title(f"Selected custom Decision Tree: max_depth={selected_depth}{suffix}")
    axis.set_xlim(-0.02, 1.02)
    axis.set_ylim(-(shown_depth + 0.7), 0.55)
    axis.axis("off")
    figure.tight_layout()
    figure.savefig(path, dpi=200, bbox_inches="tight")
    plt.close(figure)


def _draw_custom_node(
    axis: plt.Axes,
    node: TreeNode,
    classes: np.ndarray,
    feature_names: tuple[str, ...],
    *,
    depth: int,
    max_depth: int,
    x_min: float,
    x_max: float,
    parent: tuple[float, float] | None,
) -> None:
    x_position = (x_min + x_max) / 2.0
    y_position = -float(depth)
    if parent is not None:
        axis.plot(
            [parent[0], x_position],
            [parent[1] - 0.08, y_position + 0.08],
            color="#64748b",
            linewidth=1.2,
            zorder=1,
        )
    prediction = str(classes[node.prediction_index])
    counts = ", ".join(
        f"{label}={int(count)}" for label, count in zip(classes, node.class_counts, strict=True)
    )
    if node.is_leaf:
        rule = "leaf"
    elif depth >= max_depth:
        rule = "subtree omitted"
    else:
        assert node.feature_index is not None and node.threshold is not None
        rule = f"{feature_names[node.feature_index]} <= {node.threshold:.3f}"
    label = (
        f"{rule}\nimpurity={node.impurity:.3f}\nsamples={node.n_samples}\n"
        f"{counts}\npredict={prediction}"
    )
    color = "#dbeafe" if prediction == "B" else "#fee2e2"
    axis.text(
        x_position,
        y_position,
        label,
        ha="center",
        va="center",
        fontsize=7.5,
        bbox={"boxstyle": "round,pad=0.35", "facecolor": color, "edgecolor": "#475569"},
        zorder=2,
    )
    if node.is_leaf or depth >= max_depth:
        return
    assert node.left is not None and node.right is not None
    midpoint = (x_min + x_max) / 2.0
    _draw_custom_node(
        axis,
        node.left,
        classes,
        feature_names,
        depth=depth + 1,
        max_depth=max_depth,
        x_min=x_min,
        x_max=midpoint,
        parent=(x_position, y_position),
    )
    _draw_custom_node(
        axis,
        node.right,
        classes,
        feature_names,
        depth=depth + 1,
        max_depth=max_depth,
        x_min=midpoint,
        x_max=x_max,
        parent=(x_position, y_position),
    )


def _build_report_notes(result: MaxDepthExperimentResult) -> str:
    lines = [
        "# Max-depth experiment notes",
        "",
        f"> {DISCLAIMER}",
        "",
        "Depth was selected independently for each implementation using mean malignant F2 "
        "on stratified training CV. The held-out test set was not searched.",
        "",
    ]
    for implementation, selected_depth in result.selected_depths.items():
        rows = result.final_comparison[result.final_comparison["implementation"] == implementation]
        baseline = rows[rows["variant"] == "unlimited_baseline"].iloc[0]
        selected = rows[rows["variant"] == "selected_max_depth"].iloc[0]
        f2_change = selected["test_malignant_f2"] - baseline["test_malignant_f2"]
        outcome = "improved" if f2_change > 0 else "did not improve"
        lines.extend(
            [
                f"## {implementation.title()} tree",
                "",
                f"- Selected `max_depth`: `{selected_depth}`.",
                f"- Test malignant F2: {baseline['test_malignant_f2']:.4f} -> "
                f"{selected['test_malignant_f2']:.4f} ({f2_change:+.4f}); "
                f"the primary metric {outcome}.",
                f"- Test malignant recall: {baseline['test_malignant_recall']:.4f} -> "
                f"{selected['test_malignant_recall']:.4f}.",
                f"- Test accuracy/error rate: {selected['test_accuracy']:.4f} / "
                f"{selected['test_error_rate']:.4f}.",
                f"- False negatives: {int(baseline['test_false_negatives'])} -> "
                f"{int(selected['test_false_negatives'])}.",
                f"- Complexity: {int(baseline['n_leaves'])} -> {int(selected['n_leaves'])} leaves; "
                f"fitted depth {int(baseline['fitted_depth'])} -> {int(selected['fitted_depth'])}.",
                "",
            ]
        )
    lines.extend(
        [
            "## Interpretation guidance",
            "",
            "- Use malignant F2 as the primary conclusion and report accuracy/error rate "
            "as required secondary metrics.",
            "- Discuss malignant recall and raw false negatives explicitly; accuracy "
            "alone can hide costly misses.",
            "- A widening train-validation gap and increasing leaf count indicate "
            "overfitting at larger depths.",
            "- Differences between custom and sklearn trees can result from "
            "implementation-specific split tie-breaking.",
            "- Do not claim clinical validity from this educational dataset experiment.",
            "",
        ]
    )
    return "\n".join(lines)


def _display_model_name(row: pd.Series) -> str:
    implementation = str(row["implementation"]).title()
    if row["variant"] == "unlimited_baseline":
        return f"{implementation} - unlimited"
    return f"{implementation} - selected depth {row['max_depth']}"


def _print_results(
    result: MaxDepthExperimentResult,
    config: MaxDepthExperimentConfig,
    paths: dict[str, Path],
) -> None:
    print("Dual-implementation max-depth cross-validation results")
    print(f"{DISCLAIMER}\n")
    displayed_cv = result.cv_results[
        [
            "implementation",
            "max_depth",
            "fitted_depth",
            "n_leaves",
            "train_accuracy_mean",
            "validation_accuracy_mean",
            "validation_error_rate_mean",
            "train_malignant_f2_mean",
            "validation_malignant_f2_mean",
            "validation_malignant_recall_mean",
            "validation_false_negatives_mean",
        ]
    ]
    print(displayed_cv.to_string(index=False, float_format=lambda value: f"{value:.4f}"))
    print("\nSelected max_depth by implementation:")
    for implementation, depth in result.selected_depths.items():
        print(f"- {implementation}: {depth}")
    print("Selection used training CV only; the held-out test set was not searched.\n")
    print("Final held-out comparison")
    displayed_final = result.final_comparison[
        [
            "model_id",
            "max_depth",
            "fitted_depth",
            "n_leaves",
            "test_accuracy",
            "test_error_rate",
            "test_malignant_precision",
            "test_malignant_recall",
            "test_malignant_f1",
            "test_malignant_f2",
            "test_benign_recall_specificity",
            "test_balanced_accuracy",
            "test_false_negatives",
            "test_false_positives",
            "test_roc_auc",
        ]
    ]
    print(displayed_final.to_string(index=False, float_format=lambda value: f"{value:.4f}"))
    print(
        f"\nProtocol: stratified split, test_size={config.test_size}, "
        f"seed={config.random_seed}, {config.cv_folds}-fold CV"
    )
    print("\nGenerated files:")
    for path in paths.values():
        try:
            displayed_path = path.relative_to(REPOSITORY_ROOT)
        except ValueError:
            displayed_path = path
        print(f"- {displayed_path}")


def _git_state() -> tuple[str, bool]:
    commit = subprocess.run(
        ["git", "rev-parse", "HEAD"],
        cwd=REPOSITORY_ROOT,
        check=True,
        capture_output=True,
        text=True,
    ).stdout.strip()
    status = subprocess.run(
        ["git", "status", "--porcelain"],
        cwd=REPOSITORY_ROOT,
        check=True,
        capture_output=True,
        text=True,
    ).stdout
    return commit, bool(status.strip())


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


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
    for key in ("dataset", "output_dir", "depths"):
        if key not in values:
            raise SystemExit(f"Experiment config is missing required field: {key}")
    return values


def _resolve_repo_path(path: Path) -> Path:
    return path if path.is_absolute() else REPOSITORY_ROOT / path


if __name__ == "__main__":
    main()
