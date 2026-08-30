"""Train and evaluate the custom Decision Tree on the canonical UCI dataset."""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split

REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = REPOSITORY_ROOT / "backend"
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.ml.custom_tree import DecisionTreeClassifierScratch  # noqa: E402
from app.ml.preprocessing import load_breast_cancer_dataset  # noqa: E402

DEFAULT_DATASET = REPOSITORY_ROOT / "data/raw/uci_wdbc/wdbc.data"


def build_parser() -> argparse.ArgumentParser:
    """Create the command-line argument parser."""

    parser = argparse.ArgumentParser(
        description="Run the from-scratch Decision Tree on the UCI breast-cancer dataset."
    )
    parser.add_argument("--dataset", type=Path, default=DEFAULT_DATASET)
    parser.add_argument("--criterion", choices=("gini", "entropy"), default="gini")
    parser.add_argument("--max-depth", type=int, default=5)
    parser.add_argument("--min-samples-split", type=int, default=2)
    parser.add_argument("--min-samples-leaf", type=int, default=2)
    parser.add_argument("--test-size", type=float, default=0.2)
    parser.add_argument("--seed", type=int, default=42)
    return parser


def main() -> None:
    """Load data, train the custom tree, and print reproducible demo metrics."""

    parser = build_parser()
    args = parser.parse_args()
    if not 0.0 < args.test_size < 1.0:
        parser.error("--test-size must be between 0 and 1")

    dataset = load_breast_cancer_dataset(args.dataset)
    X_train, X_test, y_train, y_test = train_test_split(
        dataset.features,
        dataset.target,
        test_size=args.test_size,
        random_state=args.seed,
        stratify=dataset.target,
    )

    model = DecisionTreeClassifierScratch(
        criterion=args.criterion,
        max_depth=args.max_depth,
        min_samples_split=args.min_samples_split,
        min_samples_leaf=args.min_samples_leaf,
    )
    model.fit(X_train, y_train)

    train_predictions = model.predict(X_train)
    test_predictions = model.predict(X_test)
    train_accuracy = accuracy_score(y_train, train_predictions)
    test_accuracy = accuracy_score(y_test, test_predictions)
    matrix = confusion_matrix(y_test, test_predictions, labels=["B", "M"])

    print("Custom Decision Tree - Breast Cancer Wisconsin (Diagnostic)")
    print("Educational classification demo; not a medical diagnosis.\n")
    print(f"Dataset: {args.dataset}")
    print(f"Samples: {len(dataset.features)} | Features: {dataset.features.shape[1]}")
    print(f"Train: {len(X_train)} | Test: {len(X_test)} | Seed: {args.seed}")
    print(
        "Parameters: "
        f"criterion={args.criterion}, max_depth={args.max_depth}, "
        f"min_samples_split={args.min_samples_split}, "
        f"min_samples_leaf={args.min_samples_leaf}"
    )
    print(f"Fitted depth: {model.get_depth()} | Leaves: {model.get_n_leaves()}\n")
    print(f"Train accuracy: {train_accuracy:.4f}")
    print(f"Test accuracy:  {test_accuracy:.4f}")
    print(f"Test error rate: {1.0 - test_accuracy:.4f}")
    print(f"Malignant false negatives: {int(matrix[1, 0])}\n")
    print("Confusion matrix (rows=true B/M, columns=predicted B/M):")
    print(matrix)
    print("\nClassification report:")
    print(
        classification_report(
            y_test,
            test_predictions,
            labels=["B", "M"],
            target_names=["Benign", "Malignant"],
            digits=4,
            zero_division=0,
        )
    )
    print("Note: default split and parameters are for a local demo, not final report values.")


if __name__ == "__main__":
    main()
