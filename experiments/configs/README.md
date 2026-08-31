# Experiment configs

Baseline, split, seed và metrics đã được chốt trong D-006. Config chính thức hiện có:

- `baseline.json`
- `criterion.json`

Config cho improvement experiment cần thêm:

- `max_depth.yaml`
- `min_samples.yaml`

Nếu chưa chọn thư viện đọc YAML, có thể dùng JSON để tránh thêm dependency chỉ vì format.

`criterion.json` kế thừa dataset, split, seed, preprocessing và các tham số model từ
baseline. Config không chứa trường `criterion` vì runner luôn chạy cả `gini` và
`entropy`; đây là biến duy nhất khác nhau giữa hai run.
