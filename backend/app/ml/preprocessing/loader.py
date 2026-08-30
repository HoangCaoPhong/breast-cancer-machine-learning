"""Dataset loading and splitting utilities.

Decision D-005: sklearn.datasets.load_breast_cancer is used as the data source
because the UCI raw file has not been placed in data/raw/ yet. Feature names,
target encoding, and class order correspond to the sklearn version of the
Wisconsin Diagnostic dataset, which maps 1-to-1 with UCI dataset ID 17 content.
If a future decision replaces this with the raw UCI file, update this module and
re-record the checksum in DECISIONS.md.

Decision D-006: stratified 80/20 split, random_state=42, positive class = M
(malignant, encoded as 0 in sklearn → remapped to 1 here for clarity).
"""

from __future__ import annotations

from typing import NamedTuple

import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split

# ── Constants ──────────────────────────────────────────────────────────────────

# D-006: positive class is Malignant; encoded as 1 after remapping.
# sklearn encodes malignant=0, benign=1 internally – we flip so that M=1, B=0
# to match the clinical convention (positive = disease present).
POSITIVE_CLASS: str = "M"
NEGATIVE_CLASS: str = "B"

SPLIT_TEST_SIZE: float = 0.20
RANDOM_STATE: int = 42


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


def load_dataset() -> tuple[np.ndarray, np.ndarray, list[str]]:
    """Load the Breast Cancer Wisconsin (Diagnostic) dataset.

    Returns
    -------
    X : np.ndarray, shape (569, 30)
        Feature matrix. ID column excluded. Feature order matches sklearn /
        UCI dataset ID 17.
    y : np.ndarray, shape (569,)
        Target vector. M=1 (malignant, positive class), B=0 (benign).
    feature_names : list[str]
        Ordered list of 30 feature names.
    """
    raw = load_breast_cancer()
    X: np.ndarray = raw.data  # shape (569, 30)

    # sklearn: 0 = malignant, 1 = benign  →  remap to M=1, B=0
    y: np.ndarray = 1 - raw.target  # 0→1 (M), 1→0 (B)

    feature_names: list[str] = list(raw.feature_names)
    return X, y, feature_names


def get_train_test_split() -> DataSplit:
    """Return the canonical stratified 80/20 split (D-006).

    The split is reproducible: same seed always produces identical indices.
    """
    X, y, feature_names = load_dataset()

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
