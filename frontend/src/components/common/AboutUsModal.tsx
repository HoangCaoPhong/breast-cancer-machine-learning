import React from 'react';

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutUsModal: React.FC<AboutUsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-outline-variant bg-surface-bright flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm">
              <span className="material-symbols-outlined text-lg">info</span>
            </div>
            <div>
              <h3 className="font-bold text-base text-on-surface">Về Dự Án (About Us)</h3>
              <p className="text-xs font-sans text-on-surface-variant">
                Đồ án Nghiên cứu &amp; Ứng dụng Machine Learning
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 font-sans text-xs text-on-surface leading-relaxed">
          {/* Project Banner Card */}
          <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant space-y-2">
            <div className="font-bold text-sm text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">psychology</span>
              Hệ Thống Phân Loại &amp; Trực Quan Hóa Cây Quyết Định Ung Thư Vú
            </div>
            <p className="text-on-surface-variant">
              Dự án được phát triển nhằm mục đích nghiên cứu chuyên sâu về thuật toán <strong>Cây Quyết định (Decision Tree Classifier)</strong>, kiểm thử khả năng tự lập trình thuật toán từ con số 0 (from scratch) và tối ưu hóa các siêu tham số phân loại trên tập dữ liệu y sinh học thực tế.
            </p>
          </div>

          {/* Research Objectives */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-on-surface uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-primary">flag</span>
              Mục Tiêu Nghiên Cứu Chính
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="p-3 bg-white rounded-lg border border-outline-variant space-y-1">
                <div className="font-semibold text-primary">1. Cài đặt thuật toán thuần (From Scratch)</div>
                <div className="text-[11px] text-on-surface-variant">
                  Xây dựng thuật toán phân hoạch không phụ thuộc thư viện có sẵn để hiểu rõ cơ chế tính toán Information Gain / Gini Impurity.
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-outline-variant space-y-1">
                <div className="font-semibold text-primary">2. Tối ưu hóa siêu tham số</div>
                <div className="text-[11px] text-on-surface-variant">
                  Khống chế độ sâu tối đa (max_depth), so sánh Entropy vs Gini, và tinh chỉnh min_samples_split / leaf nhằm chống overfitting.
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-outline-variant space-y-1">
                <div className="font-semibold text-primary">3. Nền tảng Web Trực quan hóa</div>
                <div className="text-[11px] text-on-surface-variant">
                  Xây dựng giao diện tương tác Full-stack (React + FastAPI) hỗ trợ truy vết từng bước rẽ nhánh suy luận (Decision Path).
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-outline-variant space-y-1">
                <div className="font-semibold text-primary">4. Đánh giá đa độ đo y khoa</div>
                <div className="text-[11px] text-on-surface-variant">
                  Đối chiếu toàn diện giữa Accuracy, Precision, Recall (Độ nhạy ác tính) và F1-Score trên cùng phân chia Stratified 70/30.
                </div>
              </div>
            </div>
          </div>

          {/* Dataset Provenance */}
          <div className="p-3.5 bg-white rounded-lg border border-outline-variant space-y-1 text-[11px]">
            <div className="font-bold text-on-surface flex items-center gap-1.5 text-xs">
              <span className="material-symbols-outlined text-sm text-primary">storage</span>
              Tập Dữ Liệu Tham Chiếu
            </div>
            <div className="text-on-surface-variant">
              <strong>UCI Breast Cancer Wisconsin (Diagnostic) Dataset (ID #17)</strong> · 569 mẫu bệnh phẩm · 30 thuộc tính số thực trích xuất từ ảnh số hóa của sinh thiết chọc hút kim nhỏ (FNA).
            </div>
          </div>

          {/* Academic Disclaimer Note */}
          <div className="p-3 bg-surface-container-high rounded-lg border border-outline-variant text-[11px] text-on-surface-variant flex items-start gap-2">
            <span className="material-symbols-outlined text-sm text-primary shrink-0 mt-0.5">verified_user</span>
            <span>
              <strong>Lưu ý học thuật:</strong> Ứng dụng này được thiết kế phục vụ mục đích nghiên cứu và giáo dục trong khuôn khổ môn học Machine Learning, không cấu thành lời khuyên hay quyết định chẩn đoán y tế.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-outline-variant bg-surface-bright flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
