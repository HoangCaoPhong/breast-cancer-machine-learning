import React from 'react';

export type DashboardView = 'prediction' | 'tree' | 'experiments' | 'dataset';

interface SideNavBarProps {
  activeView: DashboardView;
  onViewChange: (view: DashboardView) => void;
  onResetFeatures: () => void;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({
  activeView,
  onViewChange,
  onResetFeatures,
}) => {
  return (
    <nav className="bg-surface-container-low dark:bg-surface-container-highest docked left-0 h-full w-64 fixed top-0 flex flex-col py-stack-md z-10 hidden md:flex border-r border-outline-variant">
      {/* Brand & Logo */}
      <div className="px-gutter mb-stack-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
            <span className="material-symbols-outlined text-2xl">account_tree</span>
          </div>
          <div>
            <h1 className="font-headline-md text-sm font-bold text-on-surface">
              OncoTree Classifier
            </h1>
            <p className="font-sans text-xs text-on-surface-variant">
              Hỗ trợ Dự đoán Ung thư Vú
            </p>
          </div>
        </div>

        <button
          onClick={onResetFeatures}
          className="w-full bg-primary text-on-primary py-2 px-3 rounded-lg font-sans text-xs font-semibold hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-sm">restart_alt</span>
          Xóa dữ liệu đã nhập
        </button>
      </div>

      {/* Navigation Links */}
      <ul className="flex-1 flex flex-col space-y-1">
        <li className="w-full">
          <button
            type="button"
            onClick={() => onViewChange('prediction')}
            className={`w-full flex items-center gap-3 px-gutter py-3 font-sans text-xs text-left transition-colors ${
              activeView === 'prediction'
                ? 'text-primary font-bold border-r-4 border-primary bg-surface-container-high'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={activeView === 'prediction' ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              biotech
            </span>
            <span>1. Chẩn đoán &amp; Dự đoán</span>
          </button>
        </li>

        <li className="w-full">
          <button
            type="button"
            onClick={() => onViewChange('tree')}
            className={`w-full flex items-center gap-3 px-gutter py-3 font-sans text-xs text-left transition-colors ${
              activeView === 'tree'
                ? 'text-primary font-bold border-r-4 border-primary bg-surface-container-high'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={activeView === 'tree' ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              schema
            </span>
            <span>2. Cấu trúc Cây Quyết định</span>
          </button>
        </li>

        <li className="w-full">
          <button
            type="button"
            onClick={() => onViewChange('experiments')}
            className={`w-full flex items-center gap-3 px-gutter py-3 font-sans text-xs text-left transition-colors ${
              activeView === 'experiments'
                ? 'text-primary font-bold border-r-4 border-primary bg-surface-container-high'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={activeView === 'experiments' ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              table_chart
            </span>
            <span>3. Đánh giá &amp; So sánh Mô hình</span>
          </button>
        </li>

        <li className="w-full">
          <button
            type="button"
            onClick={() => onViewChange('dataset')}
            className={`w-full flex items-center gap-3 px-gutter py-3 font-sans text-xs text-left transition-colors ${
              activeView === 'dataset'
                ? 'text-primary font-bold border-r-4 border-primary bg-surface-container-high'
                : 'text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={activeView === 'dataset' ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              description
            </span>
            <span>4. Thông tin Bộ dữ liệu UCI</span>
          </button>
        </li>
      </ul>

      {/* Bottom Metadata */}
      <div className="mt-auto px-gutter pt-3 border-t border-outline-variant text-xs font-sans text-on-surface-variant space-y-0.5">
        <div className="font-semibold text-on-surface">Đồ án: Cây Quyết Định</div>
        <div className="text-[11px] text-outline">UCI Diagnostic Dataset #17</div>
      </div>
    </nav>
  );
};
