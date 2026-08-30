import React from 'react';
import { PredictionResponse } from '../../types/prediction';

interface PredictionResultCardProps {
  result: PredictionResponse | null;
  isLoading: boolean;
}

export const PredictionResultCard: React.FC<PredictionResultCardProps> = ({
  result: _result,
  isLoading,
}) => {
  return (
    <div className="space-y-gutter">
      {/* Result State Card */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm flex flex-col">
        <div className="p-stack-md border-b border-outline-variant bg-surface-bright flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">health_and_safety</span>
            <h3 className="font-headline-md text-headline-md text-on-surface">Kết quả chẩn đoán</h3>
          </div>
          <span className="font-sans text-[11px] text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded border border-outline-variant">
            Chờ nạp dataset
          </span>
        </div>

        <div className="p-stack-md flex flex-col space-y-4">
          {/* Main Status Pill */}
          <div className="text-center py-3">
            {isLoading ? (
              <div className="inline-block bg-surface-container-high text-primary px-6 py-3 rounded-full font-sans text-sm font-semibold border border-primary mb-2">
                Đang kiểm tra kết nối...
              </div>
            ) : (
              <div className="inline-block bg-surface-container-low text-on-surface-variant px-6 py-2.5 rounded-full font-sans text-sm border border-outline-variant mb-2">
                Chờ cung cấp dataset &amp; mô hình chính thức
              </div>
            )}

            <p className="font-sans text-xs text-on-surface-variant flex items-center justify-center gap-1 mt-1">
              <span className="material-symbols-outlined text-sm text-primary">verified</span>
              Mức độ tin cậy của thuật toán: <strong>--</strong>
            </p>
          </div>

          {/* Probability Distribution */}
          <div className="space-y-3 border-t border-outline-variant pt-stack-md">
            <h4 className="font-sans text-xs text-on-surface-variant font-semibold uppercase tracking-wider">
              Xác suất ước tính theo phân lớp
            </h4>
            <div>
              <div className="flex justify-between font-sans text-xs mb-1">
                <span className="text-error font-medium">Khối u Ác tính</span>
                <span className="font-mono font-bold">--%</span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-2">
                <div className="bg-error h-2 rounded-full transition-all duration-500 w-0" />
              </div>
            </div>
            <div>
              <div className="flex justify-between font-sans text-xs mb-1">
                <span className="text-tertiary-container font-medium">Khối u Lành tính</span>
                <span className="font-mono font-bold">--%</span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-2">
                <div className="bg-tertiary-container h-2 rounded-full transition-all duration-500 w-0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
