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

## 2. Accepted baseline and evaluation protocol

| Field | Value |
| --- | --- |
| Canonical target representation | Preserve labels `B`/`M` |
| Positive / negative class | `M` / `B` |
| Split strategy/ratio | Stratified 80/20 train/test split |
| Canonical random seed | `42` |
| Cross-validation for tuning | Stratified 5-fold CV on training set |
| Primary selection metric | Malignant F2 (`beta=2`) on validation/CV |
| Selection tie-breakers | Higher malignant recall, then lower F2 standard deviation, then simpler tree |
| Required metrics | Malignant precision/recall/F1/F2, benign recall (specificity), balanced accuracy, accuracy, error rate, TN/FP/FN/TP |
| Supplementary metric | ROC-AUC when valid positive-class probabilities are available |

Tuning chỉ dùng training/CV hoặc validation. Test set chỉ dùng sau khi chọn model.
Tất cả model dùng cùng data version, feature order, split và seed.

Confusion matrix dùng row=true, column=predicted và label order `B`, `M`:

```text
              predicted B   predicted M
actual B           TN            FP
actual M           FN            TP
```

Malignant F2 được tính bằng `5 * precision * recall / (4 * precision + recall)`.
Các malignant metrics là binary class-specific metrics cho `M`, không dùng weighted
averaging. Denominator bằng 0 trả về `0.0`. ROC-AUC chỉ báo khi model cung cấp
positive-class probability hợp lệ.

### 2.1 Canonical baseline B0

```text
criterion="gini"
max_depth=None
min_samples_leaf=1
min_samples_split=2
random_state=42
```

B0 là cây cơ bản không regularization để làm mốc. Dấu hiệu train score cao hoặc cây
sâu phải được báo như bằng chứng overfitting tiềm năng, không được âm thầm chỉnh tham
số baseline. Các thay đổi depth, criterion hoặc minimum samples thuộc improvement
track tương ứng.

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
| B0 | Sklearn baseline | Nhóm/model integrator | Mốc so sánh cố định theo D-006 | Implemented |
| I1 | Tune `max_depth` | Phong | Giảm overfitting bằng giới hạn độ sâu | Pending |
| I2 | Gini vs. Entropy | Ngọc; Kiên hỗ trợ setup tích hợp | So sánh criterion trên custom và sklearn tree, giữ các tham số khác cố định | Implemented |
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
- confusion matrix theo label order `B`, `M`, malignant precision/recall/F1/F2;
- benign recall, balanced accuracy và raw TN/FP/FN/TP counts;
- ROC-AUC khi có positive-class probability hợp lệ;
- tree depth, leaf count, figure/rules và feature importances khi có;
- nhận xét overfit/underfit, failure mode và giới hạn.

## 5. Custom-tree validation

- Unit test trên dữ liệu tự tạo nhỏ, có split mong đợi tính bằng tay.
- Test stopping conditions, constant/duplicate features và deterministic tie-breaking.
- So sánh prediction/metric với sklearn trên cấu hình tương thích; giải thích khác biệt
  thay vì ép implementation khớp khi tie-breaking khác.

## 6. Comparison rule

Chọn improvement theo mean malignant F2 trên training CV. Nếu accuracy tăng nhưng
malignant F2 hoặc recall giảm, báo trade-off; không gọi đó là cải thiện mặc định.
Không tuyên bố hiệu quả lâm sàng từ kết quả trên dataset này.

## 7. Reproduction command placeholder

Owner model thay bằng entry point thật khi triển khai:

```bash
# Placeholder only
python scripts/run_experiment.py --config experiments/configs/<name>.yaml
```
