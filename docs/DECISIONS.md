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

## D-006 - Target encoding, positive class, split, seed and primary metric

- Date: 2026-08-30
- Status: proposed by Hòa – pending team ratification (especially Nhân/metrics owner)
- Context: EXPERIMENT_PLAN.md section 2 left these as TBD.
- Decision:
  - Target encoding: M=1 (malignant, positive class), B=0 (benign).
  - Split: stratified 80/20, `random_state=42`.
  - Primary metric for model selection: **malignant recall** (CV scoring).
    Rationale: in breast cancer screening, false negatives (missed malignant cases)
    are clinically more costly than false positives. Recall on the positive class
    directly minimises missed malignant predictions.
  - Secondary metrics: accuracy, error rate, precision, F1, confusion matrix,
    false-negative count, ROC-AUC where valid.
- Consequences: all experiments must use the same split/seed/encoding/metric;
  any change requires a new decision entry and re-run of all experiments.

## Pending decisions

- D-007: API request/response schema và model artifact metadata.
- D-008: owner report/video, người đại diện và Group ID.

