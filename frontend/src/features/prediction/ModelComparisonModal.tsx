import React from 'react';
import { EXPERIMENT_COMPARISON_DATA } from '../../data/featureDefinitions';
import { X, Trophy, GitCompare } from 'lucide-react';

interface ModelComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModelComparisonModal: React.FC<ModelComparisonModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-panel rounded-2xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <GitCompare className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-sans">
                Bảng So Sánh Các Thí Nghiệm Decision Tree (Lab 02)
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Đánh giá trên cùng bộ dữ liệu Wisconsin (Diagnostic), Stratified Split & Random Seed
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Experiment Comparison Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead className="bg-slate-900/90 text-slate-300 border-b border-slate-800">
              <tr>
                <th className="p-3.5 font-bold">Thực nghiệm / Model</th>
                <th className="p-3.5 font-bold">Criterion</th>
                <th className="p-3.5 font-bold">Max Depth</th>
                <th className="p-3.5 font-bold text-teal-300">Accuracy</th>
                <th className="p-3.5 font-bold text-rose-300">Malignant Recall</th>
                <th className="p-3.5 font-bold">F1-Score</th>
                <th className="p-3.5 font-bold">Error Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {EXPERIMENT_COMPARISON_DATA.map((exp) => {
                return (
                  <tr
                    key={exp.id}
                    className={`transition-colors ${
                      exp.isBest
                        ? 'bg-teal-950/30 border-l-4 border-teal-400'
                        : 'hover:bg-slate-900/50'
                    }`}
                  >
                    <td className="p-3.5 font-sans font-semibold text-slate-100 flex items-center gap-2">
                      {exp.isBest && (
                        <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      <span>
                        [{exp.id}] {exp.name}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-300">{exp.criterion}</td>
                    <td className="p-3.5 text-slate-300">{exp.maxDepth}</td>
                    <td className="p-3.5 font-bold text-teal-400">
                      {exp.accuracy !== null ? `${(exp.accuracy * 100).toFixed(2)}%` : '--'}
                    </td>
                    <td className="p-3.5 font-bold text-rose-400">
                      {exp.recallMalignant !== null ? `${(exp.recallMalignant * 100).toFixed(2)}%` : '--'}
                    </td>
                    <td className="p-3.5 text-slate-200">
                      {exp.f1Score !== null ? `${(exp.f1Score * 100).toFixed(2)}%` : '--'}
                    </td>
                    <td className="p-3.5 text-slate-400">
                      {exp.errorRate !== null ? `${(exp.errorRate * 100).toFixed(2)}%` : '--'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Experiment Findings Note */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 space-y-2 text-xs font-sans text-slate-300">
          <div className="flex items-center gap-2 text-teal-300 font-semibold">
            <Trophy className="w-4 h-4" />
            <span>Nhận Xét Khoa Học Từ Kết Quả Thực Nghiệm:</span>
          </div>
          <ul className="list-disc list-inside space-y-1.5 text-slate-400">
            <li>
              <strong className="text-slate-200">Giới hạn Max Depth:</strong> Giúp mô hình tránh overfit trên tập huấn luyện và tăng độ tổng quát hóa trên tập kiểm thử.
            </li>
            <li>
              <strong className="text-slate-200">Entropy vs Gini:</strong> Tiêu chuẩn Information Gain (Entropy) cho các điểm cắt phân nhánh sắc nét hơn đối với các đặc trưng liên tục về chu vi và độ lõm tế bào.
            </li>
            <li>
              <strong className="text-slate-200">Tối ưu Malignant Recall:</strong> Trong chẩn đoán ung thư, tối đa hóa Recall của lớp Ác tính (giảm thiểu False Negatives) là tiêu chí y học quan trọng nhất.
            </li>
          </ul>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-sans text-xs font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
