# Sklearn Decision Tree experiments

## 1. Modules

- `baseline.py`: Baseline B0 cố định để so sánh (Gini, max_depth=None, min_samples_split=2, min_samples_leaf=1, seed=42).
- `min_samples.py`: Thí nghiệm I3 – Điều chỉnh và benchmark `min_samples_split` và `min_samples_leaf` (Owner: Huỳnh Thái Hòa).

## 2. Thí nghiệm I3: `min_samples_split` & `min_samples_leaf`

- **Owner:** Huỳnh Thái Hòa (24127374).
- **Mục tiêu:** Kiểm soát mức độ phức tạp của cây quyết định, giảm số lượng lá rác (overfitting) và giảm phương sai (variance) bằng kỹ thuật pre-pruning.
- **Search Space:**
  - `min_samples_split`: `[2, 5, 10, 20, 50]`
  - `min_samples_leaf`: `[1, 2, 5, 10, 20]`
- **Cơ chế chọn model:** 5-Fold Stratified Cross-Validation trên tập Train theo malignant F2; tie-break theo recall, F2 standard deviation, số lá, fitted depth và candidate order (D-006).
- **Public API:**
  - `MinSamplesConfig`: Dataclass chứa cấu hình tìm kiếm và siêu tham số.
  - `run_min_samples_tuning(features, target, config)`: Thực hiện toàn bộ grid search, so sánh trực tiếp với Baseline B0 và trả về `MinSamplesExperimentResult`.

## 3. Các thí nghiệm khác

- `max_depth` (I1) - owner: Hoàng Cao Phong.
- Gini vs. Entropy (I2) - owner: Võ Mỹ Ngọc; Nguyễn Trung Kiên hỗ trợ integration setup.

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
