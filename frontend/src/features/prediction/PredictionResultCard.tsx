import React from 'react';
import { PredictionResponse } from '../../types/prediction';
import { useLanguage } from '../../context/LanguageContext';

interface PredictionResultCardProps {
  result: PredictionResponse | null;
  isLoading: boolean;
}

export const PredictionResultCard: React.FC<PredictionResultCardProps> = ({
  result,
  isLoading,
}) => {
  const { language, t } = useLanguage();
  const hasResult = result !== null;
  const isMalignant = result?.prediction === 'M' || result?.diagnosisLabel === 'Malignant';
  const confidence = hasResult ? ((result.confidence ?? 0.95) * 100).toFixed(1) : '--';
  const malignantProb = hasResult
    ? ((result.probabilities?.malignant ?? (isMalignant ? 0.95 : 0.05)) * 100).toFixed(1)
    : '--';
  const benignProb = hasResult
    ? ((result.probabilities?.benign ?? (isMalignant ? 0.05 : 0.95)) * 100).toFixed(1)
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
            <h3 className="font-headline-md text-headline-md text-on-surface">
              {t.resultTitle}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {hasResult && (
              <>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="p-1 text-on-surface-variant hover:text-primary rounded hover:bg-surface-container-high transition-colors flex items-center gap-1 text-xs font-sans"
                  title="Print or Save Diagnostic Summary (PDF)"
                >
                  <span className="material-symbols-outlined text-base">print</span>
                  <span className="hidden sm:inline">
                    {language === 'vi' ? 'In kết quả' : 'Print PDF'}
                  </span>
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
              <div className="inline-block bg-surface-container-high text-primary px-6 py-3 rounded-full font-sans text-sm font-semibold border border-primary mb-2 animate-pulse">
                {language === 'vi'
                  ? 'Hệ thống đang đối soát dữ liệu qua cây quyết định...'
                  : 'Evaluating feature vector across decision tree rules...'}
              </div>
            ) : !hasResult ? (
              <div className="inline-block bg-surface-container-low text-on-surface-variant px-6 py-2.5 rounded-full font-sans text-sm border border-outline-variant mb-2">
                {t.waitingResult}
              </div>
            ) : isMalignant ? (
              <div className="inline-block bg-error-container text-on-error-container px-6 py-2.5 rounded-full font-display-lg text-display-lg border border-error mb-2 font-bold shadow-sm">
                {t.diagnosisMalignant}
              </div>
            ) : (
              <div className="inline-block bg-surface-container-high text-tertiary-container px-6 py-2.5 rounded-full font-display-lg text-display-lg border border-tertiary-container mb-2 font-bold shadow-sm">
                {t.diagnosisBenign}
              </div>
            )}

            <p className="font-sans text-xs text-on-surface-variant flex items-center justify-center gap-1">
              <span className="material-symbols-outlined text-sm text-primary">verified</span>
              {t.confidenceScore}: <strong>{hasResult ? `${confidence}%` : '--'}</strong>
            </p>
          </div>

          {/* Probability Distribution */}
          <div className="space-y-3 border-t border-outline-variant pt-stack-md">
            <h4 className="font-sans text-xs text-on-surface-variant font-semibold uppercase tracking-wider">
              {t.classProbabilityTitle}
            </h4>
            <div>
              <div className="flex justify-between font-sans text-xs mb-1">
                <span className="text-error font-medium">{t.probMalignant}</span>
                <span className="font-mono font-bold">{hasResult ? `${malignantProb}%` : '--%'}</span>
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
                <span className="text-tertiary-container font-medium">{t.probBenign}</span>
                <span className="font-mono font-bold">{hasResult ? `${benignProb}%` : '--%'}</span>
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
              {language === 'vi' ? 'Quy trình suy luận của Cây Quyết định' : 'Decision Trajectory Breakdown'}
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
                  <span className="truncate">
                    {language === 'vi' ? (step.featureNameVi || step.feature) : step.feature}
                  </span>
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
                    {step.isSatisfied ? (language === 'vi' ? 'Thỏa điều kiện' : 'True (<=)') : (language === 'vi' ? 'Không thỏa' : 'False (>)')}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Top Features */}
          {topFeatures.length > 0 && (
            <div className="pt-2 border-t border-outline-variant">
              <span className="text-[11px] font-sans text-on-surface-variant font-semibold uppercase block mb-1.5">
                {t.topFeaturesTitle}:
              </span>
              <div className="space-y-1.5">
                {topFeatures.slice(0, 3).map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs font-sans">
                    <span className="text-on-surface truncate">
                      {language === 'vi' ? (item.featureNameVi || item.feature) : item.feature}
                    </span>
                    <span className="font-mono font-bold text-primary">{(item.importance * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-surface-container-low rounded-xl border border-outline-variant shadow-sm p-stack-md text-center text-xs font-sans text-on-surface-variant">
          {t.waitingResultHint}
        </div>
      )}
    </div>
  );
};

export default PredictionResultCard;
