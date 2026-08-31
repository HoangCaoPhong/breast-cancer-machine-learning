# Lab 2 requirement checklist

Nguồn: `Lab 2 - Decision Tree.pdf` (giữ local, không commit). File này là checklist
làm việc; nếu có khác biệt, đề gốc là nguồn có thẩm quyền.

## 1. Quy định chung

- [ ] Nhóm có 3-5 sinh viên.
- [ ] Chỉ định một người đại diện nộp bài.
- [ ] Đóng gói một file `[GroupID].zip` gồm:
  - [ ] `[GroupID - Report].pdf`
  - [ ] `[GroupID - Code].zip` hoặc thư mục code
  - [ ] `[GroupID - Video].mp4` hoặc `[GroupID - Video].txt` chứa link
  - [ ] `[GroupID - Materials].txt` nếu có

## 2. Dataset

- [x] Chọn Breast Cancer Wisconsin (Diagnostic), một dataset classification công khai.
- [x] Ghi nguồn UCI, DOI và license CC BY 4.0 trong experiment/data docs.
- [x] Ghi 569 mẫu, 30 feature và target `M`/`B`.
- [x] Xác định dataset phù hợp với binary Decision Tree; phần giải thích report còn cần viết.
- [ ] Mô tả preprocessing và ảnh hưởng của từng bước.

## 3. Baseline Decision Tree

- [ ] Chia training/testing rõ ràng.
- [ ] Huấn luyện baseline có config và seed tái lập được.
- [ ] Trình bày/trực quan hóa cây.
- [ ] Phân tích cấu trúc, node chia quan trọng và luật quyết định.
- [ ] Nhận xét cây quá đơn giản, quá sâu hay có dấu hiệu overfit.
- [ ] Tính metric phù hợp:
  - Classification: confusion matrix, accuracy, precision, recall, F1, ROC-AUC khi phù hợp.
  - Regression: MAE, MSE, RMSE và metric khác khi phù hợp.
- [ ] Báo accuracy và error rate theo yêu cầu khi là classification.

## 4. Cải thiện mô hình

- [ ] Đề xuất và triển khai 2-3 phương pháp khác nhau.
- [x] I2 Gini/Entropy đã chạy cho cả Custom và Sklearn trên cùng protocol.
  - [x] Có mô tả method và setting kiểm soát.
  - [x] Có Accuracy, error rate, malignant F2/recall và metrics liên quan.
  - [x] Có bảng CSV/JSON và hình so sánh Custom/Sklearn.
  - [x] Có kết luận Entropy không cải thiện so với Gini trong protocol hiện tại.
- [ ] Mỗi phương pháp có:
  - [ ] mô tả và giả thuyết;
  - [ ] setting/cây đã chỉnh;
  - [ ] kết quả và metric;
  - [ ] accuracy và error rate nếu là classification;
  - [ ] giải thích vì sao cải thiện hoặc không cải thiện.
- [ ] So sánh baseline và các mô hình cải thiện trên cùng protocol.
- [ ] Xác định phương pháp tốt nhất và giải thích nguyên nhân.

Hướng có thể cân nhắc: `max_depth`, criterion Gini/Entropy, `min_samples_split`,
`min_samples_leaf`, pruning, feature selection/engineering, class imbalance.

## 5. Report PDF

- [ ] Group introduction: tên nhóm, MSSV, thành viên, đóng góp cụ thể.
- [ ] Introduction: Decision Tree và mục tiêu project.
- [ ] Dataset description.
- [ ] Baseline model, cách train/test, hình cây, accuracy và error rate.
- [ ] Analysis of the tree.
- [ ] Improvement methods, trình bày riêng từng phương pháp.
- [ ] Comparison of results bằng bảng/hình khi phù hợp.
- [ ] Conclusion và key findings.
- [ ] References: dataset, documentation, sách, bài báo, thư viện.

## 6. Code, video và kiểm tra cuối

- [ ] Code đầy đủ cho load, preprocess, train, visualize và evaluate.
- [ ] Code rõ ràng, có hướng dẫn chạy và chạy được trên môi trường sạch.
- [ ] Video trình bày dataset, cách dựng cây, cây kết quả, accuracy/error rate,
      từng cải thiện và lý do cải thiện.
- [ ] Không chỉ đưa số cuối; có diễn giải và nhận xét.
- [ ] ZIP cuối đúng tên, mở được và không chứa secret/cache/dataset bị cấm phân phối.
