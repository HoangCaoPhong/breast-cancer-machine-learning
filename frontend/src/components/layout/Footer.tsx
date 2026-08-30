import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-container-lowest dark:bg-on-background border-t border-outline-variant dark:border-outline docked full-width bottom-0 w-full py-stack-md px-gutter flex justify-between items-center max-w-container-max mx-auto mt-auto">
      <div className="font-label-mono text-label-mono text-on-surface-variant dark:text-outline-variant">
        © 2024 HCMUS Lab 02. Institutional Use Only.
      </div>
      <div className="flex gap-4">
        <a
          className="font-label-mono text-label-mono text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed opacity-90 hover:opacity-100"
          href="#disclaimer"
        >
          Academic Disclaimer
        </a>
        <a
          className="font-label-mono text-label-mono text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed opacity-90 hover:opacity-100"
          href="#privacy"
        >
          Privacy Protocol
        </a>
        <a
          className="font-label-mono text-label-mono text-on-surface-variant dark:text-outline-variant hover:text-primary dark:hover:text-primary-fixed opacity-90 hover:opacity-100"
          href="#ethics"
        >
          Data Ethics
        </a>
      </div>
    </footer>
  );
};
