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
  const hasResult = result !== null;
  const isMalignant = result?.prediction === 'M';
  const confidence = hasResult ? (result.confidence * 100).toFixed(1) : '--';
  const malignantProb = hasResult
    ? (result.probabilities.malignant * 100).toFixed(1)
    : '--';
  const benignProb = hasResult
    ? (result.probabilities.benign * 100).toFixed(1)
    : '--';

  const decisionPath = result?.decisionPath || [];
  const topFeatures = result?.topFeatures || [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-gutter">
      {/* Result State Card */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex flex-col">
        <div className="p-stack-md border-b border-outline-variant bg-surface-bright flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">health_and_safety</span>
            <h3 className="font-headline-md text-headline-md text-on-surface">Kết quả dự đoán</h3>
          </div>
          <div className="flex items-center gap-2">
            {hasResult && (
              <>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="p-1 text-on-surface-variant hover:text-primary rounded hover:bg-surface-container-high transition-colors flex items-center gap-1 text-xs font-sans"
                  title="In hoặc Lưu Báo Cáo Chẩn Đoán (PDF)"
                >
                  <span className="material-symbols-outlined text-base">print</span>
                  <span className="hidden sm:inline">In kết quả</span>
                </button>
                <span className="font-mono text-[11px] text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded border border-outline-variant">
                  {result.selectedModelId?.toUpperCase()}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="p-stack-md flex flex-col space-y-4">
          {/* Main Status Pill */}
          <div className="text-center">
            {isLoading ? (
              <div className="inline-block bg-surface-container-high text-primary px-6 py-3 rounded-full font-sans text-sm font-semibold border border-primary mb-2">
                Hệ thống đang đối soát dữ liệu qua cây quyết định...
              </div>
            ) : !hasResult ? (
              <div className="inline-block bg-surface-container-low text-on-surface-variant px-6 py-2.5 rounded-full font-sans text-base border border-outline-variant mb-2">
                Chờ dữ liệu đầu vào
              </div>
            ) : isMalignant ? (
              <div className="inline-block bg-error-container text-on-error-container px-6 py-2.5 rounded-full font-display-lg text-display-lg border border-error mb-2">
                Khối u Ác tính (Malignant)
              </div>
            ) : (
              <div className="inline-block bg-surface-container-high text-tertiary-container px-6 py-2.5 rounded-full font-display-lg text-display-lg border border-tertiary-container mb-2 font-bold">
                Khối u Lành tính (Benign)
              </div>
            )}

            <p className="font-sans text-xs text-on-surface-variant flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm text-primary">verified</span>
              Mức độ tin cậy của thuật toán: <strong>{confidence}%</strong>
            </p>
          </div>

          {/* Probability Distribution */}
          <div className="space-y-3 border-t border-outline-variant pt-stack-md">
            <h4 className="font-sans text-xs text-on-surface-variant font-semibold uppercase tracking-wider">
              Xác suất ước tính theo phân lớp
            </h4>
            <div>
              <div className="flex justify-between font-sans text-xs mb-1">
                <span className="text-error font-medium">Khối u Ác tính</span>
                <span className="font-mono font-bold">{malignantProb}%</span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-2">
                <div
                  className="bg-error h-2 rounded-full transition-all duration-500"
                  style={{ width: hasResult ? `${malignantProb}%` : '0%' }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between font-sans text-xs mb-1">
                <span className="text-tertiary-container font-medium">Khối u Lành tính</span>
                <span className="font-mono font-bold">{benignProb}%</span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-2">
                <div
                  className="bg-tertiary-container h-2 rounded-full transition-all duration-500"
                  style={{ width: hasResult ? `${benignProb}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Path Card */}
      {decisionPath.length > 0 ? (
        <div className="bg-surface-container-low rounded-xl border border-outline-variant shadow-sm p-stack-md space-y-3">
          <div className="flex items-center gap-2 border-b border-outline-variant pb-2">
            <span className="material-symbols-outlined text-primary text-sm">alt_route</span>
            <h4 className="font-sans text-xs font-bold text-on-surface">
              Quy trình suy luận của Cây Quyết định
            </h4>
          </div>

          <div className="space-y-2">
            {decisionPath.map((step, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs font-sans bg-white p-2.5 rounded-lg border border-outline-variant"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-5 h-5 rounded-full bg-surface-container-high text-primary text-[11px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <span className="truncate">{step.featureNameVi || step.feature}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 font-mono">
                  <span className="text-on-surface-variant">
                    {step.operator} {step.threshold}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-sans font-semibold ${
                      step.isSatisfied
                        ? 'bg-surface-container-highest text-tertiary-container'
                        : 'bg-error-container text-error'
                    }`}
                  >
                    {step.isSatisfied ? 'Thỏa điều kiện' : 'Không thỏa'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Top Features */}
          {topFeatures.length > 0 && (
            <div className="pt-2 border-t border-outline-variant">
              <span className="text-[11px] font-sans text-on-surface-variant font-semibold uppercase block mb-1.5">
                Các đặc trưng tác động mạnh nhất:
              </span>
              <div className="space-y-1.5">
                {topFeatures.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs font-sans">
                    <span className="text-on-surface truncate">{item.featureNameVi || item.feature}</span>
                    <span className="font-mono font-bold text-primary">{(item.importance * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-surface-container-low rounded-xl border border-outline-variant shadow-sm p-stack-md text-center text-xs font-sans text-on-surface-variant">
          Nhập các chỉ số hoặc chọn mẫu tham khảo phía trên để theo dõi chi tiết từng bước phân nhánh của Cây Quyết định.
        </div>
      )}
    </div>
  );
};
