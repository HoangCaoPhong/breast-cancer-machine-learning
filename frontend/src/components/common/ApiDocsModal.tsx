import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

interface ApiDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiDocsModal: React.FC<ApiDocsModalProps> = ({ isOpen, onClose }) => {
  const { language, t } = useLanguage();
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
              <span className="material-symbols-outlined text-lg">api</span>
            </div>
            <div>
              <h3 className="font-bold text-base text-on-surface">{t.apiDocsTitle}</h3>
              <p className="text-xs font-sans text-on-surface-variant">
                {t.apiDocsSubtitle}
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 font-sans text-xs text-on-surface">
          {/* Quick Access to Swagger / ReDoc */}
          <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-primary flex items-center gap-1.5">
                <span className="material-symbols-outlined text-base">terminal</span>
                {language === 'vi' ? 'Cổng Tương Tác Trực Tiếp (Interactive API Explorer)' : 'Interactive OpenAPI Documentation'}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-container-high text-primary border border-outline-variant">
                Port: 3000 / 8000
              </span>
            </div>
            <p className="text-on-surface-variant leading-relaxed">
              {language === 'vi'
                ? 'FastAPI tự động sinh tài liệu chuẩn OpenAPI (Swagger UI) và ReDoc cho phép kiểm thử trực tiếp các request/response từ trình duyệt:'
                : 'FastAPI automatically generates interactive OpenAPI schemas and documentation:'}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href="/docs"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">open_in_new</span>
                {language === 'vi' ? 'Mở Swagger UI (/docs)' : 'Open Swagger UI (/docs)'}
              </a>
              <a
                href="/redoc"
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-1.5 bg-surface-container-high text-primary border border-outline-variant rounded-lg font-semibold hover:bg-surface-container-highest transition-colors inline-flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">menu_book</span>
                {language === 'vi' ? 'Mở ReDoc (/redoc)' : 'Open ReDoc (/redoc)'}
              </a>
            </div>
          </div>

          {/* Endpoint Specification Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-on-surface uppercase tracking-wider">
              {language === 'vi' ? 'Danh Sách Các Endpoint Chính' : 'Primary REST API Endpoints'}
            </h4>
            <div className="space-y-2">
              {/* Endpoint 1 */}
              <div className="p-3 bg-white rounded-lg border border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px]">
                      POST
                    </span>
                    <span className="font-mono font-semibold text-on-surface">/api/v1/predict</span>
                  </div>
                  <div className="text-[11px] text-on-surface-variant">
                    {language === 'vi'
                      ? 'Dự đoán phân loại u vú từ 30 thuộc tính số thực & truy xuất decision path.'
                      : 'Predict tumor malignancy from 30 continuous features and extract live decision path.'}
                  </div>
                </div>
                <span className="text-[11px] font-mono text-outline shrink-0">Param: model_id</span>
              </div>

              {/* Endpoint 2 */}
              <div className="p-3 bg-white rounded-lg border border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-bold text-[10px]">
                      GET
                    </span>
                    <span className="font-mono font-semibold text-on-surface">/api/v1/models</span>
                  </div>
                  <div className="text-[11px] text-on-surface-variant">
                    {language === 'vi'
                      ? 'Lấy danh sách các mô hình Cây Quyết định và cấu hình siêu tham số.'
                      : 'List available Decision Tree model variants and hyperparameter configs.'}
                  </div>
                </div>
                <span className="text-[11px] font-mono text-outline shrink-0">JSON list</span>
              </div>

              {/* Endpoint 3 */}
              <div className="p-3 bg-white rounded-lg border border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-bold text-[10px]">
                      GET
                    </span>
                    <span className="font-mono font-semibold text-on-surface">/api/v1/experiments</span>
                  </div>
                  <div className="text-[11px] text-on-surface-variant">
                    {language === 'vi'
                      ? 'Truy xuất bảng so sánh độ đo hiệu năng giữa 5 phương pháp thực nghiệm.'
                      : 'Fetch 5-experiment evaluation benchmark metrics comparison matrix.'}
                  </div>
                </div>
                <span className="text-[11px] font-mono text-outline shrink-0">JSON metrics</span>
              </div>

              {/* Endpoint 4 */}
              <div className="p-3 bg-white rounded-lg border border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-bold text-[10px]">
                      GET
                    </span>
                    <span className="font-mono font-semibold text-on-surface">/api/v1/tree-structure</span>
                  </div>
                  <div className="text-[11px] text-on-surface-variant">
                    {language === 'vi'
                      ? 'Xuất cấu trúc cây dạng cây phân cấp (Hierarchical Tree JSON).'
                      : 'Export hierarchical Decision Tree structure for visual canvas.'}
                  </div>
                </div>
                <span className="text-[11px] font-mono text-outline shrink-0">Tree Node</span>
              </div>

              {/* Endpoint 5 */}
              <div className="p-3 bg-white rounded-lg border border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono font-bold text-[10px]">
                      GET
                    </span>
                    <span className="font-mono font-semibold text-on-surface">/health</span>
                  </div>
                  <div className="text-[11px] text-on-surface-variant">
                    {language === 'vi'
                      ? 'Kiểm tra trạng thái sẵn sàng của FastAPI Server.'
                      : 'Liveness and model readiness health check.'}
                  </div>
                </div>
                <span className="text-[11px] font-mono text-emerald-600 font-semibold shrink-0">
                  {'{ "status": "ok" }'}
                </span>
              </div>
            </div>
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
