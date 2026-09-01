import React, { useState } from 'react';
import { ApiDocsModal } from '../common/ApiDocsModal';
import { AboutUsModal } from '../common/AboutUsModal';
import { useLanguage } from '../../context/LanguageContext';

interface TopNavbarProps {
  onResetFeatures: () => void;
  onNavigateSection: (sectionId: 'form-section' | 'details-section') => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onResetFeatures,
  onNavigateSection,
}) => {
  const [isApiDocsOpen, setIsApiDocsOpen] = useState<boolean>(false);
  const [isAboutUsOpen, setIsAboutUsOpen] = useState<boolean>(false);
  const { language, setLanguage, t } = useLanguage();

  return (
    <>
      <header className="sticky top-0 z-30 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant transition-all">
        <div className="max-w-container-max mx-auto px-gutter h-16 flex items-center justify-between gap-3">
          {/* Brand & Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <span className="material-symbols-outlined text-2xl">health_and_safety</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-headline-md text-base font-bold text-on-surface">
                  {t.brandTitle}
                </h1>
              </div>
              <p className="font-sans text-xs text-on-surface-variant hidden md:block">
                {t.brandSubtitle}
              </p>
            </div>
          </div>

          {/* Navigation Actions & Language Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <button
              type="button"
              onClick={() => onNavigateSection('form-section')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-sans font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">biotech</span>
              <span className="hidden lg:inline">{t.navDiagnose}</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateSection('details-section')}
              className="px-2.5 py-1.5 rounded-lg text-xs font-sans font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">schema</span>
              <span className="hidden lg:inline">{t.navTree}</span>
            </button>

            {/* API Docs Button */}
            <button
              type="button"
              onClick={() => setIsApiDocsOpen(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-sans font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors flex items-center gap-1.5"
              title="FastAPI Swagger UI & ReDoc"
            >
              <span className="material-symbols-outlined text-base">api</span>
              <span className="hidden sm:inline">{t.navApiDocs}</span>
            </button>

            {/* About Us Button */}
            <button
              type="button"
              onClick={() => setIsAboutUsOpen(true)}
              className="px-2.5 py-1.5 rounded-lg text-xs font-sans font-medium text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors flex items-center gap-1.5"
              title={t.navAboutUs}
            >
              <span className="material-symbols-outlined text-base">info</span>
              <span className="hidden sm:inline">{t.navAboutUs}</span>
            </button>

            {/* Language Switcher Pill (VI / EN) */}
            <div className="flex items-center bg-surface-container-low p-0.5 rounded-lg border border-outline-variant text-xs">
              <button
                type="button"
                onClick={() => setLanguage('vi')}
                className={`px-2 py-1 rounded-md font-sans text-[11px] font-bold transition-all flex items-center gap-1 ${
                  language === 'vi'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
                title="Chuyển sang Tiếng Việt"
              >
                <span>🇻🇳</span>
                <span>VI</span>
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-md font-sans text-[11px] font-bold transition-all flex items-center gap-1 ${
                  language === 'en'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
                title="Switch to English"
              >
                <span>🇬🇧</span>
                <span>EN</span>
              </button>
            </div>

            <div className="h-5 w-px bg-outline-variant mx-0.5 hidden sm:block" />

            <button
              type="button"
              onClick={onResetFeatures}
              className="px-3 py-1.5 bg-surface-container-low hover:bg-surface-container-high text-primary border border-outline-variant rounded-lg text-xs font-sans font-semibold transition-colors shadow-sm flex items-center gap-1.5"
              title={t.navReset}
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
              <span className="hidden xs:inline">{t.navReset}</span>
            </button>
          </div>
        </div>
      </header>

      {/* API Documentation Modal */}
      <ApiDocsModal
        isOpen={isApiDocsOpen}
        onClose={() => setIsApiDocsOpen(false)}
      />

      {/* About Us Modal */}
      <AboutUsModal
        isOpen={isAboutUsOpen}
        onClose={() => setIsAboutUsOpen(false)}
      />
    </>
  );
};

