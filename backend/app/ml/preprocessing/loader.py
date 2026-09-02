"""Dataset loading and splitting utilities.

Primary data source: data/processed/breast_cancer_cleaned.csv
  - 569 rows, 42 columns (diagnosis + 30 original features + 11 engineered)
  - Features: 41 real-valued attributes (diagnosis column excluded)

Fallback chain (3-tier):
  Tier 1 – Processed file (data/processed/breast_cancer_cleaned.csv):
    41 features = 30 original UCI + 10 worst/mean ratios + 1 size_composite.
    Target: 'diagnosis' column, already encoded (1=malignant, 0=benign).
  Tier 2 – Raw UCI file (data/raw/uci_wdbc/wdbc.data):
    30 original features. Uses load_breast_cancer_dataset() from breast_cancer.py.
    Target mapping: 'M' -> 1 (malignant, positive class), 'B' -> 0 (benign).
  Tier 3 – sklearn.datasets.load_breast_cancer():
    30 features. Used only when both local files are unavailable.

Decision D-005 (updated): Primary source is data/processed/breast_cancer_cleaned.csv.
  Falls back to data/raw/uci_wdbc/wdbc.data, then to sklearn dataset.
Decision D-006: Stratified 80/20 train/test split, random_state=42.
"""

from __future__ import annotations

import pandas as pd
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

# Tier 1: Processed data path (primary) — includes engineered features
PROCESSED_DATA_PATH = (
    Path(__file__).resolve().parent.parent.parent.parent.parent
    / "data"
    / "processed"
    / "breast_cancer_cleaned.csv"
)

# Tier 2: Raw canonical UCI data path (secondary fallback)
RAW_DATA_PATH = (
    Path(__file__).resolve().parent.parent.parent.parent.parent
    / "data"
    / "raw"
    / "uci_wdbc"
    / "wdbc.data"
)

# Feature names when loading from the processed file (41 features)
PROCESSED_FEATURE_NAMES: list[str] = list(FEATURE_NAMES) + [
    "radius_worst_to_mean",
    "texture_worst_to_mean",
    "perimeter_worst_to_mean",
    "area_worst_to_mean",
    "smoothness_worst_to_mean",
    "compactness_worst_to_mean",
    "concavity_worst_to_mean",
    "concave_points_worst_to_mean",
    "symmetry_worst_to_mean",
    "fractal_dimension_worst_to_mean",
    "size_composite",
]


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


def load_dataset(data_path: Path | str | None = None) -> tuple[np.ndarray, np.ndarray, list[str]]:
    """Load the Breast Cancer Wisconsin (Diagnostic) dataset.

    Uses a 3-tier fallback strategy:
      1. Processed CSV (data/processed/breast_cancer_cleaned.csv) — 41 features
      2. Raw UCI file  (data/raw/uci_wdbc/wdbc.data)             — 30 features
      3. sklearn.datasets.load_breast_cancer()                   — 30 features

    Parameters
    ----------
    data_path : optional
        Explicit path to override the default processed file. If None, the
        loader tries PROCESSED_DATA_PATH first, then RAW_DATA_PATH, then sklearn.

    Returns
    -------
    X : np.ndarray, shape (569, n_features)
        Feature matrix. ID column excluded. n_features is 41 when loaded from
        the processed file, or 30 when loaded from raw/sklearn.
    y : np.ndarray, shape (569,)
        Target vector. 1 = malignant (positive class), 0 = benign.
    feature_names : list[str]
        Ordered list of feature names (41 or 30 depending on source).
    """
    # ── Tier 1: Processed CSV ──────────────────────────────────────────────────
    target_path = Path(data_path) if data_path is not None else PROCESSED_DATA_PATH
    if target_path.exists():
        frame = pd.read_csv(target_path)
        if "diagnosis" in frame.columns:
            feature_cols = [c for c in frame.columns if c != "diagnosis"]
            X = frame[feature_cols].to_numpy(dtype=float)
            y = frame["diagnosis"].to_numpy(dtype=int)
            return X, y, feature_cols

    # ── Tier 2: Raw UCI file ───────────────────────────────────────────────────
    if RAW_DATA_PATH.exists():
        ds = load_breast_cancer_dataset(RAW_DATA_PATH)
        X = ds.features.to_numpy(dtype=float)
        y = (ds.target == POSITIVE_CLASS).astype(int).to_numpy()
        return X, y, list(FEATURE_NAMES)

    # ── Tier 3: sklearn fallback ───────────────────────────────────────────────
    raw = load_breast_cancer()
    X = raw.data
    y = 1 - raw.target
    return X, y, list(FEATURE_NAMES)


def get_train_test_split(data_path: Path | str | None = None) -> DataSplit:
    """Return the canonical stratified 80/20 split (D-006).

    The split is reproducible: same seed always produces identical indices.

    Parameters
    ----------
    data_path : optional
        Passed directly to load_dataset(). See load_dataset() for the 3-tier
        fallback logic.
    """
    X, y, feature_names = load_dataset(data_path=data_path)

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
