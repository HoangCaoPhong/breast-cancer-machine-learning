import json
import subprocess
import sys
from pathlib import Path

import pandas as pd

_REPOSITORY_ROOT = Path(__file__).parents[2]
_SCRIPT = _REPOSITORY_ROOT / "scripts/run_criterion_experiment.py"


def test_run_criterion_experiment_script_exports_both_variants(tmp_path: Path) -> None:
    output_dir = tmp_path / "criterion"
    result = subprocess.run(
        [sys.executable, str(_SCRIPT), "--output-dir", str(output_dir)],
        cwd=_REPOSITORY_ROOT,
        check=True,
        capture_output=True,
        text=True,
    )

    assert "Gini-versus-Entropy cross-validation results" in result.stdout
    assert "Selected criterion:" in result.stdout
    assert "Final held-out result" in result.stdout
    expected_files = {
        "cv_results.csv",
        "final_comparison.csv",
        "comparison.json",
        "accuracy_by_criterion.png",
        "malignant_f2_by_criterion.png",
        "selected_tree.png",
    }
    assert {path.name for path in output_dir.iterdir()} == expected_files
    cv_results = pd.read_csv(output_dir / "cv_results.csv")
    assert cv_results["criterion"].tolist() == ["gini", "entropy"]
    assert cv_results["selected"].sum() == 1
    summary = json.loads((output_dir / "comparison.json").read_text(encoding="utf-8"))
    assert summary["sample_counts"] == {"train": 455, "test": 114}
    assert summary["protocol"]["controlled_variable"] == "criterion"
    assert summary["protocol"]["selection"] == "stratified_5_fold_cv_on_training_set"
    assert set(summary["variants"]) == {"gini", "entropy"}
    assert summary["variants"]["gini"]["parameters"]["criterion"] == "gini"
    assert summary["variants"]["entropy"]["parameters"]["criterion"] == "entropy"
    assert (
        summary["variants"]["gini"]["parameters"]["random_state"]
        == summary["variants"]["entropy"]["parameters"]["random_state"]
        == 42
    )
    assert len(summary["variants"]["gini"]["validation_fold_metrics"]) == 5
    assert len(summary["variants"]["entropy"]["validation_fold_metrics"]) == 5
    assert summary["selection"]["selected_criterion"] in {"gini", "entropy"}
    assert summary["selection"]["test_set_used_for_selection"] is False
    assert summary["selected_test_metrics"]["false_negatives"] >= 0
    assert (output_dir / "malignant_f2_by_criterion.png").stat().st_size > 0
