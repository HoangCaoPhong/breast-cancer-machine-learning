import React from 'react';
import { Activity, GitCompare, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onOpenComparison: () => void;
  onOpenGuide: () => void;
  isBackendConnected: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenComparison,
  onOpenGuide,
  isBackendConnected,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Identity */}
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500/20 to-indigo-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-glow-teal">
              <Activity className="w-5 h-5 animate-pulse-subtle" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-white font-sans">
                  OncoTree Diagnostic
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium font-mono bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  Lab 02
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans hidden sm:block">
                Breast Cancer Decision Tree Classifier · HCMUS AI
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-2.5 sm:space-x-4">
            {/* Backend Status indicator */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-900 border border-slate-800">
              <span
                className={`w-2 h-2 rounded-full ${
                  isBackendConnected ? 'bg-emerald-400 animate-ping' : 'bg-teal-400'
                }`}
              />
              <span className="text-slate-300 hidden md:inline">
                {isBackendConnected ? 'FastAPI Active' : 'ML Engine Standalone'}
              </span>
            </div>

            {/* Model Comparison Button */}
            <button
              onClick={onOpenComparison}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-all hover:border-teal-500/40 shadow-sm active:scale-95"
            >
              <GitCompare className="w-3.5 h-3.5 text-teal-400" />
              <span>Thực nghiệm (Experiments)</span>
            </button>

            {/* Guide Button */}
            <button
              onClick={onOpenGuide}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors"
              title="Hướng dẫn & Dataset provenance"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
