import json
import subprocess
import sys
from pathlib import Path

_REPOSITORY_ROOT = Path(__file__).parents[2]
_SCRIPT = _REPOSITORY_ROOT / "scripts/run_baseline.py"


def test_run_baseline_script_exports_canonical_metrics(tmp_path: Path) -> None:
    output_dir = tmp_path / "baseline"
    result = subprocess.run(
        [sys.executable, str(_SCRIPT), "--output-dir", str(output_dir)],
        cwd=_REPOSITORY_ROOT,
        check=True,
        capture_output=True,
        text=True,
    )

    assert "Split: stratified 80/20 | seed=42 | positive class=M" in result.stdout
    assert "min_samples_split=2, min_samples_leaf=1" in result.stdout
    summary = json.loads((output_dir / "metrics.json").read_text(encoding="utf-8"))
    assert summary["sample_counts"] == {"train": 455, "test": 114}
    assert summary["parameters"]["min_samples_split"] == 2
    assert summary["parameters"]["min_samples_leaf"] == 1
    assert summary["parameters"]["random_state"] == 42
    assert summary["protocol"]["train_ratio"] == 0.8
    assert summary["protocol"]["test_ratio"] == 0.2
    assert summary["test_metrics"]["false_negatives"] >= 0
    assert summary["model_complexity"]["fitted_depth"] > 0
