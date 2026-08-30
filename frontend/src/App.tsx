import React, { useState } from 'react';
import {
  BreastCancerFeatures,
  PredictionResponse,
  ModelOptionId,
} from './types/prediction';
import { INITIAL_DEFAULT_FEATURES } from './data/featureDefinitions';
import { PredictionService } from './services/api';
import { SideNavBar, DashboardView } from './components/layout/SideNavBar';
import { Header } from './components/layout/Header';
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
  const [selectedModelId, setSelectedModelId] = useState<ModelOptionId>('best');
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<DashboardView>('prediction');
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

  const handleSidebarNavigate = (view: DashboardView) => {
    setActiveView(view);
    if (view === 'prediction') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (view === 'tree') setActiveDetailTab('tree');
      if (view === 'experiments') setActiveDetailTab('experiments');
      if (view === 'dataset') setActiveDetailTab('dataset');
      document.getElementById('details-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex overflow-x-hidden">
      {/* SideNavBar (Desktop) */}
      <SideNavBar
        activeView={activeView}
        onViewChange={handleSidebarNavigate}
        onResetFeatures={handleResetFeatures}
      />

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col md:ml-64 relative min-h-screen">
        {/* TopNavBar (Mobile Only) */}
        <Header />

        {/* Academic Disclaimer Banner */}
        <DisclaimerBanner />

        <main className="flex-1 p-gutter w-full max-w-container-max mx-auto space-y-stack-lg">
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

          {/* Technical Details: Full Tree Hierarchy, 5-Experiment Comparison, Dataset Info */}
          <TechnicalDetailsSection
            result={result}
            activeTab={activeDetailTab}
            onTabChange={(tab) => {
              setActiveDetailTab(tab);
              if (tab === 'tree') setActiveView('tree');
              if (tab === 'experiments') setActiveView('experiments');
              if (tab === 'dataset') setActiveView('dataset');
            }}
          />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default App;
