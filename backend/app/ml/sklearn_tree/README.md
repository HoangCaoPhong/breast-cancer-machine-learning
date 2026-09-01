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

### Selected I1 preset

The canonical run selected `max_depth=8` for both implementations. The versioned
integration preset is kept separately under `backend/app/ml/selected_models/` so this
package remains focused on sklearn baselines and experiment orchestration.

## Gini versus Entropy (I2)

`criterion_experiment.py` contains Ngọc's controlled criterion comparison. The
caller supplies the canonical training partition, feature names, and all shared
baseline parameters. The function rejects a caller-provided `criterion` and
requires the canonical `random_state`, which prevents the two runs from accidentally
differing in more than the splitting criterion.

```python
from app.ml.sklearn_tree import fit_gini_and_entropy

runs = fit_gini_and_entropy(
    X_train,
    y_train,
    model_parameters={
        # Copy these values from the accepted baseline config.
        "random_state": canonical_seed,
        "max_depth": baseline_max_depth,
        "min_samples_split": baseline_min_samples_split,
        "min_samples_leaf": baseline_min_samples_leaf,
    },
    feature_names=canonical_feature_order,
)
```

Each run exposes the fitted estimator, model parameters, tree depth, leaf count,
feature importances, and readable rules. Metric calculation and result-table export
must use the shared helpers under `backend/app/ml/evaluation/` after that contract is
merged. This module intentionally does not implement accuracy, error rate, precision,
recall, F1, ROC-AUC, or confusion matrix independently.
