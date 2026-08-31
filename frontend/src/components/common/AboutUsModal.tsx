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
        className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-outline-variant bg-surface-bright flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <span className="material-symbols-outlined text-xl">groups</span>
            </div>
            <div>
              <h3 className="font-bold text-base text-on-surface">
                Thông Tin Nhóm &amp; Báo Cáo Đồ Án (About Us)
              </h3>
              <p className="text-xs font-sans text-on-surface-variant">
                Giới thiệu thành viên &amp; Phân công nhiệm vụ
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 font-sans text-xs text-on-surface leading-relaxed">
          {/* Section 1: Group Members & Contribution (5 Member Slots) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-primary uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">badge</span>
                Danh Sách Thành Viên &amp; Phân Công Nhiệm Vụ
              </h4>
              <span className="text-[11px] px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-mono">
                Quy mô: 5 Thành viên
              </span>
            </div>

            <div className="overflow-x-auto border border-outline-variant rounded-xl shadow-sm">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead className="bg-surface-bright text-on-surface font-semibold border-b border-outline-variant">
                  <tr>
                    <th className="p-3 text-center w-12">STT</th>
                    <th className="p-3 w-44">Họ và Tên</th>
                    <th className="p-3 w-32">Mã Số SV (MSSV)</th>
                    <th className="p-3">Nhiệm Vụ Đảm Nhận &amp; Đóng Góp</th>
                    <th className="p-3 text-center w-24">Đóng góp (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {/* Member 1 */}
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="p-3 text-center font-bold text-primary">1</td>
                    <td className="p-3 font-semibold text-on-surface">
                      Thành viên 1
                    </td>
                    <td className="p-3 font-mono text-on-surface-variant">
                      .....................
                    </td>
                    <td className="p-3 text-on-surface-variant font-mono">
                      ----
                    </td>
                    <td className="p-3 text-center font-bold text-primary">--</td>
                  </tr>

                  {/* Member 2 */}
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="p-3 text-center font-bold text-primary">2</td>
                    <td className="p-3 font-semibold text-on-surface">
                      Thành viên 2
                    </td>
                    <td className="p-3 font-mono text-on-surface-variant">
                      .....................
                    </td>
                    <td className="p-3 text-on-surface-variant font-mono">
                      ----
                    </td>
                    <td className="p-3 text-center font-bold text-primary">--</td>
                  </tr>

                  {/* Member 3 */}
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="p-3 text-center font-bold text-primary">3</td>
                    <td className="p-3 font-semibold text-on-surface">
                      Thành viên 3
                    </td>
                    <td className="p-3 font-mono text-on-surface-variant">
                      .....................
                    </td>
                    <td className="p-3 text-on-surface-variant font-mono">
                      ----
                    </td>
                    <td className="p-3 text-center font-bold text-primary">--</td>
                  </tr>

                  {/* Member 4 */}
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="p-3 text-center font-bold text-primary">4</td>
                    <td className="p-3 font-semibold text-on-surface">
                      Thành viên 4
                    </td>
                    <td className="p-3 font-mono text-on-surface-variant">
                      .....................
                    </td>
                    <td className="p-3 text-on-surface-variant font-mono">
                      ----
                    </td>
                    <td className="p-3 text-center font-bold text-primary">--</td>
                  </tr>

                  {/* Member 5 */}
                  <tr className="hover:bg-surface-container-low transition-colors">
                    <td className="p-3 text-center font-bold text-primary">5</td>
                    <td className="p-3 font-semibold text-on-surface">
                      Thành viên 5
                    </td>
                    <td className="p-3 font-mono text-on-surface-variant">
                      .....................
                    </td>
                    <td className="p-3 text-on-surface-variant font-mono">
                      ----
                    </td>
                    <td className="p-3 text-center font-bold text-primary">--</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Project Objectives */}
          <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant space-y-2">
            <div className="font-bold text-sm text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">psychology</span>
              Tổng Quan Đề Tài &amp; Mục Tiêu Nghiên Cứu
            </div>
            <p className="text-on-surface-variant leading-relaxed">
              Hệ thống được phát triển nhằm mục đích nghiên cứu chuyên sâu về <strong>Thuật toán Cây Quyết định (Decision Tree Learning)</strong> ứng dụng trong phân loại chẩn đoán u vú (Lành tính vs Ác tính). Đề tài bao gồm việc tự lập trình thuật toán từ đầu, đánh giá mô hình cơ sở unpruned và đề xuất <strong>3 phương pháp cải tiến</strong> hiệu năng thực nghiệm.
            </p>
          </div>

          {/* Section 3: Summary of the 3 Key Improvements */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-on-surface uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-primary">auto_fix_high</span>
              Tóm Tắt 3 Phương Pháp Cải Tiến Đã Thực Hiện
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 bg-white rounded-lg border border-outline-variant space-y-1">
                <div className="font-semibold text-primary">Cải tiến 1: Độ Sâu Cây</div>
                <div className="text-[11px] text-on-surface-variant">
                  Khống chế <code className="font-mono text-primary font-bold">max_depth=3</code> giúp cấu trúc cây tinh gọn, dễ diễn giải và ngăn chặn hiện tượng quá khớp (Overfitting).
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-outline-variant space-y-1">
                <div className="font-semibold text-primary">Cải tiến 2: Độ Lợi Entropy</div>
                <div className="text-[11px] text-on-surface-variant">
                  Chuyển tiêu chuẩn phân tách sang <code className="font-mono text-primary font-bold">Entropy (Information Gain)</code> giúp tìm ngưỡng phân tách sắc nét hơn trên thuộc tính liên tục.
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-outline-variant space-y-1">
                <div className="font-semibold text-primary">Cải tiến 3: Cắt Tỉa Nhánh (Tốt nhất)</div>
                <div className="text-[11px] text-on-surface-variant">
                  Thiết lập <code className="font-mono text-primary font-bold">min_samples_split=4, leaf=2</code> loại bỏ các nhánh nhỏ nhiễu, đạt F1-Score cao nhất <strong>91.25%</strong> và Recall <strong>85.71%</strong>.
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Dataset & Disclaimer */}
          <div className="p-3 bg-surface-container-high rounded-lg border border-outline-variant text-[11px] text-on-surface-variant flex items-start gap-2">
            <span className="material-symbols-outlined text-sm text-primary shrink-0 mt-0.5">verified_user</span>
            <span>
              <strong>Lưu ý học thuật:</strong> Ứng dụng này được thiết kế phục vụ mục đích nghiên cứu và giáo dục trong khuôn khổ môn học Machine Learning, không cấu thành lời khuyên hay quyết định chẩn đoán y tế lâm sàng.
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

export default AboutUsModal;
