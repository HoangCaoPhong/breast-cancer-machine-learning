import React from 'react';
import { PredictionResponse } from '../../types/prediction';

interface PredictionResultCardProps {
  result: PredictionResponse | null;
  isLoading: boolean;
}

export const PredictionResultCard: React.FC<PredictionResultCardProps> = ({
  result,
  isLoading,
}) => {
  const isMalignant = result ? result.prediction === 'M' : true;
  const confidence = result ? (result.confidence * 100).toFixed(1) : '98.5';
  const malignantProb = result
    ? (result.probabilities.malignant * 100).toFixed(1)
    : '98.5';
  const benignProb = result
    ? (result.probabilities.benign * 100).toFixed(1)
    : '1.5';

  const decisionPath = result?.decisionPath || [];
  const topFeatures = result?.topFeatures || [];

  return (
    <div className="space-y-gutter">
      {/* Result State Card */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex flex-col">
        <div className="p-stack-md border-b border-outline-variant bg-surface-bright flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">health_and_safety</span>
            <h3 className="font-headline-md text-headline-md text-on-surface">Kết quả phân loại</h3>
          </div>
          <span className="font-label-mono text-[11px] text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded">
            {result?.selectedModelId?.toUpperCase()}
          </span>
        </div>

        <div className="p-stack-md flex flex-col space-y-4">
          {/* Main Status Pill */}
          <div className="text-center">
            {isLoading ? (
              <div className="inline-block bg-surface-container-high text-primary px-6 py-3 rounded-full font-headline-md border border-primary mb-2">
                Đang duyệt cây quyết định...
              </div>
            ) : isMalignant ? (
              <div className="inline-block bg-error-container text-on-error-container px-6 py-2.5 rounded-full font-display-lg text-display-lg border border-error mb-2">
                Malignant (Ác tính)
              </div>
            ) : (
              <div className="inline-block bg-surface-container-high text-tertiary-container px-6 py-2.5 rounded-full font-display-lg text-display-lg border border-tertiary-container mb-2 font-bold">
                Benign (Lành tính)
              </div>
            )}

            <p className="font-label-mono text-xs text-on-surface-variant flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-xs text-primary">verified</span>
              Độ tin cậy mô hình: <strong>{confidence}%</strong>
            </p>
          </div>

          {/* Probability Distribution */}
          <div className="space-y-3 border-t border-outline-variant pt-stack-md">
            <h4 className="font-label-mono text-[11px] text-on-surface-variant uppercase tracking-wider">
              Xác suất phân lớp (Class Probability)
            </h4>
            <div>
              <div className="flex justify-between font-label-mono text-xs mb-1">
                <span className="text-error font-bold">Ác tính (Malignant)</span>
                <span className="font-bold">{malignantProb}%</span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-2">
                <div
                  className="bg-error h-2 rounded-full transition-all duration-500"
                  style={{ width: `${malignantProb}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between font-label-mono text-xs mb-1">
                <span className="text-tertiary-container font-bold">Lành tính (Benign)</span>
                <span className="font-bold">{benignProb}%</span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-2">
                <div
                  className="bg-tertiary-container h-2 rounded-full transition-all duration-500"
                  style={{ width: `${benignProb}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Path Card */}
      {decisionPath.length > 0 && (
        <div className="bg-surface-container-low rounded-xl border border-outline-variant shadow-sm p-stack-md space-y-3">
          <div className="flex items-center gap-2 border-b border-outline-variant pb-2">
            <span className="material-symbols-outlined text-primary text-sm">alt_route</span>
            <h4 className="font-headline-sm text-sm font-bold text-on-surface">
              Đường rẽ nhánh của mẫu (Decision Path)
            </h4>
          </div>

          <div className="space-y-2">
            {decisionPath.map((step, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs font-mono bg-white p-2.5 rounded-lg border border-outline-variant"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-4 h-4 rounded-full bg-surface-container-high text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="truncate">{step.feature}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-on-surface-variant font-bold">
                    {step.operator} {step.threshold}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      step.isSatisfied
                        ? 'bg-surface-container-highest text-tertiary-container'
                        : 'bg-error-container text-error'
                    }`}
                  >
                    {step.isSatisfied ? 'Thỏa' : 'Không'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Top Features */}
          {topFeatures.length > 0 && (
            <div className="pt-2 border-t border-outline-variant">
              <span className="text-[11px] font-label-mono text-on-surface-variant uppercase block mb-1.5">
                Top đặc trưng quyết định:
              </span>
              <div className="space-y-1.5">
                {topFeatures.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[11px] font-mono">
                    <span className="text-on-surface truncate">{item.feature}</span>
                    <span className="font-bold text-primary">{(item.importance * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
