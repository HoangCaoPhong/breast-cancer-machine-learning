/**
 * 30 Biological features from UCI Breast Cancer Wisconsin (Diagnostic) Dataset.
 */
export type FeatureValue = number | '';

export interface BreastCancerFeatures {
  // Mean values (10)
  radius_mean: FeatureValue;
  texture_mean: FeatureValue;
  perimeter_mean: FeatureValue;
  area_mean: FeatureValue;
  smoothness_mean: FeatureValue;
  compactness_mean: FeatureValue;
  concavity_mean: FeatureValue;
  concave_points_mean: FeatureValue;
  symmetry_mean: FeatureValue;
  fractal_dimension_mean: FeatureValue;

  // Standard Error values (10)
  radius_se: FeatureValue;
  texture_se: FeatureValue;
  perimeter_se: FeatureValue;
  area_se: FeatureValue;
  smoothness_se: FeatureValue;
  compactness_se: FeatureValue;
  concavity_se: FeatureValue;
  concave_points_se: FeatureValue;
  symmetry_se: FeatureValue;
  fractal_dimension_se: FeatureValue;

  // Worst / Largest values (10)
  radius_worst: FeatureValue;
  texture_worst: FeatureValue;
  perimeter_worst: FeatureValue;
  area_worst: FeatureValue;
  smoothness_worst: FeatureValue;
  compactness_worst: FeatureValue;
  concavity_worst: FeatureValue;
  concave_points_worst: FeatureValue;
  symmetry_worst: FeatureValue;
  fractal_dimension_worst: FeatureValue;
}

export type FeatureKey = keyof BreastCancerFeatures;

export type FeatureCategory = 'mean' | 'se' | 'worst';

export interface FeatureMetadata {
  key: FeatureKey;
  label: string;
  vietnameseLabel: string;
  category: FeatureCategory;
  unit: string;
  description: string;
  min: number;
  max: number;
  step: number;
}

export interface DecisionStep {
  feature: string;
  featureNameVi: string;
  threshold: number;
  operator: '<=' | '>';
  actualValue: number;
  isSatisfied: boolean;
}

export interface FeatureImportance {
  feature: string;
  featureNameVi: string;
  importance: number; // 0.0 to 1.0
}

export interface TreeNodeData {
  id: string;
  name: string;
  feature?: string;
  threshold?: number;
  criterion?: string;
  samples?: number;
  values?: [number, number]; // [Benign, Malignant]
  isLeaf?: boolean;
  predictedClass?: 'Benign' | 'Malignant';
  children?: TreeNodeData[];
}

export type ModelOptionId = 'best' | 'scratch' | 'baseline' | 'depth_tune';

export interface ModelOptionInfo {
  id: ModelOptionId;
  name: string;
  nameVi: string;
  criterion: 'Entropy' | 'Gini';
  maxDepth: number | 'None';
  minSamplesSplit: number;
  minSamplesLeaf: number;
  accuracy: number | null;
  errorRate: number | null;
  recallMalignant: number | null;
  f1Score: number | null;
  precision: number | null;
  descriptionVi: string;
}

export interface PredictionResponse {
  prediction: 'M' | 'B';
  diagnosisLabel: 'Malignant' | 'Benign';
  diagnosisLabelVi: 'Ác tính (Malignant)' | 'Lành tính (Benign)';
  confidence: number; // 0.0 to 1.0
  probabilities: {
    malignant: number;
    benign: number;
  };
  decisionPath: DecisionStep[];
  topFeatures: FeatureImportance[];
  modelVersion: string;
  modelType: string;
  selectedModelId: ModelOptionId;
  accuracy: number | null;
  errorRate: number | null;
  recallMalignant: number | null;
  f1Score: number | null;
  timestamp: string;
  disclaimer: string;
}

export interface PresetSample {
  id: string;
  title: string;
  titleVi: string;
  type: 'benign' | 'malignant' | 'borderline';
  descriptionVi: string;
  features: BreastCancerFeatures;
}

export interface ModelExperiment {
  id: string;
  name: string;
  criterion: 'Gini' | 'Entropy';
  maxDepth: number | 'None';
  minSamplesSplit: number;
  minSamplesLeaf: number;
  accuracy: number | null;
  f1Score: number | null;
  recallMalignant: number | null;
  errorRate: number | null;
  isBest?: boolean;
}
