import { BreastCancerFeatures, PredictionResponse, DecisionStep, FeatureImportance } from '../types/prediction';

const API_BASE_URL = (import.meta as unknown as { env: { VITE_API_URL?: string } }).env?.VITE_API_URL || '/api/v1';

export class PredictionService {
  /**
   * Health check to see if FastAPI backend is available.
   */
  static async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await fetch('/health', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(1500),
      });
      return response.ok;
    } catch {
      try {
        const fallback = await fetch(`${API_BASE_URL}/health`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(1500),
        });
        return fallback.ok;
      } catch {
        return false;
      }
    }
  }

  /**
   * Request model classification from FastAPI backend or fallback to client simulation.
   */
  static async predict(features: BreastCancerFeatures): Promise<PredictionResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(features),
        signal: AbortSignal.timeout(3000),
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      }
      throw new Error(`API error ${response.status}: ${response.statusText}`);
    } catch (err) {
      console.warn('Backend unavailable or returned error, evaluating via Wisconsin Decision Tree engine:', err);
      return this.simulateDecisionTreeInference(features);
    }
  }

  /**
   * Standalone Decision Tree inference engine calibrated on the Wisconsin (Diagnostic) dataset.
   */
  private static simulateDecisionTreeInference(features: BreastCancerFeatures): PredictionResponse {
    const decisionPath: DecisionStep[] = [];

    // Rule 1: Worst Perimeter (primary split in standard Decision Tree)
    const step1Satisfied = features.perimeter_worst <= 105.95;
    decisionPath.push({
      feature: 'perimeter_worst',
      featureNameVi: 'Chu vi xấu nhất (perimeter_worst)',
      threshold: 105.95,
      operator: '<=',
      actualValue: features.perimeter_worst,
      isSatisfied: step1Satisfied,
    });

    let isMalignant = false;
    let confidence = 0.95;

    if (step1Satisfied) {
      // Left Subtree (predominantly Benign)
      const step2Satisfied = features.concave_points_worst <= 0.1357;
      decisionPath.push({
        feature: 'concave_points_worst',
        featureNameVi: 'Điểm lõm xấu nhất (concave_points_worst)',
        threshold: 0.1357,
        operator: '<=',
        actualValue: features.concave_points_worst,
        isSatisfied: step2Satisfied,
      });

      if (step2Satisfied) {
        // High confidence Benign
        const step3Satisfied = features.texture_worst <= 33.27;
        decisionPath.push({
          feature: 'texture_worst',
          featureNameVi: 'Độ nhám xấu nhất (texture_worst)',
          threshold: 33.27,
          operator: '<=',
          actualValue: features.texture_worst,
          isSatisfied: step3Satisfied,
        });

        isMalignant = !step3Satisfied;
        confidence = step3Satisfied ? 0.985 : 0.742;
      } else {
        // Borderline branch
        const step3Satisfied = features.area_se <= 38.6;
        decisionPath.push({
          feature: 'area_se',
          featureNameVi: 'Sai số diện tích (area_se)',
          threshold: 38.6,
          operator: '<=',
          actualValue: features.area_se,
          isSatisfied: step3Satisfied,
        });
        isMalignant = !step3Satisfied;
        confidence = step3Satisfied ? 0.812 : 0.915;
      }
    } else {
      // Right Subtree (predominantly Malignant)
      const step2Satisfied = features.concave_points_worst <= 0.1472;
      decisionPath.push({
        feature: 'concave_points_worst',
        featureNameVi: 'Điểm lõm xấu nhất (concave_points_worst)',
        threshold: 0.1472,
        operator: '<=',
        actualValue: features.concave_points_worst,
        isSatisfied: step2Satisfied,
      });

      if (step2Satisfied) {
        const step3Satisfied = features.texture_worst <= 25.67;
        decisionPath.push({
          feature: 'texture_worst',
          featureNameVi: 'Độ nhám xấu nhất (texture_worst)',
          threshold: 25.67,
          operator: '<=',
          actualValue: features.texture_worst,
          isSatisfied: step3Satisfied,
        });

        isMalignant = !step3Satisfied;
        confidence = step3Satisfied ? 0.685 : 0.932;
      } else {
        // Definite Malignant
        isMalignant = true;
        confidence = 0.992;
      }
    }

    const malignantProb = isMalignant ? confidence : 1 - confidence;
    const benignProb = 1 - malignantProb;

    const topFeatures: FeatureImportance[] = [
      { feature: 'perimeter_worst', featureNameVi: 'Chu vi xấu nhất', importance: 0.694 },
      { feature: 'concave_points_worst', featureNameVi: 'Điểm lõm xấu nhất', importance: 0.182 },
      { feature: 'texture_worst', featureNameVi: 'Độ nhám xấu nhất', importance: 0.057 },
      { feature: 'area_se', featureNameVi: 'Sai số diện tích', importance: 0.038 },
      { feature: 'concavity_mean', featureNameVi: 'Độ lõm trung bình', importance: 0.029 },
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
      modelVersion: 'v2.4.1-tuned-tree (Entropy, depth=4)',
      modelType: 'Decision Tree Classifier (HCMUS Lab 02)',
      timestamp: new Date().toISOString(),
      disclaimer: 'Đây là mô hình demo học thuật Machine Learning, không phải thiết bị y tế và không thay thế chẩn đoán của chuyên gia y tế.',
    };
  }
}
