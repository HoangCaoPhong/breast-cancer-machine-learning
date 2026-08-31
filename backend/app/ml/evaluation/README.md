# Evaluation

Owner chính: Lương Thiện Nhân; các model owner cung cấp output đúng contract.

Chứa metric computation, confusion matrix, tree visualization và comparison-table
export. Theo D-006, positive class là `M` và primary selection metric là malignant
F2 (`beta=2`) trên validation/CV. Required output gồm malignant precision/recall/F1/F2,
benign recall (specificity), balanced accuracy, accuracy, error rate, confusion matrix
theo label order `B`, `M`, và raw FN/FP counts. Không dùng weighted averaging cho các
malignant-class metrics; ROC-AUC chỉ là supplementary khi score/probability hợp lệ và
so sánh được giữa các model.
