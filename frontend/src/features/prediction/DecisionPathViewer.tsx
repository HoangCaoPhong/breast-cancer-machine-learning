import React from 'react';
import { DecisionStep, FeatureImportance } from '../../types/prediction';
import { GitFork, ArrowRight, Check, X, BarChart3 } from 'lucide-react';

interface DecisionPathViewerProps {
  decisionPath: DecisionStep[];
  topFeatures: FeatureImportance[];
  isMalignant: boolean;
}

export const DecisionPathViewer: React.FC<DecisionPathViewerProps> = ({
  decisionPath,
  topFeatures,
  isMalignant,
}) => {
  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 shadow-2xl space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <GitFork className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-sans">
              Đường Dẫn Quyết Định (Decision Path)
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Các luật rẽ nhánh (if-else rules) mô hình đã thực thi từ gốc đến lá
            </p>
          </div>
        </div>
      </div>

      {/* Decision Steps Chain */}
      <div className="space-y-3">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
          Luồng Rẽ Nhánh Từng Node
        </span>

        <div className="space-y-2.5">
          {decisionPath.map((step, idx) => {
            return (
              <div
                key={idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all font-mono text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 text-teal-400 font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="text-white font-semibold">{step.feature}</span>
                    <span className="text-slate-400 text-[11px] block font-sans">
                      {step.featureNameVi}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800 text-slate-300">
                    <span className="text-slate-400">Ngưỡng: </span>
                    <strong className="text-teal-300">
                      {step.operator} {step.threshold}
                    </strong>
                  </div>

                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />

                  <div className="px-2.5 py-1 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Thực tế: </span>
                    <strong
                      className={
                        step.isSatisfied ? 'text-emerald-400' : 'text-amber-400'
                      }
                    >
                      {step.actualValue.toFixed(2)}
                    </strong>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1 ${
                      step.isSatisfied
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {step.isSatisfied ? (
                      <>
                        <Check className="w-3 h-3" /> Thỏa
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3" /> Không thỏa
                      </>
                    )}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Terminal Leaf Node */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between font-mono text-xs ${
              isMalignant
                ? 'bg-rose-950/30 border-rose-500/30 text-rose-300'
                : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-current animate-ping" />
              <span>Node lá kết luận (Terminal Leaf):</span>
            </div>
            <strong className="text-sm font-bold">
              {isMalignant ? 'Malignant (Ác tính)' : 'Benign (Lành tính)'}
            </strong>
          </div>
        </div>
      </div>

      {/* Top Feature Importance Ranking */}
      <div className="pt-4 border-t border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-teal-400" />
            Đặc Trưng Quan Trọng Nhất (Feature Importance)
          </span>
        </div>

        <div className="space-y-2.5">
          {topFeatures.map((item, idx) => {
            const percentage = (item.importance * 100).toFixed(1);
            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-baseline text-xs font-mono">
                  <span className="text-slate-200">
                    {item.feature}{' '}
                    <span className="text-slate-400 text-[11px] font-sans">
                      ({item.featureNameVi})
                    </span>
                  </span>
                  <span className="text-teal-400 font-bold">{percentage}%</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
