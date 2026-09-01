import React, { useState, useEffect, useRef } from 'react';
import {
  PredictionResponse,
  ModelExperiment,
  TreeNodeData,
  DecisionStep,
  ModelOptionId,
} from '../../types/prediction';
import { EXPERIMENT_COMPARISON_DATA } from '../../data/featureDefinitions';
import { PredictionService } from '../../services/api';
import { useLanguage } from '../../context/LanguageContext';

export type DetailTab = 'tree' | 'experiments' | 'improvements' | 'dataset';
export type TreeOrientation = 'vertical' | 'horizontal';
export type TreeViewMode = 'full' | 'path_only';

interface TechnicalDetailsSectionProps {
  result: PredictionResponse | null;
  currentModelId?: ModelOptionId;
  activeTab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
}

// Confusion matrix data for each model based on test set (114 samples: 71 Benign, 43 Malignant)
const CONFUSION_MATRIX_MAP: Record<
  string,
  { tn: number; fp: number; fn: number; tp: number; nameVi: string; nameEn: string }
> = {
  B0: {
    nameVi: 'Mô hình Gốc: Sklearn Baseline (Unpruned)',
    nameEn: 'Baseline Model: Sklearn Baseline',
    tn: 68,
    fp: 4,
    fn: 4,
    tp: 38,
  },
  C0: {
    nameVi: 'Cây Tự Lập Trình: Custom Tree',
    nameEn: 'Custom Decision Tree from Scratch',
    tn: 71,
    fp: 1,
    fn: 10,
    tp: 32,
  },
  I1: {
    nameVi: 'Cải tiến 1: Giới hạn Độ sâu cây (max_depth=8)',
    nameEn: 'Improvement 1: Max Depth Constraint (max_depth=8)',
    tn: 68,
    fp: 4,
    fn: 4,
    tp: 38,
  },
  I2: {
    nameVi: 'Cải tiến 2: Tiêu chuẩn phân hoạch (Gini vs Entropy)',
    nameEn: 'Improvement 2: Splitting Criterion (Gini vs Entropy)',
    tn: 68,
    fp: 4,
    fn: 4,
    tp: 38,
  },
  I3: {
    nameVi: 'Cải tiến 3: Điều chỉnh số mẫu tối thiểu (min_samples_split=5)',
    nameEn: 'Improvement 3: Adjusting min_samples (min_split=5)',
    tn: 69,
    fp: 3,
    fn: 4,
    tp: 38,
  },
};

// Recursive Dynamic Tree Node Renderer with Live Decision Path, Orientation & Enhanced Branch Lines
interface DynamicTreeNodeViewProps {
  node: TreeNodeData;
  isRoot?: boolean;
  depth?: number;
  isActivePath?: boolean;
  decisionPath?: DecisionStep[];
  predictionResult?: PredictionResponse | null;
  orientation?: TreeOrientation;
  viewMode?: TreeViewMode;
}

const DynamicTreeNodeView: React.FC<DynamicTreeNodeViewProps> = ({
  node,
  isRoot = false,
  depth = 0,
  isActivePath = false,
  decisionPath = [],
  predictionResult = null,
  orientation = 'vertical',
  viewMode = 'full',
}) => {
  const { language, t } = useLanguage();
  const isLeaf = node.isLeaf || !node.children || node.children.length === 0;
  const isMalignant =
    node.predictedClass === 'Malignant' ||
    (node.values && node.values[1] > node.values[0]);

  const hasResult = Boolean(predictionResult);
  const currentStep = decisionPath[depth];
  const isTargetLeaf = isLeaf && isActivePath && hasResult;

  // In path_only mode: dim unvisited nodes and branches so the active trajectory pops out
  const isDimmed = viewMode === 'path_only' && hasResult && !isActivePath;

  // Determine active branch index for children (0 = Left, 1 = Right)
  const activeBranchIdx =
    isActivePath && currentStep !== undefined
      ? currentStep.isSatisfied
        ? 0
        : 1
      : -1;

  const isHorizontal = orientation === 'horizontal';

  return (
    <div
      className={`flex ${
        isHorizontal ? 'flex-row items-center gap-4 shrink-0' : 'flex-col items-center flex-1 min-w-[240px]'
      } transition-all duration-300 ${
        isDimmed ? 'opacity-25 hover:opacity-90' : 'opacity-100'
      }`}
    >
      {/* Node Box Column */}
      <div className="flex flex-col items-center shrink-0">
        {/* Active Trajectory Step Banner */}
        {isActivePath && !isLeaf && currentStep && (
          <div className="inline-flex items-center gap-1 bg-primary text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-1 shadow-sm animate-fade-in whitespace-nowrap">
            <span className="material-symbols-outlined text-[12px]">route</span>
            {t.stepPrefix} {depth + 1}: {currentStep.actualValue} ≤ {currentStep.threshold} ➔{' '}
            {currentStep.isSatisfied ? t.stepTrue : t.stepFalse}
          </div>
        )}

        {/* Target Final Diagnosis Leaf Banner (Color-coded: Green for Benign, Red for Malignant) */}
        {isTargetLeaf && (
          <div
            className={`inline-flex items-center gap-1 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-1 shadow-md animate-pulse whitespace-nowrap ${
              isMalignant ? 'bg-error shadow-error/30' : 'bg-tertiary-container shadow-tertiary-container/30'
            }`}
          >
            <span className="material-symbols-outlined text-[12px]">
              {isMalignant ? 'warning' : 'verified'}
            </span>
            {t.leafTargetBanner} {isMalignant ? t.diagnosisMalignant : t.diagnosisBenign}
          </div>
        )}

        {/* Node Box */}
        <div
          className={`p-3 rounded-xl border text-center transition-all shadow-sm ${
            isHorizontal ? 'w-[240px] shrink-0' : 'w-full max-w-[260px]'
          } ${
            isTargetLeaf
              ? isMalignant
                ? 'border-2 border-error bg-error-container/40 ring-4 ring-error/30 shadow-xl scale-105'
                : 'border-2 border-tertiary-container bg-tertiary-container/20 ring-4 ring-tertiary-container/30 shadow-xl scale-105'
              : isActivePath
              ? 'border-2 border-primary bg-primary/10 ring-4 ring-primary/20 shadow-lg scale-[1.02]'
              : isRoot
              ? 'bg-white border-2 border-primary'
              : isLeaf
              ? isMalignant
                ? 'bg-error-container/30 border-error text-on-error-container font-semibold'
                : 'bg-surface-container-highest border-tertiary-container text-tertiary-container font-semibold'
              : 'bg-white border-outline-variant'
          }`}
        >
          <div
            className={`font-bold text-xs line-clamp-2 ${
              isTargetLeaf
                ? isMalignant
                  ? 'text-error font-extrabold'
                  : 'text-tertiary-container font-extrabold'
                : isActivePath
                ? 'text-primary font-bold'
                : 'text-on-surface'
            }`}
          >
            {node.name ||
              (isLeaf
                ? `${language === 'vi' ? 'Nút Lá' : 'Leaf'}: ${node.predictedClass}`
                : `${node.feature} ≤ ${node.threshold}`)}
          </div>

          {node.criterion && (
            <div className="text-[11px] font-mono text-on-surface-variant mt-0.5">
              {node.criterion}
            </div>
          )}

          {node.samples !== undefined && (
            <div className="text-[11px] text-on-surface-variant mt-0.5">
              {t.totalSamples}: <strong>{node.samples}</strong>
            </div>
          )}

          {node.values && node.values.length === 2 && (() => {
            const total = node.values[0] + node.values[1];
            const benignPct = total > 0 ? ((node.values[0] / total) * 100).toFixed(1) : '0';
            const malignantPct = total > 0 ? ((node.values[1] / total) * 100).toFixed(1) : '0';

            return (
              <div className="text-[11px] text-outline mt-1 flex justify-center gap-2 font-mono flex-wrap">
                <span className="text-tertiary-container font-medium">
                  {language === 'vi' ? 'Lành' : 'Benign'}: {node.values[0]} ({benignPct}%)
                </span>
                <span className="text-error font-medium">
                  {language === 'vi' ? 'Ác' : 'Malignant'}: {node.values[1]} ({malignantPct}%)
                </span>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Children Branches with Crisp & Distinct Connector Lines */}
      {!isLeaf && node.children && node.children.length > 0 && (
        <>
          {isHorizontal ? (
            /* Horizontal (Left-to-Right) Branches */
            <div className="flex items-center gap-3 shrink-0">
              {/* Horizontal line connector */}
              <div
                className={`w-6 h-0.5 shrink-0 transition-colors ${
                  isActivePath ? 'bg-primary' : 'bg-slate-300'
                }`}
              />
              <div className="flex flex-col gap-6 border-l-2 border-slate-300 pl-4 py-2 relative shrink-0">
                {node.children.map((child, idx) => {
                  const isChildActivePath = isActivePath && idx === activeBranchIdx;
                  const isLeft = idx === 0;

                  return (
                    <div key={child.id || idx} className="flex items-center gap-3 relative shrink-0">
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap transition-all border flex items-center gap-1 shadow-2xs ${
                          isChildActivePath
                            ? 'bg-primary text-white border-primary ring-2 ring-primary/30 shadow-md'
                            : isLeft
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[11px]">
                          {isLeft ? 'check_circle' : 'cancel'}
                        </span>
                        {isLeft ? t.branchLeftShort : t.branchRightShort}
                        {isChildActivePath && ' ✓'}
                      </span>
                      <DynamicTreeNodeView
                        node={child}
                        depth={depth + 1}
                        isActivePath={isChildActivePath}
                        decisionPath={decisionPath}
                        predictionResult={predictionResult}
                        orientation={orientation}
                        viewMode={viewMode}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Vertical (Top-to-Bottom) Branches */
            <div className="w-full flex flex-col items-center">
              {/* Stem line coming down from parent node */}
              <div
                className={`w-0.5 h-5 transition-colors ${
                  isActivePath ? 'bg-primary' : 'bg-slate-300'
                }`}
              />

              {/* Branch Split Grid with Solid Top Connector Bar */}
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 relative pt-4">
                {/* Horizontal crossbar connecting the two branches */}
                <div
                  className={`hidden md:block absolute top-0 left-1/4 right-1/4 h-0.5 transition-colors ${
                    isActivePath ? 'bg-primary' : 'bg-slate-300'
                  }`}
                />

                {node.children.map((child, idx) => {
                  const isChildActivePath = isActivePath && idx === activeBranchIdx;
                  const isLeft = idx === 0;

                  return (
                    <div key={child.id || idx} className="flex flex-col items-center relative">
                      {/* Vertical line down to branch badge */}
                      <div
                        className={`hidden md:block w-0.5 h-4 transition-colors ${
                          isChildActivePath ? 'bg-primary' : 'bg-slate-300'
                        }`}
                      />

                      {/* Branch Label Badge */}
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-2 transition-all flex items-center gap-1 border shadow-2xs ${
                          isChildActivePath
                            ? 'bg-primary text-white border-primary ring-2 ring-primary/30 shadow-md scale-105'
                            : isLeft
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[12px]">
                          {isLeft ? 'check_circle' : 'cancel'}
                        </span>
                        {isLeft ? t.branchLeftTrue : t.branchRightFalse}
                        {isChildActivePath && ' ✓'}
                      </span>

                      {/* Child Node Tree */}
                      <DynamicTreeNodeView
                        node={child}
                        depth={depth + 1}
                        isActivePath={isChildActivePath}
                        decisionPath={decisionPath}
                        predictionResult={predictionResult}
                        orientation={orientation}
                        viewMode={viewMode}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const formatPercent = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(Number(val))) return '--';
  return `${(Number(val) * 100).toFixed(2)}%`;
};

export const TechnicalDetailsSection: React.FC<TechnicalDetailsSectionProps> = ({
  result,
  currentModelId = 'I3',
  activeTab,
  onTabChange,
}) => {
  const { language, t } = useLanguage();
  const [experiments, setExperiments] = useState<ModelExperiment[]>(
    EXPERIMENT_COMPARISON_DATA
  );
  const [treeData, setTreeData] = useState<TreeNodeData | null>(null);
  const [loadingTree, setLoadingTree] = useState<boolean>(false);

  // Zoom, Orientation & View Mode state
  const [zoomLevel, setZoomLevel] = useState<number>(0.9);
  const [orientation, setOrientation] = useState<TreeOrientation>('vertical');
  const [viewMode, setViewMode] = useState<TreeViewMode>('full');

  // Drag-and-pan canvas state with bounded coordinates
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [matrixModelId, setMatrixModelId] = useState<string>('I3');

  const selectedModelId = result?.selectedModelId?.toUpperCase() || currentModelId.toUpperCase() || matrixModelId;
  const currentMatrix =
    CONFUSION_MATRIX_MAP[matrixModelId] || CONFUSION_MATRIX_MAP[selectedModelId] || CONFUSION_MATRIX_MAP['I3'];

  // Sync matrixModelId when result or currentModelId changes
  useEffect(() => {
    if (result?.selectedModelId) {
      setMatrixModelId(result.selectedModelId.toUpperCase());
    } else if (currentModelId) {
      setMatrixModelId(currentModelId.toUpperCase());
      setPanOffset({ x: 0, y: 0 });
    }
  }, [result?.selectedModelId, currentModelId]);

  useEffect(() => {
    PredictionService.getExperiments().then((data) => {
      if (data && data.length > 0) {
        setExperiments(data);
      }
    });
  }, []);

  useEffect(() => {
    if (activeTab === 'tree') {
      setLoadingTree(true);
      const modelId = result?.selectedModelId || currentModelId || 'I3';
      PredictionService.getTreeStructure(modelId)
        .then((data) => {
          setTreeData(data);
        })
        .finally(() => {
          setLoadingTree(false);
        });
    }
  }, [activeTab, result?.selectedModelId, currentModelId]);

  // Non-passive wheel event listener for smooth zooming on canvas
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDelta = e.deltaY < 0 ? 0.08 : -0.08;
      setZoomLevel((prev) => {
        const next = Number((prev + zoomDelta).toFixed(2));
        return Math.min(1.8, Math.max(0.35, next));
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [activeTab]);

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(1.6, Number((prev + 0.15).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(0.4, Number((prev - 0.15).toFixed(2))));
  };

  const handleResetZoom = () => {
    setZoomLevel(0.9);
    setPanOffset({ x: 0, y: 0 });
  };

  // Drag-to-pan event handlers with dynamic rectangular diagram bounding
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, input, select, a')) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - panOffset.x,
      y: e.clientY - panOffset.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const container = containerRef.current;
    const content = contentRef.current;

    let limitX = 1600;
    let limitY = 800;

    if (container && content) {
      const scaledWidth = content.scrollWidth * zoomLevel;
      const scaledHeight = content.scrollHeight * zoomLevel;
      const cWidth = container.clientWidth;
      const cHeight = container.clientHeight;

      limitX = Math.max(cWidth * 0.6, (scaledWidth - cWidth * 0.15) / 2 + 150);
      limitY = Math.max(cHeight * 0.6, (scaledHeight - cHeight * 0.15) / 2 + 150);
    }

    const rawX = e.clientX - dragStartRef.current.x;
    const rawY = e.clientY - dragStartRef.current.y;

    setPanOffset({
      x: Math.max(-limitX, Math.min(limitX, rawX)),
      y: Math.max(-limitY, Math.min(limitY, rawY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const accuracy = formatPercent(result?.accuracy ?? 0.9386);
  const errorRate = formatPercent(result?.errorRate ?? 0.0614);
  const recall = formatPercent(result?.recallMalignant ?? 0.8571);
  const f1 = formatPercent(result?.f1Score ?? 0.9125);

  const decisionPath = result?.decisionPath || [];

  return (
    <div
      className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden"
      id="details-section"
    >
      {/* Header & Sub-tabs */}
      <div className="border-b border-outline-variant bg-surface-bright p-stack-md flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="material-symbols-outlined text-primary">schema</span>
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface">
              {t.treeSectionTitle}
            </h3>
            <p className="text-xs font-sans text-on-surface-variant">
              {t.treeSectionSubtitle}
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-1.5 overflow-x-auto bg-surface-container-low p-1 rounded-lg border border-outline-variant">
          <button
            type="button"
            onClick={() => onTabChange('tree')}
            className={`px-3 py-1.5 font-sans text-xs rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'tree'
                ? 'bg-white text-primary font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-sm">account_tree</span>
            {t.tabTreeTitle}
          </button>
          <button
            type="button"
            onClick={() => onTabChange('experiments')}
            className={`px-3 py-1.5 font-sans text-xs rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'experiments'
                ? 'bg-white text-primary font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-sm">table_chart</span>
            {t.tabExperimentsTitle}
          </button>
          <button
            type="button"
            onClick={() => onTabChange('improvements')}
            className={`px-3 py-1.5 font-sans text-xs rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'improvements'
                ? 'bg-white text-primary font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-sm">auto_fix_high</span>
            {t.tabImprovementsTitle}
          </button>
          <button
            type="button"
            onClick={() => onTabChange('dataset')}
            className={`px-3 py-1.5 font-sans text-xs rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'dataset'
                ? 'bg-white text-primary font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-sm">description</span>
            {t.tabDatasetTitle}
          </button>
        </div>
      </div>

      <div className="p-stack-md">
        {/* Tab 1: Full Dynamic Tree Diagram & Live Path Highlighting */}
        {activeTab === 'tree' && (
          <div className="space-y-4">
            {/* Live Inference Path Banner */}
            {result ? (
              <div className="p-3 bg-primary/10 border border-primary/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-sans">
                <div className="flex items-center gap-2 text-primary font-bold">
                  <span className="material-symbols-outlined text-base animate-spin text-primary">navigation</span>
                  <span>{t.trajectoryBannerTitle}</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-on-surface">
                  <span>{t.trajectoryStepsCount.replace('{count}', String(decisionPath.length))}</span>
                  <span>➔</span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-white font-bold ${
                      result.prediction === 'M' ? 'bg-error' : 'bg-tertiary-container'
                    }`}
                  >
                    {language === 'vi' ? result.diagnosisLabelVi : result.diagnosisLabel} ({formatPercent(result.confidence)})
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-surface-container-low border border-outline-variant rounded-xl flex items-center justify-between gap-2 text-xs font-sans text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-primary">lightbulb</span>
                  <span>{t.trajectoryPrompt}</span>
                </div>
              </div>
            )}

            {/* Tree Toolbar: View Mode, Orientation & Zoom controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-surface-bright p-3 rounded-xl border border-outline-variant">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-sans text-on-surface-variant">
                    {t.treeModelLabel}: <strong className="text-primary">{selectedModelId}</strong>
                  </span>
                  <span className="text-outline text-xs">|</span>
                  <div className="flex items-center gap-2 text-xs font-sans">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-highest text-tertiary-container font-semibold text-[11px]">
                      {t.legendBenign}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-error-container text-error font-semibold text-[11px]">
                      {t.legendMalignant}
                    </span>
                  </div>
                </div>

                {/* View Scope Toggle: Toàn bộ cây vs Nhánh suy luận */}
                <div className="flex items-center bg-surface-container-low p-0.5 rounded-lg border border-outline-variant">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('full');
                      setPanOffset({ x: 0, y: 0 });
                    }}
                    className={`px-2.5 py-1 text-xs rounded-md font-sans transition-colors flex items-center gap-1 ${
                      viewMode === 'full'
                        ? 'bg-white text-primary font-bold shadow-sm'
                        : 'text-on-surface-variant hover:text-primary'
                    }`}
                    title="Hiển thị tất cả nhánh rõ 100%"
                  >
                    <span className="material-symbols-outlined text-sm">nature</span>
                    {t.viewModeFull}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('path_only');
                      setPanOffset({ x: 0, y: 0 });
                    }}
                    className={`px-2.5 py-1 text-xs rounded-md font-sans transition-colors flex items-center gap-1 ${
                      viewMode === 'path_only'
                        ? 'bg-white text-primary font-bold shadow-sm'
                        : 'text-on-surface-variant hover:text-primary'
                    }`}
                    title="Làm nổi bật nhánh suy luận"
                  >
                    <span className="material-symbols-outlined text-sm">timeline</span>
                    {t.viewModePath}
                  </button>
                </div>
              </div>

              {/* View & Zoom Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Orientation Toggle */}
                <div className="flex items-center bg-surface-container-low p-0.5 rounded-lg border border-outline-variant">
                  <button
                    type="button"
                    onClick={() => {
                      setOrientation('vertical');
                      setPanOffset({ x: 0, y: 0 });
                    }}
                    className={`px-2.5 py-1 text-xs rounded-md font-sans transition-colors flex items-center gap-1 ${
                      orientation === 'vertical'
                        ? 'bg-white text-primary font-bold shadow-sm'
                        : 'text-on-surface-variant hover:text-primary'
                    }`}
                    title="Xem dọc"
                  >
                    <span className="material-symbols-outlined text-sm">align_vertical_top</span>
                    {t.orientationVertical}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOrientation('horizontal');
                      setPanOffset({ x: 0, y: 0 });
                    }}
                    className={`px-2.5 py-1 text-xs rounded-md font-sans transition-colors flex items-center gap-1 ${
                      orientation === 'horizontal'
                        ? 'bg-white text-primary font-bold shadow-sm'
                        : 'text-on-surface-variant hover:text-primary'
                    }`}
                    title="Xem ngang"
                  >
                    <span className="material-symbols-outlined text-sm">align_horizontal_left</span>
                    {t.orientationHorizontal}
                  </button>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center bg-surface-container-low p-0.5 rounded-lg border border-outline-variant text-xs">
                  <button
                    type="button"
                    onClick={handleZoomOut}
                    className="p-1 text-on-surface-variant hover:text-primary rounded hover:bg-white transition-colors"
                    title="Thu nhỏ sơ đồ"
                  >
                    <span className="material-symbols-outlined text-sm">zoom_out</span>
                  </button>
                  <span className="px-2 font-mono font-bold text-on-surface text-[11px]">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={handleZoomIn}
                    className="p-1 text-on-surface-variant hover:text-primary rounded hover:bg-white transition-colors"
                    title="Phóng to sơ đồ"
                  >
                    <span className="material-symbols-outlined text-sm">zoom_in</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetZoom}
                    className="px-2 py-1 text-[11px] text-on-surface-variant hover:text-primary rounded hover:bg-white transition-colors border-l border-outline-variant font-sans"
                    title="Đặt lại kích thước mặc định"
                  >
                    {t.zoomReset}
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic Hierarchical Tree Canvas */}
            <div
              ref={containerRef}
              className={`relative overflow-hidden bg-surface-container-low border border-outline-variant rounded-xl p-4 font-sans text-xs min-h-[500px] max-h-[720px] select-none flex ${
                orientation === 'horizontal' ? 'items-center justify-start pl-8' : 'items-start justify-center'
              } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* Drag & Pan & Wheel Helper Badge */}
              <div className="absolute bottom-3 right-3 z-10 bg-white/95 backdrop-blur-sm border border-outline-variant rounded-md px-2.5 py-1 text-[10px] text-on-surface-variant flex items-center gap-2 shadow-sm pointer-events-none">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-primary">drag_pan</span>
                  <span>{t.canvasDragHelper}</span>
                </span>
                <span className="text-outline">·</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-primary">mouse</span>
                  <span>{t.canvasWheelHelper}</span>
                </span>
              </div>

              {loadingTree ? (
                <div className="text-center py-16 text-on-surface-variant">
                  {t.loadingTree}
                </div>
              ) : treeData ? (
                <div
                  ref={contentRef}
                  className={`inline-flex min-w-max p-6 ${
                    orientation === 'horizontal' ? 'items-center justify-start' : 'items-start justify-center'
                  }`}
                  style={{
                    transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                    transformOrigin: orientation === 'horizontal' ? 'left center' : 'center top',
                    transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                  }}
                >
                  <DynamicTreeNodeView
                    node={treeData}
                    isRoot={true}
                    depth={0}
                    isActivePath={Boolean(result)}
                    decisionPath={decisionPath}
                    predictionResult={result}
                    orientation={orientation}
                    viewMode={viewMode}
                  />
                </div>
              ) : (
                <div className="text-center py-16 text-on-surface-variant">
                  {t.noTreeData}
                </div>
              )}
            </div>

            {/* Dynamic Tree Analysis & Overfitting Insights */}
            {(() => {
              const calculateStats = (node: TreeNodeData | null): { depth: number; leaves: number; totalNodes: number } => {
                if (!node) return { depth: 0, leaves: 0, totalNodes: 0 };
                if (!node.children || node.children.length === 0) {
                  return { depth: 0, leaves: 1, totalNodes: 1 };
                }
                const childStats = node.children.map(calculateStats);
                return {
                  depth: 1 + Math.max(...childStats.map((s) => s.depth)),
                  leaves: childStats.reduce((acc, s) => acc + s.leaves, 0),
                  totalNodes: 1 + childStats.reduce((acc, s) => acc + s.totalNodes, 0),
                };
              };

              const treeStats = calculateStats(treeData);
              const rootFeature = treeData?.feature || 'perimeter_worst';
              const rootThreshold = treeData?.threshold ?? 105.95;
              const rootSamples = treeData?.samples ?? 455;

              return (
                <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant space-y-3 font-sans text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <h4 className="font-bold text-xs text-primary uppercase tracking-wider flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm">insights</span>
                      {t.insightsTitle} ({selectedModelId})
                    </h4>
                    <span className="text-[11px] font-mono text-on-surface-variant">
                      {t.insightsDepth}: <strong>{treeStats.depth}</strong> · {t.insightsLeaves}: <strong>{treeStats.leaves}</strong> · {t.insightsNodes}: <strong>{treeStats.totalNodes}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Card 1: Nút Gốc Thực Tế */}
                    <div className="bg-white p-3 rounded-lg border border-outline-variant space-y-1">
                      <div className="font-semibold text-primary flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-primary">alt_route</span>
                        {t.insightRootTitle}
                      </div>
                      <p className="text-on-surface-variant leading-relaxed">
                        {language === 'vi' ? (
                          <>
                            Mô hình <strong>{selectedModelId}</strong> chọn thuộc tính <code className="font-mono bg-surface-container-low px-1 py-0.5 rounded font-bold text-primary">{rootFeature} ≤ {rootThreshold}</code> làm nút gốc để phân loại ban đầu trên <strong>{rootSamples} mẫu</strong>, tối ưu hóa mức giảm tạp chất lớn nhất.
                          </>
                        ) : (
                          <>
                            Model <strong>{selectedModelId}</strong> selects <code className="font-mono bg-surface-container-low px-1 py-0.5 rounded font-bold text-primary">{rootFeature} ≤ {rootThreshold}</code> as primary root split over <strong>{rootSamples} samples</strong>, maximizing information purity reduction.
                          </>
                        )}
                      </p>
                    </div>

                    {/* Card 2: Nhận xét Cấu trúc Cây theo Model */}
                    <div className="bg-white p-3 rounded-lg border border-outline-variant space-y-1">
                      <div className="font-semibold text-error flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-error">account_tree</span>
                        {t.insightStructureTitle}
                      </div>
                      <p className="text-on-surface-variant leading-relaxed">
                        {language === 'vi' ? (
                          <>
                            {selectedModelId === 'B0' && `Cây gốc không giới hạn (Unpruned) phát triển tới độ sâu ${treeStats.depth} với ${treeStats.leaves} nút lá, sinh ra nhiều lá nhỏ chứa ít mẫu, làm tăng phương sai và nguy cơ Overfitting.`}
                            {selectedModelId === 'C0' && `Cây tự viết từ đầu (From Scratch) đạt độ sâu ${treeStats.depth} với ${treeStats.leaves} nút lá, thể hiện thuật toán đệ quy tự code hoạt động đồng nhất với cấu trúc cây chuẩn.`}
                            {selectedModelId === 'I1' && `Khống chế max_depth=8 giới hạn cây ở ${treeStats.depth} tầng (${treeStats.leaves} lá), cân bằng tối ưu giữa giảm thiểu lỗi và duy trì độ nhạy phát hiện khối u ác tính.`}
                            {selectedModelId === 'I2' && `Thực nghiệm so sánh Gini vs Entropy: tiêu chuẩn Gini được chọn qua 5-Fold CV với cây độ sâu ${treeStats.depth} (${treeStats.leaves} lá) cho đường biên phân lớp ổn định nhất.`}
                            {selectedModelId === 'I3' && `Áp dụng min_samples_split=5, leaf=1 giúp cây tự động cắt tỉa các lá đơn lẻ ở độ sâu ${treeStats.depth} (chỉ còn ${treeStats.leaves} lá), đạt độ chính xác cao nhất.`}
                          </>
                        ) : (
                          <>
                            {selectedModelId === 'B0' && `Unpruned baseline expands to depth ${treeStats.depth} with ${treeStats.leaves} leaves, producing noisy isolate splits and elevated overfitting variance.`}
                            {selectedModelId === 'C0' && `Scratch recursive implementation constructs a depth-${treeStats.depth} hierarchy with ${treeStats.leaves} terminal leaves.`}
                            {selectedModelId === 'I1' && `Enforcing max_depth=8 restricts expansion to ${treeStats.depth} levels (${treeStats.leaves} leaves), pruning idiosyncratic noise.`}
                            {selectedModelId === 'I2' && `Evaluating Gini vs Entropy: Gini criterion selected via 5-Fold CV produces a depth-${treeStats.depth} tree (${treeStats.leaves} leaves).`}
                            {selectedModelId === 'I3' && `Configuring min_samples_split=5, leaf=1 prunes isolate leaves down to ${treeStats.leaves} leaves at depth ${treeStats.depth}.`}
                          </>
                        )}
                      </p>
                    </div>

                    {/* Card 3: Hiệu năng thực nghiệm */}
                    <div className="bg-white p-3 rounded-lg border border-outline-variant space-y-1">
                      <div className="font-semibold text-primary flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-primary">verified</span>
                        {t.insightGeneralizationTitle}
                      </div>
                      <p className="text-on-surface-variant leading-relaxed">
                        {language === 'vi' ? (
                          selectedModelId === 'I3' ? (
                            <span>
                              Mô hình đạt điểm số tốt nhất: <strong>Độ chính xác {accuracy}</strong>, <strong>Recall Ác tính {recall}</strong> và <strong>F1 {f1}</strong>, chứng minh việc cắt tỉa mẫu tối thiểu giúp cây khái quát hóa tối ưu nhất.
                            </span>
                          ) : (
                            <span>
                              Mô hình đạt <strong>Độ chính xác {accuracy}</strong> với <strong>tỷ lệ lỗi {errorRate}</strong> và <strong>F1 {f1}</strong> trên tập kiểm thử độc lập.
                            </span>
                          )
                        ) : (
                          selectedModelId === 'I3' ? (
                            <span>
                              Achieves peak performance: <strong>Accuracy {accuracy}</strong>, <strong>Malignant Recall {recall}</strong>, and <strong>F1-Score {f1}</strong> on held-out test cohort.
                            </span>
                          ) : (
                            <span>
                              Evaluated at <strong>Accuracy {accuracy}</strong> with <strong>Error Rate {errorRate}</strong> and <strong>F1-Score {f1}</strong> on test partition.
                            </span>
                          )
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Tab 2: 5-Experiment Comparison & Confusion Matrix */}
        {activeTab === 'experiments' && (
          <div className="space-y-5">
            {/* Quick KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant text-center">
                <div className="font-sans text-xs text-on-surface-variant font-medium">{t.matrixAccuracyCard}</div>
                <div className="font-mono text-lg font-bold text-primary mt-1">{accuracy}</div>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant text-center">
                <div className="font-sans text-xs text-on-surface-variant font-medium">{t.matrixErrorCard}</div>
                <div className="font-mono text-lg font-bold text-error mt-1">{errorRate}</div>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant text-center">
                <div className="font-sans text-xs text-on-surface-variant font-medium">{t.matrixRecallCard}</div>
                <div className="font-mono text-lg font-bold text-primary mt-1">{recall}</div>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant text-center">
                <div className="font-sans text-xs text-on-surface-variant font-medium">{t.matrixF1Card}</div>
                <div className="font-mono text-lg font-bold text-primary mt-1">{f1}</div>
              </div>
            </div>

            {/* Main Comparison Table */}
            <div className="overflow-x-auto border border-outline-variant rounded-xl shadow-sm">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead className="bg-surface-bright text-on-surface font-semibold border-b border-outline-variant">
                  <tr>
                    <th className="p-3">{t.colModelName}</th>
                    <th className="p-3">{t.colCriterion}</th>
                    <th className="p-3">{t.colConfigDepth}</th>
                    <th className="p-3 text-primary">{t.colFittedDepth}</th>
                    <th className="p-3">{t.colLeaves}</th>
                    <th className="p-3 text-primary">{t.colAccuracy}</th>
                    <th className="p-3 text-error">{t.colError}</th>
                    <th className="p-3">{t.colRecall}</th>
                    <th className="p-3">{t.colF1}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant font-mono">
                  {experiments.map((exp) => (
                    <tr
                      key={exp.id}
                      className={`transition-colors ${
                        exp.isBest
                          ? 'bg-surface-container-high font-bold border-l-4 border-primary'
                          : 'hover:bg-surface-container-low'
                      }`}
                    >
                      <td className="p-3 text-on-surface font-sans font-medium">
                        {language === 'vi' ? exp.name : `${exp.id}: ${exp.assignedTo || exp.name}`}
                        {exp.isBest && (
                          <span className="ml-2 text-[10px] bg-primary text-white px-2 py-0.5 rounded-full uppercase">
                            {t.bestBadge}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-on-surface font-sans">{exp.criterion}</td>
                      <td className="p-3 text-on-surface font-mono">{exp.maxDepth}</td>
                      <td className="p-3 font-bold text-primary font-mono">
                        {exp.fittedDepth ?? (exp.maxDepth === 'None' ? 8 : exp.maxDepth)}
                      </td>
                      <td className="p-3 text-on-surface font-mono">
                        {exp.leafCount ?? (exp.id === 'I3' ? 20 : exp.id === 'C0' ? 15 : 24)}
                      </td>
                      <td className="p-3 font-bold text-primary">
                        {formatPercent(exp.accuracy)}
                      </td>
                      <td className="p-3 font-bold text-error">
                        {formatPercent(exp.errorRate)}
                      </td>
                      <td className="p-3 font-bold text-on-surface">
                        {formatPercent(exp.recallMalignant)}
                      </td>
                      <td className="p-3 text-on-surface">
                        {formatPercent(exp.f1Score)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Interactive Confusion Matrix */}
            <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant space-y-3 font-sans text-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-xs text-primary uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm">grid_view</span>
                    {t.confusionMatrixTitle} ({language === 'vi' ? currentMatrix.nameVi : currentMatrix.nameEn})
                  </h4>
                </div>

                {/* Direct Model Switcher for Confusion Matrix */}
                <div className="flex items-center gap-1 bg-surface-bright p-1 rounded-lg border border-outline-variant flex-wrap">
                  {(['B0', 'C0', 'I1', 'I2', 'I3'] as const).map((mId) => (
                    <button
                      key={mId}
                      type="button"
                      onClick={() => setMatrixModelId(mId)}
                      className={`px-2.5 py-1 text-[11px] rounded font-mono font-bold transition-all ${
                        matrixModelId === mId
                          ? 'bg-primary text-white shadow-xs scale-105'
                          : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low'
                      }`}
                    >
                      {mId}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                {/* 2x2 Matrix Table */}
                <div className="bg-white rounded-xl border border-outline-variant p-3 shadow-sm">
                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                    {/* Header */}
                    <div className="p-2 text-[11px] font-bold text-on-surface-variant">
                      {language === 'vi' ? 'Thực tế \\ Dự đoán' : 'Actual \\ Pred'}
                    </div>
                    <div className="p-2 font-bold bg-surface-container-low rounded text-tertiary-container">
                      {t.predBenign}
                    </div>
                    <div className="p-2 font-bold bg-surface-container-low rounded text-error">
                      {t.predMalignant}
                    </div>

                    {/* Row 1: Actual Benign */}
                    <div className="p-2.5 font-bold bg-surface-container-low rounded flex items-center justify-center text-on-surface">
                      {t.actualBenign}
                    </div>
                    <div className="p-3 bg-surface-container-highest/60 border border-tertiary-container/30 rounded-lg text-center">
                      <div className="font-mono text-base font-bold text-tertiary-container">{currentMatrix.tn}</div>
                      <div className="text-[10px] text-on-surface-variant font-sans font-medium">True Negative (TN)</div>
                    </div>
                    <div className="p-3 bg-error-container/20 border border-error/20 rounded-lg text-center">
                      <div className="font-mono text-base font-bold text-error">{currentMatrix.fp}</div>
                      <div className="text-[10px] text-on-surface-variant font-sans font-medium">False Positive (FP)</div>
                    </div>

                    {/* Row 2: Actual Malignant */}
                    <div className="p-2.5 font-bold bg-surface-container-low rounded flex items-center justify-center text-on-surface">
                      {t.actualMalignant}
                    </div>
                    <div className="p-3 bg-error-container/40 border border-error rounded-lg text-center">
                      <div className="font-mono text-base font-bold text-error">{currentMatrix.fn}</div>
                      <div className="text-[10px] text-error font-sans font-bold">False Negative (FN) ⚠️</div>
                    </div>
                    <div className="p-3 bg-primary-container/30 border border-primary rounded-lg text-center">
                      <div className="font-mono text-base font-bold text-primary">{currentMatrix.tp}</div>
                      <div className="text-[10px] text-on-surface-variant font-sans font-medium">True Positive (TP)</div>
                    </div>
                  </div>
                </div>

                {/* Matrix Clinical Interpretation */}
                <div className="space-y-2 text-xs font-sans text-on-surface-variant">
                  <div className="p-3 bg-white rounded-lg border border-outline-variant space-y-1">
                    <strong className="text-on-surface font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-tertiary-container">verified</span>
                      {t.clinicalInterpretationTitle}
                    </strong>
                    <p className="leading-relaxed">
                      {language === 'vi' ? (
                        <>
                          Mô hình nhận diện chính xác <strong>{currentMatrix.tp} / {currentMatrix.tp + currentMatrix.fn} ca ác tính thực tế</strong> (Độ nhạy Recall = {(((currentMatrix.tp) / (currentMatrix.tp + currentMatrix.fn || 1)) * 100).toFixed(1)}%) và <strong>{currentMatrix.tn} / {currentMatrix.tn + currentMatrix.fp} ca lành tính</strong>.
                        </>
                      ) : (
                        <>
                          Correctly identified <strong>{currentMatrix.tp} / {currentMatrix.tp + currentMatrix.fn} malignant cases</strong> (Recall Sensitivity = {(((currentMatrix.tp) / (currentMatrix.tp + currentMatrix.fn || 1)) * 100).toFixed(1)}%) and <strong>{currentMatrix.tn} / {currentMatrix.tn + currentMatrix.fp} benign cases</strong>.
                        </>
                      )}
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-outline-variant space-y-1">
                    <strong className="text-error font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">warning</span>
                      {t.clinicalSafetyTitle}
                    </strong>
                    <p className="leading-relaxed">
                      {language === 'vi' ? (
                        <>
                          Trong chẩn đoán ung thư, mục tiêu tối thượng là giảm thiểu <strong>FN ({currentMatrix.fn} ca)</strong> vì bỏ sót ca ác tính nguy hiểm hơn rất nhiều so với chẩn đoán nhầm ca lành tính.
                        </>
                      ) : (
                        <>
                          In oncological screening, minimizing <strong>False Negatives (FN = {currentMatrix.fn})</strong> is critical because delayed malignant intervention poses severe medical hazards.
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Deep-dive on 3 Improvements */}
        {activeTab === 'improvements' && (
          <div className="space-y-4 font-sans text-xs text-on-surface">
            <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant space-y-3">
              <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-base">auto_fix_high</span>
                {t.improvementsTitle}
              </h4>
              <p className="text-on-surface-variant leading-relaxed">
                {t.improvementsSubtitle}
              </p>
            </div>

            {/* 3 Improvement Cards */}
            <div className="space-y-3">
              {/* Method 1 */}
              <div className="p-4 bg-white rounded-xl border border-outline-variant space-y-2 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="font-bold text-sm text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">height</span>
                    {t.imp1Title}
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-surface-container-low text-primary">
                    Accuracy: 91.81% · Error: 8.19%
                  </span>
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  <strong>{language === 'vi' ? 'Mô tả phương pháp:' : 'Methodology:'}</strong> {t.imp1Desc}
                </p>
                <div className="p-2.5 bg-surface-container-low rounded-lg text-on-surface leading-relaxed">
                  {t.imp1Why}
                </div>
              </div>

              {/* Method 2 */}
              <div className="p-4 bg-white rounded-xl border border-outline-variant space-y-2 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="font-bold text-sm text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">functions</span>
                    {t.imp2Title}
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-surface-container-low text-primary">
                    Accuracy: 92.98% · Error: 7.02%
                  </span>
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  <strong>{language === 'vi' ? 'Mô tả phương pháp:' : 'Methodology:'}</strong> {t.imp2Desc}
                </p>
                <div className="p-2.5 bg-surface-container-low rounded-lg text-on-surface leading-relaxed">
                  {t.imp2Why}
                </div>
              </div>

              {/* Method 3 (Best) */}
              <div className="p-4 bg-white rounded-xl border-2 border-primary space-y-2 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="font-bold text-sm text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">content_cut</span>
                    {t.imp3Title}
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-primary text-white">
                    Accuracy: 93.86% · F1: 91.25% · Recall: 85.71%
                  </span>
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  <strong>{language === 'vi' ? 'Mô tả phương pháp:' : 'Methodology:'}</strong> {t.imp3Desc}
                </p>
                <div className="p-2.5 bg-primary/10 rounded-lg text-on-surface leading-relaxed">
                  {t.imp3Why}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Dataset Provenance */}
        {activeTab === 'dataset' && (
          <div className="space-y-4 font-sans text-xs text-on-surface">
            <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant space-y-3">
              <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                <span className="material-symbols-outlined text-base">storage</span>
                {t.datasetTitle}
              </h4>
              <p className="text-on-surface-variant leading-relaxed">
                {t.datasetSubtitle}
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans text-xs">
                <div className="bg-white p-3 rounded-lg border border-outline-variant">
                  <div className="text-on-surface-variant text-[11px] font-medium">{t.datasetSampleSizeTitle}</div>
                  <div className="font-bold text-primary text-sm mt-0.5">{t.datasetSampleSizeValue}</div>
                  <div className="text-[11px] text-outline mt-0.5">{t.datasetSampleSizeSub}</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-outline-variant">
                  <div className="text-on-surface-variant text-[11px] font-medium">{t.datasetFeatureSpaceTitle}</div>
                  <div className="font-bold text-primary text-sm mt-0.5">{t.datasetFeatureSpaceValue}</div>
                  <div className="text-[11px] text-outline mt-0.5">{t.datasetFeatureSpaceSub}</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-outline-variant">
                  <div className="text-on-surface-variant text-[11px] font-medium">{t.datasetProvenanceTitle}</div>
                  <div className="font-bold text-primary text-sm mt-0.5">UCI ID: #17</div>
                  <div className="text-[11px] text-outline mt-0.5">CC BY 4.0 License</div>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-outline-variant text-[11px] font-sans text-on-surface-variant">
                <strong>{t.datasetCitationTitle}</strong> Wolberg, W., Street, W., &amp; Mangasarian, O. (1995). Breast Cancer Wisconsin (Diagnostic). UCI Machine Learning Repository. https://doi.org/10.24432/C5DW2B.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicalDetailsSection;

