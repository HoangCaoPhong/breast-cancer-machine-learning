/**
 * 30 Biological features from UCI Breast Cancer Wisconsin (Diagnostic) Dataset.
 */
export interface BreastCancerFeatures {
  // Mean values (10)
  radius_mean: number;
  texture_mean: number;
  perimeter_mean: number;
  area_mean: number;
  smoothness_mean: number;
  compactness_mean: number;
  concavity_mean: number;
  concave_points_mean: number;
  symmetry_mean: number;
  fractal_dimension_mean: number;

  // Standard Error values (10)
  radius_se: number;
  texture_se: number;
  perimeter_se: number;
  area_se: number;
  smoothness_se: number;
  compactness_se: number;
  concavity_se: number;
  concave_points_se: number;
  symmetry_se: number;
  fractal_dimension_se: number;

  // Worst / Largest values (10)
  radius_worst: number;
  texture_worst: number;
  perimeter_worst: number;
  area_worst: number;
  smoothness_worst: number;
  compactness_worst: number;
  concavity_worst: number;
  concave_points_worst: number;
  symmetry_worst: number;
  fractal_dimension_worst: number;
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
  accuracy: number;
  errorRate: number;
  recallMalignant: number;
  f1Score: number;
  precision: number;
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
  accuracy: number;
  errorRate: number;
  recallMalignant: number;
  f1Score: number;
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
  accuracy: number;
  f1Score: number;
  recallMalignant: number;
  errorRate: number;
  isBest?: boolean;
}
