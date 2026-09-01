# Sklearn Decision Tree experiments

- Baseline cố định để so sánh.
- `max_depth` - owner: Hoàng Cao Phong.
- Gini vs. Entropy - owner: Võ Mỹ Ngọc; Nguyễn Trung Kiên hỗ trợ integration setup.
- `min_samples_split`/`min_samples_leaf` - owner: Huỳnh Thái Hòa.

Mọi experiment phải đọc cùng split/config và export kết quả theo
`docs/EXPERIMENT_PLAN.md`.

## Max-depth runner

`max_depth.py` giữ logic thí nghiệm tái sử dụng được. Chạy entry point từ repository
root:

```bash
python scripts/run_max_depth_experiment.py \
  --config experiments/configs/max_depth.json
```

Baseline dùng `max_depth=None`. Các độ sâu hữu hạn được chọn bằng stratified CV trên
training split; held-out test không tham gia chọn tham số. Theo D-006, primary metric
là malignant F2 (`beta=2`). Tie-break lần lượt theo malignant recall cao hơn, F2
standard deviation thấp hơn, ít leaf hơn, fitted depth thấp hơn và candidate order.

## Gini versus Entropy (I2)

`gini_vs_entropy.py` contains the reusable I2 orchestration for both the existing
custom tree and sklearn tree. It imports the original estimators without modifying
their implementation, keeps every baseline parameter fixed, and changes only
`criterion` between `gini` and `entropy`. Both families use the same shuffled,
stratified split and CV folds.

Run from the repository root:

```bash
python scripts/run_gini_vs_entropy.py
```

The runner reads the canonical config, keeps all non-criterion parameters fixed,
and writes one CV table, one JSON summary, one comparison chart, and one
selected-trees figure under the experiment results directory. The custom-tree
implementation remains independent.

Each run exposes the fitted estimator, model parameters, tree depth, leaf count,
feature importances, and readable rules. Metric calculation and result-table export
must use the shared helpers under `backend/app/ml/evaluation/` after the D-006
contract is in place. This module intentionally does not implement accuracy, error
rate, precision, recall, F1, ROC-AUC, or confusion matrix independently.

### Best variant and current finding

For I2, "best" means the better of the two controlled variants (`gini` and
`entropy`) under the accepted experiment protocol. It does not mean the globally
best Decision Tree configuration. The runner selects the highest mean validation
malignant F2 from stratified 5-fold CV on the training split. Mean validation
malignant recall breaks an F2 tie; accuracy is reported for reference and the
held-out test set is not used for selection.

The reproducible run with the canonical UCI dataset, shuffled stratified 80/20
split, seed `42`, and all non-criterion baseline parameters fixed selected `gini`
for both implementations. The report must state that Gini is the best tested
criterion under this fixed protocol, not that Gini is universally superior.
