"""Generate report-ready comparison charts for Experiment I3 (min_samples tuning).

Owner: Huỳnh Thái Hòa (24127374)

Usage
-----
    python scripts/plot_min_samples_comparison.py
    python scripts/plot_min_samples_comparison.py --output reports/figures/comparison.png
"""


from __future__ import annotations

import argparse
import sys
from pathlib import Path

import matplotlib.pyplot as plt
import numpy as np

REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ROOT = REPOSITORY_ROOT / "backend"
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.ml.preprocessing import load_breast_cancer_dataset  # noqa: E402
from app.ml.sklearn_tree import MinSamplesConfig, run_min_samples_tuning  # noqa: E402

DEFAULT_OUTPUT = REPOSITORY_ROOT / "reports/figures/min_samples_comparison.png"


def build_parser() -> argparse.ArgumentParser:
    """Create command-line argument parser."""
    parser = argparse.ArgumentParser(
        description="Generate comparison charts for Experiment I3 (min_samples tuning)."
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=DEFAULT_OUTPUT,
        help="Path to save the generated PNG plot.",
    )
    return parser


def main() -> None:
    """Run I3 tuning and generate publication-quality comparison charts."""
    args = build_parser().parse_args()
    output_path = args.output if args.output.is_absolute() else REPOSITORY_ROOT / args.output
    output_path.parent.mkdir(parents=True, exist_ok=True)

    print("Running Experiment I3 tuning to generate plot data...")
    dataset_path = REPOSITORY_ROOT / "data/raw/uci_wdbc/wdbc.data"
    dataset = load_breast_cancer_dataset(dataset_path)
    config = MinSamplesConfig()
    result = run_min_samples_tuning(dataset.features, dataset.target, config)

    bl = result.baseline_candidate
    best = result.best_candidate

    # Set style
    plt.style.use(
        "seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default"
    )
    fig, axs = plt.subplots(2, 2, figsize=(14, 11), dpi=300)
    fig.suptitle(
        "Experiment I3: Min-Samples Tuning vs Sklearn Baseline (B0)\n"
        "Breast Cancer Wisconsin (Diagnostic) Dataset",
        fontsize=15,
        fontweight="bold",
        y=0.98,
    )

    # ── 1. Classification Metrics Comparison (Top-Left) ──────────────────────
    ax1 = axs[0, 0]
    metric_labels = [
        "Accuracy",
        "Malignant\nRecall",
        "Malignant\nPrecision",
        "Malignant\nF1-Score",
        "Benign\nSpecificity",
        "Balanced\nAccuracy",
    ]
    b0_scores = [
        bl.test_metrics.accuracy * 100,
        bl.test_metrics.malignant_recall * 100,
        bl.test_metrics.malignant_precision * 100,
        bl.test_metrics.malignant_f1 * 100,
        bl.test_metrics.benign_recall_specificity * 100,
        bl.test_metrics.balanced_accuracy * 100,
    ]
    i3_scores = [
        best.test_metrics.accuracy * 100,
        best.test_metrics.malignant_recall * 100,
        best.test_metrics.malignant_precision * 100,
        best.test_metrics.malignant_f1 * 100,
        best.test_metrics.benign_recall_specificity * 100,
        best.test_metrics.balanced_accuracy * 100,
    ]

    x = np.arange(len(metric_labels))
    width = 0.35

    rects1 = ax1.bar(
        x - width / 2, b0_scores, width, label="Baseline B0 (mss=2, msl=1)", color="#4A90E2"
    )
    rects2 = ax1.bar(
        x + width / 2,
        i3_scores,
        width,
        label=f"Tuned I3 (mss={best.min_samples_split}, msl={best.min_samples_leaf})",
        color="#2ECC71",
    )

    ax1.set_ylabel("Score (%)", fontsize=11, fontweight="semibold")
    ax1.set_title("(A) Classification Test Metrics Comparison", fontsize=12, fontweight="bold")
    ax1.set_xticks(x)
    ax1.set_xticklabels(metric_labels, fontsize=9)
    ax1.set_ylim(80, 100)
    ax1.legend(loc="lower right", frameon=True)

    # Add data labels
    for rect in rects1:
        h = rect.get_height()
        ax1.annotate(
            f"{h:.1f}%",
            xy=(rect.get_x() + rect.get_width() / 2, h),
            xytext=(0, 3),
            textcoords="offset points",
            ha="center",
            va="bottom",
            fontsize=8,
        )
    for rect in rects2:
        h = rect.get_height()
        ax1.annotate(
            f"{h:.1f}%",
            xy=(rect.get_x() + rect.get_width() / 2, h),
            xytext=(0, 3),
            textcoords="offset points",
            ha="center",
            va="bottom",
            fontsize=8,
            fontweight="bold",
        )

    # ── 2. Grid Search CV Recall Heatmap (Top-Right) ──────────────────────────
    ax2 = axs[0, 1]
    split_vals = list(config.min_samples_split_grid)
    leaf_vals = list(config.min_samples_leaf_grid)
    heatmap_data = np.zeros((len(split_vals), len(leaf_vals)))

    for c in result.all_candidates:
        row_i = split_vals.index(c.min_samples_split)
        col_j = leaf_vals.index(c.min_samples_leaf)
        heatmap_data[row_i, col_j] = c.cv_recall_mean

    im = ax2.imshow(heatmap_data, cmap="YlGnBu", aspect="auto", vmin=0.85, vmax=0.91)
    cbar = fig.colorbar(im, ax=ax2)
    cbar.set_label("5-Fold CV Malignant Recall", fontsize=10)

    ax2.set_xticks(np.arange(len(leaf_vals)))
    ax2.set_yticks(np.arange(len(split_vals)))
    ax2.set_xticklabels(leaf_vals)
    ax2.set_yticklabels(split_vals)
    ax2.set_xlabel("min_samples_leaf", fontsize=11, fontweight="semibold")
    ax2.set_ylabel("min_samples_split", fontsize=11, fontweight="semibold")
    ax2.set_title("(B) Grid Search CV Malignant Recall Heatmap", fontsize=12, fontweight="bold")

    # Annotate numbers
    for i in range(len(split_vals)):
        for j in range(len(leaf_vals)):
            val = heatmap_data[i, j]
            is_best = (
                split_vals[i] == best.min_samples_split and leaf_vals[j] == best.min_samples_leaf
            )
            color = "white" if val > 0.89 else "black"
            text_str = f"{val:.3f}" + ("\n[Best]" if is_best else "")

            weight = "bold" if is_best else "normal"
            ax2.text(
                j,
                i,
                text_str,
                ha="center",
                va="center",
                color=color,
                fontsize=8.5,
                fontweight=weight,
            )

    # ── 3. Confusion Matrix Comparison (Bottom-Left) ──────────────────────────
    ax3 = axs[1, 0]
    cm_b0 = np.array(
        [
            [bl.test_metrics.true_negatives, bl.test_metrics.false_positives],
            [bl.test_metrics.false_negatives, bl.test_metrics.true_positives],
        ]
    )
    cm_i3 = np.array(
        [
            [best.test_metrics.true_negatives, best.test_metrics.false_positives],
            [best.test_metrics.false_negatives, best.test_metrics.true_positives],
        ]
    )

    # Combine side by side in ax3
    ax3.axis("off")
    ax3.set_title(
        "(C) Test Confusion Matrices (Left: Baseline B0 | Right: Tuned I3)",
        fontsize=12,
        fontweight="bold",
        pad=15,
    )

    # Sub-axes for 2 confusion matrices inside ax3
    sub_pos = ax3.get_position()
    w = sub_pos.width * 0.44
    h = sub_pos.height * 0.8
    y0 = sub_pos.y0

    sub_ax1 = fig.add_axes([sub_pos.x0, y0, w, h])
    sub_ax2 = fig.add_axes([sub_pos.x0 + sub_pos.width * 0.54, y0, w, h])

    for s_ax, cm, title in [
        (sub_ax1, cm_b0, "Baseline B0"),
        (sub_ax2, cm_i3, f"Tuned I3 (mss={best.min_samples_split})"),
    ]:
        s_ax.matshow(cm, cmap="Blues", alpha=0.6)
        s_ax.set_title(title, fontsize=10, fontweight="bold", pad=8)
        s_ax.set_xticks([0, 1])
        s_ax.set_yticks([0, 1])
        s_ax.set_xticklabels(["Pred B", "Pred M"], fontsize=8)
        s_ax.set_yticklabels(["True B", "True M"], fontsize=8)
        for r_i in range(2):
            for c_j in range(2):
                s_ax.text(
                    c_j,
                    r_i,
                    str(cm[r_i, c_j]),
                    ha="center",
                    va="center",
                    fontsize=12,
                    fontweight="bold",
                )

    # ── 4. Complexity & Speed Comparison (Bottom-Right) ──────────────────────
    ax4 = axs[1, 1]
    comp_labels = [
        "Number of Leaves\n(Fewer = Less Overfit)",
        "Training Time (ms)\n(Faster = Better)",
    ]
    b0_comp = [bl.n_leaves, bl.training_time_ms]
    i3_comp = [best.n_leaves, best.training_time_ms]

    x_comp = np.arange(len(comp_labels))
    w_comp = 0.35

    ax4.bar(
        x_comp[0] - w_comp / 2, b0_comp[0], w_comp, color="#E74C3C", label="Baseline B0 (24 leaves)"
    )
    ax4.bar(
        x_comp[0] + w_comp / 2,
        i3_comp[0],
        w_comp,
        color="#27AE60",
        label=f"Tuned I3 ({best.n_leaves} leaves -16.7%)",
    )

    ax4.bar(x_comp[1] - w_comp / 2, b0_comp[1], w_comp, color="#E74C3C")
    ax4.bar(x_comp[1] + w_comp / 2, i3_comp[1], w_comp, color="#27AE60")

    ax4.set_xticks(x_comp)
    ax4.set_xticklabels(comp_labels, fontsize=10)
    ax4.set_title("(D) Tree Complexity & Execution Speed", fontsize=12, fontweight="bold")
    ax4.set_ylabel("Value", fontsize=11, fontweight="semibold")

    ax4.annotate(
        f"{b0_comp[0]} leaves",
        xy=(x_comp[0] - w_comp / 2, b0_comp[0]),
        xytext=(0, 3),
        textcoords="offset points",
        ha="center",
        fontsize=9,
    )
    ax4.annotate(
        f"{i3_comp[0]} leaves\n(-4 leaves)",
        xy=(x_comp[0] + w_comp / 2, i3_comp[0]),
        xytext=(0, 3),
        textcoords="offset points",
        ha="center",
        fontsize=9,
        fontweight="bold",
        color="#1E8449",
    )
    ax4.annotate(
        f"{b0_comp[1]:.1f} ms",
        xy=(x_comp[1] - w_comp / 2, b0_comp[1]),
        xytext=(0, 3),
        textcoords="offset points",
        ha="center",
        fontsize=9,
    )
    ax4.annotate(
        f"{i3_comp[1]:.1f} ms",
        xy=(x_comp[1] + w_comp / 2, i3_comp[1]),
        xytext=(0, 3),
        textcoords="offset points",
        ha="center",
        fontsize=9,
        fontweight="bold",
    )

    ax4.legend(loc="upper right", frameon=True)

    plt.tight_layout(rect=[0, 0.03, 1, 0.95])
    plt.savefig(output_path, dpi=300, bbox_inches="tight")
    plt.close()

    print(f"[OK] Comparison chart successfully generated and saved to:\n     {output_path}\n")


if __name__ == "__main__":
    main()
