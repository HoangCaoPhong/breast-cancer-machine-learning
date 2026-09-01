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

## 2. Shared evaluation protocol

| Field | Value |
| --- | --- |
| Canonical target encoding | TBD |
| Positive class | `M` (malignant), accepted in D-006 |
| Split strategy/ratio | TBD; stratified split expected |
| Canonical random seed | TBD |
| Cross-validation | TBD |
| Primary selection metric | Malignant-class F2 (`beta = 2`) on validation/CV |
| Selection tie-breakers | Higher malignant recall, then lower F2 standard deviation, then simpler tree |
| Required secondary metrics | Malignant precision/recall/F1, benign recall (specificity), balanced accuracy, accuracy, error rate, confusion matrix, FN and FP counts |
| Supplementary metric | ROC-AUC only when the compared models expose valid, comparable scores/probabilities |

Tuning chỉ dùng training/CV hoặc validation. Test set chỉ dùng sau khi chọn model.
Tất cả model dùng cùng data version, feature order, split và seed.

### 2.1 Metric definitions

Confusion matrix luôn dùng thứ tự nhãn `B`, `M`, với **row là ground truth** và
**column là prediction**:

```text
              predicted B   predicted M
actual B           TN            FP
actual M           FN            TP
```

- Malignant precision: `TP / (TP + FP)`.
- Malignant recall/sensitivity: `TP / (TP + FN)`.
- Malignant F1: harmonic mean of malignant precision and recall.
- **Malignant F2 (primary):** `5 * precision * recall / (4 * precision + recall)`;
  equivalently `(5 * TP) / (5 * TP + 4 * FN + FP)`. This weights recall twice as
  strongly as precision while still penalizing false positives.
- Benign recall/specificity: `TN / (TN + FP)`.
- Balanced accuracy: `(malignant recall + specificity) / 2`.
- Accuracy: `(TP + TN) / (TP + TN + FP + FN)`; error rate: `1 - accuracy`.

Các metric precision/recall/F1/F2 ở trên là **binary, class-specific metrics for
`M`**, không dùng weighted averaging. Classification report vẫn xuất metric riêng
cho cả `B` và `M`. Khi denominator bằng 0, code phải trả `0` và ghi rõ
`zero_division=0` thay vì phát sinh `NaN` hoặc warning không kiểm soát.

### 2.2 Model-selection rule

1. Tính mean và standard deviation của malignant F2 trên các validation folds của
   training set; chọn mean cao nhất.
2. Nếu candidate bằng nhau ở độ chính xác số được lưu, ưu tiên malignant recall cao
   hơn, rồi F2 standard deviation thấp hơn, rồi cây đơn giản hơn (ít leaf hơn, sau đó
   depth thấp hơn). Candidate order đã khai báo trong config là tie-break cuối để bảo
   đảm deterministic.
3. Không dùng test set để chọn model hoặc threshold. Sau khi chốt candidate, đánh giá
   đúng một lần trên held-out test set và báo toàn bộ required metrics cùng raw FN/FP.
4. Accuracy cao hơn nhưng malignant F2 hoặc recall thấp hơn phải được trình bày như
   một trade-off, không tự động gọi là cải thiện.

F2 được chọn thay vì recall đơn độc vì recall có thể đạt tối đa bằng cách dự đoán mọi
mẫu là `M`. F2 vẫn thể hiện chi phí bỏ sót malignant cao hơn, đồng thời phạt false
positive. Accuracy được giữ vì đề bài yêu cầu nhưng không phải tiêu chí chọn model.

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
- confusion matrix theo thứ tự `B`, `M`; malignant F2/precision/recall/F1;
- benign recall (specificity), balanced accuracy và raw false-negative/false-positive count;
- ROC-AUC nếu mọi model trong phép so sánh có score/probability hợp lệ và tương đương;
- tree depth, leaf count, figure/rules và feature importances khi có;
- nhận xét overfit/underfit, failure mode và giới hạn.

## 5. Custom-tree validation

- Unit test trên dữ liệu tự tạo nhỏ, có split mong đợi tính bằng tay.
- Test stopping conditions, constant/duplicate features và deterministic tie-breaking.
- So sánh prediction/metric với sklearn trên cấu hình tương thích; giải thích khác biệt
  thay vì ép implementation khớp khi tie-breaking khác.

## 6. Comparison rule

Chọn model theo malignant F2 và tie-breakers ở mục 2.2. Nếu accuracy tăng nhưng
malignant F2 hoặc recall giảm, báo trade-off; không gọi đó là cải thiện mặc định.
Không tuyên bố hiệu quả lâm sàng từ kết quả trên dataset này.

## 7. Reproduction command placeholder

Owner model thay bằng entry point thật khi triển khai:

```bash
# Placeholder only
python scripts/run_experiment.py --config experiments/configs/<name>.yaml
```
