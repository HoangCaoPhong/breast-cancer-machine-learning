# Decision log

Không xóa quyết định cũ; nếu đổi, thêm quyết định mới và ghi `superseded`.

## D-001 - Full-stack educational demo architecture

- Date: 2026-08-29
- Status: accepted
- Context: nhóm chốt mục tiêu cuối là website minh họa phân loại ung thư vú.
- Decision: dùng monorepo `backend/` + `frontend/`; ML nằm tách khỏi FastAPI routes;
  training chạy offline, website chỉ inference từ model artifact đã chọn.
- Consequences: cần chốt sớm feature order, artifact metadata và API contract.

## D-002 - Canonical dataset

- Date: 2026-08-29
- Status: accepted
- Decision: dùng Breast Cancer Wisconsin (Diagnostic), UCI dataset ID 17, binary
  classification `M`/`B`; ID không là feature.
- Consequences: nguồn UCI là authoritative; retrieval method và checksum còn cần chốt.

## D-003 - Model tracks and improvements

- Date: 2026-08-29
- Status: accepted
- Decision: có một Decision Tree from scratch và một sklearn baseline; ba hướng
  cải thiện là `max_depth`, Gini-vs-Entropy, và `min_samples_split`/`min_samples_leaf`.
- Consequences: mọi variant phải dùng chung data/split/seed/metric; custom tree không
  được gọi sklearn tree trong implementation.

## D-004 - Educational and medical-safety wording

- Date: 2026-08-29
- Status: accepted
- Decision: README, frontend, report và video phải ghi rõ đây không phải chẩn đoán y khoa.
- Consequences: không thu thập patient-identifiable data và không tuyên bố clinical readiness.

## D-005 - Canonical raw dataset retrieval and feature order

- Date: 2026-08-30
- Status: accepted
- Decision: load directly from the canonical official UCI archive files
  `data/raw/uci_wdbc/wdbc.data` and `wdbc.names`. Validate shape (569, 32) and
  ensure no missing values. The `id` column (column 0) is excluded. Feature names
  and order match the 30 UCI WDBC attributes. Fallback to `sklearn.datasets.load_breast_cancer`
  is supported for environments where the raw file is not present.
- Consequences: preprocessing code reads directly from the canonical raw file;
  all experiments share the exact same immutable raw data.

## D-006 - Evaluation metrics and model-selection rule

- Date: 2026-08-30
- Status: accepted
- Context: dataset có 357 mẫu benign và 212 mẫu malignant. Accuracy đơn độc có thể
  che khuất false negative; malignant recall đơn độc lại có thể được tối đa hóa bằng
  cách dự đoán mọi mẫu là malignant.
- Decision: `M` (malignant) là positive class. Primary selection metric là
  malignant-class F2 (`beta = 2`) tính trên validation/CV của training set. Tie-break
  theo malignant recall cao hơn, F2 standard deviation thấp hơn, rồi cây ít leaf/depth
  hơn. Required report metrics gồm malignant precision/recall/F1/F2, benign recall
  (specificity), balanced accuracy, accuracy, error rate, confusion matrix theo label
  order `B`, `M`, và raw FN/FP counts. ROC-AUC chỉ là supplementary khi score/probability
  giữa các model hợp lệ và so sánh được.
- Consequences: mọi experiment phải đổi model selection từ accuracy sang malignant F2,
  giữ test set hoàn toàn ngoài tuning, dùng class-specific binary metrics cho `M` và
  lưu averaging/label order trong config hoặc metadata. Accuracy vẫn phải báo theo đề
  bài nhưng không quyết định model thắng. Kết quả hiện có tạo bằng selection metric khác
  phải chạy lại trước khi đưa vào report.

## D-006 - Canonical baseline and evaluation metrics

- Date: 2026-08-30
- Status: accepted
- Decision: baseline B0 dùng `DecisionTreeClassifier` với `criterion="gini"`,
  `max_depth=None`, `min_samples_leaf=1`, `min_samples_split=2` và
  `random_state=42`. Protocol hiện tại là stratified 80/20 split, positive class là
  `M` và negative class là `B`. Primary model-selection metric cho các improvement
  experiment là malignant F2 (`beta=2`) tính trên validation/CV của training set.
  Baseline report bắt buộc xuất malignant precision/recall/F1/F2, benign recall
  (specificity), balanced accuracy, accuracy, error rate, confusion counts theo thứ
  tự `B`, `M`, và ROC-AUC khi có probability hợp lệ.
- Consequences: B0 là mốc cố định, không tune trên test set. Mọi improvement phải dùng
  cùng dataset/split/seed/class semantics và so sánh với B0. Accuracy vẫn được báo theo
  đề bài nhưng không thay thế malignant F2/recall và raw false-negative count.

## Pending decisions

- D-007: API request/response schema và model artifact metadata.
- D-008: owner report/video, người đại diện và Group ID.
