"""Test for the benchmark_min_samples script entrypoint."""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

_REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
if str(_REPOSITORY_ROOT) not in sys.path:
    sys.path.insert(0, str(_REPOSITORY_ROOT))

_SCRIPT = _REPOSITORY_ROOT / "scripts/benchmark_min_samples.py"


def test_script_execution_via_subprocess(tmp_path: Path) -> None:
    output_dir = tmp_path / "benchmark_test_output"
    result = subprocess.run(
        [
            sys.executable,
            str(_SCRIPT),
            "--output-dir",
            str(output_dir),
            "--include-custom-tree",
        ],
        cwd=_REPOSITORY_ROOT,
        check=True,
        capture_output=True,
        text=True,
    )

    assert "EXPERIMENT I3 BENCHMARK: BASELINE vs TUNED MODEL" in result.stdout
    assert "Baseline (B0)" in result.stdout
    assert "Tuned (I3)" in result.stdout

    summary_file = output_dir / "benchmark_summary.json"
    assert summary_file.exists()

    data = json.loads(summary_file.read_text(encoding="utf-8"))
    assert "baseline_b0" in data
    assert "tuned_i3" in data
    assert "delta_vs_baseline" in data
    assert "custom_tree_scratch" in data
    assert "all_grid_candidates" in data
    assert len(data["all_grid_candidates"]) == 25

