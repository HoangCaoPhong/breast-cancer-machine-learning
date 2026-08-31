"""Validated loader for the canonical UCI breast-cancer dataset."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

import pandas as pd

FEATURE_NAMES = (
    "radius_mean",
    "texture_mean",
    "perimeter_mean",
    "area_mean",
    "smoothness_mean",
    "compactness_mean",
    "concavity_mean",
    "concave_points_mean",
    "symmetry_mean",
    "fractal_dimension_mean",
    "radius_se",
    "texture_se",
    "perimeter_se",
    "area_se",
    "smoothness_se",
    "compactness_se",
    "concavity_se",
    "concave_points_se",
    "symmetry_se",
    "fractal_dimension_se",
    "radius_worst",
    "texture_worst",
    "perimeter_worst",
    "area_worst",
    "smoothness_worst",
    "compactness_worst",
    "concavity_worst",
    "concave_points_worst",
    "symmetry_worst",
    "fractal_dimension_worst",
)

_DATASET_COLUMNS = ("id", "diagnosis", *FEATURE_NAMES)
_EXPECTED_ROWS = 569
_EXPECTED_TARGETS = {"B", "M"}


@dataclass(frozen=True, slots=True)
class BreastCancerDataset:
    """Validated predictive features and original UCI diagnosis labels."""

    features: pd.DataFrame
    target: pd.Series


def load_breast_cancer_dataset(path: str | Path) -> BreastCancerDataset:
    """Load and validate the canonical headerless UCI ``wdbc.data`` file.

    The identifier is validated but deliberately excluded from ``features``. Target
    labels remain ``B`` and ``M`` so the shared target mapping can be decided later.
    """

    source = Path(path)
    if not source.is_file():
        raise FileNotFoundError(f"Breast-cancer dataset was not found: {source}")

    frame = pd.read_csv(
        source,
        header=None,
        names=_DATASET_COLUMNS,
        dtype={"id": "string", "diagnosis": "string"},
    )
    expected_shape = (_EXPECTED_ROWS, len(_DATASET_COLUMNS))
    if frame.shape != expected_shape:
        raise ValueError(
            f"Expected canonical dataset shape {expected_shape}, received {frame.shape}"
        )
    if frame.isna().any().any():
        raise ValueError("Canonical breast-cancer dataset must not contain missing values")
    if not frame["id"].is_unique:
        raise ValueError("Canonical breast-cancer dataset IDs must be unique")

    targets = set(frame["diagnosis"].unique())
    if targets != _EXPECTED_TARGETS:
        raise ValueError(f"Expected diagnosis labels {_EXPECTED_TARGETS}, received {targets}")

    try:
        features = frame.loc[:, FEATURE_NAMES].astype(float)
    except (TypeError, ValueError) as error:
        raise ValueError("All breast-cancer features must be numeric") from error

    return BreastCancerDataset(
        features=features,
        target=frame["diagnosis"].copy(),
    )
