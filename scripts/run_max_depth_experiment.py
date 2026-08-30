"""Run and export the reproducible scikit-learn max-depth experiment."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

import matplotlib

matplotlib.use("Agg")

import matplotlib.pyplot as plt  # noqa: E402
import numpy as np  # noqa: E402
from sklearn.tree import plot_tree  # noqa: E402

REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = REPOSITORY_ROOT / "backend"
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.ml.preprocessing import load_breast_cancer_dataset  # noqa: E402
from app.ml.sklearn_tree import (  # noqa: E402
    MaxDepthExperimentConfig,
    MaxDepthExperimentResult,
    run_max_depth_experiment,
)

DEFAULT_CONFIG = REPOSITORY_ROOT / "experiments/configs/max_depth.json"


def build_parser() -> argparse.ArgumentParser:
    """Create the command-line argument parser."""

    parser = argparse.ArgumentParser(
        description="Tune sklearn Decision Tree max_depth and export tables and figures."
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
    paths = export_results(result, config, raw_config, output_dir)
    _print_results(result, config, paths)


def export_results(
    result: MaxDepthExperimentResult,
    config: MaxDepthExperimentConfig,
    raw_config: dict[str, Any],
    output_dir: Path,
) -> dict[str, Path]:
    """Write experiment tables, summary metadata, and figures to ``output_dir``."""

    output_dir.mkdir(parents=True, exist_ok=True)
    paths = {
        "cv_results": output_dir / "cv_results.csv",
        "final_comparison": output_dir / "final_comparison.csv",
        "summary": output_dir / "summary.json",
        "accuracy_plot": output_dir / "accuracy_by_depth.png",
        "f2_plot": output_dir / "malignant_f2_by_depth.png",
        "tree_plot": output_dir / "selected_tree.png",
    }
    result.cv_results.to_csv(paths["cv_results"], index=False)
    result.final_comparison.to_csv(paths["final_comparison"], index=False)

    summary = {
        "experiment_name": raw_config.get("experiment_name", "sklearn_max_depth"),
        "owner": raw_config.get("owner"),
        "protocol_status": raw_config.get("protocol_status"),
        "hypothesis": raw_config.get("hypothesis"),
        "selected_max_depth": result.selected_depth,
        "primary_selection_metric": "malignant_f2_beta_2",
        "selection_rule": (
            "Highest mean stratified training-CV malignant F2; ties use higher "
            "malignant recall, lower F2 standard deviation, fewer leaves, lower "
            "fitted depth, then declared candidate order"
        ),
        "test_set_used_for_selection": False,
        "train_samples": result.train_size,
        "test_samples": result.test_size,
        "random_seed": config.random_seed,
        "test_size": config.test_size,
        "cv_folds": config.cv_folds,
        "positive_class": config.positive_class,
        "medical_disclaimer": "Educational classification demo; not a medical diagnosis.",
    }
    paths["summary"].write_text(
        json.dumps(summary, indent=2, ensure_ascii=True) + "\n",
        encoding="utf-8",
    )
    _save_accuracy_plot(result, paths["accuracy_plot"])
    _save_f2_plot(result, paths["f2_plot"])
    _save_tree_plot(result, paths["tree_plot"])
    return paths


def _save_accuracy_plot(result: MaxDepthExperimentResult, path: Path) -> None:
    labels = result.cv_results["max_depth"].tolist()
    positions = np.arange(len(labels))
    figure, axis = plt.subplots(figsize=(11, 6))
    axis.plot(
        positions,
        result.cv_results["train_accuracy_mean"],
        marker="o",
        linewidth=2,
        label="Training CV mean",
    )
    axis.errorbar(
        positions,
        result.cv_results["validation_accuracy_mean"],
        yerr=result.cv_results["validation_accuracy_std"],
        marker="o",
        linewidth=2,
        capsize=4,
        label="Validation CV mean +/- 1 std",
    )
    selected_position = int(
        result.cv_results.index[result.cv_results["max_depth_value"] == result.selected_depth][0]
    )
    axis.axvline(
        selected_position,
        color="tab:green",
        linestyle="--",
        alpha=0.8,
        label=f"Selected depth = {result.selected_depth}",
    )
    axis.set_xticks(positions, labels)
    axis.set_xlabel("Configured max_depth")
    axis.set_ylabel("Accuracy")
    axis.set_title("Decision Tree accuracy across max_depth values")
    axis.grid(alpha=0.25)
    axis.legend()
    figure.tight_layout()
    figure.savefig(path, dpi=180, bbox_inches="tight")
    plt.close(figure)


def _save_f2_plot(result: MaxDepthExperimentResult, path: Path) -> None:
    labels = result.cv_results["max_depth"].tolist()
    positions = np.arange(len(labels))
    figure, axis = plt.subplots(figsize=(11, 6))
    axis.plot(
        positions,
        result.cv_results["train_malignant_f2_mean"],
        marker="o",
        linewidth=2,
        label="Training CV mean",
    )
    axis.errorbar(
        positions,
        result.cv_results["validation_malignant_f2_mean"],
        yerr=result.cv_results["validation_malignant_f2_std"],
        marker="o",
        linewidth=2,
        capsize=4,
        label="Validation CV mean +/- 1 std",
    )
    selected_position = int(
        result.cv_results.index[result.cv_results["max_depth_value"] == result.selected_depth][0]
    )
    axis.axvline(
        selected_position,
        color="tab:green",
        linestyle="--",
        alpha=0.8,
        label=f"Selected depth = {result.selected_depth}",
    )
    axis.set_xticks(positions, labels)
    axis.set_xlabel("Configured max_depth")
    axis.set_ylabel("Malignant F2 (beta=2)")
    axis.set_title("Decision Tree malignant F2 across max_depth values")
    axis.grid(alpha=0.25)
    axis.legend()
    figure.tight_layout()
    figure.savefig(path, dpi=180, bbox_inches="tight")
    plt.close(figure)


def _save_tree_plot(result: MaxDepthExperimentResult, path: Path) -> None:
    shown_depth = min(result.selected_depth, 4)
    figure_width = max(18, 5 * shown_depth)
    figure_height = max(10, 3 * shown_depth)
    figure, axis = plt.subplots(figsize=(figure_width, figure_height))
    plot_tree(
        result.selected_model,
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
    suffix = "" if shown_depth == result.selected_depth else f" (shown through depth {shown_depth})"
    axis.set_title(f"Selected Decision Tree: max_depth={result.selected_depth}{suffix}")
    figure.tight_layout()
    figure.savefig(path, dpi=180, bbox_inches="tight")
    plt.close(figure)


def _print_results(
    result: MaxDepthExperimentResult,
    config: MaxDepthExperimentConfig,
    paths: dict[str, Path],
) -> None:
    print("Max-depth cross-validation results")
    print("Educational classification demo; not a medical diagnosis.\n")
    print(
        result.cv_results.drop(columns=["candidate_order", "max_depth_value"]).to_string(
            index=False,
            float_format=lambda value: f"{value:.4f}",
        )
    )
    print(f"\nSelected max_depth: {result.selected_depth}")
    print("Selection used training CV only; the held-out test set was not searched.\n")
    print("Final held-out comparison")
    print(
        result.final_comparison.to_string(
            index=False,
            float_format=lambda value: f"{value:.4f}",
        )
    )
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
