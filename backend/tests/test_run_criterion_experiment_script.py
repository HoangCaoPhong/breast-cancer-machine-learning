import json
import subprocess
import sys
from pathlib import Path

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

    assert "Gini versus Entropy Decision Tree experiment" in result.stdout
    assert "GINI CV:" in result.stdout
    assert "ENTROPY CV:" in result.stdout
    assert "Selected by training CV:" in result.stdout
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
    assert summary["selected_test_metrics"]["false_negatives"] >= 0
