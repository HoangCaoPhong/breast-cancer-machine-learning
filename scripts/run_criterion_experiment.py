"""Run and export the canonical Gini-versus-Entropy experiment."""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import sklearn

REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = REPOSITORY_ROOT / "backend"
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.ml.preprocessing import load_breast_cancer_dataset  # noqa: E402
from app.ml.sklearn_tree.baseline import BaselineConfig  # noqa: E402
from app.ml.sklearn_tree.criterion_experiment import (  # noqa: E402
    CRITERIA,
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
    output_path = output_dir / "comparison.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)

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
            "selection": f"stratified_{cv_folds}_fold_cv_on_training_set",
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
        },
        "selected_test_metrics": result.selected_test_metrics.to_dict(),
        "medical_disclaimer": "Educational classification demo; not a medical diagnosis.",
    }
    output_path.write_text(
        json.dumps(summary, indent=2, ensure_ascii=True) + "\n",
        encoding="utf-8",
    )
    _print_summary(summary, output_path)


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


def _print_summary(summary: dict[str, Any], output_path: Path) -> None:
    protocol = summary["protocol"]
    print("Gini versus Entropy Decision Tree experiment")
    print("Educational classification demo; not a medical diagnosis.\n")
    print(
        "Split: stratified "
        f"{protocol['train_ratio'] * 100:.0f}/{protocol['test_ratio'] * 100:.0f} | "
        f"seed={protocol['random_state']} | positive class={protocol['positive_class']}\n"
    )
    for criterion in CRITERIA:
        variant = summary["variants"][criterion]
        metrics = variant["validation_mean_metrics"]
        complexity = variant["model_complexity"]
        print(
            f"{criterion.upper()} CV: malignant_f2={metrics['malignant_f2']:.4f}, "
            f"recall={metrics['malignant_recall']:.4f}, "
            f"accuracy={metrics['accuracy']:.4f}, "
            f"depth={complexity['fitted_depth']}, leaves={complexity['n_leaves']}"
        )
    delta = summary["validation_delta_entropy_minus_gini"]
    selection = summary["selection"]
    selected_test_metrics = summary["selected_test_metrics"]
    print(f"\nEntropy - Gini mean CV malignant_f2: {delta['malignant_f2']:+.4f}")
    print(f"Selected by training CV: {selection['selected_criterion'].upper()}")
    print(
        "Selected model test: "
        f"malignant_f2={selected_test_metrics['malignant_f2']:.4f}, "
        f"recall={selected_test_metrics['malignant_recall']:.4f}, "
        f"accuracy={selected_test_metrics['accuracy']:.4f}"
    )
    print(f"Saved: {output_path}")


if __name__ == "__main__":
    main()
