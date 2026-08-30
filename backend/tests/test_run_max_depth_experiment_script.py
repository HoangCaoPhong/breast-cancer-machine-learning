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
                "test_size": 0.2,
                "random_seed": 42,
                "cv_folds": 3,
                "criterion": "gini",
                "min_samples_split": 2,
                "min_samples_leaf": 1,
                "positive_class": "M",
            }
        ),
        encoding="utf-8",
    )

    result = subprocess.run(
        [sys.executable, str(_SCRIPT), "--config", str(config_path)],
        cwd=_REPOSITORY_ROOT,
        check=True,
        capture_output=True,
        text=True,
    )

    assert "Max-depth cross-validation results" in result.stdout
    assert "Selected max_depth:" in result.stdout
    assert "Final held-out comparison" in result.stdout
    expected_files = {
        "cv_results.csv",
        "final_comparison.csv",
        "summary.json",
        "accuracy_by_depth.png",
        "malignant_f2_by_depth.png",
        "selected_tree.png",
    }
    assert {path.name for path in output_dir.iterdir()} == expected_files
    comparison = pd.read_csv(output_dir / "final_comparison.csv")
    assert comparison["model"].tolist() == ["Unlimited baseline", "Selected max_depth"]
    summary = json.loads((output_dir / "summary.json").read_text(encoding="utf-8"))
    assert summary["test_set_used_for_selection"] is False
    assert summary["primary_selection_metric"] == "malignant_f2_beta_2"
