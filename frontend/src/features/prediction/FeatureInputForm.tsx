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
  MODEL_OPTIONS,
  getRandomDatasetSample,
} from '../../data/featureDefinitions';
import { useLanguage } from '../../context/LanguageContext';

interface FeatureInputFormProps {
  features: BreastCancerFeatures;
  onChange: (features: BreastCancerFeatures) => void;
  selectedModelId: ModelOptionId;
  onModelChange: (modelId: ModelOptionId) => void;
  onSubmit: () => void;
  onReset?: () => void;
  isLoading: boolean;
}

export const FeatureInputForm: React.FC<FeatureInputFormProps> = ({
  features,
  onChange,
  selectedModelId,
  onModelChange,
  onSubmit,
  onReset,
  isLoading,
}) => {
  const [activeCategory, setActiveCategory] = useState<FeatureCategory>('mean');
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { language, t } = useLanguage();

  const missingOrInvalidFeatures = FEATURE_METADATA_LIST.filter((meta) => {
    const val = features[meta.key];
    return typeof val !== 'number' || isNaN(val) || val < 0;
  });

  const meanMissingCount = missingOrInvalidFeatures.filter((f) => f.category === 'mean').length;
  const seMissingCount = missingOrInvalidFeatures.filter((f) => f.category === 'se').length;
  const worstMissingCount = missingOrInvalidFeatures.filter((f) => f.category === 'worst').length;

  const handleInputChange = (key: FeatureKey, rawValue: string) => {
    if (rawValue.trim() === '') {
      onChange({
        ...features,
        [key]: '',
      });
      return;
    }
    const parsed = parseFloat(rawValue);
    onChange({
      ...features,
      [key]: isNaN(parsed) ? '' : parsed,
    });
    if (validationError) {
      setValidationError(null);
    }
  };

  const handleApplyPreset = (preset: PresetSample) => {
    onChange({ ...preset.features });
    setHasAttemptedSubmit(false);
    setValidationError(null);
  };

  const handleApplyRandom = () => {
    const randomFeatures = getRandomDatasetSample();
    onChange({ ...randomFeatures });
    setHasAttemptedSubmit(false);
    setValidationError(null);
  };

  const handleClear = () => {
    const emptyFeatures = {} as BreastCancerFeatures;
    FEATURE_METADATA_LIST.forEach((f) => {
      emptyFeatures[f.key] = '';
    });
    onChange(emptyFeatures);
    setHasAttemptedSubmit(false);
    setValidationError(null);
    onReset?.();
  };

  const handleFormSubmit = () => {
    setHasAttemptedSubmit(true);
    if (missingOrInvalidFeatures.length > 0) {
      const firstMissing = missingOrInvalidFeatures[0];
      setActiveCategory(firstMissing.category);
      setValidationError(
        language === 'vi'
          ? `Vui lòng nhập đầy đủ 30 chỉ số sinh thiết hợp lệ (≥ 0). Còn ${missingOrInvalidFeatures.length} chỉ số đang trống hoặc chưa hợp lệ!`
          : `Please enter all 30 valid biopsy features (>= 0). ${missingOrInvalidFeatures.length} field(s) are missing or invalid!`
      );
      return;
    }
    setValidationError(null);
    onSubmit();
  };

  const currentCategoryFeatures = FEATURE_METADATA_LIST.filter(
    (f) => f.category === activeCategory
  );

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-stack-md border-b border-outline-variant bg-surface-bright flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-primary">analytics</span>
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface">
              {t.formTitle}
            </h3>
            <p className="text-xs text-on-surface-variant font-sans">
              {t.formSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-outline-variant px-stack-md bg-surface-bright overflow-x-auto whitespace-nowrap">
        <button
          type="button"
          onClick={() => setActiveCategory('mean')}
          className={`px-4 py-3 font-sans text-xs transition-colors flex items-center gap-1.5 ${
            activeCategory === 'mean'
              ? 'text-primary border-b-2 border-primary font-bold'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span>1. {t.tabMean}</span>
          {hasAttemptedSubmit && meanMissingCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-error/15 text-error text-[10px] font-mono font-bold">
              {meanMissingCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('se')}
          className={`px-4 py-3 font-sans text-xs transition-colors flex items-center gap-1.5 ${
            activeCategory === 'se'
              ? 'text-primary border-b-2 border-primary font-bold'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span>2. {t.tabSe}</span>
          {hasAttemptedSubmit && seMissingCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-error/15 text-error text-[10px] font-mono font-bold">
              {seMissingCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveCategory('worst')}
          className={`px-4 py-3 font-sans text-xs transition-colors flex items-center gap-1.5 ${
            activeCategory === 'worst'
              ? 'text-primary border-b-2 border-primary font-bold'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span>3. {t.tabWorst}</span>
          {hasAttemptedSubmit && worstMissingCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-error/15 text-error text-[10px] font-mono font-bold">
              {worstMissingCount}
            </span>
          )}
        </button>
      </div>

      {/* Form Grid */}
      <div className="p-stack-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
          {currentCategoryFeatures.map((meta) => {
            const val = features[meta.key];
            const isMissing = hasAttemptedSubmit && (typeof val !== 'number' || isNaN(val));
            const isNegative = typeof val === 'number' && val < 0;
            const hasError = isMissing || isNegative;

            return (
              <div key={meta.key} className="flex flex-col gap-1">
                <label className="font-sans text-xs font-semibold text-on-surface flex items-center justify-between">
                  <span className="truncate">
                    {language === 'vi' ? (
                      <>
                        {meta.vietnameseLabel}{' '}
                        <span className="text-on-surface-variant font-normal">
                          ({meta.label.replace(/\s*\((Mean|SE|Worst)\)/i, '')})
                        </span>
                      </>
                    ) : (
                      <>
                        {meta.label}{' '}
                        <span className="text-on-surface-variant font-normal">
                          ({meta.key})
                        </span>
                      </>
                    )}
                  </span>
                  <span className="text-[11px] text-outline font-normal">
                    ({meta.unit})
                  </span>
                </label>
                <input
                  type="number"
                  step={meta.step}
                  min="0"
                  value={val === '' ? '' : val}
                  onChange={(e) => handleInputChange(meta.key, e.target.value)}
                  className={`border rounded-lg p-2 font-mono text-xs outline-none transition-colors bg-white ${
                    hasError
                      ? 'border-error focus:border-error focus:ring-1 focus:ring-error bg-error/5 text-error font-medium'
                      : 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary text-on-surface'
                  }`}
                  placeholder="0.00"
                />
                {hasError && (
                  <span className="text-error text-[11px] font-sans flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[13px]">error</span>{' '}
                    {isNegative
                      ? (language === 'vi' ? 'Giá trị phải lớn hơn hoặc bằng 0' : 'Value must be >= 0')
                      : (language === 'vi' ? 'Vui lòng nhập giá trị số' : 'Please enter a numeric value')}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Row */}
        <div className="mt-stack-lg pt-stack-md border-t border-outline-variant space-y-3">
          {/* Quick presets */}
          <div className="flex gap-2 flex-wrap items-center">
            <button
              type="button"
              onClick={() => handleApplyPreset(PRESET_SAMPLES[0])}
              className="px-3 py-1.5 text-primary border border-primary rounded-lg font-sans text-xs hover:bg-surface-container-low transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">check_circle</span> {t.btnBenignPreset}
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset(PRESET_SAMPLES[1])}
              className="px-3 py-1.5 text-error border border-error rounded-lg font-sans text-xs hover:bg-error-container/20 transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">warning</span> {t.btnMalignantPreset}
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset(PRESET_SAMPLES[2])}
              className="px-3 py-1.5 text-on-surface-variant border border-outline-variant rounded-lg font-sans text-xs hover:bg-surface-container-low transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-sm">help</span> {t.btnBorderlinePreset}
            </button>
            <button
              type="button"
              onClick={handleApplyRandom}
              className="px-3 py-1.5 text-secondary border border-secondary rounded-lg font-sans text-xs hover:bg-secondary-container/20 transition-colors flex items-center gap-1.5"
              title="Pick a random sample from UCI WDBC dataset"
            >
              <span className="material-symbols-outlined text-sm">shuffle</span> {t.btnRandom}
            </button>
          </div>

          {/* Validation Alert */}
          {validationError && (
            <div className="p-3 rounded-lg bg-error/10 border border-error/40 text-error text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-base shrink-0">report</span>
              <span className="font-semibold">{validationError}</span>
            </div>
          )}

          {/* Bottom Execution Controls: Model Selector & Action Buttons */}
          <div className="p-3.5 bg-surface-container-low/70 rounded-xl border border-outline-variant/70 space-y-3">
            {/* Algorithm Selector Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <label className="text-xs font-sans text-on-surface font-semibold flex items-center gap-1.5 shrink-0">
                <span className="material-symbols-outlined text-base text-primary">psychology</span>
                <span>{t.selectModelLabel}:</span>
              </label>
              <div className="relative flex-1 min-w-0">
                <select
                  value={selectedModelId}
                  onChange={(e) => onModelChange(e.target.value as ModelOptionId)}
                  className="w-full truncate border border-outline-variant rounded-lg pl-3 pr-8 py-2 font-sans text-xs text-on-surface bg-surface-container-lowest hover:border-primary/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors font-medium shadow-2xs cursor-pointer appearance-none"
                >
                  {MODEL_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id} className="py-1">
                      {language === 'vi' ? `[${opt.id}] ${opt.nameVi}` : `[${opt.id}] ${opt.name}`}
                    </option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant pointer-events-none">
                  unfold_more
                </span>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap sm:flex-nowrap items-center justify-end gap-2 pt-2 border-t border-outline-variant/50">
              <button
                type="button"
                onClick={handleClear}
                className="flex-1 sm:flex-none px-4 py-2 text-on-surface-variant hover:text-on-surface font-sans text-xs font-medium bg-surface-container-lowest hover:bg-surface-container-high rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-outline-variant shadow-2xs"
              >
                <span className="material-symbols-outlined text-sm">clear_all</span> {t.btnClear}
              </button>
              <button
                type="button"
                onClick={handleFormSubmit}
                disabled={isLoading}
                className="flex-1 sm:flex-none px-5 py-2 bg-primary text-on-primary rounded-lg font-sans text-xs font-bold hover:bg-primary-container transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow"
              >
                <span className="material-symbols-outlined text-sm">play_arrow</span>
                {isLoading ? t.btnSubmitting : t.btnSubmit}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureInputForm;

