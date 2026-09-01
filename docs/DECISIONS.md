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

## D-006 - Canonical baseline and evaluation protocol

- Date: 2026-08-30
- Status: accepted
- Context: dataset có 357 mẫu benign và 212 mẫu malignant. Accuracy đơn độc có thể
  che khuất false negative; malignant recall đơn độc lại có thể được tối đa hóa bằng
  cách dự đoán mọi mẫu là malignant.
- Decision: preserve labels `B`/`M`; use a stratified 80/20 train/test split with
  `random_state=42` and stratified 5-fold CV on the training set for tuning. Baseline
  B0 uses `DecisionTreeClassifier(criterion="gini", max_depth=None,
  min_samples_leaf=1, min_samples_split=2, random_state=42)`. `M` (malignant) is the
  positive class. Primary selection metric is malignant-class F2 (`beta=2`) computed
  on training CV. Tie-break
  theo malignant recall cao hơn, F2 standard deviation thấp hơn, rồi cây ít leaf/depth
  hơn. Required report metrics gồm malignant precision/recall/F1/F2, benign recall
  (specificity), balanced accuracy, accuracy, error rate, confusion matrix theo label
  order `B`, `M`, và raw FN/FP counts. ROC-AUC chỉ là supplementary khi score/probability
  giữa các model hợp lệ và so sánh được.
- Consequences: B0 là mốc cố định và mọi improvement dùng cùng dataset, split, seed,
  class semantics và CV. Mọi experiment phải chọn model bằng malignant F2, giữ test
  set hoàn toàn ngoài tuning, dùng class-specific binary metrics cho `M` và
  lưu averaging/label order trong config hoặc metadata. Accuracy vẫn phải báo theo đề
  bài nhưng không quyết định model thắng. Kết quả hiện có tạo bằng selection metric khác
  phải chạy lại trước khi đưa vào report.

## D-007 - Dual-implementation max-depth experiment

- Date: 2026-08-31
- Status: accepted
- Context: đề bài yêu cầu thay đổi `max_depth`, trình bày tree/result và giải thích
  cải thiện; nhóm đồng thời cần chứng minh implementation tự cài đặt hoạt động trên
  cùng protocol với sklearn reference.
- Decision: I1 chạy trên cả `DecisionTreeClassifierScratch` và sklearn
  `DecisionTreeClassifier`. Hai implementation dùng cùng stratified 80/20 split,
  seed 42, stratified 5-fold training CV, feature order, class semantics, criterion,
  `min_samples_split`, `min_samples_leaf` và search space. Mỗi implementation chọn
  finite depth riêng theo D-006. Test set chỉ đánh giá unlimited baseline và depth đã
  chọn; không dùng để chọn tham số.
- Consequences: runner phải export kết quả của mọi candidate, metric/complexity chart,
  confusion matrix, tree figure cho cả hai implementation và provenance đủ để viết
  report. Khác biệt do split tie-breaking phải được giải thích, không ép hai cây giống
  hệt nhau.
- Result: canonical run chọn `max_depth=8` cho cả custom và sklearn tree. Depth 8
  bằng candidate unlimited về held-out metrics và fitted complexity (8 levels, 24
  leaves), nên đây là cấu hình hữu hạn tái lập được, không phải một cải thiện hiệu
  năng hay giảm độ phức tạp trên split này. Preset tích hợp có model ID `I1`, version
  `i1-max-depth-v1`, và được expose từ `backend/app/ml/selected_models/` để backend
  sau này không hard-code lại.

## D-008 - Dual-implementation Gini-versus-Entropy experiment

- Date: 2026-09-01
- Status: accepted
- Decision: I2 so sánh `gini` và `entropy` trên cả custom và sklearn tree, giữ mọi
  tham số khác theo B0 và chọn criterion riêng cho từng implementation bằng malignant
  F2 trên stratified 5-fold training CV. Held-out test không tham gia selection.
- Result: canonical run chọn `gini` cho cả custom và sklearn. Mean validation F2 lần
  lượt là `0.9027` và `0.8948`; selected held-out F2 lần lượt là `0.8894` và `0.9048`.
- Consequences: kết luận chỉ áp dụng cho hai criterion và protocol đã thử; không tuyên
  bố Gini luôn tốt hơn Entropy. Runner, config, tests và report outputs của I2 được tích
  hợp cùng I1 nhưng vẫn giữ implementation thuật toán tách biệt. Preset tích hợp có
  model ID `I2`, version `i2-criterion-v1`, và được expose từ
  `backend/app/ml/selected_models/`.

## D-009 - Sklearn minimum-samples selection

- Date: 2026-09-01
- Status: accepted
- Decision: I3 thử grid `min_samples_split=(2, 5, 10, 20, 50)` và
  `min_samples_leaf=(1, 2, 5, 10, 20)` trên sklearn tree theo D-006. Model được chọn
  bằng malignant F2 trên stratified 5-fold training CV; test set không tham gia chọn.
- Result: canonical run chọn `min_samples_split=5`, `min_samples_leaf=1`. Mean CV F2
  là `0.8974` (std `0.0486`), held-out F2 là `0.9091`, recall `0.9048`, accuracy
  `0.9386`, fitted depth `8` và `20` leaves.
- Consequences: preset `i3-min-samples-v1` được expose từ `selected_models`. Có thể
  dựng custom tree với cùng tham số để integration so sánh, nhưng kết quả selection
  chính thức của I3 chỉ đại diện cho sklearn family.

## Pending decisions

- D-010: API request/response schema và model artifact metadata.
- D-011: owner report/video, người đại diện và Group ID.
