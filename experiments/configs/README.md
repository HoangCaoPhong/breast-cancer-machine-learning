# Experiment configs

Baseline, split, seed và metrics đã được chốt trong D-006. Config chính thức hiện có:

- `baseline.json` - cấu hình baseline B0 cố định
- `max_depth.json` - cùng search space cho custom và sklearn tree theo D-007
- `criterion.json` - Gini-vs-Entropy trên custom và sklearn tree theo D-008
- `min_samples.json` - grid `min_samples_split`/`min_samples_leaf` của I3; chọn bằng malignant F2 theo D-006

`criterion.json` kế thừa dataset, split, seed, preprocessing và các tham số model từ
baseline. Config khai báo hai candidate `gini` và `entropy`; runner dùng cùng protocol
cho custom và sklearn tree, đồng thời giữ mọi tham số khác giống nhau giữa hai candidate.

`min_samples.json` giữ split 80/20, seed 42 và 5-fold stratified training CV. Held-out
test không tham gia chọn tham số; primary metric và tie-breakers tuân theo D-006.
