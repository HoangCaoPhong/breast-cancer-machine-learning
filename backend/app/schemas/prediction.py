"""Pydantic request and response schemas for breast cancer prediction."""

from typing import List, Optional, Union
from pydantic import BaseModel, Field, ConfigDict


class BreastCancerFeaturesSchema(BaseModel):
    """Schema for all 30 real-valued cell nuclei features."""

    # 10 Mean Features
    radius_mean: float = Field(..., ge=0.0, description="Mean radius of cell nuclei (mm)")
    texture_mean: float = Field(..., ge=0.0, description="Standard deviation of gray-scale values")
    perimeter_mean: float = Field(..., ge=0.0, description="Mean perimeter of cell nuclei (mm)")
    area_mean: float = Field(..., ge=0.0, description="Mean area of cell nuclei (mm²)")
    smoothness_mean: float = Field(..., ge=0.0, description="Local variation in radius lengths")
    compactness_mean: float = Field(..., ge=0.0, description="Perimeter² / area - 1.0")
    concavity_mean: float = Field(..., ge=0.0, description="Severity of concave portions of the contour")
    concave_points_mean: float = Field(..., ge=0.0, description="Number of concave portions of the contour")
    symmetry_mean: float = Field(..., ge=0.0, description="Symmetry of cell nuclei")
    fractal_dimension_mean: float = Field(..., ge=0.0, description="Coastline approximation - 1")

    # 10 Standard Error Features
    radius_se: float = Field(..., ge=0.0, description="Standard error of radius")
    texture_se: float = Field(..., ge=0.0, description="Standard error of texture")
    perimeter_se: float = Field(..., ge=0.0, description="Standard error of perimeter")
    area_se: float = Field(..., ge=0.0, description="Standard error of area")
    smoothness_se: float = Field(..., ge=0.0, description="Standard error of smoothness")
    compactness_se: float = Field(..., ge=0.0, description="Standard error of compactness")
    concavity_se: float = Field(..., ge=0.0, description="Standard error of concavity")
    concave_points_se: float = Field(..., ge=0.0, description="Standard error of concave points")
    symmetry_se: float = Field(..., ge=0.0, description="Standard error of symmetry")
    fractal_dimension_se: float = Field(..., ge=0.0, description="Standard error of fractal dimension")

    # 10 Worst / Largest Features
    radius_worst: float = Field(..., ge=0.0, description="Worst or largest radius")
    texture_worst: float = Field(..., ge=0.0, description="Worst or largest texture")
    perimeter_worst: float = Field(..., ge=0.0, description="Worst or largest perimeter")
    area_worst: float = Field(..., ge=0.0, description="Worst or largest area")
    smoothness_worst: float = Field(..., ge=0.0, description="Worst or largest smoothness")
    compactness_worst: float = Field(..., ge=0.0, description="Worst or largest compactness")
    concavity_worst: float = Field(..., ge=0.0, description="Worst or largest concavity")
    concave_points_worst: float = Field(..., ge=0.0, description="Worst or largest concave points")
    symmetry_worst: float = Field(..., ge=0.0, description="Worst or largest symmetry")
    fractal_dimension_worst: float = Field(..., ge=0.0, description="Worst or largest fractal dimension")

    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "radius_mean": 17.99,
                "texture_mean": 10.38,
                "perimeter_mean": 122.8,
                "area_mean": 1001.0,
                "smoothness_mean": 0.1184,
                "compactness_mean": 0.2776,
                "concavity_mean": 0.3001,
                "concave_points_mean": 0.1471,
                "symmetry_mean": 0.2419,
                "fractal_dimension_mean": 0.07871,
                "radius_se": 1.095,
                "texture_se": 0.9053,
                "perimeter_se": 8.589,
                "area_se": 153.4,
                "smoothness_se": 0.006399,
                "compactness_se": 0.04904,
                "concavity_se": 0.05373,
                "concave_points_se": 0.01587,
                "symmetry_se": 0.03003,
                "fractal_dimension_se": 0.006193,
                "radius_worst": 25.38,
                "texture_worst": 17.33,
                "perimeter_worst": 184.6,
                "area_worst": 2019.0,
                "smoothness_worst": 0.1622,
                "compactness_worst": 0.6656,
                "concavity_worst": 0.7119,
                "concave_points_worst": 0.2654,
                "symmetry_worst": 0.4601,
                "fractal_dimension_worst": 0.1189,
            }
        },
    )


class DecisionStepSchema(BaseModel):
    """Represents a single decision node evaluation in the tree traversal."""

    feature: str
    feature_name_vi: Optional[str] = None
    threshold: float
    operator: str
    value: float
    is_satisfied: bool


class FeatureImportanceSchema(BaseModel):
    """Feature importance score."""

    feature: str
    feature_name_vi: Optional[str] = None
    importance: float


class PredictionResponseSchema(BaseModel):
    """Full prediction response payload returned to frontend."""

    prediction: str = Field(..., description="'Malignant' or 'Benign'")
    malignant_prob: float = Field(..., ge=0.0, le=1.0)
    benign_prob: float = Field(..., ge=0.0, le=1.0)
    confidence: float = Field(..., ge=0.0, le=1.0)

    # Benchmark metrics of the evaluated model
    accuracy: float
    error_rate: float
    precision: float
    recall_malignant: float
    f1_score: float

    selected_model_id: str
    decision_path: List[DecisionStepSchema] = []
    top_features: List[FeatureImportanceSchema] = []
    disclaimer: str


class ModelOptionInfoSchema(BaseModel):
    """Metadata for a model available in the model selector."""

    id: str
    name: str
    name_vi: str
    assigned_to: str
    criterion: str
    max_depth: Union[int, str]
    min_samples_split: int
    min_samples_leaf: int
    accuracy: Optional[float] = None
    error_rate: Optional[float] = None
    recall_malignant: Optional[float] = None
    f1_score: Optional[float] = None
    precision: Optional[float] = None
    description_vi: str


class ExperimentMetricSchema(BaseModel):
    """Comparative row in the 5-experiment benchmark table."""

    id: str
    name: str
    assigned_to: str
    criterion: str
    max_depth: Union[int, str]
    min_samples_split: int
    min_samples_leaf: int
    accuracy: float
    error_rate: float
    f1_score: float
    recall_malignant: float
    is_best: bool = False


class TreeNodeSchema(BaseModel):
    """Hierarchical node representation of a Decision Tree."""

    id: str
    name: str
    feature: Optional[str] = None
    threshold: Optional[float] = None
    criterion: Optional[str] = None
    samples: int
    values: List[int]
    is_leaf: bool = False
    predicted_class: Optional[str] = None
    children: List["TreeNodeSchema"] = []


TreeNodeSchema.model_rebuild()
