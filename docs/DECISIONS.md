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

## Pending decisions

- D-005: retrieval method, raw checksum và canonical feature names/order.
- D-006: target encoding, positive class, split ratio, seed và primary metric.
- D-007: API request/response schema và model artifact metadata.
- D-008: owner report/video, người đại diện và Group ID.
