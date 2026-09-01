import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TeamMember {
  no: number;
  fullName: string;
  fullNameEn: string;
  studentId: string;
  role: string;
  roleVi: string;
  contribution: string;
  contributionVi: string;
  share: string;
}

const TEAM_MEMBERS: TeamMember[] = [
  {
    no: 1,
    fullName: 'Hoàng Cao Phong',
    fullNameEn: 'Hoang Cao Phong',
    studentId: '24127486',
    role: 'Tech Lead / ML Engineer',
    roleVi: 'Tech Lead / ML Engineer',
    contribution: 'Repository, custom tree, max_depth experiment, integration and review',
    contributionVi: 'Khởi tạo repository, cài đặt Cây quyết định từ đầu (Custom Tree), thực nghiệm max_depth, tích hợp và kiểm duyệt code',
    share: '20%',
  },
  {
    no: 2,
    fullName: 'Võ Mỹ Ngọc',
    fullNameEn: 'Vo My Ngoc',
    studentId: '24127294',
    role: 'Frontend / ML Researcher',
    roleVi: 'Frontend / ML Researcher',
    contribution: 'Prediction UI; Gini-versus-Entropy research and experiment',
    contributionVi: 'Giao diện dự đoán chẩn đoán (Prediction UI); Nghiên cứu và thực nghiệm tiêu chuẩn Gini vs Entropy',
    share: '20%',
  },
  {
    no: 3,
    fullName: 'Nguyễn Trung Kiên',
    fullNameEn: 'Nguyen Trung Kien',
    studentId: '24127068',
    role: 'Full Stack Developer',
    roleVi: 'Full Stack Developer',
    contribution: 'FastAPI, API-model integration, deployment and frontend contract support',
    contributionVi: 'FastAPI backend, tích hợp API với mô hình ML, triển khai hệ thống và hỗ trợ kết nối frontend',
    share: '20%',
  },
  {
    no: 4,
    fullName: 'Huỳnh Thái Hòa',
    fullNameEn: 'Huynh Thai Hoa',
    studentId: '24127374',
    role: 'Data Engineer',
    roleVi: 'Data Engineer',
    contribution: 'min_samples_split and min_samples_leaf experiment',
    contributionVi: 'Thực nghiệm tham số số mẫu tối thiểu (min_samples_split & min_samples_leaf)',
    share: '20%',
  },
  {
    no: 5,
    fullName: 'Lương Thiện Nhân',
    fullNameEn: 'Luong Thien Nhan',
    studentId: '24127475',
    role: 'Data Scientist',
    roleVi: 'Data Scientist',
    contribution: 'Data validation, metric definitions, evaluation and result tables',
    contributionVi: 'Kiểm định & làm sạch dữ liệu, định nghĩa hệ chỉ số đánh giá, thực nghiệm và tổng hợp bảng kết quả',
    share: '20%',
  },
];

export const AboutUsModal: React.FC<AboutUsModalProps> = ({ isOpen, onClose }) => {
  const { language, t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden"
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
                {t.aboutUsTitle}
              </h3>
              <p className="text-xs font-sans text-on-surface-variant">
                {t.aboutUsSubtitle}
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
          {/* Section 1: Group Members & Contribution (5 Members) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-primary uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">badge</span>
                {t.aboutUsTeamTableTitle}
              </h4>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold font-mono">
                {language === 'vi' ? 'Quy mô: 5 Thành viên' : '5 Core Members'}
              </span>
            </div>

            <div className="overflow-x-auto border border-outline-variant rounded-xl shadow-sm bg-white">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead className="bg-surface-bright text-on-surface font-semibold border-b border-outline-variant">
                  <tr>
                    <th className="p-3 text-center w-12">{t.colNo}</th>
                    <th className="p-3 w-48">{t.colFullName}</th>
                    <th className="p-3 w-52">{t.colRole}</th>
                    <th className="p-3">{t.colContribution}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {TEAM_MEMBERS.map((member) => (
                    <tr key={member.fullNameEn} className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="p-3 text-center font-bold text-primary">{member.no}</td>
                      <td className="p-3 font-semibold text-on-surface whitespace-nowrap">
                        {language === 'vi' ? member.fullName : member.fullNameEn}
                      </td>
                      <td className="p-3 font-medium text-on-surface-variant whitespace-nowrap">
                        {language === 'vi' ? member.roleVi : member.role}
                      </td>
                      <td className="p-3 text-on-surface-variant leading-relaxed">
                        {language === 'vi' ? member.contributionVi : member.contribution}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Project Objectives */}
          <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant space-y-2">
            <div className="font-bold text-sm text-primary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-base">psychology</span>
              {t.aboutUsObjectives}
            </div>
            <p className="text-on-surface-variant leading-relaxed">
              {language === 'vi'
                ? 'Hệ thống được phát triển nhằm mục đích nghiên cứu chuyên sâu về Thuật toán Cây Quyết định (Decision Tree Learning) ứng dụng trong phân loại chẩn đoán u vú (Lành tính vs Ác tính). Đề tài bao gồm việc tự lập trình thuật toán từ đầu, đánh giá mô hình cơ sở unpruned và đề xuất 3 phương pháp cải tiến hiệu năng thực nghiệm.'
                : 'The platform is engineered to investigate Decision Tree Learning paradigms for binary breast tumor diagnostic classification (Benign vs Malignant). The project implements a scratch recursive algorithm, compares unpruned baseline trees, and benchmarks 3 systematic hyperparameter improvement methodologies.'}
            </p>
          </div>

          {/* Section 3: Summary of the 3 Key Improvements */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-on-surface uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-primary">auto_fix_high</span>
              {t.aboutUsImprovementsTitle}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 bg-white rounded-lg border border-outline-variant space-y-1">
                <div className="font-semibold text-primary">
                  {language === 'vi' ? 'Cải tiến 1: Độ Sâu Cây' : 'Imp 1: Max Depth'}
                </div>
                <div className="text-[11px] text-on-surface-variant">
                  {language === 'vi'
                    ? 'Khống chế max_depth=3 giúp cấu trúc cây tinh gọn, dễ diễn giải và ngăn chặn hiện tượng quá khớp (Overfitting).'
                    : 'Constraining max_depth=3 simplifies tree geometry and reduces model variance.'}
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-outline-variant space-y-1">
                <div className="font-semibold text-primary">
                  {language === 'vi' ? 'Cải tiến 2: Độ Lợi Entropy' : 'Imp 2: Information Gain'}
                </div>
                <div className="text-[11px] text-on-surface-variant">
                  {language === 'vi'
                    ? 'Chuyển tiêu chuẩn phân tách sang Entropy (Information Gain) giúp tìm ngưỡng phân tách sắc nét hơn trên thuộc tính liên tục.'
                    : 'Switching to Entropy Criterion finds sharper split boundaries across continuous metrics.'}
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-outline-variant space-y-1">
                <div className="font-semibold text-primary">
                  {language === 'vi' ? 'Cải tiến 3: Điều chỉnh min_samples ⭐' : 'Imp 3: Adjusting min_samples ⭐'}
                </div>
                <div className="text-[11px] text-on-surface-variant">
                  {language === 'vi'
                    ? 'Thiết lập min_samples_split=4, leaf=2 loại bỏ các nhánh nhỏ nhiễu, đạt F1-Score cao nhất 91.25% và Recall 85.71%.'
                    : 'Configuring min_samples_split=4, leaf=2 prevents noisy isolate splits, yielding peak 91.25% F1.'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Dataset & Disclaimer */}
          <div className="p-3 bg-surface-container-high rounded-lg border border-outline-variant text-[11px] text-on-surface-variant flex items-start gap-2">
            <span className="material-symbols-outlined text-sm text-primary shrink-0 mt-0.5">verified_user</span>
            <span>
              <strong>{t.disclaimerTag}:</strong> {t.disclaimerText}
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
            {t.btnClose}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutUsModal;

