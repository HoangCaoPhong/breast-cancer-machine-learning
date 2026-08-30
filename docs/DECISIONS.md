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

## Pending decisions

- D-007: target encoding, split ratio, canonical seed và cross-validation protocol.
- D-008: API request/response schema và model artifact metadata.
- D-009: owner report/video, người đại diện và Group ID.
