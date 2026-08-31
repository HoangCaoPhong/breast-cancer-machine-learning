import json
import subprocess
import sys
from pathlib import Path

import pandas as pd

_REPOSITORY_ROOT = Path(__file__).parents[2]
_SCRIPT = _REPOSITORY_ROOT / "scripts/run_criterion_experiment.py"


def test_run_criterion_experiment_script_exports_sklearn_results(tmp_path: Path) -> None:
    output_dir = tmp_path / "criterion"
    config_path = tmp_path / "criterion.json"
    config_path.write_text(
        json.dumps(
            {
                "experiment_name": "test_gini_vs_entropy",
                "dataset": str(_REPOSITORY_ROOT / "data/raw/uci_wdbc/wdbc.data"),
                "output_dir": str(output_dir),
                "test_size": 0.2,
                "random_state": 42,
                "cv_folds": 2,
                "criteria": ["gini", "entropy"],
                "primary_metric": "malignant_f2",
                "max_depth": 3,
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

    assert "Gini-versus-Entropy sklearn cross-validation results" in completed.stdout
    assert "Selected criterion:" in completed.stdout
    assert "Held-out test:" in completed.stdout
    expected_files = {
        "cv_results.csv",
        "summary.json",
        "criterion_comparison.png",
        "selected_tree.png",
    }
    assert {path.name for path in output_dir.iterdir()} == expected_files

    cv_results = pd.read_csv(output_dir / "cv_results.csv")
    assert cv_results["criterion"].tolist() == ["gini", "entropy"]
    assert cv_results["selected"].sum() == 1

    summary = json.loads((output_dir / "summary.json").read_text(encoding="utf-8"))
    assert summary["sample_counts"] == {"train": 455, "test": 114}
    assert summary["protocol"]["model_family"] == "sklearn_decision_tree"
    assert summary["protocol"]["controlled_variable"] == "criterion"
    assert summary["protocol"]["primary_metric"] == "mean_validation_malignant_f2"
    assert summary["protocol"]["test_set_used_for_selection"] is False
    assert set(summary["variants"]) == {"gini", "entropy"}
    assert summary["selection"]["selected_criterion"] in {"gini", "entropy"}
    assert summary["selection"]["selected_test_metrics"]["false_negatives"] >= 0
    assert (output_dir / "criterion_comparison.png").stat().st_size > 0
    assert (output_dir / "selected_tree.png").stat().st_size > 0
