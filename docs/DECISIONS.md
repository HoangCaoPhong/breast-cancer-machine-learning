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

## Pending decisions

- D-006: target encoding, positive class, split ratio, seed và primary metric.
- D-007: API request/response schema và model artifact metadata.
- D-008: owner report/video, người đại diện và Group ID.
