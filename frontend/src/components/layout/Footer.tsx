import React from 'react';
import { Database, ExternalLink, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 border-t border-slate-800/80 bg-slate-950/60 backdrop-blur py-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-center sm:text-left">
            <span className="font-mono text-slate-300 font-medium">HCMUS · Nhóm 4 (AI Lab 02)</span>
            <span>Dataset: UCI Breast Cancer Wisconsin (Diagnostic)</span>
            <span className="font-mono">DOI: 10.24432/C5DW2B</span>
          </div>

          <div className="flex items-center gap-4 font-mono">
            <a
              href="https://archive.ics.uci.edu/dataset/17/breast-cancer-wisconsin-diagnostic"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-teal-400 transition-colors"
            >
              <Database className="w-3.5 h-3.5" />
              <span>UCI Repository</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-slate-700">|</span>
            <span className="inline-flex items-center gap-1 text-slate-400">
              <Shield className="w-3.5 h-3.5 text-teal-400" />
              <span>CC BY 4.0</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
