"""Run and export the canonical scikit-learn Decision Tree baseline."""

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
from app.ml.sklearn_tree import BaselineConfig, run_sklearn_baseline  # noqa: E402

DEFAULT_CONFIG = REPOSITORY_ROOT / "experiments/configs/baseline.json"


def build_parser() -> argparse.ArgumentParser:
    """Create the command-line parser."""

    parser = argparse.ArgumentParser(
        description="Run the canonical sklearn Decision Tree baseline."
    )
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG)
    parser.add_argument(
        "--output-dir",
        type=Path,
        help="Override output_dir from config; relative paths use repository root.",
    )
    return parser


def main() -> None:
    """Load data, fit B0, and export its metric contract."""

    args = build_parser().parse_args()
    raw_config = _load_json(args.config)
    config = BaselineConfig.from_mapping(raw_config)
    dataset_path = _resolve_repo_path(Path(raw_config["dataset"]))
    configured_output = args.output_dir or Path(raw_config["output_dir"])
    output_dir = _resolve_repo_path(configured_output)

    dataset = load_breast_cancer_dataset(dataset_path)
    result = run_sklearn_baseline(dataset.features, dataset.target, config)
    output_path = output_dir / "metrics.json"
    output_path.parent.mkdir(parents=True, exist_ok=True)
    summary = {
        "experiment_name": raw_config.get("experiment_name", "sklearn_baseline"),
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
        },
        "parameters": {
            "criterion": config.criterion,
            "max_depth": config.max_depth,
            "min_samples_split": config.min_samples_split,
            "min_samples_leaf": config.min_samples_leaf,
            "random_state": config.random_state,
        },
        "model_complexity": {
            "fitted_depth": int(result.model.get_depth()),
            "n_leaves": int(result.model.get_n_leaves()),
        },
        "feature_order": list(result.feature_names),
        "class_order": list(result.class_names),
        "sample_counts": {"train": result.train_size, "test": result.test_size},
        "train_metrics": result.train_metrics.to_dict(),
        "test_metrics": result.test_metrics.to_dict(),
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
        raise SystemExit("Baseline config must contain a JSON object")
    for field in ("dataset", "output_dir"):
        if field not in values:
            raise SystemExit(f"Baseline config is missing required field: {field}")
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
    metrics = summary["test_metrics"]
    protocol = summary["protocol"]
    parameters = summary["parameters"]
    print("Sklearn Decision Tree baseline")
    print("Educational classification demo; not a medical diagnosis.\n")
    print(
        "Split: stratified "
        f"{protocol['train_ratio'] * 100:.0f}/{protocol['test_ratio'] * 100:.0f} | "
        f"seed={protocol['random_state']} | positive class={protocol['positive_class']}"
    )
    print(
        f"Parameters: criterion={parameters['criterion']}, "
        f"max_depth={parameters['max_depth'] or 'unlimited'}, "
        f"min_samples_split={parameters['min_samples_split']}, "
        f"min_samples_leaf={parameters['min_samples_leaf']}, "
        f"random_state={parameters['random_state']}\n"
    )
    for name in (
        "malignant_f2",
        "malignant_recall",
        "malignant_precision",
        "malignant_f1",
        "benign_recall_specificity",
        "balanced_accuracy",
        "accuracy",
        "error_rate",
        "roc_auc",
    ):
        value = metrics[name]
        print(f"{name}: {'not available' if value is None else f'{value:.4f}'}")
    print(
        "Confusion counts (TN, FP, FN, TP): "
        f"({metrics['true_negatives']}, {metrics['false_positives']}, "
        f"{metrics['false_negatives']}, {metrics['true_positives']})"
    )
    print(f"\nSaved: {output_path}")


if __name__ == "__main__":
    main()
