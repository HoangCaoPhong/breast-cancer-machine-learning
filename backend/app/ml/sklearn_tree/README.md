# Sklearn Decision Tree experiments

- Baseline cố định để so sánh.
- `max_depth` - owner: Hoàng Cao Phong.
- Gini vs. Entropy - owner: Võ Mỹ Ngọc; Nguyễn Trung Kiên hỗ trợ integration setup.
- `min_samples_split`/`min_samples_leaf` - owner: Huỳnh Thái Hòa.

Mọi experiment phải đọc cùng split/config và export kết quả theo
`docs/EXPERIMENT_PLAN.md`.

## Dual-implementation max-depth runner

`max_depth.py` giữ logic thí nghiệm tái sử dụng cho cả custom tree và sklearn tree.
Chạy entry point từ repository root:

```bash
python scripts/run_max_depth_experiment.py \
  --config experiments/configs/max_depth.json
```

Mỗi implementation có baseline `max_depth=None` và chọn finite depth riêng bằng cùng
stratified folds trên training split; held-out test không tham gia chọn tham số. Theo
D-006/D-007, primary metric là malignant F2 (`beta=2`). Tie-break lần lượt theo
malignant recall cao hơn, F2 standard deviation thấp hơn, ít leaf hơn, fitted depth
thấp hơn và candidate order.
