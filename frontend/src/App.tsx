import React, { useState, useEffect } from 'react';
import { BreastCancerFeatures, PredictionResponse } from './types/prediction';
import { INITIAL_DEFAULT_FEATURES } from './data/featureDefinitions';
import { PredictionService } from './services/api';
import { Header } from './components/layout/Header';
import { DisclaimerBanner } from './components/layout/DisclaimerBanner';
import { Footer } from './components/layout/Footer';
import { FeatureInputForm } from './features/prediction/FeatureInputForm';
import { PredictionResultCard } from './features/prediction/PredictionResultCard';
import { DecisionPathViewer } from './features/prediction/DecisionPathViewer';
import { ModelComparisonModal } from './features/prediction/ModelComparisonModal';
import { GuideModal } from './components/common/GuideModal';

export const App: React.FC = () => {
  const [features, setFeatures] = useState<BreastCancerFeatures>({
    ...INITIAL_DEFAULT_FEATURES,
  });
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

  // Check backend health on mount and run initial inference
  useEffect(() => {
    const initApp = async () => {
      const connected = await PredictionService.checkBackendHealth();
      setIsBackendConnected(connected);

      // Run an initial quick inference for the default preset
      setIsLoading(true);
      try {
        const initialRes = await PredictionService.predict(features);
        setResult(initialRes);
      } catch (err) {
        console.error('Initial inference error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  const handlePredict = async () => {
    setIsLoading(true);
    try {
      const res = await PredictionService.predict(features);
      setResult(res);
    } catch (err) {
      console.error('Prediction failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-teal-500/30 selection:text-teal-200">
      {/* Top Header */}
      <Header
        onOpenComparison={() => setIsComparisonOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        isBackendConnected={isBackendConnected}
      />

      {/* Medical Safety Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: 30-Feature Matrix Input Form (Col span 7) */}
          <div className="lg:col-span-7 space-y-6">
            <FeatureInputForm
              features={features}
              onChange={setFeatures}
              onSubmit={handlePredict}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column: Prediction Result & Decision Path Explainability (Col span 5) */}
          <div className="lg:col-span-5 space-y-6">
            <PredictionResultCard result={result} isLoading={isLoading} />

            {result && (
              <DecisionPathViewer
                decisionPath={result.decisionPath}
                topFeatures={result.topFeatures}
                isMalignant={result.prediction === 'M'}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
      <ModelComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
      />

      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </div>
  );
};

export default App;
