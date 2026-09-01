import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const DisclaimerBanner: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="bg-primary text-on-primary py-2 px-gutter text-center font-sans text-xs flex items-center justify-center gap-2">
      <span className="material-symbols-outlined text-sm">info</span>
      <span>
        <strong>{t.disclaimerTag}:</strong> {t.disclaimerText}
      </span>
    </div>
  );
};

