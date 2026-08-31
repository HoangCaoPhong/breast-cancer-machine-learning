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
- **Cơ chế chọn model:** 5-Fold Stratified Cross-Validation trên tập Train theo Malignant Recall (kèm tie-breaking).
- **Public API:**
  - `MinSamplesConfig`: Dataclass chứa cấu hình tìm kiếm và siêu tham số.
  - `run_min_samples_tuning(features, target, config)`: Thực hiện toàn bộ grid search, so sánh trực tiếp với Baseline B0 và trả về `MinSamplesExperimentResult`.

## 3. Các thí nghiệm khác

- `max_depth` (I1) - owner: Hoàng Cao Phong.
- Gini vs. Entropy (I2) - owner: Võ Mỹ Ngọc; Nguyễn Trung Kiên hỗ trợ integration setup.

Mọi experiment phải đọc cùng split/config và export kết quả theo `docs/EXPERIMENT_PLAN.md`.

