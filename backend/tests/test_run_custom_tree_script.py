import subprocess
import sys
from pathlib import Path

_REPOSITORY_ROOT = Path(__file__).parents[2]
_SCRIPT = _REPOSITORY_ROOT / "scripts/run_custom_tree.py"


def test_run_custom_tree_script_uses_canonical_dataset() -> None:
    result = subprocess.run(
        [
            sys.executable,
            str(_SCRIPT),
            "--max-depth",
            "3",
            "--min-samples-leaf",
            "5",
        ],
        cwd=_REPOSITORY_ROOT,
        check=True,
        capture_output=True,
        text=True,
    )

    assert "Samples: 569 | Features: 30" in result.stdout
    assert "Train: 455 | Test: 114 | Seed: 42" in result.stdout
    assert "Test accuracy:" in result.stdout
    assert "Malignant false negatives:" in result.stdout
    assert "not a medical diagnosis" in result.stdout
