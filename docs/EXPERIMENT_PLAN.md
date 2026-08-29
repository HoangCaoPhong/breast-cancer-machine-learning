# Experiment plan

## 1. Dataset contract

| Field | Value |
| --- | --- |
| Dataset | Breast Cancer Wisconsin (Diagnostic) |
| Canonical source | UCI Machine Learning Repository, dataset ID 17 |
| DOI | `10.24432/C5DW2B` |
| License | CC BY 4.0 |
| Task | Binary classification |
| Instances | 569 |
| Predictive features | 30 real-valued features |
| Target | `diagnosis`: `M` or `B` |
| Missing values | None according to UCI metadata |
| Excluded field | ID |
| Retrieval method/checksum | TBD |

## 2. Protocol cần Nhân và nhóm chốt

| Field | Value |
| --- | --- |
| Canonical target encoding | TBD |
| Positive class | Proposed `M`; confirm in decision log |
| Split strategy/ratio | TBD; stratified split expected |
| Canonical random seed | TBD |
| Cross-validation | TBD |
| Primary selection metric | TBD |
| Secondary metrics | accuracy, error rate, precision, recall, F1, confusion matrix; ROC-AUC if valid |

Tuning chỉ dùng training/CV hoặc validation. Test set chỉ dùng sau khi chọn model.
Tất cả model dùng cùng data version, feature order, split và seed.

## 3. Model matrix

| ID | Model/change | Owner | Giả thuyết chính | Status |
| --- | --- | --- | --- | --- |
| C0 | Decision Tree from scratch | Phong | Minh họa cách impurity/split/stopping tạo cây | Pending |
| B0 | Sklearn baseline | Nhóm/model integrator | Mốc so sánh cố định | Pending |
| I1 | Tune `max_depth` | Phong | Giảm overfitting bằng giới hạn độ sâu | Pending |
| I2 | Gini vs. Entropy | Ngọc; Kiên hỗ trợ setup tích hợp | Criterion khác có thể đổi split/complexity/performance | Pending |
| I3 | Tune `min_samples_split`/`min_samples_leaf` | Hòa | Tránh nhánh quá đặc thù và giảm variance | Pending |

Các giá trị thử phải được ghi trước trong config. Nếu tham khảo paper để chọn search
space, lưu citation và không dùng test set để chọn ngưỡng.

## 4. Evaluation output

Mỗi run dùng cho report lưu tối thiểu:

- run ID, timestamp và Git commit SHA;
- dataset retrieval/version/checksum;
- split/CV, seed, preprocessing và feature order;
- model parameters/search space;
- train/validation/test metrics phù hợp;
- accuracy và `error_rate = 1 - accuracy`;
- confusion matrix, malignant recall và false-negative count;
- tree depth, leaf count, figure/rules và feature importances khi có;
- nhận xét overfit/underfit, failure mode và giới hạn.

## 5. Custom-tree validation

- Unit test trên dữ liệu tự tạo nhỏ, có split mong đợi tính bằng tay.
- Test stopping conditions, constant/duplicate features và deterministic tie-breaking.
- So sánh prediction/metric với sklearn trên cấu hình tương thích; giải thích khác biệt
  thay vì ép implementation khớp khi tie-breaking khác.

## 6. Comparison rule

Chọn model theo primary metric đã chốt trước. Nếu accuracy tăng nhưng malignant
recall giảm, báo trade-off; không gọi đó là cải thiện mặc định. Không tuyên bố hiệu
quả lâm sàng từ kết quả trên dataset này.

## 7. Reproduction command placeholder

Owner model thay bằng entry point thật khi triển khai:

```bash
# Placeholder only
python scripts/run_experiment.py --config experiments/configs/<name>.yaml
```
