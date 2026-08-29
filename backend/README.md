# Backend

FastAPI backend, training/evaluation code và model inference.

```text
backend/
├── app/
│   ├── api/routes/       # HTTP routes
│   ├── core/             # config/startup concerns
│   ├── ml/
│   │   ├── custom_tree/  # Decision Tree from scratch
│   │   ├── sklearn_tree/ # baseline + improvement variants
│   │   ├── preprocessing/
│   │   └── evaluation/
│   ├── schemas/          # Pydantic request/response
│   └── services/         # model loading and prediction use case
└── tests/
```

Owner FastAPI sẽ thêm `app/main.py` và lệnh chạy thật. Contract dự kiến đặt API dưới
`/api/v1`, có health endpoint, prediction endpoint, model/version metadata và disclaimer.

ML module không import FastAPI. Training chạy offline; request chỉ gọi model đã load.
