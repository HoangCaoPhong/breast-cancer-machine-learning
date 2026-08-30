import React, { useState } from 'react';
import {
  BreastCancerFeatures,
  PredictionResponse,
  ModelOptionId,
} from './types/prediction';
import { INITIAL_DEFAULT_FEATURES } from './data/featureDefinitions';
import { PredictionService } from './services/api';
import { TopNavbar } from './components/layout/TopNavbar';
import { DisclaimerBanner } from './components/layout/DisclaimerBanner';
import { Footer } from './components/layout/Footer';
import { FeatureInputForm } from './features/prediction/FeatureInputForm';
import { PredictionResultCard } from './features/prediction/PredictionResultCard';
import {
  TechnicalDetailsSection,
  DetailTab,
} from './features/prediction/TechnicalDetailsSection';

export const App: React.FC = () => {
  const [features, setFeatures] = useState<BreastCancerFeatures>({
    ...INITIAL_DEFAULT_FEATURES,
  });
  const [selectedModelId, setSelectedModelId] = useState<ModelOptionId>('I3');
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTab>('tree');

  const runPrediction = async (
    currentFeatures: BreastCancerFeatures,
    modelId: ModelOptionId
  ) => {
    setIsLoading(true);
    try {
      const res = await PredictionService.predict(currentFeatures, modelId);
      setResult(res);
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModelChange = (newModelId: ModelOptionId) => {
    setSelectedModelId(newModelId);
    if (result !== null) {
      runPrediction(features, newModelId);
    }
  };

  const handleResetFeatures = () => {
    setFeatures({ ...INITIAL_DEFAULT_FEATURES });
    setResult(null);
  };

  const handleNavigateSection = (sectionId: 'form-section' | 'details-section') => {
    if (sectionId === 'form-section') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.getElementById('details-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex flex-col">
      {/* Top Navbar (Horizontal) */}
      <TopNavbar
        onResetFeatures={handleResetFeatures}
        onNavigateSection={handleNavigateSection}
      />

      {/* Academic Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Main Content Area (Full Width Spacious Layout) */}
      <main className="flex-1 w-full max-w-container-max mx-auto p-gutter space-y-stack-lg" id="form-section">
        {/* Main 12-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Left Column: 30-Feature Matrix Form (7 cols) */}
          <div className="lg:col-span-7 space-y-gutter">
            <FeatureInputForm
              features={features}
              onChange={setFeatures}
              selectedModelId={selectedModelId}
              onModelChange={handleModelChange}
              onSubmit={() => runPrediction(features, selectedModelId)}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column: Prediction Result & Decision Path (5 cols) */}
          <div className="lg:col-span-5 space-y-gutter">
            <PredictionResultCard result={result} isLoading={isLoading} />
          </div>
        </div>

        {/* Technical Details Section: Full Tree, Experiment Matrix, Dataset Info (12 cols) */}
        <TechnicalDetailsSection
          result={result}
          activeTab={activeDetailTab}
          onTabChange={setActiveDetailTab}
        />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
