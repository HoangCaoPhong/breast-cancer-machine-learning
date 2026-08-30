import React, { useState } from 'react';
import {
  BreastCancerFeatures,
  FeatureCategory,
  FeatureKey,
  PresetSample,
} from '../../types/prediction';
import {
  FEATURE_METADATA_LIST,
  PRESET_SAMPLES,
  INITIAL_DEFAULT_FEATURES,
} from '../../data/featureDefinitions';
import {
  Sparkles,
  RotateCcw,
  Play,
  CheckCircle2,
  AlertCircle,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface FeatureInputFormProps {
  features: BreastCancerFeatures;
  onChange: (features: BreastCancerFeatures) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const FeatureInputForm: React.FC<FeatureInputFormProps> = ({
  features,
  onChange,
  onSubmit,
  isLoading,
}) => {
  const [activeCategory, setActiveCategory] = useState<FeatureCategory>('mean');
  const [activePresetId, setActivePresetId] = useState<string | null>(PRESET_SAMPLES[0].id);

  const handleInputChange = (key: FeatureKey, rawValue: string) => {
    const parsed = parseFloat(rawValue);
    onChange({
      ...features,
      [key]: isNaN(parsed) ? 0 : parsed,
    });
    setActivePresetId(null);
  };

  const handleApplyPreset = (preset: PresetSample) => {
    onChange({ ...preset.features });
    setActivePresetId(preset.id);
  };

  const handleReset = () => {
    onChange({ ...INITIAL_DEFAULT_FEATURES });
    setActivePresetId(PRESET_SAMPLES[0].id);
  };

  const currentCategoryFeatures = FEATURE_METADATA_LIST.filter(
    (f) => f.category === activeCategory
  );

  return (
    <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-slate-800/80">
      {/* Header & Quick Preset Bar */}
      <div className="p-5 border-b border-slate-800/80 bg-slate-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-sans">
                Bộ Đặc Trưng Sinh Học (30 Features)
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Fine Needle Aspirate (FNA) digitized cell nuclear morphometry
              </p>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <span className="text-xs font-mono text-slate-400 mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              Mẫu thử:
            </span>
            {PRESET_SAMPLES.map((preset) => {
              const isSelected = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 active:scale-95 ${
                    isSelected
                      ? preset.type === 'benign'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-glow-emerald'
                        : preset.type === 'malignant'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-glow-rose'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800 hover:text-white'
                  }`}
                  title={preset.descriptionVi}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      preset.type === 'benign'
                        ? 'bg-emerald-400'
                        : preset.type === 'malignant'
                        ? 'bg-rose-400'
                        : 'bg-amber-400'
                    }`}
                  />
                  <span>{preset.titleVi}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Preset Description */}
        {activePresetId && (
          <div className="mt-3 text-xs font-sans text-slate-300 bg-slate-950/60 px-3 py-2 rounded-lg border border-slate-800/60 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <span>
              {PRESET_SAMPLES.find((p) => p.id === activePresetId)?.descriptionVi}
            </span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800/80 bg-slate-950/50 px-3 sm:px-5">
        <button
          type="button"
          onClick={() => setActiveCategory('mean')}
          className={`py-3 px-4 font-mono text-xs sm:text-sm font-semibold transition-all border-b-2 ${
            activeCategory === 'mean'
              ? 'tab-active'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          1. Giá Trị Trung Bình (Mean · 10)
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('se')}
          className={`py-3 px-4 font-mono text-xs sm:text-sm font-semibold transition-all border-b-2 ${
            activeCategory === 'se'
              ? 'tab-active'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          2. Sai Số Chuẩn (Standard Error · 10)
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('worst')}
          className={`py-3 px-4 font-mono text-xs sm:text-sm font-semibold transition-all border-b-2 ${
            activeCategory === 'worst'
              ? 'tab-active'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          3. Giá Trị Xấu Nhất (Worst · 10)
        </button>
      </div>

      {/* Form Fields Grid */}
      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {currentCategoryFeatures.map((meta) => {
            const val = features[meta.key];
            const isInvalid = val < 0;

            return (
              <div
                key={meta.key}
                className="group relative bg-slate-900/60 hover:bg-slate-900/90 rounded-xl p-3.5 border border-slate-800/80 hover:border-slate-700 transition-all"
              >
                <div className="flex items-baseline justify-between gap-2 mb-1.5">
                  <label
                    htmlFor={meta.key}
                    className="text-xs font-semibold text-slate-200 font-sans truncate"
                    title={meta.description}
                  >
                    {meta.vietnameseLabel}
                  </label>
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    [{meta.unit}]
                  </span>
                </div>

                <div className="relative">
                  <input
                    id={meta.key}
                    type="number"
                    step={meta.step}
                    min="0"
                    value={val}
                    onChange={(e) => handleInputChange(meta.key, e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-700/80 focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 rounded-lg px-3 py-2 text-sm font-mono text-white font-medium outline-none transition-all"
                    placeholder="0.00"
                  />
                  <span className="absolute right-3 top-2.5 text-[10px] font-mono text-slate-400 pointer-events-none uppercase">
                    {meta.key.replace(/_(mean|se|worst)/, '')}
                  </span>
                </div>

                {isInvalid && (
                  <p className="mt-1 text-[11px] font-mono text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Giá trị phải là số không âm
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="mt-8 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-mono text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-slate-800 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Khôi phục Mặc định</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onSubmit}
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-sans font-bold text-sm shadow-glow-teal hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Đang phân tích tế bào...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Chạy Phân Loại (Predict)</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
