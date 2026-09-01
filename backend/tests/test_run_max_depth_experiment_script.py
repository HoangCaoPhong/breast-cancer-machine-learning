import json
import subprocess
import sys
from pathlib import Path

import pandas as pd

_REPOSITORY_ROOT = Path(__file__).parents[2]
_SCRIPT = _REPOSITORY_ROOT / "scripts/run_max_depth_experiment.py"
_DATASET = _REPOSITORY_ROOT / "data/raw/uci_wdbc/wdbc.data"


def test_run_max_depth_experiment_script_exports_tables_and_figures(tmp_path: Path) -> None:
    output_dir = tmp_path / "results"
    config_path = tmp_path / "config.json"
    config_path.write_text(
        json.dumps(
            {
                "experiment_name": "test_max_depth",
                "protocol_status": "test",
                "dataset": str(_DATASET),
                "output_dir": str(output_dir),
                "depths": [None, 1, 2],
                "implementations": ["custom", "sklearn"],
                "test_size": 0.2,
                "random_seed": 42,
                "cv_folds": 3,
                "criterion": "gini",
                "min_samples_split": 2,
                "min_samples_leaf": 1,
                "positive_class": "M",
                "negative_class": "B",
            }
        ),
        encoding="utf-8",
    )

    completed = subprocess.run(
        [sys.executable, str(_SCRIPT), "--config", str(config_path)],
        cwd=_REPOSITORY_ROOT,
        check=True,
        capture_output=True,
        text=True,
    )

    assert "Dual-implementation max-depth cross-validation results" in completed.stdout
    assert "Selected max_depth by implementation:" in completed.stdout
    assert "Final held-out comparison" in completed.stdout
    expected_files = {
        "cv_results.csv",
        "final_comparison.csv",
        "summary.json",
        "report_notes.md",
        "accuracy_by_depth.png",
        "malignant_f2_by_depth.png",
        "complexity_by_depth.png",
        "test_metrics_comparison.png",
        "confusion_matrices.png",
        "selected_custom_tree.png",
        "selected_sklearn_tree.png",
    }
    assert {path.name for path in output_dir.iterdir()} == expected_files
    assert all(path.stat().st_size > 0 for path in output_dir.iterdir())
    comparison = pd.read_csv(output_dir / "final_comparison.csv")
    assert comparison["model_id"].tolist() == [
        "custom_unlimited_baseline",
        "custom_selected_max_depth",
        "sklearn_unlimited_baseline",
        "sklearn_selected_max_depth",
    ]
    summary = json.loads((output_dir / "summary.json").read_text(encoding="utf-8"))
    assert summary["test_set_used_for_selection"] is False
    assert summary["primary_selection_metric"] == "malignant_f2_beta_2"
    assert set(summary["selected_max_depth"]) == {"custom", "sklearn"}
    assert summary["dataset_sha256"]
    assert "not a medical diagnosis" in summary["medical_disclaimer"]
