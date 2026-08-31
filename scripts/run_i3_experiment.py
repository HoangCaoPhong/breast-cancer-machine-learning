"""Entry point for experiment I3 – min_samples_split / min_samples_leaf.

Usage
-----
    python scripts/run_i3_experiment.py

Outputs are written to experiments/results/i3_min_samples/.
The test set is evaluated once after the best config is chosen by CV recall.
"""

from __future__ import annotations

import json
import sys
from datetime import datetime, timezone
from pathlib import Path

# Ensure backend directory is on the path when running from project root
ROOT = Path(__file__).resolve().parent.parent
BACKEND_DIR = ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.ml.preprocessing.loader import get_train_test_split  # noqa: E402
from app.ml.sklearn_tree.min_samples_experiment import (  # noqa: E402
    print_experiment_summary,
    run_min_samples_experiment,
)

RESULTS_DIR = ROOT / "experiments" / "results" / "i3_min_samples"


def main() -> None:
    """Run experiment I3 and save results."""
    print("Loading dataset and canonical split (D-005, D-006)...")
    split = get_train_test_split()

    print(
        f"  Train: {split.X_train.shape[0]} samples  |  "
        f"Test: {split.X_test.shape[0]} samples  |  "
        f"Features: {split.X_train.shape[1]}"
    )
    train_m = int(split.y_train.sum())
    test_m = int(split.y_test.sum())
    print(
        f"  Train - M:{train_m}  B:{split.X_train.shape[0] - train_m}  |  "
        f"Test  - M:{test_m}  B:{split.X_test.shape[0] - test_m}"
    )
    print()

    print("Running I3 grid search (5-fold CV on training set)...")
    result = run_min_samples_experiment(
        split.X_train,
        split.y_train,
        split.X_test,
        split.y_test,
    )

    print_experiment_summary(result)

    # ── Save results ──────────────────────────────────────────────────────────
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)

    timestamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    output: dict = {
        "experiment_id": "I3",
        "timestamp": timestamp,
        "config": "experiments/configs/i3_min_samples.yaml",
        "dataset": "sklearn.datasets.load_breast_cancer (UCI ID 17 equivalent)",
        "split": {
            "strategy": "stratified",
            "test_size": 0.20,
            "random_state": 42,
            "n_train": int(split.X_train.shape[0]),
            "n_test": int(split.X_test.shape[0]),
        },
        "positive_class": "M",
        "cv_folds": 5,
        "cv_scoring": "recall",
        "all_runs": result.summary_rows(),
        "best_run": result.best_run.as_dict(),
        "baseline_run": result.baseline_run.as_dict(),
        "delta_vs_baseline": {
            "test_recall_malignant": round(
                result.best_run.test_recall_malignant - result.baseline_run.test_recall_malignant,
                6,
            ),
            "test_accuracy": round(
                result.best_run.test_accuracy - result.baseline_run.test_accuracy,
                6,
            ),
            "test_f1_malignant": round(
                result.best_run.test_f1_malignant - result.baseline_run.test_f1_malignant,
                6,
            ),
            "false_negative_delta": (
                result.best_run.test_false_negative_count
                - result.baseline_run.test_false_negative_count
            ),
        },
    }

    out_file = RESULTS_DIR / f"results_{timestamp}.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False)

    print(f"Results saved to {out_file}")

    # ── Summary analysis ──────────────────────────────────────────────────────
    best = result.best_run
    baseline = result.baseline_run
    delta_recall = best.test_recall_malignant - baseline.test_recall_malignant
    delta_fn = best.test_false_negative_count - baseline.test_false_negative_count

    print("\n=== Analysis ===")
    if delta_recall > 0:
        print(
            f"[OK] Best config IMPROVES malignant recall by {delta_recall:+.4f} "
            f"({delta_fn:+d} false negatives vs baseline)."
        )
    elif delta_recall == 0:
        print("= Best config matches baseline recall (no recall change).")
    else:
        print(
            f"! Best config reduces malignant recall by {delta_recall:+.4f}. "
            "Report this trade-off - do not declare it an improvement."
        )

    depth_delta = best.tree_depth - baseline.tree_depth
    print(
        f"  Tree depth: {best.tree_depth} (baseline {baseline.tree_depth}, "
        f"delta {depth_delta:+d}) - "
        + ("shallower = more regularised." if depth_delta < 0 else "same or deeper.")
    )


if __name__ == "__main__":
    main()
