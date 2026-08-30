import React, { useState } from 'react';
import {
  BreastCancerFeatures,
  FeatureCategory,
  FeatureKey,
  PresetSample,
  ModelOptionId,
} from '../../types/prediction';
import {
  FEATURE_METADATA_LIST,
  PRESET_SAMPLES,
  INITIAL_DEFAULT_FEATURES,
  MODEL_OPTIONS,
} from '../../data/featureDefinitions';

interface FeatureInputFormProps {
  features: BreastCancerFeatures;
  onChange: (features: BreastCancerFeatures) => void;
  selectedModelId: ModelOptionId;
  onModelChange: (modelId: ModelOptionId) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const FeatureInputForm: React.FC<FeatureInputFormProps> = ({
  features,
  onChange,
  selectedModelId,
  onModelChange,
  onSubmit,
  isLoading,
}) => {
  const [activeCategory, setActiveCategory] = useState<FeatureCategory>('mean');

  const handleInputChange = (key: FeatureKey, rawValue: string) => {
    const parsed = parseFloat(rawValue);
    onChange({
      ...features,
      [key]: isNaN(parsed) ? 0 : parsed,
    });
  };

  const handleApplyPreset = (preset: PresetSample) => {
    onChange({ ...preset.features });
  };

  const handleReset = () => {
    onChange({ ...INITIAL_DEFAULT_FEATURES });
  };

  const currentCategoryFeatures = FEATURE_METADATA_LIST.filter(
    (f) => f.category === activeCategory
  );

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
      {/* Header & Model Selector (Single clean row) */}
      <div className="p-stack-md border-b border-outline-variant bg-surface-bright flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-primary">data_object</span>
          <h3 className="font-headline-md text-headline-md text-on-surface">
            Dữ liệu đặc trưng sinh học (30 Features)
          </h3>
        </div>

        {/* Compact Model Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-label-mono text-on-surface-variant whitespace-nowrap">
            Mô hình:
          </label>
          <select
            value={selectedModelId}
            onChange={(e) => onModelChange(e.target.value as ModelOptionId)}
            className="border border-outline-variant rounded-lg px-2.5 py-1.5 font-label-mono text-xs text-on-surface bg-surface-container-low focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
          >
            {MODEL_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.nameVi} (Acc: {(opt.accuracy * 100).toFixed(1)}%)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant px-stack-md bg-surface-bright overflow-x-auto whitespace-nowrap">
        <button
          type="button"
          onClick={() => setActiveCategory('mean')}
          className={`px-4 py-3 font-label-mono text-label-mono transition-colors ${
            activeCategory === 'mean'
              ? 'text-primary border-b-2 border-primary font-bold'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          1. Giá trị trung bình (Mean · 10)
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('se')}
          className={`px-4 py-3 font-label-mono text-label-mono transition-colors ${
            activeCategory === 'se'
              ? 'text-primary border-b-2 border-primary font-bold'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          2. Sai số chuẩn (SE · 10)
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('worst')}
          className={`px-4 py-3 font-label-mono text-label-mono transition-colors ${
            activeCategory === 'worst'
              ? 'text-primary border-b-2 border-primary font-bold'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          3. Giá trị lớn nhất (Worst · 10)
        </button>
      </div>

      {/* Form Grid */}
      <div className="p-stack-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
          {currentCategoryFeatures.map((meta) => {
            const val = features[meta.key];
            const isInvalid = val < 0;

            return (
              <div key={meta.key} className="flex flex-col gap-1">
                <label className="font-body-md font-bold text-on-surface flex items-center justify-between">
                  <span className="truncate">
                    {meta.label.replace(/\s*\((Mean|SE|Worst)\)/i, '')} ({meta.vietnameseLabel.replace(/\s*\(Mean|SE|Worst\)/i, '')})
                  </span>
                  <span className="text-[11px] font-label-mono text-outline font-normal">
                    [{meta.unit}]
                  </span>
                </label>
                <input
                  type="number"
                  step={meta.step}
                  min="0"
                  value={val}
                  onChange={(e) => handleInputChange(meta.key, e.target.value)}
                  className="border border-outline-variant rounded-lg p-2 font-data-metric text-data-metric focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors bg-white"
                  placeholder="0.00"
                />
                {isInvalid && (
                  <span className="text-error text-xs font-label-mono flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[14px]">error</span> Phải là số dương
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Row */}
        <div className="mt-stack-lg pt-stack-md border-t border-outline-variant flex flex-wrap gap-3 items-center justify-between">
          {/* Quick presets */}
          <div className="flex gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleApplyPreset(PRESET_SAMPLES[0])}
              className="px-3 py-1.5 text-primary border border-primary rounded-lg font-label-mono text-xs hover:bg-surface-container-low transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">upload_file</span> Mẫu Lành Tính
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset(PRESET_SAMPLES[1])}
              className="px-3 py-1.5 text-primary border border-primary rounded-lg font-label-mono text-xs hover:bg-surface-container-low transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">upload_file</span> Mẫu Ác Tính
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset(PRESET_SAMPLES[2])}
              className="px-3 py-1.5 text-on-surface-variant border border-outline-variant rounded-lg font-label-mono text-xs hover:bg-surface-container-low transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">upload_file</span> Mẫu Ranh Giới
            </button>
          </div>

          {/* Form Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3.5 py-1.5 text-on-surface-variant font-label-mono text-xs hover:bg-surface-container-highest rounded-lg transition-colors flex items-center gap-1.5 border border-outline-variant"
            >
              <span className="material-symbols-outlined text-sm">refresh</span> Làm mới
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={isLoading}
              className="px-5 py-2 bg-primary text-on-primary rounded-lg font-body-md font-bold hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 text-sm"
            >
              <span className="material-symbols-outlined text-sm">memory</span>
              {isLoading ? 'Đang phân tích...' : 'Phân loại ngay'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
