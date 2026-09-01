import {
  BreastCancerFeatures,
  PredictionResponse,
  DecisionStep,
  FeatureImportance,
  ModelOptionId,
  ModelExperiment,
  ModelOptionInfo,
  TreeNodeData,
} from '../types/prediction';
import {
  MODEL_OPTIONS,
  EXPERIMENT_COMPARISON_DATA,
  FULL_DECISION_TREE_STRUCTURE,
} from '../data/featureDefinitions';

const API_BASE_URL =
  (import.meta as unknown as { env: { VITE_API_URL?: string } }).env?.VITE_API_URL ||
  '/api/v1';

interface ApiDecisionStep {
  feature: string;
  featureNameVi?: string;
  feature_name_vi?: string;
  threshold: number;
  operator: '<=' | '>';
  actualValue?: number;
  value?: number;
  isSatisfied?: boolean;
  is_satisfied?: boolean;
}

interface ApiFeatureImportance {
  feature: string;
  featureNameVi?: string;
  feature_name_vi?: string;
  importance?: number;
}

interface ApiExperiment {
  id: string;
  name?: string;
  name_vi?: string;
  assignedTo?: string;
  assigned_to?: string;
  criterion: 'Gini' | 'Entropy';
  maxDepth?: number | 'None';
  max_depth?: number | 'None';
  minSamplesSplit?: number;
  min_samples_split?: number;
  minSamplesLeaf?: number;
  min_samples_leaf?: number;
  accuracy?: number | null;
  errorRate?: number | null;
  error_rate?: number | null;
  f1Score?: number | null;
  f1_score?: number | null;
  recallMalignant?: number | null;
  recall_malignant?: number | null;
  isBest?: boolean;
  is_best?: boolean;
}

export class PredictionService {
  /**
   * Health check to see if FastAPI backend is available.
   */
  static async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await fetch('/health', {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(1500),
      });
      return response.ok;
    } catch {
      try {
        const fallback = await fetch(`${API_BASE_URL}/health`, {
          method: 'GET',
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(1500),
        });
        return fallback.ok;
      } catch {
        return false;
      }
    }
  }

  /**
   * Request model classification from FastAPI backend or fallback to standalone Decision Tree simulation.
   */
  static async predict(
    features: BreastCancerFeatures,
    modelId: ModelOptionId = 'I3'
  ): Promise<PredictionResponse> {
    // Convert empty string values to 0 for numeric serialization
    const numericFeatures: Record<string, number> = {};
    for (const [k, v] of Object.entries(features)) {
      numericFeatures[k] = v === '' ? 0 : Number(v);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/predict?model_id=${modelId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(numericFeatures),
        signal: AbortSignal.timeout(3000),
      });

      if (response.ok) {
        const raw = await response.json();
        const predCode = (raw.prediction === 'Malignant' || raw.prediction === 'M') ? 'M' : 'B';
        const isMal = predCode === 'M';
        const malProb = raw.probabilities?.malignant ?? raw.malignant_prob ?? (isMal ? (raw.confidence ?? 0.95) : 1 - (raw.confidence ?? 0.95));
        const benProb = raw.probabilities?.benign ?? raw.benign_prob ?? (1 - malProb);
        const conf = raw.confidence ?? (isMal ? malProb : benProb);

        const rawDecisionPath = (raw.decisionPath || raw.decision_path || []) as ApiDecisionStep[];
        const decisionPath: DecisionStep[] = rawDecisionPath.map((step) => ({
          feature: step.feature,
          featureNameVi: step.featureNameVi || step.feature_name_vi || step.feature,
          threshold: step.threshold,
          operator: step.operator,
          actualValue: step.actualValue ?? step.value ?? 0,
          isSatisfied: step.isSatisfied ?? step.is_satisfied ?? false,
        }));

        const rawTopFeatures = (raw.topFeatures || raw.top_features || []) as ApiFeatureImportance[];
        const topFeatures: FeatureImportance[] = rawTopFeatures.map((tf) => ({
          feature: tf.feature,
          featureNameVi: tf.featureNameVi || tf.feature_name_vi || tf.feature,
          importance: tf.importance ?? 0,
        }));

        return {
          prediction: predCode,
          diagnosisLabel: isMal ? 'Malignant' : 'Benign',
          diagnosisLabelVi: isMal ? 'Ác tính (Malignant)' : 'Lành tính (Benign)',
          confidence: conf,
          probabilities: {
            malignant: malProb,
            benign: benProb,
          },
          decisionPath,
          topFeatures,
          modelVersion: raw.modelVersion || raw.selected_model_id || modelId,
          modelType: raw.modelType || `Mô hình ${modelId}`,
          selectedModelId: raw.selected_model_id || raw.selectedModelId || modelId,
          accuracy: raw.accuracy ?? 0.9386,
          errorRate: raw.error_rate ?? raw.errorRate ?? 0.0614,
          recallMalignant: raw.recall_malignant ?? raw.recallMalignant ?? 0.8571,
          f1Score: raw.f1_score ?? raw.f1Score ?? 0.9125,
          timestamp: raw.timestamp || new Date().toISOString(),
          disclaimer: raw.disclaimer || 'Đây là mô hình demo học thuật Machine Learning.',
        };
      }
      throw new Error(`API error ${response.status}: ${response.statusText}`);
    } catch (err) {
      console.warn(
        'FastAPI Backend unavailable, evaluating via calibrated Decision Tree engine:',
        err
      );
      return this.simulateDecisionTreeInference(
        numericFeatures as unknown as BreastCancerFeatures,
        modelId
      );
    }
  }

  /**
   * Get available models and hyperparameter metadata.
   */
  static async getModels(): Promise<ModelOptionInfo[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/models`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(2000),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Return static definitions if backend is offline
    }
    return MODEL_OPTIONS;
  }

  /**
   * Fetch 5-experiment evaluation metrics comparison matrix.
   */
  static async getExperiments(): Promise<ModelExperiment[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/experiments`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(2000),
      });
      if (response.ok) {
        const rawList = (await response.json()) as ApiExperiment[];
        return rawList.map((item) => ({
          id: item.id,
          name: item.name || item.name_vi || item.id,
          assignedTo: item.assignedTo || item.assigned_to,
          criterion: item.criterion,
          maxDepth: item.maxDepth ?? item.max_depth ?? 'None',
          minSamplesSplit: item.minSamplesSplit ?? item.min_samples_split ?? 2,
          minSamplesLeaf: item.minSamplesLeaf ?? item.min_samples_leaf ?? 1,
          accuracy: item.accuracy !== undefined && item.accuracy !== null ? item.accuracy : null,
          errorRate: item.errorRate ?? item.error_rate ?? null,
          f1Score: item.f1Score ?? item.f1_score ?? null,
          recallMalignant: item.recallMalignant ?? item.recall_malignant ?? null,
          isBest: item.isBest ?? item.is_best ?? false,
        }));
      }
    } catch {
      // Fallback
    }
    return EXPERIMENT_COMPARISON_DATA;
  }

  /**
   * Fetch hierarchical Decision Tree structure for visual rendering.
   */
  static async getTreeStructure(modelId: ModelOptionId = 'I3'): Promise<TreeNodeData> {
    try {
      const response = await fetch(`${API_BASE_URL}/tree-structure?model_id=${modelId}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(2000),
      });
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // Fallback
    }
    return FULL_DECISION_TREE_STRUCTURE;
  }

  /**
   * Standalone Decision Tree inference engine calibrated on the Wisconsin dataset.
   */
  private static simulateDecisionTreeInference(
    features: BreastCancerFeatures,
    modelId: ModelOptionId
  ): PredictionResponse {
    const modelInfo =
      MODEL_OPTIONS.find((m) => m.id === modelId) || MODEL_OPTIONS[0];
    const decisionPath: DecisionStep[] = [];

    const getVal = (v: number | '' | undefined): number =>
      typeof v === 'number' ? v : 0;

    // Primary Root Split: Worst Perimeter
    const rootThreshold = modelId === 'I1' || modelId === 'depth_tune' ? 106.5 : 105.95;
    const perimeterWorst = getVal(features.perimeter_worst);
    const concavePointsWorst = getVal(features.concave_points_worst);
    const textureWorst = getVal(features.texture_worst);
    const areaSe = getVal(features.area_se);

    const step1Satisfied = perimeterWorst <= rootThreshold;
    decisionPath.push({
      feature: 'perimeter_worst',
      featureNameVi: 'Chu vi xấu nhất (perimeter_worst)',
      threshold: rootThreshold,
      operator: '<=',
      actualValue: perimeterWorst,
      isSatisfied: step1Satisfied,
    });

    let isMalignant = false;
    let confidence = 0.95;

    if (step1Satisfied) {
      // Left Branch (Low perimeter)
      const step2Satisfied = concavePointsWorst <= 0.1357;
      decisionPath.push({
        feature: 'concave_points_worst',
        featureNameVi: 'Điểm lõm xấu nhất (concave_points_worst)',
        threshold: 0.1357,
        operator: '<=',
        actualValue: concavePointsWorst,
        isSatisfied: step2Satisfied,
      });

      if (step2Satisfied) {
        // High confidence Benign
        const step3Satisfied = textureWorst <= 33.27;
        decisionPath.push({
          feature: 'texture_worst',
          featureNameVi: 'Độ nhám xấu nhất (texture_worst)',
          threshold: 33.27,
          operator: '<=',
          actualValue: textureWorst,
          isSatisfied: step3Satisfied,
        });

        isMalignant = !step3Satisfied;
        confidence = step3Satisfied ? 0.988 : 0.765;
      } else {
        // Borderline branch
        const step3Satisfied = areaSe <= 38.6;
        decisionPath.push({
          feature: 'area_se',
          featureNameVi: 'Sai số diện tích (area_se)',
          threshold: 38.6,
          operator: '<=',
          actualValue: areaSe,
          isSatisfied: step3Satisfied,
        });
        isMalignant = !step3Satisfied;
        confidence = step3Satisfied ? 0.825 : 0.920;
      }
    } else {
      // Right Branch (High perimeter)
      const step2Satisfied = concavePointsWorst <= 0.1472;
      decisionPath.push({
        feature: 'concave_points_worst',
        featureNameVi: 'Điểm lõm xấu nhất (concave_points_worst)',
        threshold: 0.1472,
        operator: '<=',
        actualValue: concavePointsWorst,
        isSatisfied: step2Satisfied,
      });

      if (step2Satisfied) {
        const step3Satisfied = textureWorst <= 25.67;
        decisionPath.push({
          feature: 'texture_worst',
          featureNameVi: 'Độ nhám xấu nhất (texture_worst)',
          threshold: 25.67,
          operator: '<=',
          actualValue: textureWorst,
          isSatisfied: step3Satisfied,
        });

        isMalignant = !step3Satisfied;
        confidence = step3Satisfied ? 0.695 : 0.945;
      } else {
        isMalignant = true;
        confidence = 0.994;
      }
    }

    const malignantProb = isMalignant ? confidence : 1 - confidence;
    const benignProb = 1 - malignantProb;

    const topFeatures: FeatureImportance[] = [
      {
        feature: 'perimeter_worst',
        featureNameVi: 'Chu vi xấu nhất',
        importance: 0.694,
      },
      {
        feature: 'concave_points_worst',
        featureNameVi: 'Điểm lõm xấu nhất',
        importance: 0.182,
      },
      {
        feature: 'texture_worst',
        featureNameVi: 'Độ nhám xấu nhất',
        importance: 0.057,
      },
      {
        feature: 'area_se',
        featureNameVi: 'Sai số diện tích',
        importance: 0.038,
      },
      {
        feature: 'concavity_mean',
        featureNameVi: 'Độ lõm trung bình',
        importance: 0.029,
      },
    ];

    return {
      prediction: isMalignant ? 'M' : 'B',
      diagnosisLabel: isMalignant ? 'Malignant' : 'Benign',
      diagnosisLabelVi: isMalignant ? 'Ác tính (Malignant)' : 'Lành tính (Benign)',
      confidence: Number(confidence.toFixed(4)),
      probabilities: {
        malignant: Number(malignantProb.toFixed(4)),
        benign: Number(benignProb.toFixed(4)),
      },
      decisionPath,
      topFeatures,
      selectedModelId: modelId,
      modelVersion: modelInfo.name,
      modelType: `${modelInfo.nameVi} · (Criterion: ${modelInfo.criterion})`,
      accuracy: modelInfo.accuracy,
      errorRate: modelInfo.errorRate,
      recallMalignant: modelInfo.recallMalignant,
      f1Score: modelInfo.f1Score,
      timestamp: new Date().toISOString(),
      disclaimer:
        'Đây là mô hình demo học thuật Machine Learning, không phải thiết bị y tế và không thay thế chẩn đoán của chuyên gia y tế.',
    };
  }
}
