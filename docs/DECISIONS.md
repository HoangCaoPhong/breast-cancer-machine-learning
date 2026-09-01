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

## D-005 - Dataset retrieval and canonical feature order

- Date: 2026-08-30
- Status: accepted
- Decision: track the official UCI `wdbc.data` and `wdbc.names` files; validate their
  checksums and load the 30 predictive columns in the order declared by
  `backend/app/ml/preprocessing/breast_cancer.py`. The `id` field is validated but never
  passed to a model. Diagnosis remains `B`/`M` until the shared encoding decision is made.
- Consequences: tests and local experiments use one immutable dataset copy without a
  network call; feature names/order are stored by the fitted custom tree.

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
