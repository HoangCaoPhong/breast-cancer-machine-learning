import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-surface dark:bg-surface-dim docked full-width top-0 border-b border-outline-variant dark:border-outline flex justify-between items-center px-gutter h-16 w-full max-w-container-max mx-auto z-10 sticky md:hidden">
      <div className="font-headline-sm text-headline-sm font-bold text-primary dark:text-primary-fixed">
        HCMUS Lab 02
      </div>
      <div className="flex gap-4 items-center">
        <span
          className="material-symbols-outlined cursor-pointer active:opacity-80 text-on-surface-variant hover:text-primary transition-colors"
        >
          settings
        </span>
        <span
          className="material-symbols-outlined cursor-pointer active:opacity-80 text-on-surface-variant hover:text-primary transition-colors"
        >
          help
        </span>
      </div>
    </header>
  );
};
