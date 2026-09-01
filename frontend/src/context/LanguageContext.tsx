import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'vi' | 'en';

export interface Translations {
  // Brand & Navbar
  brandTitle: string;
  brandSubtitle: string;
  navDiagnose: string;
  navTree: string;
  navApiDocs: string;
  navAboutUs: string;
  navReset: string;

  // Disclaimer
  disclaimerTag: string;
  disclaimerText: string;

  // Form
  formTitle: string;
  formSubtitle: string;
  selectModelLabel: string;
  tabMean: string;
  tabSe: string;
  tabWorst: string;
  btnRandom: string;
  btnMalignantPreset: string;
  btnBenignPreset: string;
  btnBorderlinePreset: string;
  btnClear: string;
  btnSubmit: string;
  btnSubmitting: string;
  inputValidationHelper: string;

  // Prediction Result
  resultTitle: string;
  resultSubtitle: string;
  diagnosisMalignant: string;
  diagnosisBenign: string;
  confidenceScore: string;
  classProbabilityTitle: string;
  probMalignant: string;
  probBenign: string;
  topFeaturesTitle: string;
  metricAccuracy: string;
  metricErrorRate: string;
  metricRecall: string;
  metricF1: string;
  waitingResult: string;
  waitingResultHint: string;

  // Technical Details Tabs
  tabTreeTitle: string;
  tabExperimentsTitle: string;
  tabImprovementsTitle: string;
  tabDatasetTitle: string;

  // Tree Visualizer
  treeSectionTitle: string;
  treeSectionSubtitle: string;
  treeModelLabel: string;
  legendBenign: string;
  legendMalignant: string;
  viewModeFull: string;
  viewModePath: string;
  orientationVertical: string;
  orientationHorizontal: string;
  zoomReset: string;
  canvasDragHelper: string;
  canvasWheelHelper: string;
  trajectoryBannerTitle: string;
  trajectoryStepsCount: string;
  trajectoryPrompt: string;
  leafTargetBanner: string;
  leafBenignLabel: string;
  leafMalignantLabel: string;
  stepPrefix: string;
  stepTrue: string;
  stepFalse: string;
  branchLeftTrue: string;
  branchRightFalse: string;
  branchLeftShort: string;
  branchRightShort: string;
  totalSamples: string;
  loadingTree: string;
  noTreeData: string;

  // Dynamic Tree Insights
  insightsTitle: string;
  insightsDepth: string;
  insightsLeaves: string;
  insightsNodes: string;
  insightRootTitle: string;
  insightStructureTitle: string;
  insightGeneralizationTitle: string;

  // Confusion Matrix Tab
  matrixTitle: string;
  matrixSubtitle: string;
  matrixAccuracyCard: string;
  matrixErrorCard: string;
  matrixRecallCard: string;
  matrixF1Card: string;
  benchmarkTableTitle: string;
  colModelId: string;
  colModelName: string;
  colOwner: string;
  colCriterion: string;
  colDepth: string;
  colLeaves: string;
  colAccuracy: string;
  colError: string;
  colRecall: string;
  colF1: string;
  colStatus: string;
  bestBadge: string;
  actualMalignant: string;
  actualBenign: string;
  predMalignant: string;
  predBenign: string;
  confusionMatrixTitle: string;
  clinicalInterpretationTitle: string;
  clinicalSafetyTitle: string;

  // Improvements Tab
  improvementsTitle: string;
  improvementsSubtitle: string;
  imp1Title: string;
  imp1Desc: string;
  imp1Why: string;
  imp2Title: string;
  imp2Desc: string;
  imp2Why: string;
  imp3Title: string;
  imp3Desc: string;
  imp3Why: string;

  // Dataset Tab
  datasetTitle: string;
  datasetSubtitle: string;
  datasetSampleSizeTitle: string;
  datasetSampleSizeValue: string;
  datasetSampleSizeSub: string;
  datasetFeatureSpaceTitle: string;
  datasetFeatureSpaceValue: string;
  datasetFeatureSpaceSub: string;
  datasetProvenanceTitle: string;
  datasetCitationTitle: string;

  // Modals
  aboutUsTitle: string;
  aboutUsSubtitle: string;
  aboutUsObjectives: string;
  aboutUsTeamTableTitle: string;
  colFullName: string;
  colGmail: string;
  colRole: string;
  colContribution: string;
  aboutUsImprovementsTitle: string;
  apiDocsTitle: string;
  apiDocsSubtitle: string;
  btnClose: string;

  // Footer
  footerDisclaimer: string;
  footerRights: string;
}

export const translations: Record<Language, Translations> = {
  vi: {
    // Brand & Navbar
    brandTitle: 'Chẩn Đoán Ung Thư Vú',
    brandSubtitle: 'Hệ thống Dự đoán & Trực quan hóa Cây Quyết định Ung thư Vú',
    navDiagnose: 'Nhập liệu & Chẩn đoán',
    navTree: 'Cây Quyết định & Báo cáo',
    navApiDocs: 'Tài liệu API',
    navAboutUs: 'About Us',
    navReset: 'Đặt lại dữ liệu',

    // Disclaimer
    disclaimerTag: 'Lưu ý Học thuật',
    disclaimerText:
      'Ứng dụng này phục vụ mục đích nghiên cứu và giáo dục trong khuôn khổ môn học Machine Learning (Học Máy), không cấu thành lời khuyên y tế lâm sàng hay thay thế chẩn đoán của bác sĩ.',

    // Form
    formTitle: 'Dữ Liệu Khối U Sinh Thiết (30 Chỉ Số)',
    formSubtitle: 'Trích xuất tự động qua xử lý ảnh số hóa từ kỹ thuật chọc hút tế bào kim nhỏ (FNA)',
    selectModelLabel: 'Lựa chọn Thuật toán / Mô hình Cây Quyết Định',
    tabMean: 'Giá trị Trung bình (Mean)',
    tabSe: 'Sai số Chuẩn (SE)',
    tabWorst: 'Giá trị Cực đại (Worst)',
    btnRandom: 'Mẫu ngẫu nhiên',
    btnMalignantPreset: 'Ca Ác tính điển hình',
    btnBenignPreset: 'Ca Lành tính điển hình',
    btnBorderlinePreset: 'Ca Ranh giới (Borderline)',
    btnClear: 'Xóa toàn bộ',
    btnSubmit: 'Thực hiện Chẩn đoán & Suy luận',
    btnSubmitting: 'Đang xử lý phân loại...',
    inputValidationHelper: 'Đơn vị đo chuẩn y sinh Wisconsin. Nhập giá trị số thực dương hợp lệ.',

    // Prediction Result
    resultTitle: 'Kết Quả Phân Loại Khối U',
    resultSubtitle: 'Suy luận thời gian thực từ Cây Quyết Định',
    diagnosisMalignant: 'Ác tính (Malignant)',
    diagnosisBenign: 'Lành tính (Benign)',
    confidenceScore: 'Độ tin cậy tại Nút Lá',
    classProbabilityTitle: 'Xác suất Ước tính theo Phân lớp',
    probMalignant: 'Khối u Ác tính (M)',
    probBenign: 'Khối u Lành tính (B)',
    topFeaturesTitle: 'Top 3 Đặc trưng Hình học Chi phối Chẩn đoán',
    metricAccuracy: 'Độ chính xác',
    metricErrorRate: 'Tỷ lệ lỗi',
    metricRecall: 'Độ nhạy (Recall)',
    metricF1: 'Điểm F1-Score',
    waitingResult: 'Sẵn sàng chẩn đoán',
    waitingResultHint: 'Nhập thông số hoặc chọn mẫu có sẵn ở bên trái rồi nhấn "Thực hiện Chẩn đoán".',

    // Technical Details Tabs
    tabTreeTitle: 'Cấu trúc Cây & Suy luận',
    tabExperimentsTitle: 'So sánh & Ma trận Nhầm lẫn',
    tabImprovementsTitle: 'Phân tích 3 Cải tiến',
    tabDatasetTitle: 'Hồ sơ Dữ liệu',

    // Tree Visualizer
    treeSectionTitle: 'Cơ sở Phân tích & Báo cáo Thực nghiệm',
    treeSectionSubtitle: 'Trực quan hóa cấu trúc cây, đường suy luận, ma trận nhầm lẫn và bảng đối chuẩn',
    treeModelLabel: 'Mô hình',
    legendBenign: '● Lành tính (Benign)',
    legendMalignant: '● Ác tính (Malignant)',
    viewModeFull: 'Toàn bộ cây',
    viewModePath: 'Chỉ nhánh suy luận',
    orientationVertical: 'Xem Dọc',
    orientationHorizontal: 'Xem Ngang',
    zoomReset: '↺ Đặt lại',
    canvasDragHelper: 'Kéo chuột để di chuyển',
    canvasWheelHelper: 'Lăn chuột để Phóng to / Thu nhỏ',
    trajectoryBannerTitle: 'Đang hiển thị Đường đi Suy luận (Decision Trajectory) của mẫu hiện tại:',
    trajectoryStepsCount: 'Trải qua {count} phép thử phân tách',
    trajectoryPrompt: 'Nhập thông số hoặc chọn mẫu ở trên rồi bấm "Thực hiện chẩn đoán" để xem vệt sáng minh họa đường suy luận!',
    leafTargetBanner: '🎯 ĐÍCH ĐẾN: ',
    leafBenignLabel: 'Lá: Lành tính',
    leafMalignantLabel: 'Lá: Ác tính',
    stepPrefix: 'Bước',
    stepTrue: 'ĐÚNG',
    stepFalse: 'SAI',
    branchLeftTrue: 'Nhánh Trái (Đúng: ≤ Ngưỡng)',
    branchRightFalse: 'Nhánh Phải (Sai: > Ngưỡng)',
    branchLeftShort: '≤ Đúng',
    branchRightShort: '> Sai',
    totalSamples: 'Tổng số mẫu',
    loadingTree: 'Đang nạp cấu trúc cây quyết định từ máy chủ...',
    noTreeData: 'Chưa có dữ liệu cấu trúc cây cho mô hình này.',

    // Dynamic Tree Insights
    insightsTitle: 'Nhận Xét Động: Cấu Trúc Cây & Hiện Tượng Quá Khớp',
    insightsDepth: 'Độ sâu thực tế',
    insightsLeaves: 'Tổng nút lá',
    insightsNodes: 'Tổng số nút',
    insightRootTitle: '1. Phân tách then chốt tại nút gốc',
    insightStructureTitle: '2. Cấu trúc tầng & Nguy cơ quá khớp',
    insightGeneralizationTitle: '3. Đánh giá tổng quát hóa (Test Set)',

    // Confusion Matrix Tab
    matrixTitle: 'Bảng Đối Chuẩn Hiệu Năng & Ma Trận Nhầm Lẫn 2x2',
    matrixSubtitle: 'Đánh giá khách quan trên tập kiểm thử độc lập (Test Set gồm 171 mẫu: 107 Lành tính · 64 Ác tính)',
    matrixAccuracyCard: 'Độ chính xác toàn cục',
    matrixErrorCard: 'Tỷ lệ phân loại sai (Error Rate)',
    matrixRecallCard: 'Độ nhạy Ác tính (Malignant Recall)',
    matrixF1Card: 'Điểm tổng hòa F1-Score',
    benchmarkTableTitle: 'Bảng So Sánh Hiệu Năng 5 Mô Hình Thực Nghiệm',
    colModelId: 'Mã ID',
    colModelName: 'Tên Mô Hình / Phương Pháp',
    colOwner: 'Phụ Trách',
    colCriterion: 'Tiêu Chuẩn',
    colDepth: 'Độ Sâu',
    colLeaves: 'Số Lá',
    colAccuracy: 'Độ Chính Xác',
    colError: 'Tỷ Lệ Lỗi',
    colRecall: 'Recall Ác Tính',
    colF1: 'F1-Score',
    colStatus: 'Trạng Thái',
    bestBadge: 'Tốt nhất ⭐',
    actualMalignant: 'Thực tế Ác tính (M)',
    actualBenign: 'Thực tế Lành tính (B)',
    predMalignant: 'Dự đoán Ác tính (M)',
    predBenign: 'Dự đoán Lành tính (B)',
    confusionMatrixTitle: 'Ma Trận Nhầm Lẫn 2x2 Thực Nghiệm (Confusion Matrix)',
    clinicalInterpretationTitle: 'Khả năng phát hiện khối u chính xác:',
    clinicalSafetyTitle: 'Ý nghĩa an toàn y khoa (False Negatives - Bỏ sót ác tính):',

    // Improvements Tab
    improvementsTitle: 'Phân Tích Chuyên Sâu 3 Phương Pháp Cải Tiến Mô Hình',
    improvementsSubtitle: 'Chi tiết nguyên lý toán học, cấu hình tham số và lý do nâng cao năng lực tổng quát hóa',
    imp1Title: 'Phương pháp 1: Khống chế Chiều sâu cây (max_depth = 3)',
    imp1Desc: 'Giới hạn độ sâu tối đa của cây ở mức max_depth = 3 thay vì phát triển vô hạn.',
    imp1Why: '💡 Tại sao cải tiến này giúp giảm lỗi: Ngăn chặn hiện tượng quá khớp (Overfitting), giảm phương sai (Variance). Cây dừng sớm ở các quy tắc tổng quát thay vì học vẹt các điểm nhiễu ngoại lai.',
    imp2Title: 'Phương pháp 2: Tiêu chuẩn phân hoạch (Gini vs Entropy)',
    imp2Desc: 'Chuyển đổi hàm đo độ tạp chất từ Gini Impurity sang Information Gain (Entropy).',
    imp2Why: '💡 Tại sao cải tiến này giúp tăng hiệu năng: Thước đo Entropy có hàm logarit nên nhạy cảm hơn với sự mất cân bằng phân phối xác suất tại các nhánh ranh giới, giúp lựa chọn các ngưỡng cắt tối ưu hơn.',
    imp3Title: 'Phương pháp 3: Điều chỉnh số mẫu tối thiểu (Adjusting min_samples_split / leaf) ⭐ [TỐT NHẤT]',
    imp3Desc: 'Thiết lập điều kiện cắt tỉa sớm với min_samples_split = 4 và min_samples_leaf = 2 kết hợp max_depth = 4.',
    imp3Why: '💡 Tại sao cải tiến này đạt kết quả tốt nhất: Loại bỏ hoàn toàn các nút lá đơn lẻ (1 mẫu), nâng cao độ bền vững khi gặp dữ liệu mới và đạt F1-Score (91.25%) cùng Recall ác tính (85.71%) cao nhất.',

    // Dataset Tab
    datasetTitle: 'Bộ Dữ Liệu UCI Breast Cancer Wisconsin (Diagnostic)',
    datasetSubtitle: 'Công bố bởi Dr. William H. Wolberg, W. Nick Street và Olvi L. Mangasarian (Đại học Wisconsin, 1995)',
    datasetSampleSizeTitle: 'Quy mô mẫu',
    datasetSampleSizeValue: '569 trường hợp',
    datasetSampleSizeSub: '357 Lành tính (B) · 212 Ác tính (M)',
    datasetFeatureSpaceTitle: 'Không gian đặc trưng',
    datasetFeatureSpaceValue: '30 thuộc tính liên tục',
    datasetFeatureSpaceSub: '10 Giá trị trung bình · 10 Sai số · 10 Cực đại',
    datasetProvenanceTitle: 'Nguồn gốc & Bản quyền',
    datasetCitationTitle: 'Trích dẫn khoa học:',

    // Modals
    aboutUsTitle: 'Về Nhóm Nghiên Cứu & Đề Tài Lab 2',
    aboutUsSubtitle: 'Phân loại Chẩn đoán Ung thư Vú bằng Thuật toán Cây Quyết định (Decision Tree Learning)',
    aboutUsObjectives: 'Mục Tiêu Đề Tài:',
    aboutUsTeamTableTitle: 'Danh Sách Thành Viên & Bảng Phân Công Nhiệm Vụ:',
    colFullName: 'Họ và Tên',
    colGmail: 'Gmail',
    colRole: 'Nhiệm Vụ Đảm Nhận Chính',
    colContribution: 'Đóng Góp',
    aboutUsImprovementsTitle: 'Tóm Tắt 3 Hướng Cải Tiến Mô Hình:',
    apiDocsTitle: 'Tài Liệu RESTful API Backend (FastAPI)',
    apiDocsSubtitle: 'Tra cứu trực tiếp tài liệu OpenAPI Swagger UI và ReDoc của máy chủ',
    btnClose: 'Đóng',

    // Footer
    footerDisclaimer: 'Cảnh báo: Ứng dụng phục vụ nghiên cứu và giáo dục học thuật môn học Machine Learning, không thay thế chẩn đoán y tế chuyên khoa.',
    footerRights: 'Breast Cancer Decision Tree Platform · All rights reserved.',
  },

  en: {
    // Brand & Navbar
    brandTitle: 'Breast Cancer Diagnostic',
    brandSubtitle: 'Decision Tree Diagnostic Classification & Interactive Trajectory Visualizer',
    navDiagnose: 'Clinical Entry & Diagnosis',
    navTree: 'Decision Tree & Reports',
    navApiDocs: 'API Documentation',
    navAboutUs: 'About Us',
    navReset: 'Reset Form',

    // Disclaimer
    disclaimerTag: 'Academic Disclaimer',
    disclaimerText:
      'This application is built strictly for academic research and educational demonstration in the Machine Learning course. It does not constitute clinical medical advice or substitute professional medical diagnosis.',

    // Form
    formTitle: 'Biopsy Cellular Features (30 Continuous Metrics)',
    formSubtitle: 'Digitized image features extracted from Fine Needle Aspirate (FNA) cell nuclei',
    selectModelLabel: 'Select Decision Tree Model / Algorithm Variant',
    tabMean: 'Mean Values',
    tabSe: 'Standard Error (SE)',
    tabWorst: 'Worst / Largest Values',
    btnRandom: 'Random Sample',
    btnMalignantPreset: 'Typical Malignant Case',
    btnBenignPreset: 'Typical Benign Case',
    btnBorderlinePreset: 'Borderline Case',
    btnClear: 'Clear Form',
    btnSubmit: 'Run Diagnostic Prediction',
    btnSubmitting: 'Classifying Cellular Features...',
    inputValidationHelper: 'Standard Wisconsin continuous metric values. Enter positive floating-point numbers.',

    // Prediction Result
    resultTitle: 'Tumor Classification Result',
    resultSubtitle: 'Real-time inference generated by Decision Tree',
    diagnosisMalignant: 'Malignant Tumor (M)',
    diagnosisBenign: 'Benign Tumor (B)',
    confidenceScore: 'Leaf Node Confidence',
    classProbabilityTitle: 'Class Posterior Probability Distribution',
    probMalignant: 'Malignant Class (M)',
    probBenign: 'Benign Class (B)',
    topFeaturesTitle: 'Top 3 Geometric Drivers Influencing Decision',
    metricAccuracy: 'Accuracy',
    metricErrorRate: 'Error Rate',
    metricRecall: 'Malignant Recall',
    metricF1: 'F1-Score',
    waitingResult: 'Ready for Diagnostic Evaluation',
    waitingResultHint: 'Enter 30 cell parameters or load a clinical preset from the left panel, then click "Run Diagnostic Prediction".',

    // Technical Details Tabs
    tabTreeTitle: 'Tree Hierarchy & Trajectory',
    tabExperimentsTitle: 'Benchmarks & Confusion Matrix',
    tabImprovementsTitle: '3 Improvement Methods',
    tabDatasetTitle: 'Dataset Provenance',

    // Tree Visualizer
    treeSectionTitle: 'Analytical Workspace & Experimental Evaluation',
    treeSectionSubtitle: 'Interactive decision tree canvas, live inference trajectory, 2x2 confusion matrix, and benchmark tables',
    treeModelLabel: 'Active Model',
    legendBenign: '● Benign',
    legendMalignant: '● Malignant',
    viewModeFull: 'Full Tree',
    viewModePath: 'Active Path Only',
    orientationVertical: 'Vertical View',
    orientationHorizontal: 'Horizontal View',
    zoomReset: '↺ Reset View',
    canvasDragHelper: 'Click & Drag to Pan Canvas',
    canvasWheelHelper: 'Mouse Wheel to Zoom in/out',
    trajectoryBannerTitle: 'Visualizing Live Decision Trajectory for Current Patient Sample:',
    trajectoryStepsCount: 'Traversed through {count} splitting decision rules',
    trajectoryPrompt: 'Run a prediction or select a preset above to illuminate the step-by-step decision trajectory through the tree!',
    leafTargetBanner: '🎯 TARGET LEAF: ',
    leafBenignLabel: 'Leaf: Benign',
    leafMalignantLabel: 'Leaf: Malignant',
    stepPrefix: 'Step',
    stepTrue: 'TRUE',
    stepFalse: 'FALSE',
    branchLeftTrue: 'Left Branch (True: ≤ Threshold)',
    branchRightFalse: 'Right Branch (False: > Threshold)',
    branchLeftShort: '≤ True',
    branchRightShort: '> False',
    totalSamples: 'Total Samples',
    loadingTree: 'Fetching hierarchical decision tree structure from backend...',
    noTreeData: 'No tree structure data available for this model variant.',

    // Dynamic Tree Insights
    insightsTitle: 'Dynamic Real-Time Insights: Tree Geometry & Overfitting Analysis',
    insightsDepth: 'Actual Depth',
    insightsLeaves: 'Terminal Leaves',
    insightsNodes: 'Total Nodes',
    insightRootTitle: '1. Primary Root Node Split',
    insightStructureTitle: '2. Hierarchy & Overfitting Risk',
    insightGeneralizationTitle: '3. Generalization Performance (Test Set)',

    // Confusion Matrix Tab
    matrixTitle: 'Model Benchmark Evaluation & 2x2 Confusion Matrix',
    matrixSubtitle: 'Evaluated objectively on the held-out test partition (171 samples: 107 Benign · 64 Malignant)',
    matrixAccuracyCard: 'Overall Accuracy',
    matrixErrorCard: 'Global Error Rate',
    matrixRecallCard: 'Malignant Sensitivity (Recall)',
    matrixF1Card: 'Harmonic Mean F1-Score',
    benchmarkTableTitle: 'Comprehensive 5-Model Benchmark Comparison Table',
    colModelId: 'Model ID',
    colModelName: 'Model Name / Methodology',
    colOwner: 'Lead',
    colCriterion: 'Criterion',
    colDepth: 'Depth',
    colLeaves: 'Leaves',
    colAccuracy: 'Accuracy',
    colError: 'Error Rate',
    colRecall: 'Malignant Recall',
    colF1: 'F1-Score',
    colStatus: 'Status',
    bestBadge: 'Best Model ⭐',
    actualMalignant: 'Actual Malignant (M)',
    actualBenign: 'Actual Benign (B)',
    predMalignant: 'Predicted Malignant (M)',
    predBenign: 'Predicted Benign (B)',
    confusionMatrixTitle: 'Empirical 2x2 Confusion Matrix',
    clinicalInterpretationTitle: 'Diagnostic Classification Power:',
    clinicalSafetyTitle: 'Clinical Safety Implications (False Negatives - Missed Cancer Risk):',

    // Improvements Tab
    improvementsTitle: 'In-Depth Analysis of 3 Improvement Methodologies',
    improvementsSubtitle: 'Mathematical principles, hyperparameter search rationale, and generalization enhancement mechanisms',
    imp1Title: 'Method 1: Constraining Maximum Tree Depth (max_depth = 3)',
    imp1Desc: 'Enforces strict early stopping by restricting tree depth to max_depth = 3 instead of unconstrained expansion.',
    imp1Why: '💡 Why this reduces error: Effectively prevents overfitting and reduces model variance by eliminating deep leaf splits tailored to idiosyncratic training noise.',
    imp2Title: 'Method 2: Splitting Criterion Comparison (Gini vs Entropy)',
    imp2Desc: 'Transitions the split purity metric from Gini Impurity to Information Gain (Entropy).',
    imp2Why: '💡 Why this improves performance: Entropy logarithmic scaling provides heightened sensitivity to probability skew at boundary regions, yielding crisper decision thresholds across continuous features.',
    imp3Title: 'Method 3: Adjusting minimum samples for split or leaf nodes ⭐ [BEST OVERALL]',
    imp3Desc: 'Configures pre-pruning sample constraints (min_samples_split = 4, min_samples_leaf = 2) combined with max_depth = 4.',
    imp3Why: '💡 Why this achieves superior results: Prohibits single-sample isolate leaves, enhancing statistical robustness on unseen distributions and attaining peak F1-Score (91.25%) and Malignant Recall (85.71%).',

    // Dataset Tab
    datasetTitle: 'UCI Breast Cancer Wisconsin (Diagnostic) Dataset Provenance',
    datasetSubtitle: 'Published by Dr. William H. Wolberg, W. Nick Street, and Olvi L. Mangasarian (University of Wisconsin, 1995)',
    datasetSampleSizeTitle: 'Sample Cohort',
    datasetSampleSizeValue: '569 Biopsy Cases',
    datasetSampleSizeSub: '357 Benign (B) · 212 Malignant (M)',
    datasetFeatureSpaceTitle: 'Feature Space Dimension',
    datasetFeatureSpaceValue: '30 Continuous Metrics',
    datasetFeatureSpaceSub: '10 Mean · 10 Standard Error · 10 Worst/Extreme',
    datasetProvenanceTitle: 'Provenance & Licensing',
    datasetCitationTitle: 'Academic Citation:',

    // Modals
    aboutUsTitle: 'About Research Team & Lab 2 Project',
    aboutUsSubtitle: 'Breast Cancer Diagnostic Classification using Decision Tree Learning Paradigms',
    aboutUsObjectives: 'Core Academic Objectives:',
    aboutUsTeamTableTitle: 'Team Member Roster & Assigned Responsibilities:',
    colFullName: 'Full Name',
    colGmail: 'Gmail Contact',
    colRole: 'Assigned Responsibility',
    colContribution: 'Contribution',
    aboutUsImprovementsTitle: 'Summary of 3 Model Improvement Methodologies:',
    apiDocsTitle: 'Backend RESTful API Reference (FastAPI)',
    apiDocsSubtitle: 'Live OpenAPI Swagger UI and ReDoc interface documentation for backend endpoints',
    btnClose: 'Close',

    // Footer
    footerDisclaimer: 'Notice: Designed strictly for Machine Learning academic research and demonstration. Not a medical device.',
    footerRights: 'Breast Cancer Decision Tree Platform · All rights reserved.',
  },
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_lang');
    return saved === 'en' || saved === 'vi' ? saved : 'vi';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_lang', lang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
