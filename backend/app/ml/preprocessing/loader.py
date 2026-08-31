"""Dataset loading and splitting utilities.

Canonical data source: data/raw/uci_wdbc/wdbc.data (UCI Machine Learning
Repository, dataset ID 17, DOI: 10.24432/C5DW2B).

Decision D-005: Load directly from canonical raw UCI file `data/raw/uci_wdbc/wdbc.data`.
ID column (column 0) is excluded.
Target mapping (column 1): 'M' -> 1 (malignant, positive class), 'B' -> 0 (benign).
Features: 30 real-valued attributes (columns 2..31).

Decision D-006: Stratified 80/20 train/test split, random_state=42.
"""

from __future__ import annotations

from pathlib import Path
from typing import NamedTuple

import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split

from app.ml.preprocessing.breast_cancer import (
    FEATURE_NAMES,
    load_breast_cancer_dataset,
)

# ── Constants ──────────────────────────────────────────────────────────────────

POSITIVE_CLASS: str = "M"
NEGATIVE_CLASS: str = "B"

SPLIT_TEST_SIZE: float = 0.20
RANDOM_STATE: int = 42

# Canonical raw data path relative to repo root
RAW_DATA_PATH = (
    Path(__file__).resolve().parent.parent.parent.parent.parent
    / "data"
    / "raw"
    / "uci_wdbc"
    / "wdbc.data"
)


# ── Return types ───────────────────────────────────────────────────────────────


class DataSplit(NamedTuple):
    """Canonical train/test split with metadata."""

    X_train: np.ndarray
    X_test: np.ndarray
    y_train: np.ndarray
    y_test: np.ndarray
    feature_names: list[str]
    class_names: list[str]  # index 0 = B, index 1 = M (after remap)


# ── Public API ─────────────────────────────────────────────────────────────────


def load_dataset(raw_path: Path | str | None = None) -> tuple[np.ndarray, np.ndarray, list[str]]:
    """Load the Breast Cancer Wisconsin (Diagnostic) dataset from raw UCI file.

    Parameters
    ----------
    raw_path : optional path to `wdbc.data`. If None, uses default canonical path.

    Returns
    -------
    X : np.ndarray, shape (569, 30)
        Feature matrix. ID column excluded.
    y : np.ndarray, shape (569,)
        Target vector. M=1 (malignant, positive class), B=0 (benign).
    feature_names : list[str]
        Ordered list of 30 feature names.
    """
    target_path = Path(raw_path) if raw_path is not None else RAW_DATA_PATH

    if target_path.exists():
        ds = load_breast_cancer_dataset(target_path)
        X = ds.features.to_numpy(dtype=float)
        y = (ds.target == POSITIVE_CLASS).astype(int).to_numpy()
        feature_names = list(FEATURE_NAMES)
    else:
        # Fallback to sklearn load_breast_cancer if raw file is not present
        raw = load_breast_cancer()
        X = raw.data
        y = 1 - raw.target
        feature_names = list(FEATURE_NAMES)

    return X, y, feature_names


def get_train_test_split(raw_path: Path | str | None = None) -> DataSplit:
    """Return the canonical stratified 80/20 split (D-006).

    The split is reproducible: same seed always produces identical indices.
    """
    X, y, feature_names = load_dataset(raw_path=raw_path)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=SPLIT_TEST_SIZE,
        random_state=RANDOM_STATE,
        stratify=y,
    )

    return DataSplit(
        X_train=X_train,
        X_test=X_test,
        y_train=y_train,
        y_test=y_test,
        feature_names=feature_names,
        class_names=[NEGATIVE_CLASS, POSITIVE_CLASS],  # index matches encoded value
    )
