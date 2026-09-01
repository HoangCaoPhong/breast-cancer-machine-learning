import React from 'react';
import { X, BookOpen, Database, ShieldAlert, Layers } from 'lucide-react';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-panel rounded-2xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-sans">
                Hướng Dẫn Sử Dụng & Nguồn Dữ Liệu
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Đồ án Machine Learning Lab 02 · Nhóm 4 HCMUS
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

        <div className="space-y-4 text-xs font-sans text-slate-300 leading-relaxed">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-teal-300 flex items-center gap-1.5">
              <Database className="w-4 h-4" /> Nguồn Gốc Dữ Liệu (Dataset Provenance)
            </h4>
            <p>
              Sử dụng bộ dữ liệu kinh điển <strong>Breast Cancer Wisconsin (Diagnostic)</strong> từ UCI Machine Learning Repository (Dataset ID 17).
              Gồm 569 mẫu bệnh phẩm chọc hút kim nhỏ (FNA) với 30 đặc trưng số thực mô tả các thuộc tính nhân tế bào.
            </p>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4" /> Cách Thử Nghiệm Nhanh
            </h4>
            <ul className="list-disc list-inside space-y-1 text-slate-400">
              <li>Nhấn các nút <strong>Mẫu Lành Tính</strong> hoặc <strong>Mẫu Ác Tính</strong> để điền sẵn 30 thông số đo đạc thực tế từ tập kiểm thử.</li>
              <li>Chuyển giữa các tab <strong>Mean</strong>, <strong>SE</strong>, <strong>Worst</strong> để tinh chỉnh từng chỉ số cụ thể.</li>
              <li>Nhấn <strong>Chạy Phân Loại</strong> để xem kết quả, xác suất dự đoán và đường đi quyết định (Decision Path).</li>
            </ul>
          </div>

          <div className="bg-amber-950/30 p-4 rounded-xl border border-amber-500/20 text-amber-200/90 space-y-2">
            <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> Lưu Ý Quan Trọng
            </h4>
            <p>
              Dự án này là bài tập môn học Cơ sở Trí tuệ Nhân tạo nhằm minh họa cơ chế hoạt động của thuật toán Cây Quyết Định (Decision Tree). Kết quả từ mô hình tuyệt đối không có giá trị thay thế bác sĩ hay các quy trình xét nghiệm y khoa lâm sàng.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-sans text-xs font-semibold transition-colors"
          >
            Đã Hiểu
          </button>
        </div>
      </div>
    </div>
  );
};
