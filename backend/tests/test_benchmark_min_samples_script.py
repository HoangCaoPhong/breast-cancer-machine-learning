"""Test for the benchmark_min_samples script entrypoint."""

from __future__ import annotations

import json
from pathlib import Path

from scripts.benchmark_min_samples import DEFAULT_CONFIG, build_parser, main


def test_build_parser_defaults() -> None:
    parser = build_parser()
    args = parser.parse_args([])
    assert args.config == DEFAULT_CONFIG
    assert args.output_dir is None
    assert args.include_custom_tree is False


def test_script_execution_with_custom_output(tmp_path: Path, monkeypatch) -> None:
    output_dir = tmp_path / "benchmark_test_output"
    monkeypatch.setattr(
        "sys.argv",
        [
            "benchmark_min_samples.py",
            "--output-dir",
            str(output_dir),
            "--include-custom-tree",
        ],
    )
    main()

    summary_file = output_dir / "benchmark_summary.json"
    assert summary_file.exists()

    data = json.loads(summary_file.read_text(encoding="utf-8"))
    assert "baseline_b0" in data
    assert "tuned_i3" in data
    assert "delta_vs_baseline" in data
    assert "custom_tree_scratch" in data
    assert "all_grid_candidates" in data
    assert len(data["all_grid_candidates"]) == 25
