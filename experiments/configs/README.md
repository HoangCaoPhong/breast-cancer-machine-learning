# Experiment configs

Baseline, split, seed và metrics đã được chốt trong D-006. Config chính thức hiện có:

- `baseline.json`
- `max_depth.json` - cùng search space cho custom và sklearn tree theo D-007
- `criterion.json` - Gini-vs-Entropy trên custom và sklearn tree theo D-008

Config cho improvement experiment cần thêm:

- `min_samples.yaml`

Nếu chưa chọn thư viện đọc YAML, có thể dùng JSON để tránh thêm dependency chỉ vì format.

`criterion.json` kế thừa dataset, split, seed, preprocessing và các tham số model từ
baseline. Config khai báo hai candidate `gini` và `entropy`; runner dùng cùng protocol
cho custom và sklearn tree, đồng thời giữ mọi tham số khác giống nhau giữa hai candidate.
