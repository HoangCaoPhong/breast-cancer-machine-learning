import React from 'react';
import { AlertTriangle, Info } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-amber-950/40 border-y border-amber-500/20 px-4 py-2 text-xs sm:text-sm text-amber-200/90">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-sans">
            <strong className="font-semibold text-amber-300">Cảnh báo học thuật:</strong> Đây là mô hình máy học phục vụ học tập & nghiên cứu (ĐH Khoa học Tự nhiên ĐHQG-HCM). Không phải thiết bị y tế và tuyệt đối không thay thế chẩn đoán của bác sĩ chuyên khoa.
          </span>
        </div>
        <span className="hidden lg:inline-flex items-center gap-1 font-mono text-xs text-amber-300/70 shrink-0">
          <Info className="w-3.5 h-3.5" /> UCI ID: 17 (Diagnostic)
        </span>
      </div>
    </div>
  );
};
