import React from 'react';
import { PredictionResponse } from '../../types/prediction';
import {
  ShieldAlert,
  ShieldCheck,
  Percent,
  Cpu,
  Clock,
  Info,
  Microscope,
} from 'lucide-react';

interface PredictionResultCardProps {
  result: PredictionResponse | null;
  isLoading: boolean;
}

export const PredictionResultCard: React.FC<PredictionResultCardProps> = ({
  result,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 shadow-2xl flex flex-col items-center justify-center min-h-[380px] space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 animate-pulse">
            <Microscope className="w-8 h-8 animate-bounce" />
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-teal-500/20 blur-sm -z-10 animate-pulse" />
        </div>
        <div className="text-center">
          <h3 className="text-base font-bold text-white font-sans">
            Mô Hình Đang Duyệt Cây Quyết Định...
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Đánh giá 30 chỉ số tế bào học qua các ngưỡng phân nhánh
          </p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 shadow-2xl flex flex-col items-center justify-center min-h-[380px] text-center space-y-3">
        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
          <Microscope className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-300 font-sans">
          Chưa Có Kết Quả Phân Loại
        </h3>
        <p className="text-xs text-slate-400 font-sans max-w-xs">
          Vui lòng chọn mẫu thử hoặc nhập 30 thông số tế bào học ở bảng bên trái, sau đó nhấn{' '}
          <strong className="text-teal-400">"Chạy Phân Loại"</strong>.
        </p>
      </div>
    );
  }

  const isMalignant = result.prediction === 'M';
  const malignantPercentage = (result.probabilities.malignant * 100).toFixed(1);
  const benignPercentage = (result.probabilities.benign * 100).toFixed(1);

  return (
    <div
      className={`glass-panel rounded-2xl overflow-hidden shadow-2xl border transition-all ${
        isMalignant
          ? 'border-rose-500/40 shadow-glow-rose'
          : 'border-emerald-500/40 shadow-glow-emerald'
      }`}
    >
      {/* Result Status Header */}
      <div
        className={`p-6 border-b flex items-center justify-between ${
          isMalignant
            ? 'bg-rose-950/30 border-rose-500/20'
            : 'bg-emerald-950/30 border-emerald-500/20'
        }`}
      >
        <div className="flex items-center space-x-3.5">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              isMalignant
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {isMalignant ? (
              <ShieldAlert className="w-7 h-7 animate-pulse" />
            ) : (
              <ShieldCheck className="w-7 h-7" />
            )}
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
              Kết Quả Phân Loại Mô Hình
            </span>
            <h3
              className={`text-xl sm:text-2xl font-extrabold font-sans tracking-tight ${
                isMalignant ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {result.diagnosisLabelVi}
            </h3>
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="text-right">
          <span className="text-[11px] font-mono text-slate-400 block">Độ tin cậy</span>
          <span className="text-lg font-bold font-mono text-white">
            {(result.confidence * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Probabilities Distribution */}
      <div className="p-6 space-y-5">
        <div>
          <div className="flex justify-between items-center text-xs font-mono mb-2">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Percent className="w-3.5 h-3.5 text-teal-400" />
              Phân Phối Xác Suất Hai Lớp (Class Probability)
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Malignant Probability Bar */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-rose-300 font-semibold">Ác tính (Malignant)</span>
                <span className="text-rose-300 font-bold">{malignantPercentage}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-rose-600 to-rose-400 h-2.5 rounded-full transition-all duration-700"
                  style={{ width: `${malignantPercentage}%` }}
                />
              </div>
            </div>

            {/* Benign Probability Bar */}
            <div>
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className="text-emerald-300 font-semibold">Lành tính (Benign)</span>
                <span className="text-emerald-300 font-bold">{benignPercentage}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div
                  className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-2.5 rounded-full transition-all duration-700"
                  style={{ width: `${benignPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Cellular Summary */}
        <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200 font-sans">
            <Info className="w-4 h-4 text-teal-400 shrink-0" />
            <span>Ý Nghĩa Hình Thái Học Tế Bào</span>
          </div>
          <p className="text-xs text-slate-300 font-sans leading-relaxed">
            {isMalignant
              ? 'Tế bào có đặc trưng chu vi lớn (perimeter worst) và nhiều điểm lõm bất thường (concave points), đây là các dấu hiệu phân nhánh mạnh dẫn đến kết luận ác tính trong cây quyết định.'
              : 'Tế bào duy trì tính đồng nhất cao, bán kính và diện tích trong khoảng an toàn, không xuất hiện các biến dạng cấu trúc nhân nghiêm trọng.'}
          </p>
        </div>

        {/* Metadata Footer */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-teal-400" />
            <span>{result.modelVersion}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{new Date(result.timestamp).toLocaleTimeString('vi-VN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
