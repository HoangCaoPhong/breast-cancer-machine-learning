# Experiment configs

Owner model thêm config sau khi canonical split/seed được chốt. Metrics đã chốt theo
D-006: malignant F2 (`beta=2`) là primary selection metric, positive class là `M`.
Tên gợi ý:

- `baseline.yaml`
- `max_depth.yaml`
- `criterion.yaml`
- `min_samples.yaml`

Nếu chưa chọn thư viện đọc YAML, có thể dùng JSON để tránh thêm dependency chỉ vì format.
