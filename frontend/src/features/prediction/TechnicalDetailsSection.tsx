import React, { useState, useEffect, useRef } from 'react';
import {
  PredictionResponse,
  ModelExperiment,
  TreeNodeData,
  DecisionStep,
} from '../../types/prediction';
import { EXPERIMENT_COMPARISON_DATA } from '../../data/featureDefinitions';
import { PredictionService } from '../../services/api';

export type DetailTab = 'tree' | 'experiments' | 'improvements' | 'dataset';
export type TreeOrientation = 'vertical' | 'horizontal';
export type TreeViewMode = 'full' | 'path_only';

interface TechnicalDetailsSectionProps {
  result: PredictionResponse | null;
  activeTab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
}

// Confusion matrix data for each model based on test set (171 samples: 107 Benign, 64 Malignant)
const CONFUSION_MATRIX_MAP: Record<
  string,
  { tn: number; fp: number; fn: number; tp: number; name: string }
> = {
  B0: {
    name: 'Mô hình Gốc: Sklearn Baseline (Unpruned)',
    tn: 101,
    fp: 6,
    fn: 6,
    tp: 58,
  },
  C0: {
    name: 'Cây Tự Lập Trình: Custom Tree',
    tn: 104,
    fp: 3,
    fn: 14,
    tp: 50,
  },
  I1: {
    name: 'Cải tiến 1: Giới hạn Độ sâu cây (max_depth=3)',
    tn: 103,
    fp: 4,
    fn: 10,
    tp: 54,
  },
  I2: {
    name: 'Cải tiến 2: Dùng Tiêu chuẩn Entropy',
    tn: 103,
    fp: 4,
    fn: 8,
    tp: 56,
  },
  I3: {
    name: 'Cải tiến 3: Tối ưu Cắt tỉa nhánh (min_samples)',
    tn: 104,
    fp: 3,
    fn: 8,
    tp: 56,
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
            Bước {depth + 1}: {currentStep.actualValue ?? (currentStep as any).value} ≤ {currentStep.threshold} ➔{' '}
            {currentStep.isSatisfied ? 'ĐÚNG' : 'SAI'}
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
            🎯 ĐÍCH ĐẾN: {isMalignant ? 'Ác tính (Malignant)' : 'Lành tính (Benign)'}
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
                ? `Nút Lá: ${node.predictedClass}`
                : `${node.feature} ≤ ${node.threshold}`)}
          </div>

          {node.criterion && (
            <div className="text-[11px] font-mono text-on-surface-variant mt-0.5">
              {node.criterion}
            </div>
          )}

          {node.samples !== undefined && (
            <div className="text-[11px] text-on-surface-variant mt-0.5">
              Tổng số mẫu: <strong>{node.samples}</strong>
            </div>
          )}

          {node.values && node.values.length === 2 && (
            <div className="text-[11px] text-outline mt-0.5 flex justify-center gap-2 font-mono">
              <span className="text-tertiary-container">Lành: {node.values[0]}</span>
              <span className="text-error">Ác: {node.values[1]}</span>
            </div>
          )}
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
                        {isLeft ? '≤ Đúng' : '> Sai'}
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
                        {isLeft ? 'Nhánh Trái (Đúng: ≤ Ngưỡng)' : 'Nhánh Phải (Sai: > Ngưỡng)'}
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
  activeTab,
  onTabChange,
}) => {
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

  const selectedModelId = result?.selectedModelId?.toUpperCase() || 'I3';
  const currentMatrix =
    CONFUSION_MATRIX_MAP[selectedModelId] || CONFUSION_MATRIX_MAP['I3'];

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
      const modelId = result?.selectedModelId || 'I3';
      PredictionService.getTreeStructure(modelId)
        .then((data) => {
          setTreeData(data);
        })
        .finally(() => {
          setLoadingTree(false);
        });
    }
  }, [activeTab, result?.selectedModelId]);

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
              Cơ sở Phân tích &amp; Báo cáo Thực nghiệm
            </h3>
            <p className="text-xs font-sans text-on-surface-variant">
              Trực quan hóa cấu trúc cây và đường suy luận, ma trận nhầm lẫn, bảng so sánh đối chuẩn và phân tích 3 phương pháp cải tiến
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
            Cấu trúc Cây &amp; Suy luận
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
            So sánh &amp; Ma trận Nhầm lẫn
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
            Phân tích 3 Cải tiến
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
            Hồ sơ Dữ liệu
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
                  <span>Đang hiển thị Đường đi Suy luận (Decision Trajectory) của mẫu hiện tại:</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-on-surface">
                  <span>Trải qua {decisionPath.length} phép thử phân tách</span>
                  <span>➔</span>
                  <span
                    className={`px-2.5 py-0.5 rounded text-white font-bold ${
                      result.prediction === 'M' ? 'bg-error' : 'bg-tertiary-container'
                    }`}
                  >
                    {result.diagnosisLabelVi} ({formatPercent(result.confidence)})
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-surface-container-low border border-outline-variant rounded-xl flex items-center justify-between gap-2 text-xs font-sans text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-base text-primary">lightbulb</span>
                  <span>Nhập thông số hoặc chọn mẫu ca bệnh ở trên rồi bấm <strong>"Thực hiện chẩn đoán"</strong> để xem vệt sáng minh họa đường suy luận từng bước trên cây!</span>
                </div>
              </div>
            )}

            {/* Tree Toolbar: View Mode, Orientation & Zoom controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-surface-bright p-3 rounded-xl border border-outline-variant">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-sans text-on-surface-variant">
                    Mô hình: <strong className="text-primary">{selectedModelId}</strong>
                  </span>
                  <span className="text-outline text-xs">|</span>
                  <div className="flex items-center gap-2 text-xs font-sans">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-highest text-tertiary-container font-semibold text-[11px]">
                      ● Lành tính
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-error-container text-error font-semibold text-[11px]">
                      ● Ác tính
                    </span>
                  </div>
                </div>

                {/* View Scope Toggle: Toàn bộ cây vs Nhánh suy luận (làm mờ nhánh phụ) */}
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
                    title="Hiển thị tất cả nhánh rõ 100% không làm mờ"
                  >
                    <span className="material-symbols-outlined text-sm">nature</span>
                    Toàn bộ cây
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
                    title="Làm nổi bật nhánh suy luận và làm mờ các nhánh không liên quan"
                  >
                    <span className="material-symbols-outlined text-sm">timeline</span>
                    Chỉ nhánh suy luận
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
                    title="Xem cây theo chiều dọc (Từ trên xuống dưới)"
                  >
                    <span className="material-symbols-outlined text-sm">align_vertical_top</span>
                    Xem Dọc
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
                    title="Xem cây theo chiều ngang (Từ trái sang phải)"
                  >
                    <span className="material-symbols-outlined text-sm">align_horizontal_left</span>
                    Xem Ngang
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
                    title="Đặt lại vị trí &amp; kích thước mặc định"
                  >
                    ↺ Đặt lại
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic Hierarchical Tree Canvas with Centered Root, Drag-and-Pan & Scroll Wheel Zoom */}
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
                  <span>Kéo chuột để di chuyển</span>
                </span>
                <span className="text-outline">·</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px] text-primary">mouse</span>
                  <span>Lăn chuột để Phóng to / Thu nhỏ</span>
                </span>
              </div>

              {loadingTree ? (
                <div className="text-center py-16 text-on-surface-variant">
                  Đang nạp cấu trúc cây quyết định từ máy chủ...
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
                  Chưa có dữ liệu cấu trúc cây cho mô hình này.
                </div>
              )}
            </div>

            {/* Tree Analysis & Overfitting Insights */}
            <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant space-y-3 font-sans text-xs">
              <h4 className="font-bold text-xs text-primary uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">insights</span>
                Nhận Xét Cấu Trúc Cây &amp; Hiện Tượng Quá Khớp (Tree Analysis &amp; Overfitting)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white p-3 rounded-lg border border-outline-variant space-y-1">
                  <div className="font-semibold text-primary">1. Nút gốc &amp; Phân tách then chốt</div>
                  <p className="text-on-surface-variant leading-relaxed">
                    Thuộc tính <strong>perimeter_worst</strong> (hoặc <strong>concave_points_worst</strong>) liên tục được chọn làm nút gốc nhờ khả năng giảm độ đo tạp chất (Information Gain) lớn nhất.
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-outline-variant space-y-1">
                  <div className="font-semibold text-error">2. Nguy cơ Overfitting ở cây Baseline</div>
                  <p className="text-on-surface-variant leading-relaxed">
                    Mô hình cơ sở không giới hạn độ sâu (Unpruned) phát triển tới độ sâu ≥ 8, tạo ra nhiều nút lá chỉ chứa 1 mẫu bệnh phẩm, khiến cây quá khớp với tập huấn luyện và kém ổn định.
                  </p>
                </div>
                <div className="bg-white p-3 rounded-lg border border-outline-variant space-y-1">
                  <div className="font-semibold text-primary">3. Hiệu quả của Cắt tỉa (Pruning)</div>
                  <p className="text-on-surface-variant leading-relaxed">
                    Khi áp dụng <strong>min_samples_split=4</strong> và <strong>min_samples_leaf=2</strong>, cây loại bỏ các nhánh nhiễu, giúp giữ lại các quy tắc chẩn đoán ngắn gọn, trực quan và tổng quát hóa cao.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: 5-Experiment Comparison & Confusion Matrix */}
        {activeTab === 'experiments' && (
          <div className="space-y-5">
            {/* Quick KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant text-center">
                <div className="font-sans text-xs text-on-surface-variant font-medium">Độ chính xác toàn cục</div>
                <div className="font-mono text-lg font-bold text-primary mt-1">{accuracy}</div>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant text-center">
                <div className="font-sans text-xs text-on-surface-variant font-medium">Tỷ lệ phân loại sai (Error Rate)</div>
                <div className="font-mono text-lg font-bold text-error mt-1">{errorRate}</div>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant text-center">
                <div className="font-sans text-xs text-on-surface-variant font-medium">Độ nhạy Ác tính (Recall)</div>
                <div className="font-mono text-lg font-bold text-primary mt-1">{recall}</div>
              </div>
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant text-center">
                <div className="font-sans text-xs text-on-surface-variant font-medium">Điểm tổng hòa F1-Score</div>
                <div className="font-mono text-lg font-bold text-primary mt-1">{f1}</div>
              </div>
            </div>

            {/* Main Comparison Table */}
            <div className="overflow-x-auto border border-outline-variant rounded-xl shadow-sm">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead className="bg-surface-bright text-on-surface font-semibold border-b border-outline-variant">
                  <tr>
                    <th className="p-3">Phương pháp / Mô hình</th>
                    <th className="p-3">Tiêu chuẩn phân hoạch</th>
                    <th className="p-3">Độ sâu tối đa</th>
                    <th className="p-3 text-primary">Độ chính xác (Accuracy)</th>
                    <th className="p-3 text-error">Tỷ lệ lỗi (Error Rate)</th>
                    <th className="p-3">Độ nhạy Ác tính (Recall)</th>
                    <th className="p-3">F1-Score</th>
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
                        {exp.name}
                        {exp.isBest && (
                          <span className="ml-2 text-[10px] bg-primary text-white px-2 py-0.5 rounded-full uppercase">
                            Tốt nhất
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-on-surface font-sans">{exp.criterion}</td>
                      <td className="p-3 text-on-surface">{exp.maxDepth}</td>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h4 className="font-bold text-xs text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">grid_view</span>
                  Ma Trận Nhầm Lẫn (Confusion Matrix: {currentMatrix.name})
                </h4>
                <span className="text-[11px] text-on-surface-variant font-mono">
                  Tập kiểm thử Test: 171 mẫu (107 Lành tính · 64 Ác tính)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                {/* 2x2 Matrix Table */}
                <div className="bg-white rounded-xl border border-outline-variant p-3 shadow-sm">
                  <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
                    {/* Header */}
                    <div className="p-2 text-[11px] font-bold text-on-surface-variant">Thực tế \ Dự đoán</div>
                    <div className="p-2 font-bold bg-surface-container-low rounded text-tertiary-container">
                      Dự đoán Lành tính (B)
                    </div>
                    <div className="p-2 font-bold bg-surface-container-low rounded text-error">
                      Dự đoán Ác tính (M)
                    </div>

                    {/* Row 1: Actual Benign */}
                    <div className="p-2.5 font-bold bg-surface-container-low rounded flex items-center justify-center text-on-surface">
                      Thực tế: Lành tính (B)
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
                      Thực tế: Ác tính (M)
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
                      Khả năng phát hiện khối u chính xác:
                    </strong>
                    <p className="leading-relaxed">
                      Mô hình nhận diện chính xác <strong>{currentMatrix.tp} / 64 ca ác tính thực tế</strong> (Độ nhạy Recall = {((currentMatrix.tp / 64) * 100).toFixed(1)}%) và <strong>{currentMatrix.tn} / 107 ca lành tính</strong>.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-outline-variant space-y-1">
                    <strong className="text-error font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">warning</span>
                      Ý nghĩa an toàn y khoa (False Negatives - Bỏ sót ác tính):
                    </strong>
                    <p className="leading-relaxed">
                      Trong chẩn đoán ung thư, mục tiêu tối thượng là giảm thiểu <strong>FN ({currentMatrix.fn} ca)</strong> vì bỏ sót ca ác tính nguy hiểm hơn rất nhiều so với chẩn đoán nhầm ca lành tính.
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
                Phân Tích Chuyên Sâu 3 Phương Pháp Cải Tiến Mô Hình
              </h4>
              <p className="text-on-surface-variant leading-relaxed">
                Chi tiết nguyên lý toán học, cấu hình tham số thực nghiệm và giải thích nguyên nhân tại sao các phương pháp cải tiến giúp tăng hiệu năng tổng quát hóa trên tập dữ liệu Wisconsin:
              </p>
            </div>

            {/* 3 Improvement Cards */}
            <div className="space-y-3">
              {/* Method 1 */}
              <div className="p-4 bg-white rounded-xl border border-outline-variant space-y-2 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="font-bold text-sm text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">height</span>
                    Phương pháp 1: Khống chế Chiều sâu cây (max_depth)
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-surface-container-low text-primary">
                    Accuracy: 91.81% · Error: 8.19%
                  </span>
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  <strong>Mô tả phương pháp:</strong> Giới hạn độ sâu tối đa của cây ở mức <code className="font-mono bg-surface-container-low px-1 rounded">max_depth = 3</code> thay vì phát triển vô hạn (None).
                </p>
                <div className="p-2.5 bg-surface-container-low rounded-lg text-on-surface leading-relaxed">
                  <strong>💡 Tại sao cải tiến này giúp tăng hiệu năng / giảm lỗi:</strong> Giúp ngăn chặn hiện tượng quá khớp (Overfitting), giảm phương sai (Variance) của mô hình. Cây quyết định dừng sớm ở các quy tắc tổng quát thay vì cố gắng phân tách từng điểm nhiễu ngoại lai.
                </div>
              </div>

              {/* Method 2 */}
              <div className="p-4 bg-white rounded-xl border border-outline-variant space-y-2 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="font-bold text-sm text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">functions</span>
                    Phương pháp 2: Tiêu chuẩn phân hoạch (Gini vs Entropy)
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-surface-container-low text-primary">
                    Accuracy: 92.98% · Error: 7.02%
                  </span>
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  <strong>Mô tả phương pháp:</strong> Thay đổi hàm tính toán độ tinh khiết phân tách từ <code className="font-mono bg-surface-container-low px-1 rounded">Gini Impurity</code> sang <code className="font-mono bg-surface-container-low px-1 rounded">Information Gain (Entropy)</code>.
                </p>
                <div className="p-2.5 bg-surface-container-low rounded-lg text-on-surface leading-relaxed">
                  <strong>💡 Tại sao cải tiến này giúp tăng hiệu năng / giảm lỗi:</strong> Thước đo Entropy có hàm logarit nên nhạy cảm hơn với sự mất cân bằng phân phối xác suất tại các nhánh ranh giới, giúp lựa chọn các điểm cắt (thresholds) tối ưu hơn trên các đặc trưng tế bào liên tục.
                </div>
              </div>

              {/* Method 3 (Best) */}
              <div className="p-4 bg-white rounded-xl border-2 border-primary space-y-2 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="font-bold text-sm text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base">content_cut</span>
                    Phương pháp 3: Tối ưu Cắt tỉa nhánh (min_samples_split / leaf) ⭐ [TỐT NHẤT]
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-primary text-white">
                    Accuracy: 93.86% · F1: 91.25% · Recall: 85.71%
                  </span>
                </div>
                <p className="text-on-surface-variant leading-relaxed">
                  <strong>Mô tả phương pháp:</strong> Thiết lập điều kiện cắt tỉa sớm (Pre-pruning) với <code className="font-mono bg-surface-container-low px-1 rounded">min_samples_split = 4</code> và <code className="font-mono bg-surface-container-low px-1 rounded">min_samples_leaf = 2</code> kết hợp độ sâu <code className="font-mono bg-surface-container-low px-1 rounded">max_depth = 4</code>.
                </p>
                <div className="p-2.5 bg-primary/10 rounded-lg text-on-surface leading-relaxed">
                  <strong>💡 Tại sao cải tiến này đạt kết quả tốt nhất:</strong> Bằng cách không cho phép sinh ra các nút lá đơn lẻ (≤ 1 mẫu), mô hình loại bỏ hoàn toàn các nhánh con rác, nâng cao độ bền vững khi gặp dữ liệu mới và đạt điểm F1-score cũng như Recall ác tính cao nhất trong toàn bộ các thí nghiệm.
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
                Bộ Dữ Liệu UCI Breast Cancer Wisconsin (Diagnostic)
              </h4>
              <p className="text-on-surface-variant leading-relaxed">
                Được công bố bởi <strong>Dr. William H. Wolberg, W. Nick Street và Olvi L. Mangasarian</strong> (Đại học Wisconsin, 1995).
                Bộ dữ liệu bao gồm <strong>569 mẫu sinh thiết</strong> với <strong>30 thuộc tính số thực</strong> đo lường đặc điểm hình học của nhân tế bào ung thư vú.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans text-xs">
                <div className="bg-white p-3 rounded-lg border border-outline-variant">
                  <div className="text-on-surface-variant text-[11px] font-medium">Quy mô mẫu</div>
                  <div className="font-bold text-primary text-sm mt-0.5">569 trường hợp</div>
                  <div className="text-[11px] text-outline mt-0.5">357 Lành tính (B) · 212 Ác tính (M)</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-outline-variant">
                  <div className="text-on-surface-variant text-[11px] font-medium">Không gian đặc trưng</div>
                  <div className="font-bold text-primary text-sm mt-0.5">30 thuộc tính liên tục</div>
                  <div className="text-[11px] text-outline mt-0.5">10 Giá trị trung bình · 10 Sai số · 10 Cực đại</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-outline-variant">
                  <div className="text-on-surface-variant text-[11px] font-medium">Nguồn gốc &amp; Bản quyền</div>
                  <div className="font-bold text-primary text-sm mt-0.5">UCI ID: #17</div>
                  <div className="text-[11px] text-outline mt-0.5">Giấy phép mở: CC BY 4.0</div>
                </div>
              </div>

              <div className="p-3 bg-white rounded-lg border border-outline-variant text-[11px] font-sans text-on-surface-variant">
                <strong>Trích dẫn khoa học:</strong> Wolberg, W., Street, W., &amp; Mangasarian, O. (1995). Breast Cancer Wisconsin (Diagnostic). UCI Machine Learning Repository. https://doi.org/10.24432/C5DW2B.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TechnicalDetailsSection;
