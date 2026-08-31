# Experiment configs

Baseline, split, seed và metrics đã được chốt trong D-006. Config chính thức hiện có:

- `baseline.json`

Config cho improvement experiment cần thêm:

- `max_depth.yaml`
- `criterion.yaml`
- `min_samples.yaml`

Nếu chưa chọn thư viện đọc YAML, có thể dùng JSON để tránh thêm dependency chỉ vì format.

`criterion.yaml`/`criterion.json` phải kế thừa dataset, split, seed, preprocessing và
các tham số model từ baseline. Hai run chỉ được khác `criterion: gini` và
`criterion: entropy`. Chỉ tạo config chạy chính thức sau khi D-005/D-006 được chốt.
