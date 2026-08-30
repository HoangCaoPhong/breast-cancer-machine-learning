import React from 'react';

interface TopNavbarProps {
  onResetFeatures: () => void;
  onNavigateSection: (sectionId: 'form-section' | 'details-section') => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onResetFeatures,
  onNavigateSection,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant transition-all">
      <div className="max-w-container-max mx-auto px-gutter h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
            <span className="material-symbols-outlined text-2xl">health_and_safety</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline-md text-base font-bold text-on-surface">
                Breast Cancer Diagnostic
              </h1>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[11px] font-sans font-medium bg-surface-container-high text-primary border border-outline-variant">
                Lab 2 · UCI Dataset #17
              </span>
            </div>
            <p className="font-sans text-xs text-on-surface-variant hidden xs:block">
              Hệ thống Dự đoán &amp; Trực quan hóa Cây Quyết định Ung thư Vú
            </p>
          </div>
        </div>

        {/* Navigation Actions (Horizontal) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => onNavigateSection('form-section')}
            className="px-3 py-1.5 rounded-lg text-xs font-sans font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">biotech</span>
            <span className="hidden md:inline">Nhập liệu &amp; Chẩn đoán</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateSection('details-section')}
            className="px-3 py-1.5 rounded-lg text-xs font-sans font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">schema</span>
            <span className="hidden md:inline">Cây Quyết định &amp; Báo cáo</span>
          </button>

          <div className="h-5 w-px bg-outline-variant mx-1 hidden sm:block" />

          <button
            type="button"
            onClick={onResetFeatures}
            className="px-3.5 py-1.5 bg-surface-container-low hover:bg-surface-container-high text-primary border border-outline-variant rounded-lg text-xs font-sans font-semibold transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">restart_alt</span>
            <span>Đặt lại dữ liệu</span>
          </button>
        </div>
      </div>
    </header>
  );
};
