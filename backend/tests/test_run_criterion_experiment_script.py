import json
import subprocess
import sys
from pathlib import Path

import pandas as pd

_REPOSITORY_ROOT = Path(__file__).parents[2]
_SCRIPT = _REPOSITORY_ROOT / "scripts/run_criterion_experiment.py"


def test_run_criterion_experiment_script_exports_both_variants(tmp_path: Path) -> None:
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
                "max_depth": 3,
                "min_samples_split": 2,
                "min_samples_leaf": 1,
                "positive_class": "M",
                "negative_class": "B",
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

    assert "Gini-versus-Entropy cross-validation results" in result.stdout
    assert "Selected criteria:" in result.stdout
    assert "Custom Decision Tree" in result.stdout
    assert "Sklearn Decision Tree" in result.stdout
    assert "Final held-out comparison" in result.stdout
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
    assert cv_results["model_family"].tolist() == ["custom", "custom", "sklearn", "sklearn"]
    assert cv_results["criterion"].tolist() == ["gini", "entropy", "gini", "entropy"]
    assert cv_results["selected"].sum() == 2
    summary = json.loads((output_dir / "comparison.json").read_text(encoding="utf-8"))
    assert summary["sample_counts"] == {"train": 455, "test": 114}
    assert summary["protocol"]["controlled_variable"] == "criterion"
    assert summary["protocol"]["selection"] == "stratified_2_fold_cv_on_training_set"
    family_results = summary["model_family_results"]
    assert set(family_results) == {"custom", "sklearn"}
    for family in ("custom", "sklearn"):
        assert set(family_results[family]["variants"]) == {"gini", "entropy"}
        assert family_results[family]["selection"]["selected_criterion"] in {
            "gini",
            "entropy",
        }
        assert family_results[family]["selection"]["test_set_used_for_selection"] is False
        assert family_results[family]["selected_test_metrics"]["false_negatives"] >= 0
    assert (output_dir / "accuracy_by_criterion.png").stat().st_size > 0
    assert (output_dir / "malignant_f2_by_criterion.png").stat().st_size > 0
