"""Benchmark and comparison script for Experiment I3 (min_samples tuning) vs Baseline.

Owner: Huỳnh Thái Hòa (24127374)

Usage
-----
    python scripts/benchmark_min_samples.py
    python scripts/benchmark_min_samples.py --config experiments/configs/min_samples.json
    python scripts/benchmark_min_samples.py --include-custom-tree
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import sklearn
from sklearn.model_selection import train_test_split

REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = REPOSITORY_ROOT / "backend"
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.ml.custom_tree import DecisionTreeClassifierScratch  # noqa: E402
from app.ml.evaluation import compute_binary_classification_metrics  # noqa: E402
from app.ml.preprocessing import load_breast_cancer_dataset  # noqa: E402
from app.ml.sklearn_tree import MinSamplesConfig, run_min_samples_tuning  # noqa: E402

DEFAULT_CONFIG = REPOSITORY_ROOT / "experiments/configs/min_samples.json"


def build_parser() -> argparse.ArgumentParser:
    """Create command-line argument parser."""
    parser = argparse.ArgumentParser(
        description="Run benchmark comparing Baseline B0 and I3 Min-Samples Tuned model."
    )
    parser.add_argument(
        "--config",
        type=Path,
        default=DEFAULT_CONFIG,
        help="Path to min_samples experiment JSON config.",
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        help="Override output directory.",
    )
    parser.add_argument(
        "--include-custom-tree",
        action="store_true",
        help="Also benchmark Custom Decision Tree (from scratch) for comparison.",
    )
    return parser


def main() -> None:
    """Execute benchmark and print formatted comparison."""
    args = build_parser().parse_args()
    raw_config = _load_json(args.config)
    config = MinSamplesConfig.from_mapping(raw_config)
    dataset_path = _resolve_repo_path(
        Path(raw_config.get("dataset", "data/raw/uci_wdbc/wdbc.data"))
    )
    output_dir = _resolve_repo_path(
        args.output_dir or Path(raw_config.get("output_dir", "experiments/results/min_samples"))
    )

    dataset = load_breast_cancer_dataset(dataset_path)

    # 1. Run I3 tuning (includes Baseline B0 candidate and Best candidate)
    result = run_min_samples_tuning(dataset.features, dataset.target, config)

    # 2. Optionally benchmark Custom Tree
    custom_tree_result = None
    if args.include_custom_tree:
        custom_tree_result = _benchmark_custom_tree(dataset.features, dataset.target, config)

    # 3. Print benchmark comparison table
    _print_benchmark_table(result, custom_tree_result)

    # 4. Save JSON summary
    output_dir.mkdir(parents=True, exist_ok=True)
    summary_path = output_dir / "benchmark_summary.json"
    summary_data = _build_summary_dict(
        result=result,
        config=config,
        raw_config=raw_config,
        dataset_path=dataset_path,
        custom_tree_result=custom_tree_result,
    )
    summary_path.write_text(
        json.dumps(summary_data, indent=2, ensure_ascii=True) + "\n",
        encoding="utf-8",
    )
    print(f"\nSaved benchmark results to: {summary_path}\n")


def _benchmark_custom_tree(
    features: Any,
    target: Any,
    config: MinSamplesConfig,
) -> dict[str, Any]:
    """Benchmark Custom Decision Tree from scratch on the same split."""
    X_train, X_test, y_train, y_test = train_test_split(
        features,
        target,
        test_size=config.test_size,
        random_state=config.random_state,
        stratify=target,
    )

    model = DecisionTreeClassifierScratch(
        criterion=config.criterion,
        max_depth=5,
        min_samples_split=5,
        min_samples_leaf=1,
    )

    t0 = time.perf_counter()
    model.fit(X_train, y_train)
    t1 = time.perf_counter()
    train_time_ms = (t1 - t0) * 1000.0

    t_inf0 = time.perf_counter()
    preds = model.predict(X_test)
    t_inf1 = time.perf_counter()
    inf_latency_us = ((t_inf1 - t_inf0) * 1_000_000.0) / max(len(X_test), 1)

    metrics = compute_binary_classification_metrics(
        y_test,
        preds,
        positive_class=config.positive_class,
        negative_class=config.negative_class,
    )

    return {
        "name": "Custom Decision Tree (Scratch)",
        "train_time_ms": round(train_time_ms, 4),
        "inference_latency_us": round(inf_latency_us, 2),
        "depth": model.get_depth(),
        "leaves": model.get_n_leaves(),
        "metrics": metrics.to_dict(),
    }


def _print_benchmark_table(
    result: Any,
    custom_tree_result: dict[str, Any] | None = None,
) -> None:
    """Print ASCII comparison table across all evaluated models."""
    bl = result.baseline_candidate
    best = result.best_candidate
    delta = result.delta_vs_baseline

    print("\n" + "=" * 80)
    print("           EXPERIMENT I3 BENCHMARK: BASELINE vs TUNED MODEL")
    print("=" * 80)
    print("Educational classification demo; not a clinical medical diagnosis.\n")

    print(f"Dataset: 569 samples (Train: {result.train_size}, Test: {result.test_size}) | Seed: 42")
    print(
        f"Baseline B0 parameters:   min_samples_split={bl.min_samples_split}, "
        f"min_samples_leaf={bl.min_samples_leaf}"
    )
    print(
        f"I3 Tuned parameters:      min_samples_split={best.min_samples_split}, "
        f"min_samples_leaf={best.min_samples_leaf} (Selected via 5-Fold CV)"
    )
    print("-" * 80)

    header = f"{'Metric':<28} | {'Baseline (B0)':>14} | {'Tuned (I3)':>14} | {'Delta (Diff)':>14}"
    print(header)
    print("-" * 80)

    cv_b0 = f"{bl.cv_f2_mean:.4f} +/- {bl.cv_f2_std:.4f}"
    cv_i3 = f"{best.cv_f2_mean:.4f} +/- {best.cv_f2_std:.4f}"
    cv_diff = f"{best.cv_f2_mean - bl.cv_f2_mean:+.4f}"

    b0_m = bl.test_metrics
    best_m = best.test_metrics

    prec_diff = best_m.malignant_precision - b0_m.malignant_precision
    spec_diff = best_m.benign_recall_specificity - b0_m.benign_recall_specificity
    bal_diff = best_m.balanced_accuracy - b0_m.balanced_accuracy
    lat_diff = best.inference_latency_us - bl.inference_latency_us

    cm_b0 = (
        f"({b0_m.true_negatives}, {b0_m.false_positives}, "
        f"{b0_m.false_negatives}, {b0_m.true_positives})"
    )
    cm_i3 = (
        f"({best_m.true_negatives}, {best_m.false_positives}, "
        f"{best_m.false_negatives}, {best_m.true_positives})"
    )

    rows = [
        (
            "CV Malignant F2 (Train)",
            cv_b0,
            cv_i3,
            cv_diff,
        ),
        (
            "Test Malignant F2",
            f"{b0_m.malignant_f2:.4f}",
            f"{best_m.malignant_f2:.4f}",
            f"{delta['test_malignant_f2_delta']:+.4f}",
        ),
        (
            "Test Malignant Recall (M)",
            f"{b0_m.malignant_recall:.4f}",
            f"{best_m.malignant_recall:.4f}",
            f"{delta['test_malignant_recall_delta']:+.4f}",
        ),
        (
            "Test Accuracy",
            f"{b0_m.accuracy:.4f}",
            f"{best_m.accuracy:.4f}",
            f"{delta['test_accuracy_delta']:+.4f}",
        ),
        (
            "Test Error Rate",
            f"{b0_m.error_rate:.4f}",
            f"{best_m.error_rate:.4f}",
            f"{-delta['test_accuracy_delta']:+.4f}",
        ),
        (
            "Test Malignant F1-Score",
            f"{b0_m.malignant_f1:.4f}",
            f"{best_m.malignant_f1:.4f}",
            f"{delta['test_malignant_f1_delta']:+.4f}",
        ),
        (
            "Test Malignant Precision",
            f"{b0_m.malignant_precision:.4f}",
            f"{best_m.malignant_precision:.4f}",
            f"{prec_diff:+.4f}",
        ),
        (
            "Benign Specificity",
            f"{b0_m.benign_recall_specificity:.4f}",
            f"{best_m.benign_recall_specificity:.4f}",
            f"{spec_diff:+.4f}",
        ),
        (
            "Balanced Accuracy",
            f"{b0_m.balanced_accuracy:.4f}",
            f"{best_m.balanced_accuracy:.4f}",
            f"{bal_diff:+.4f}",
        ),
        (
            "False Negatives (Missed M)",
            f"{b0_m.false_negatives:>14d}",
            f"{best_m.false_negatives:>14d}",
            f"{delta['false_negatives_delta']:+14d}",
        ),
        (
            "Confusion (TN, FP, FN, TP)",
            cm_b0,
            cm_i3,
            "             -",
        ),
        (
            "Tree Depth",
            f"{bl.fitted_depth:>14d}",
            f"{best.fitted_depth:>14d}",
            f"{delta['fitted_depth_delta']:+14d}",
        ),
        (
            "Number of Leaves",
            f"{bl.n_leaves:>14d}",
            f"{best.n_leaves:>14d}",
            f"{delta['n_leaves_delta']:+14d}",
        ),
        (
            "Training Time (ms)",
            f"{bl.training_time_ms:>11.2f} ms",
            f"{best.training_time_ms:>11.2f} ms",
            f"{delta['training_time_delta_ms']:+11.2f} ms",
        ),
        (
            "Inference Latency (us)",
            f"{bl.inference_latency_us:>11.2f} us",
            f"{best.inference_latency_us:>11.2f} us",
            f"{lat_diff:+11.2f} us",
        ),
    ]

    for label, b0_val, i3_val, diff_val in rows:
        print(f"{label:<28} | {b0_val:>14} | {i3_val:>14} | {diff_val:>14}")

    if custom_tree_result:
        print("-" * 80)
        ct_m = custom_tree_result["metrics"]
        print(
            f"Custom Tree (Scratch): Acc={ct_m['accuracy']:.4f} | "
            f"Recall={ct_m['malignant_recall']:.4f} | F1={ct_m['malignant_f1']:.4f} | "
            f"Depth={custom_tree_result['depth']} | Leaves={custom_tree_result['leaves']} | "
            f"Train Time={custom_tree_result['train_time_ms']:.2f}ms"
        )

    print("=" * 80)
    print("\nBENCHMARK KEY INSIGHTS:")
    if delta["test_accuracy_delta"] > 0:
        print(
            f"  [+] Test Accuracy improved by {delta['test_accuracy_delta'] * 100:+.2f}% "
            f"({bl.test_metrics.accuracy * 100:.2f}% -> {best.test_metrics.accuracy * 100:.2f}%)."
        )
    if delta["n_leaves_delta"] < 0:
        print(
            f"  [+] Tree Complexity reduced: {abs(delta['n_leaves_delta'])} fewer leaves "
            f"({bl.n_leaves} -> {best.n_leaves}), preventing overfitting."
        )
    print(
        f"  [+] CV Malignant F2: {bl.cv_f2_mean:.4f} -> {best.cv_f2_mean:.4f} "
        f"(stability +/- {best.cv_f2_std:.4f})."
    )
    total_m = best.test_metrics.false_negatives + best.test_metrics.true_positives
    print(
        f"  [+] Maintained low false negative count ({best.test_metrics.false_negatives} "
        f"missed out of {total_m} malignant samples)."
    )


def _build_summary_dict(
    result: Any,
    config: MinSamplesConfig,
    raw_config: dict[str, Any],
    dataset_path: Path,
    custom_tree_result: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Build summary dictionary for JSON export."""
    bl = result.baseline_candidate
    best = result.best_candidate

    data: dict[str, Any] = {
        "experiment_name": raw_config.get("experiment_name", "min_samples_tuning_I3"),
        "created_at_utc": datetime.now(timezone.utc).isoformat(),
        "scikit_learn_version": sklearn.__version__,
        "dataset": str(dataset_path),
        "dataset_sha256": _sha256(dataset_path),
        "protocol": {
            "split": "stratified_train_test",
            "train_ratio": 1.0 - config.test_size,
            "test_ratio": config.test_size,
            "random_state": config.random_state,
            "positive_class": config.positive_class,
            "negative_class": config.negative_class,
            "cv_folds": config.cv_folds,
            "selection_metric": config.primary_metric,
        },
        "baseline_b0": {
            "parameters": {
                "min_samples_split": bl.min_samples_split,
                "min_samples_leaf": bl.min_samples_leaf,
                "criterion": config.criterion,
            },
            "cv_metrics": {
                "cv_f2_mean": bl.cv_f2_mean,
                "cv_f2_std": bl.cv_f2_std,
                "cv_recall_mean": bl.cv_recall_mean,
                "cv_recall_std": bl.cv_recall_std,
                "cv_f1_mean": bl.cv_f1_mean,
                "cv_accuracy_mean": bl.cv_accuracy_mean,
            },
            "train_metrics": bl.train_metrics.to_dict(),
            "test_metrics": bl.test_metrics.to_dict(),
            "complexity": {
                "fitted_depth": bl.fitted_depth,
                "n_leaves": bl.n_leaves,
            },
            "profiling": {
                "training_time_ms": bl.training_time_ms,
                "inference_latency_us": bl.inference_latency_us,
            },
        },
        "tuned_i3": {
            "parameters": {
                "min_samples_split": best.min_samples_split,
                "min_samples_leaf": best.min_samples_leaf,
                "criterion": config.criterion,
            },
            "cv_metrics": {
                "cv_f2_mean": best.cv_f2_mean,
                "cv_f2_std": best.cv_f2_std,
                "cv_recall_mean": best.cv_recall_mean,
                "cv_recall_std": best.cv_recall_std,
                "cv_f1_mean": best.cv_f1_mean,
                "cv_accuracy_mean": best.cv_accuracy_mean,
            },
            "train_metrics": best.train_metrics.to_dict(),
            "test_metrics": best.test_metrics.to_dict(),
            "complexity": {
                "fitted_depth": best.fitted_depth,
                "n_leaves": best.n_leaves,
            },
            "profiling": {
                "training_time_ms": best.training_time_ms,
                "inference_latency_us": best.inference_latency_us,
            },
        },
        "delta_vs_baseline": result.delta_vs_baseline,
        "all_grid_candidates": [c.to_dict() for c in result.all_candidates],
        "medical_disclaimer": "Educational classification demo; not a medical diagnosis.",
    }

    if custom_tree_result:
        data["custom_tree_scratch"] = custom_tree_result

    return data


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


if __name__ == "__main__":
    main()
