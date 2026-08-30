import React from 'react';
import { PredictionResponse } from '../../types/prediction';
import {
  EXPERIMENT_COMPARISON_DATA,
  FULL_DECISION_TREE_STRUCTURE,
} from '../../data/featureDefinitions';

export type DetailTab = 'tree' | 'experiments' | 'dataset';

interface TechnicalDetailsSectionProps {
  result: PredictionResponse | null;
  activeTab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
}

export const TechnicalDetailsSection: React.FC<TechnicalDetailsSectionProps> = ({
  result,
  activeTab,
  onTabChange,
}) => {
  const accuracy =
    result?.accuracy !== null && result?.accuracy !== undefined
      ? `${(result.accuracy * 100).toFixed(2)}%`
      : '--';
  const errorRate =
    result?.errorRate !== null && result?.errorRate !== undefined
      ? `${(result.errorRate * 100).toFixed(2)}%`
      : '--';
  const recall =
    result?.recallMalignant !== null && result?.recallMalignant !== undefined
      ? `${(result.recallMalignant * 100).toFixed(2)}%`
      : '--';
  const f1 =
    result?.f1Score !== null && result?.f1Score !== undefined
      ? `${(result.f1Score * 100).toFixed(2)}%`
      : '--';

  return (
    <div
      className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden"
      id="details-section"
    >
      {/* Header & Sub-tabs */}
      <div className="border-b border-outline-variant bg-surface-bright p-stack-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-primary">schema</span>
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface">
              Cơ sở Phân tích &amp; Báo cáo Thực nghiệm
            </h3>
            <p className="text-xs font-sans text-on-surface-variant">
              Trực quan hóa cấu trúc cây quyết định, bảng đối chiếu hiệu năng giữa các phương pháp và hồ sơ dữ liệu
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-1.5 overflow-x-auto bg-surface-container-low p-1 rounded-lg border border-outline-variant">
          <button
            type="button"
            onClick={() => onTabChange('tree')}
            className={`px-3 py-1.5 font-sans text-xs rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'tree'
                ? 'bg-white text-primary font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-sm">account_tree</span>
            Cấu trúc Cây Quyết định
          </button>
          <button
            type="button"
            onClick={() => onTabChange('experiments')}
            className={`px-3 py-1.5 font-sans text-xs rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'experiments'
                ? 'bg-white text-primary font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-sm">table_chart</span>
            So sánh Các Phương pháp
          </button>
          <button
            type="button"
            onClick={() => onTabChange('dataset')}
            className={`px-3 py-1.5 font-sans text-xs rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'dataset'
                ? 'bg-white text-primary font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-sm">description</span>
            Hồ sơ Bộ dữ liệu
          </button>
        </div>
      </div>

      <div className="p-stack-md">
        {/* Tab 1: Full Tree Diagram */}
        {activeTab === 'tree' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-sans text-on-surface-variant">
                Độ sâu giới hạn: 4 tầng · Tiêu chuẩn phân hoạch: Độ lợi thông tin (Information Gain / Entropy)
              </span>
              <div className="flex items-center gap-2 text-xs font-sans">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-surface-container-highest text-tertiary-container font-semibold">
                  ● Nhóm Lành tính
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-error-container text-error font-semibold">
                  ● Nhóm Ác tính
                </span>
              </div>
            </div>

            {/* Hierarchical Tree Box */}
            <div className="overflow-x-auto bg-surface-container-low border border-outline-variant rounded-xl p-5 font-sans text-xs space-y-4">
              {/* Level 0: Root */}
              <div className="flex flex-col items-center">
                <div className="bg-white border-2 border-primary rounded-lg p-3 text-center shadow-sm max-w-sm w-full">
                  <div className="font-bold text-primary text-sm">
                    Nút gốc: Chu vi lớn nhất (perimeter_worst) ≤ {FULL_DECISION_TREE_STRUCTURE.threshold} mm
                  </div>
                  <div className="text-on-surface-variant text-[11px] mt-0.5 font-mono">
                    {FULL_DECISION_TREE_STRUCTURE.criterion} · Tổng số mẫu = {FULL_DECISION_TREE_STRUCTURE.samples}
                  </div>
                  <div className="text-[11px] text-on-surface font-medium mt-0.5">
                    Phân phối mẫu: [Lành tính: {FULL_DECISION_TREE_STRUCTURE.values?.[0]}, Ác tính: {FULL_DECISION_TREE_STRUCTURE.values?.[1]}]
                  </div>
                </div>
                <div className="w-0.5 h-6 bg-outline-variant my-1" />
              </div>

              {/* Level 1: Subtrees */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Subtree (<= 105.95) */}
                <div className="flex flex-col items-center bg-white/80 p-4 rounded-xl border border-outline-variant">
                  <span className="text-[11px] font-semibold text-tertiary-container mb-2 bg-surface-container-highest px-2.5 py-0.5 rounded">
                    Nhánh Trái: Chu vi lớn nhất ≤ 105.95 mm (Khuynh hướng lành tính)
                  </span>
                  <div className="bg-white border border-outline-variant rounded-lg p-2.5 text-center w-full">
                    <div className="font-bold text-on-surface">
                      Điểm lõm lớn nhất (concave_points_worst) ≤ 0.1357
                    </div>
                    <div className="text-[11px] text-on-surface-variant mt-0.5 font-mono">
                      Tổng số mẫu = 290 · [Lành: 275, Ác: 15]
                    </div>
                  </div>

                  {/* Level 2 Left Leaves */}
                  <div className="grid grid-cols-2 gap-3 mt-3 w-full">
                    <div className="bg-surface-container-highest border border-tertiary-container rounded-lg p-2.5 text-center">
                      <div className="font-bold text-tertiary-container">Kết luận: Lành tính</div>
                      <div className="text-[11px] text-on-surface-variant mt-0.5">268 trường hợp</div>
                    </div>
                    <div className="bg-error-container border border-error rounded-lg p-2.5 text-center">
                      <div className="font-bold text-error">Kết luận: Ác tính</div>
                      <div className="text-[11px] text-on-surface-variant mt-0.5">15 trường hợp</div>
                    </div>
                  </div>
                </div>

                {/* Right Subtree (> 105.95) */}
                <div className="flex flex-col items-center bg-white/80 p-4 rounded-xl border border-outline-variant">
                  <span className="text-[11px] font-semibold text-error mb-2 bg-error-container px-2.5 py-0.5 rounded">
                    Nhánh Phải: Chu vi lớn nhất &gt; 105.95 mm (Khuynh hướng ác tính)
                  </span>
                  <div className="bg-white border border-outline-variant rounded-lg p-2.5 text-center w-full">
                    <div className="font-bold text-on-surface">
                      Điểm lõm lớn nhất (concave_points_worst) ≤ 0.1472
                    </div>
                    <div className="text-[11px] text-on-surface-variant mt-0.5 font-mono">
                      Tổng số mẫu = 165 · [Lành: 10, Ác: 155]
                    </div>
                  </div>

                  {/* Level 2 Right Leaves */}
                  <div className="grid grid-cols-2 gap-3 mt-3 w-full">
                    <div className="bg-surface-container-highest border border-outline-variant rounded-lg p-2.5 text-center">
                      <div className="font-bold text-on-surface">Độ nhám ≤ 25.67</div>
                      <div className="text-[11px] text-on-surface-variant mt-0.5">25 trường hợp phân hóa</div>
                    </div>
                    <div className="bg-error-container border border-error rounded-lg p-2.5 text-center">
                      <div className="font-bold text-error">Kết luận: Ác tính cao</div>
                      <div className="text-[11px] text-on-surface-variant mt-0.5">140 trường hợp (100%)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: 5-Experiment Comparison */}
        {activeTab === 'experiments' && (
          <div className="space-y-4">
            {/* Quick KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant text-center">
                <div className="font-sans text-xs text-on-surface-variant font-medium">Độ chính xác toàn cục</div>
                <div className="font-mono text-lg font-bold text-primary mt-1">{accuracy}</div>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant text-center">
                <div className="font-sans text-xs text-on-surface-variant font-medium">Tỷ lệ phân loại sai</div>
                <div className="font-mono text-lg font-bold text-error mt-1">{errorRate}</div>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant text-center">
                <div className="font-sans text-xs text-on-surface-variant font-medium">Độ nhạy Ác tính (Recall)</div>
                <div className="font-mono text-lg font-bold text-primary mt-1">{recall}</div>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant text-center">
                <div className="font-sans text-xs text-on-surface-variant font-medium">Điểm tổng hòa F1</div>
                <div className="font-mono text-lg font-bold text-primary mt-1">{f1}</div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-outline-variant rounded-xl">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead className="bg-surface-bright text-on-surface font-semibold border-b border-outline-variant">
                  <tr>
                    <th className="p-3">Phương pháp / Mô hình</th>
                    <th className="p-3">Tiêu chuẩn phân hoạch</th>
                    <th className="p-3">Độ sâu tối đa</th>
                    <th className="p-3 text-primary">Độ chính xác (Accuracy)</th>
                    <th className="p-3 text-error">Tỷ lệ lỗi (Error Rate)</th>
                    <th className="p-3">Độ nhạy Ác tính (Recall)</th>
                    <th className="p-3">F1-Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant font-mono">
                  {EXPERIMENT_COMPARISON_DATA.map((exp) => (
                    <tr
                      key={exp.id}
                      className={`transition-colors ${
                        exp.isBest
                          ? 'bg-surface-container-high font-bold border-l-4 border-primary'
                          : 'hover:bg-surface-container-low'
                      }`}
                    >
                      <td className="p-3 text-on-surface font-sans font-medium">
                        {exp.name}
                      </td>
                      <td className="p-3 text-on-surface font-sans">{exp.criterion}</td>
                      <td className="p-3 text-on-surface">{exp.maxDepth}</td>
                      <td className="p-3 font-bold text-primary">
                        {exp.accuracy !== null ? `${(exp.accuracy * 100).toFixed(2)}%` : '--'}
                      </td>
                      <td className="p-3 font-bold text-error">
                        {exp.errorRate !== null ? `${(exp.errorRate * 100).toFixed(2)}%` : '--'}
                      </td>
                      <td className="p-3 font-bold text-on-surface">
                        {exp.recallMalignant !== null ? `${(exp.recallMalignant * 100).toFixed(2)}%` : '--'}
                      </td>
                      <td className="p-3 text-on-surface">
                        {exp.f1Score !== null ? `${(exp.f1Score * 100).toFixed(2)}%` : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Findings Note */}
            <div className="p-3.5 bg-surface-container-low rounded-lg border border-outline-variant text-xs font-sans text-on-surface space-y-1">
              <div className="font-bold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">insights</span>
                Phương pháp đánh giá học thuật:
              </div>
              <p className="text-on-surface-variant leading-relaxed">
                Tất cả mô hình được huấn luyện và kiểm thử độc lập trên cùng phân chia phân tầng (Stratified Train/Test Split 70/30) với Random Seed cố định để đảm bảo tính khách quan và khả năng tái lập kết quả.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Dataset Provenance */}
        {activeTab === 'dataset' && (
          <div className="space-y-4 font-sans text-xs text-on-surface">
            <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant space-y-3">
              <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-base">storage</span>
                Bộ Dữ Liệu UCI Breast Cancer Wisconsin (Diagnostic)
              </h4>
              <p className="text-on-surface-variant leading-relaxed">
                Được công bố bởi <strong>Dr. William H. Wolberg, W. Nick Street và Olvi L. Mangasarian</strong> (Đại học Wisconsin, 1995).
                Bộ dữ liệu bao gồm <strong>569 mẫu sinh thiết</strong> với <strong>30 thuộc tính số thực</strong> đo lường đặc điểm hình học của nhân tế bào ung thư vú.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans text-xs">
                <div className="bg-white p-3 rounded-lg border border-outline-variant">
                  <div className="text-on-surface-variant text-[11px] font-medium">Quy mô mẫu</div>
                  <div className="font-bold text-primary text-sm mt-0.5">569 trường hợp</div>
                  <div className="text-[11px] text-outline mt-0.5">357 Lành tính (B) · 212 Ác tính (M)</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-outline-variant">
                  <div className="text-on-surface-variant text-[11px] font-medium">Không gian đặc trưng</div>
                  <div className="font-bold text-primary text-sm mt-0.5">30 thuộc tính liên tục</div>
                  <div className="text-[11px] text-outline mt-0.5">10 Giá trị trung bình · 10 Sai số · 10 Cực đại</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-outline-variant">
                  <div className="text-on-surface-variant text-[11px] font-medium">Nguồn gốc &amp; Bản quyền</div>
                  <div className="font-bold text-primary text-sm mt-0.5">UCI ID: #17</div>
                  <div className="text-[11px] text-outline mt-0.5">Giấy phép mở: CC BY 4.0</div>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-outline-variant text-[11px] font-sans text-on-surface-variant">
                <strong>Trích dẫn khoa học:</strong> Wolberg, W., Street, W., &amp; Mangasarian, O. (1995). Breast Cancer Wisconsin (Diagnostic). UCI Machine Learning Repository. https://doi.org/10.24432/C5DW2B.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
