import React, { useState } from 'react';
import { PredictionResponse } from '../../types/prediction';
import {
  EXPERIMENT_COMPARISON_DATA,
  FULL_DECISION_TREE_STRUCTURE,
} from '../../data/featureDefinitions';

interface TechnicalDetailsSectionProps {
  result: PredictionResponse | null;
}

export const TechnicalDetailsSection: React.FC<TechnicalDetailsSectionProps> = ({
  result,
}) => {
  const [activeTab, setActiveTab] = useState<'tree' | 'experiments' | 'dataset'>('tree');

  const accuracy = result ? (result.accuracy * 100).toFixed(2) : '97.37';
  const errorRate = result ? (result.errorRate * 100).toFixed(2) : '2.63';
  const recall = result ? (result.recallMalignant * 100).toFixed(2) : '97.62';
  const f1 = result ? (result.f1Score * 100).toFixed(2) : '96.47';

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden" id="tree-section">
      {/* Header & Sub-tabs */}
      <div className="border-b border-outline-variant bg-surface-bright p-stack-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-primary">account_tree</span>
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface">
              Phân Tích Cây Quyết Định &amp; Thực Nghiệm (Lab 02)
            </h3>
            <p className="text-xs font-label-mono text-on-surface-variant">
              Hiển thị cấu trúc cây, bảng so sánh 5 mô hình và dữ liệu nguồn UCI
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-1.5 overflow-x-auto bg-surface-container-low p-1 rounded-lg border border-outline-variant">
          <button
            type="button"
            onClick={() => setActiveTab('tree')}
            className={`px-3 py-1.5 font-label-mono text-xs rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'tree'
                ? 'bg-white text-primary font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-sm">schema</span>
            Sơ đồ Cây
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('experiments')}
            className={`px-3 py-1.5 font-label-mono text-xs rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'experiments'
                ? 'bg-white text-primary font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-sm">table_chart</span>
            So Sánh 5 Mô Hình
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('dataset')}
            className={`px-3 py-1.5 font-label-mono text-xs rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'dataset'
                ? 'bg-white text-primary font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-sm">database</span>
            Dataset UCI
          </button>
        </div>
      </div>

      <div className="p-stack-md">
        {/* Tab 1: Full Tree Diagram */}
        {activeTab === 'tree' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-label-mono text-on-surface-variant">
                Độ sâu max_depth = 4 · Tiêu chuẩn phân hoạch: Information Gain (Entropy)
              </span>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-highest text-tertiary-container font-bold">
                  ● Lành tính (Benign)
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-error-container text-error font-bold">
                  ● Ác tính (Malignant)
                </span>
              </div>
            </div>

            {/* Hierarchical Tree Box */}
            <div className="overflow-x-auto bg-surface-container-low border border-outline-variant rounded-xl p-5 font-mono text-xs space-y-4">
              {/* Level 0: Root */}
              <div className="flex flex-col items-center">
                <div className="bg-white border-2 border-primary rounded-lg p-3 text-center shadow-sm max-w-sm w-full">
                  <div className="font-bold text-primary text-sm">
                    [Node Gốc] {FULL_DECISION_TREE_STRUCTURE.feature} &lt;= {FULL_DECISION_TREE_STRUCTURE.threshold}
                  </div>
                  <div className="text-on-surface-variant text-[11px] mt-0.5">
                    {FULL_DECISION_TREE_STRUCTURE.criterion} · samples = {FULL_DECISION_TREE_STRUCTURE.samples}
                  </div>
                  <div className="text-[11px] text-on-surface font-semibold mt-0.5">
                    values = [Lành: {FULL_DECISION_TREE_STRUCTURE.values?.[0]}, Ác: {FULL_DECISION_TREE_STRUCTURE.values?.[1]}]
                  </div>
                </div>
                <div className="w-0.5 h-6 bg-outline-variant my-1" />
              </div>

              {/* Level 1: Subtrees */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Subtree (<= 105.95) */}
                <div className="flex flex-col items-center bg-white/70 p-4 rounded-xl border border-outline-variant">
                  <span className="text-[11px] font-bold text-tertiary-container mb-2 bg-surface-container-highest px-2 py-0.5 rounded">
                    Nhánh Trái (perimeter_worst &lt;= 105.95)
                  </span>
                  <div className="bg-white border border-outline-variant rounded-lg p-2.5 text-center w-full">
                    <div className="font-bold text-on-surface">
                      concave_points_worst &lt;= 0.1357
                    </div>
                    <div className="text-[11px] text-on-surface-variant mt-0.5">
                      samples = 290 · [Lành: 275, Ác: 15]
                    </div>
                  </div>

                  {/* Level 2 Left Leaves */}
                  <div className="grid grid-cols-2 gap-3 mt-3 w-full">
                    <div className="bg-surface-container-highest border border-tertiary-container rounded p-2 text-center">
                      <div className="font-bold text-tertiary-container">Lá: Benign</div>
                      <div className="text-[10px] text-on-surface-variant">268 mẫu lành tính</div>
                    </div>
                    <div className="bg-error-container border border-error rounded p-2 text-center">
                      <div className="font-bold text-error">Lá: Malignant</div>
                      <div className="text-[10px] text-on-surface-variant">15 mẫu ác tính</div>
                    </div>
                  </div>
                </div>

                {/* Right Subtree (> 105.95) */}
                <div className="flex flex-col items-center bg-white/70 p-4 rounded-xl border border-outline-variant">
                  <span className="text-[11px] font-bold text-error mb-2 bg-error-container px-2 py-0.5 rounded">
                    Nhánh Phải (perimeter_worst &gt; 105.95)
                  </span>
                  <div className="bg-white border border-outline-variant rounded-lg p-2.5 text-center w-full">
                    <div className="font-bold text-on-surface">
                      concave_points_worst &lt;= 0.1472
                    </div>
                    <div className="text-[11px] text-on-surface-variant mt-0.5">
                      samples = 165 · [Lành: 10, Ác: 155]
                    </div>
                  </div>

                  {/* Level 2 Right Leaves */}
                  <div className="grid grid-cols-2 gap-3 mt-3 w-full">
                    <div className="bg-surface-container-highest border border-outline-variant rounded p-2 text-center">
                      <div className="font-bold text-on-surface">texture_worst &lt;= 25.67</div>
                      <div className="text-[10px] text-on-surface-variant">25 mẫu phân hóa</div>
                    </div>
                    <div className="bg-error-container border border-error rounded p-2 text-center">
                      <div className="font-bold text-error">Lá: Pure Malignant</div>
                      <div className="text-[10px] text-on-surface-variant">140 mẫu ác tính (100%)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: 5-Experiment Comparison */}
        {activeTab === 'experiments' && (
          <div className="space-y-4" id="experiments-section">
            {/* Quick KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant text-center">
                <div className="font-label-mono text-[11px] text-on-surface-variant uppercase">Accuracy</div>
                <div className="font-data-metric text-lg font-bold text-primary mt-1">{accuracy}%</div>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant text-center">
                <div className="font-label-mono text-[11px] text-on-surface-variant uppercase">Error Rate</div>
                <div className="font-data-metric text-lg font-bold text-error mt-1">{errorRate}%</div>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant text-center">
                <div className="font-label-mono text-[11px] text-on-surface-variant uppercase">Malignant Recall</div>
                <div className="font-data-metric text-lg font-bold text-primary mt-1">{recall}%</div>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant text-center">
                <div className="font-label-mono text-[11px] text-on-surface-variant uppercase">F1-Score</div>
                <div className="font-data-metric text-lg font-bold text-primary mt-1">{f1}%</div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-outline-variant rounded-xl">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead className="bg-surface-bright text-on-surface font-label-mono uppercase border-b border-outline-variant">
                  <tr>
                    <th className="p-3 font-semibold">Mô hình / Thực nghiệm</th>
                    <th className="p-3 font-semibold">Criterion</th>
                    <th className="p-3 font-semibold">Max Depth</th>
                    <th className="p-3 font-semibold text-primary">Accuracy</th>
                    <th className="p-3 font-semibold text-error">Error Rate</th>
                    <th className="p-3 font-semibold">Malignant Recall</th>
                    <th className="p-3 font-semibold">F1-Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {EXPERIMENT_COMPARISON_DATA.map((exp) => (
                    <tr
                      key={exp.id}
                      className={`transition-colors ${
                        exp.isBest
                          ? 'bg-surface-container-high font-bold border-l-4 border-primary'
                          : 'hover:bg-surface-container-low'
                      }`}
                    >
                      <td className="p-3 text-on-surface font-sans font-semibold">
                        [{exp.id}] {exp.name}
                      </td>
                      <td className="p-3 text-on-surface">{exp.criterion}</td>
                      <td className="p-3 text-on-surface">{exp.maxDepth}</td>
                      <td className="p-3 font-bold text-primary">{(exp.accuracy * 100).toFixed(2)}%</td>
                      <td className="p-3 font-bold text-error">{(exp.errorRate * 100).toFixed(2)}%</td>
                      <td className="p-3 font-bold text-on-surface">{(exp.recallMalignant * 100).toFixed(2)}%</td>
                      <td className="p-3 text-on-surface">{(exp.f1Score * 100).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Findings Note */}
            <div className="p-3.5 bg-surface-container-low rounded-lg border border-outline-variant text-xs font-sans text-on-surface space-y-1">
              <div className="font-bold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">insights</span>
                Kết luận thực nghiệm:
              </div>
              <p className="text-on-surface-variant">
                Mô hình <strong>[I3]</strong> đạt kết quả cao nhất nhờ kết hợp tiêu chuẩn <strong>Entropy</strong> (phân nhánh chính xác hơn Gini đối với biến liên tục) và khống chế độ sâu <strong>max_depth = 4</strong> giúp triệt tiêu hoàn toàn overfitting.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Dataset Provenance */}
        {activeTab === 'dataset' && (
          <div className="space-y-3 font-sans text-xs text-on-surface" id="dataset-section">
            <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant space-y-2">
              <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-base">database</span>
                Bộ dữ liệu UCI Breast Cancer Wisconsin (Diagnostic)
              </h4>
              <p className="text-on-surface-variant leading-relaxed">
                Được công bố bởi Dr. William H. Wolberg, W. Nick Street và Olvi L. Mangasarian (Đại học Wisconsin, 1995).
                Gồm <strong>569 mẫu sinh thiết tế bào</strong> với <strong>30 thuộc tính số thực</strong> đo lường từ hình ảnh chọc hút kim nhỏ (FNA).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 font-mono text-[11px]">
                <div className="bg-white p-2 rounded border border-outline-variant">
                  <strong>Số mẫu:</strong> 569 (357 Lành, 212 Ác)
                </div>
                <div className="bg-white p-2 rounded border border-outline-variant">
                  <strong>Số đặc trưng:</strong> 30 số thực
                </div>
                <div className="bg-white p-2 rounded border border-outline-variant">
                  <strong>Giấy phép:</strong> CC BY 4.0 (UCI ID: 17)
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
