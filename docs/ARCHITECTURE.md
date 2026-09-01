# Architecture

## Module flow

```text
frontend form
    |
    | POST /api/v1/predict
    v
FastAPI route -> Pydantic schema -> prediction service -> loaded model/pipeline
    |                                                    |
    v                                                    v
safe JSON response                              model metadata/artifact
```

Training/experiments chạy offline, không chạy trong request:

```text
UCI raw data -> validation/preprocessing -> canonical split
                                             |          |
                                      custom tree    sklearn variants
                                             |          |
                                             +-> evaluation/comparison
                                                       |
                                             selected model + metadata
```

## Ownership boundaries

- `backend/app/api/`: HTTP route và dependency wiring.
- `backend/app/schemas/`: request/response validation, feature order và examples.
- `backend/app/services/`: model load/predict và response orchestration.
- `backend/app/ml/custom_tree/`: thuật toán tự cài đặt, không phụ thuộc FastAPI.
- `backend/app/ml/sklearn_tree/`: baseline, tuning và ba thí nghiệm sklearn.
- `backend/app/ml/selected_models/`: preset có version được chọn từ I1/I2/I3 để tích
  hợp; không chứa thuật toán, HTTP logic hoặc model artifact.
- `backend/app/ml/preprocessing/`: load/schema/split/pipeline.
- `backend/app/ml/evaluation/`: metric, comparison table và tree visualization.
- `frontend/src/features/prediction/`: form và result UI.
- `frontend/src/services/`: API client duy nhất.
- `experiments/configs/`: config có version; `experiments/results/` là output local.

## Contracts cần merge sớm

1. Dataset columns, target mapping và canonical feature order.
2. Split/seed/primary metric.
3. Model artifact metadata: version, feature order, class order và metrics.
4. `POST /api/v1/predict` request/response schema.
5. Error messages và disclaimer frontend hiển thị.

## Out of scope ban đầu

- Tài khoản người dùng, database và lưu lịch sử dự đoán.
- Thu thập thông tin bệnh nhân thật.
- Online training trong request.
- Tuyên bố hoặc kiểm định hiệu quả lâm sàng.
