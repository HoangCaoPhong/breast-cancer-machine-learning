"""Data loading, feature definition, and preprocessing pipeline."""

import numpy as np
import pandas as pd
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split

# 30 Canonical Feature Names in strict order
CANONICAL_FEATURE_NAMES: list[str] = [
    # 10 Mean Features
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
    # 10 Standard Error Features
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
    # 10 Worst / Largest Features
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
]

# Vietnamese labels for all 30 features
FEATURE_NAME_VI_MAP: dict[str, str] = {
    "radius_mean": "Bán kính trung bình",
    "texture_mean": "Độ nhám trung bình",
    "perimeter_mean": "Chu vi trung bình",
    "area_mean": "Diện tích trung bình",
    "smoothness_mean": "Độ mịn trung bình",
    "compactness_mean": "Độ nén trung bình",
    "concavity_mean": "Độ lõm trung bình",
    "concave_points_mean": "Điểm lõm trung bình",
    "symmetry_mean": "Tính đối xứng trung bình",
    "fractal_dimension_mean": "Số chiều Fractal trung bình",
    "radius_se": "Sai số bán kính",
    "texture_se": "Sai số kết cấu",
    "perimeter_se": "Sai số chu vi",
    "area_se": "Sai số diện tích",
    "smoothness_se": "Sai số độ mịn",
    "compactness_se": "Sai số độ nén",
    "concavity_se": "Sai số độ lõm",
    "concave_points_se": "Sai số điểm lõm",
    "symmetry_se": "Sai số tính đối xứng",
    "fractal_dimension_se": "Sai số chiều Fractal",
    "radius_worst": "Bán kính xấu nhất",
    "texture_worst": "Độ nhám xấu nhất",
    "perimeter_worst": "Chu vi xấu nhất",
    "area_worst": "Diện tích xấu nhất",
    "smoothness_worst": "Độ mịn xấu nhất",
    "compactness_worst": "Độ nén xấu nhất",
    "concavity_worst": "Độ lõm xấu nhất",
    "concave_points_worst": "Điểm lõm xấu nhất",
    "symmetry_worst": "Tính đối xứng xấu nhất",
    "fractal_dimension_worst": "Số chiều Fractal xấu nhất",
}


def load_canonical_data() -> tuple[pd.DataFrame, pd.Series]:
    """Load the UCI Breast Cancer Wisconsin (Diagnostic) dataset.

    Returns:
        X: DataFrame of 30 numerical features.
        y: Series of binary target where 1 = Malignant (M), 0 = Benign (B).
    """
    raw = load_breast_cancer(as_frame=True)
    df = raw.frame.copy()

    # sklearn target: 0 = malignant, 1 = benign.
    # In standard clinical literature and our contract:
    # 1 = Malignant (positive/abnormal), 0 = Benign (negative/normal).
    # We map 0 -> 1 (Malignant) and 1 -> 0 (Benign).
    y = df["target"].apply(lambda val: 1 if val == 0 else 0)

    # Standardize column naming to canonical snake_case
    feature_cols = [c for c in df.columns if c != "target"]
    X = df[feature_cols].copy()

    # Rename sklearn column names (e.g. 'mean radius' -> 'radius_mean')
    rename_mapping = {}
    for col in feature_cols:
        parts = col.split(" ")
        if len(parts) >= 2:
            prefix = parts[0]
            rest = "_".join(parts[1:]).replace(" ", "_")
            if prefix in ("mean", "worst"):
                new_name = f"{rest}_{prefix}"
            elif "error" in col:
                base = col.replace(" error", "").replace(" ", "_")
                new_name = f"{base}_se"
            else:
                new_name = col.replace(" ", "_")
        else:
            new_name = col.replace(" ", "_")

        # Fix concave points naming
        new_name = new_name.replace("concave_points", "concave_points")
        rename_mapping[col] = new_name

    X.rename(columns=rename_mapping, inplace=True)

    # Ensure canonical column order
    for f in CANONICAL_FEATURE_NAMES:
        if f not in X.columns:
            # Fallback direct assignment by index
            idx = CANONICAL_FEATURE_NAMES.index(f)
            X[f] = raw.data.iloc[:, idx]

    X = X[CANONICAL_FEATURE_NAMES]
    return X, y


def get_canonical_train_test_split(
    random_seed: int = 42,
    train_ratio: float = 0.70,
) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Return deterministic Stratified Train/Test split (70/30)."""
    X, y = load_canonical_data()
    X_train, X_test, y_train, y_test = train_test_split(
        X.values,
        y.values,
        test_size=1.0 - train_ratio,
        random_state=random_seed,
        stratify=y.values,
    )
    return X_train, X_test, y_train, y_test
