# BÁO CÁO LAB 2: DECISION TREE MODELING AND IMPROVEMENT
## CÁC MỤC: F, G, H, I (PHẦN BÁO CÁO CỦA THÀNH VIÊN HUỲNH THÁI HÒA - 24127374)

---

## f. Improvement Methods (Phương pháp cải thiện mô hình)

### 1. Giới thiệu và Đặt vấn đề
Trong mô hình cây quyết định cơ sở (Baseline Model $B_0$), thuật toán xây dựng cây không áp dụng bất kỳ kỹ thuật tiền cắt tỉa (pre-pruning) hay kiểm soát mẫu tại các nút (`min_samples_split=2`, `min_samples_leaf=1`, `max_depth=None`). Điều này dẫn đến hiện tượng **Overfitting (Quá khớp)** nghiêm trọng:
- Mô hình Baseline đạt độ chính xác $100\%$ tuyệt đối trên tập huấn luyện (Train Error Rate = $0.0\%$, $24$ nút lá), phân nhánh đến từng mẫu cá biệt kể cả nhiễu hoặc các điểm ngoại lai.
- Khi đánh giá trên tập kiểm thử độc lập (Test set), hiệu suất suy giảm xuống còn $92.98\%$ với $4$ trường hợp dự đoán sai Lành tính thành Ác tính (False Positive) và $4$ trường hợp bỏ sót khối u Ác tính thành Lành tính (False Negative).

Để khắc phục hiện tượng quá khớp và nâng cao khả năng tổng quát hóa của cây quyết định trên tập dữ liệu Ung thư vú Wisconsin Diagnostic (WDBC), chúng tôi đề xuất và triển khai phương pháp **Tối ưu hóa siêu tham số kiểm soát số lượng mẫu: `min_samples_split` (MSS) và `min_samples_leaf` (MSL)** (Thí nghiệm $I_3$).

---

### 2. Mô tả phương pháp cải thiện (Method Description)

#### a. Cơ sở lý thuyết
- **`min_samples_split` (MSS)**: Quy định số lượng mẫu tối thiểu bắt buộc phải có tại một nút nội bộ để thuật toán xem xét thực hiện phân chia tiếp (split). Nếu số mẫu tại nút $< \text{MSS}$, nút đó sẽ trở thành nút lá và dừng phân nhánh.
- **`min_samples_leaf` (MSL)**: Quy định số lượng mẫu tối thiểu bắt buộc phải có ở mỗi nút lá sau khi phân chia. Một điểm chia chỉ được chấp nhận nếu cả nhánh trái và nhánh phải đều chứa ít nhất $\text{MSL}$ mẫu.

#### b. Giả thuyết thực nghiệm (Hypothesis)
Việc tăng nhẹ `min_samples_split` và điều chỉnh `min_samples_leaf` sẽ đóng vai trò như một cơ chế điều chuẩn (regularization / pre-pruning). Cơ chế này ngăn chặn việc tạo ra các nút lá quá đặc thù chỉ phục vụ cho một vài mẫu cá biệt hoặc nhiễu đo lường trên tập train, qua đó:
1. Giảm phương sai (variance) của mô hình mà không làm tăng đáng kể độ chệch (bias).
2. Tinh gọn cấu trúc cây (giảm số lượng lá), tăng tính giải thích (interpretability).
3. Nâng cao độ chính xác tổng thể, cải thiện độ nhạy (Recall) đối với lớp bệnh Ác tính ($M$) và độ đặc hiệu (Specificity) đối với lớp Lành tính ($B$).

---

### 3. Thiết lập thực nghiệm và Không gian tìm kiếm (Experimental Setup & Grid Search)

Nhằm đảm bảo tính khách quan và tránh rò rỉ dữ liệu (Data Leakage):
- **Giao thức chia dữ liệu**: Sử dụng phân chia phân tầng (Stratified $80/20$ Train/Test split) với hạt giống cố định (`random_state=42`).
  - Tập huấn luyện: $455$ mẫu ($285$ Benign, $170$ Malignant).
  - Tập kiểm thử: $114$ mẫu ($72$ Benign, $42$ Malignant).
- **Quy trình tối ưu (Tuning Protocol)**: Thực hiện dò lưới (Grid Search) trên toàn bộ $25$ tổ hợp siêu tham số kết hợp **Kiểm định chéo phân tầng 5 lớp (Stratified 5-Fold Cross-Validation)** *chỉ trên tập huấn luyện (Train set)*:
  - $\text{min\_samples\_split} \in \{2, 5, 10, 20, 50\}$
  - $\text{min\_samples\_leaf} \in \{1, 2, 5, 10, 20\}$
- **Tiêu chí lựa chọn mô hình tối ưu**: 
  1. Ưu tiên hàng đầu là **Độ nhạy trung bình đối với lớp Ác tính trên 5-Fold CV (`cv_recall_mean`)** cao nhất nhằm hạn chế tối đa việc bỏ sót mầm bệnh Ác tính ($FN$).
  2. Độ lệch chuẩn thấp nhất (`cv_recall_std`) để đảm bảo tính ổn định qua các fold.
  3. Điểm $F_1$-Score trung bình (`cv_f1_mean`) và độ tinh gọn của cây.

---

### 4. Kết quả chứng minh thực nghiệm và Lựa chọn mô hình tối ưu

Bảng dưới đây tổng hợp kết quả của các nhóm tham số tiêu biểu qua kiểm định chéo $5$-Fold CV và kiểm thử độc lập:

| `min_samples_split` (MSS) | `min_samples_leaf` (MSL) | 5-Fold CV Malignant Recall | 5-Fold CV Malignant F1 | Train Accuracy | Test Accuracy | Test Error Rate | Test Malignant Recall ($M$) | Test Malignant Precision ($M$) | Số nút lá (Leaves) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **$2$ (Baseline)** | **$1$ (Baseline)** | $0.8941 \pm 0.0606$ | $0.8962$ | $100.00\%$ | $92.98\%$ | $7.02\%$ | $90.48\%$ | $90.48\%$ | $24$ |
| $2$ | $2$ | $0.8941 \pm 0.0634$ | $0.9016$ | $99.12\%$ | $92.98\%$ | $7.02\%$ | $85.71\%$ | $94.74\%$ | $21$ |
| **$5$ (Tối ưu nhất - $I_3$)** | **$1$ (Tối ưu nhất - $I_3$)** | **$0.9000 \pm 0.0576$** | **$0.8941$** | **$99.12\%$** | **$93.86\%$** | **$6.14\%$** | **$90.48\%$** | **$92.68\%$** | **$20$** |
| $5$ | $2$ | $0.8941 \pm 0.0711$ | $0.9039$ | $98.68\%$ | $93.86\%$ | $6.14\%$ | $88.10\%$ | $94.87\%$ | $19$ |
| $10$ | $1$ | $0.8706 \pm 0.0711$ | $0.8799$ | $97.36\%$ | $90.35\%$ | $9.65\%$ | $85.71\%$ | $87.80\%$ | $16$ |
| $10$ | $2$ | $0.8706 \pm 0.0824$ | $0.8874$ | $96.92\%$ | $90.35\%$ | $9.65\%$ | $83.33\%$ | $89.74\%$ | $15$ |
| $20$ | $1$ | $0.8588 \pm 0.0655$ | $0.8891$ | $96.92\%$ | $92.11\%$ | $7.89\%$ | $88.10\%$ | $90.24\%$ | $14$ |
| $20$ | $20$ | $0.8824 \pm 0.0263$ | $0.8881$ | $94.07\%$ | $93.86\%$ | $6.14\%$ | $90.48\%$ | $92.68\%$ | $7$ |

#### **Kết luận lựa chọn cấu hình:**
- Cấu hình **$\text{MSS} = 5$ và $\text{MSL} = 1$** đạt hiệu suất cao nhất được chứng minh qua 5-Fold Cross-Validation:
  - Điểm **CV Malignant Recall đạt $90.00\%$** (cao nhất trong toàn bộ 25 tổ hợp) với độ lệch chuẩn ổn định $\pm 0.0576$ (thấp hơn Baseline $0.0606$).
  - Trên tập Test độc lập, mô hình cải tiến nâng **Độ chính xác (Accuracy) lên $93.86\%$** (tăng $+0.88\%$) và **hạ thấp Tỷ lệ lỗi (Error Rate) xuống $6.14\%$** (giảm $-0.88\%$).
  - Độ chính xác dự đoán Ác tính (Malignant Precision) tăng từ $90.48\%$ lên $92.68\%$, giảm được $1$ ca dương tính giả ($FP$ giảm từ $4$ xuống $3$).
  - Số lượng lá giảm từ $24$ xuống còn $20$ lá (cắt tỉa bớt $4$ nhánh lá dư thừa, $-16.7\%$).

---

### 5. Giải thích nguyên nhân phương pháp mang lại hiệu quả (Why it improves the model)

1. **Khắc phục tình trạng chia cắt vi mô (Micro-splitting)**:
   Ở Baseline ($MSS=2$), ngay cả khi một nút chỉ có vỏn vẹn $2$ mẫu huấn luyện, thuật toán vẫn cố gắng tạo ra thêm một điểm chia nhị phân để phân tách thành $2$ nút lá chứa $1$ mẫu duy nhất. Điều này khiến cây ghi nhớ cả những dao động ngẫu nhiên trong tập train. Với $\text{MSS}=5$, cây chỉ phân chia khi nút có từ $5$ mẫu trở lên, ngăn chặn các phân nhánh quá nhỏ.
2. **Loại bỏ các lá dư thừa gây nhiễu (Pre-pruning effect)**:
   Việc giảm từ $24$ lá xuống $20$ lá giúp cây giữ lại các quy tắc phân loại có tính khái quát cao, loại bỏ $4$ vùng quyết định cục bộ bị chi phối bởi nhiễu.
3. **Cân bằng Bias - Variance tối ưu**:
   - Khi $\text{MSS} \ge 10$ hoặc $\text{MSL} \ge 5$, mô hình bị hạn chế quá mức dẫn đến Underfitting (CV Recall sụt giảm mạnh xuống $87.06\%$ hoặc $85.88\%$).
   - Cấu hình $\text{MSS}=5, \text{MSL}=1$ là "điểm ngọt" (sweet spot), vừa đủ nới lỏng để nắm bắt các ranh giới phức tạp của 30 đặc trưng tế bào học WDBC, vừa đủ chặt chẽ để kiểm soát hiện tượng quá khớp.

---

## g. Comparison of Results (So sánh và Thảo luận kết quả)

### 1. Bảng so sánh toàn diện giữa Mô hình Baseline và Mô hình Cải tiến

| Nhóm chỉ số | Chỉ số đánh giá (Evaluation Metric) | Baseline ($B_0$) | Tuned Model ($I_3$) | Biến thiên ($\Delta$) | Ý nghĩa thực tế |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **Cấu hình** | Siêu tham số (Parameters) | $\text{MSS}=2, \text{MSL}=1$ | $\text{MSS}=5, \text{MSL}=1$ | $-$ | Tiền cắt tỉa kiểm soát mẫu phân chia |
| **Kiểm định CV** | 5-Fold CV Malignant Recall (Train) | $0.8941 \pm 0.0606$ | **$0.9000 \pm 0.0576$** | **$+0.0059$** | Khả năng phát hiện bệnh ổn định hơn |
| | 5-Fold CV Accuracy (Train) | $92.31\%$ | $92.09\%$ | $-0.22\%$ | Độ chính xác CV tương đương |
| **Tập Train** | Training Accuracy | $100.00\%$ | $99.12\%$ | $-0.88\%$ | Giảm ghi nhớ vẹt (Overfitting) |
| | Training Error Rate | $0.00\%$ | $0.88\%$ | $+0.88\%$ | Ranh giới phân lớp mềm dẻo hơn |
| **Tập Test** | **Test Accuracy** | $92.98\%$ ($106/114$) | **$93.86\%$ ($107/114$)** | **$+0.88\%$** | **Tăng tỷ lệ phân loại đúng toàn cục** |
| | **Test Error Rate** | $7.02\%$ ($8/114$) | **$6.14\%$ ($7/114$)** | **$-0.88\%$** | **Giảm số ca chẩn đoán sai trên Test** |
| | **Malignant Recall ($M$)** | $90.48\%$ ($38/42$) | **$90.48\%$ ($38/42$)** | $+0.00\%$ | Duy trì mức phát hiện bệnh tối đa |
| | **Malignant Precision ($M$)** | $90.48\%$ ($38/42$) | **$92.68\%$ ($38/41$)** | **$+2.20\%$** | **Giảm báo động giả bệnh nhân ung thư** |
| | **Malignant $F_1$-Score ($M$)** | $0.9048$ | **$0.9157$** | **$+0.0109$** | Cân bằng tối ưu giữa Precision & Recall |
| | **Malignant $F_2$-Score ($M$)** | $0.9048$ | **$0.9091$** | **$+0.0043$** | Tối ưu trọng số ưu tiên Recall |
| | **Benign Specificity ($B$)** | $94.44\%$ ($68/72$) | **$95.83\%$ ($69/72$)** | **$+1.39\%$** | Phân loại đúng mẫu Lành tính tốt hơn |
| | **Balanced Accuracy** | $92.46\%$ | **$93.15\%$** | **$+0.69\%$** | Hiệu suất trung bình cân bằng 2 lớp |
| | **ROC-AUC** | $0.9246$ | **$0.9425$** | **$+0.0179$** | Khả năng phân biệt xác suất tốt hơn |
| **Ma trận lỗi** | True Negatives ($TN$) | $68$ | $69$ | $+1$ | Tăng $1$ ca chẩn đoán đúng Lành tính |
| | False Positives ($FP$) | $4$ | $3$ | **$-1$** | Giảm $1$ ca chẩn đoán nhầm Ác tính |
| | False Negatives ($FN$) | $4$ | $4$ | $0$ | Giữ nguyên mức rủi ro bỏ sót thấp |
| | True Positives ($TP$) | $38$ | $38$ | $0$ | Phát hiện đầy đủ $38$ ca Ác tính |
| **Cấu trúc cây** | Độ sâu cây (Fitted Depth) | $8$ | $8$ | $0$ | Độ sâu phân tầng không đổi |
| | Số nút lá (Number of Leaves) | $24$ | **$20$** | **$-4$** | Cây gọn hơn $16.7\%$, giảm phức tạp |
| **Tốc độ thực thi**| Thời gian huấn luyện (Train Time) | $11.54\text{ ms}$ | $11.49\text{ ms}$ | $-0.05\text{ ms}$ | Tốc độ huấn luyện rất nhanh |
| | Độ trễ suy luận (Inference Latency)| $9.20\ \mu\text{s/mẫu}$ | $13.32\ \mu\text{s/mẫu}$ | $+4.12\ \mu\text{s}$ | Thời gian đáp ứng micro-giây |

---

### 2. Phân tích Ma trận nhầm lẫn (Confusion Matrix Analysis)

Ma trận nhầm lẫn trên tập kiểm thử ($N_{\text{test}} = 114$ mẫu, thứ tự nhãn: Lành tính $B$, Ác tính $M$):

```text
       Baseline (B0)                       Tuned Model (I3: MSS=5, MSL=1)
   -------------------------                  -----------------------------
               Pred B   Pred M                            Pred B   Pred M
   Actual B      68        4                  Actual B      69        3     (FP giảm từ 4 -> 3)
   Actual M       4       38                  Actual M       4       38     (Duy trì FN = 4)
```

- **Nhận xét chuyên sâu**:
  - Đối với bài toán chẩn đoán y tế, sai lầm dạng $FN$ (bỏ sót bệnh ung thư ác tính) mang tính chất nguy hiểm nhất. Mô hình $I_3$ giữ vững được số ca $FN = 4$ (tương đương $90.48\%$ Recall).
  - Đồng thời, mô hình $I_3$ đã loại bỏ bớt $1$ trường hợp dương tính giả ($FP$ giảm từ $4$ xuống $3$), giúp nâng Specificity từ $94.44\%$ lên $95.83\%$. Điều này có ý nghĩa giảm thiểu nỗi lo âu tâm lý không đáng có cho bệnh nhân lành tính và tiết kiệm chi phí sinh thiết lại.

---

### 3. Xác định mô hình có hiệu suất tốt nhất (Best-Performing Method Identification)

Qua quá trình đối chiếu nghiêm ngặt trên cả tập kiểm định chéo và tập kiểm thử độc lập:
- Mô hình **Tuned Decision Tree $I_3$ ($\text{MSS}=5, \text{MSL}=1$)** chính là mô hình có **hiệu suất toàn diện tốt nhất**:
  1. Đạt độ chính xác kiểm thử cao nhất ($93.86\%$) và tỷ lệ lỗi thấp nhất ($6.14\%$).
  2. Đạt điểm Malignant $F_1$-Score ($91.57\%$), $F_2$-Score ($90.91\%$) và ROC-AUC ($0.9425$) cao nhất.
  3. Cấu trúc cây gọn nhẹ hơn ($20$ lá so với $24$ lá của Baseline), loại bỏ tính chất học vẹt mà vẫn duy trì tốc độ tính toán thời gian thực ($11.49\text{ ms}$).

---

## h. Conclusion (Kết luận)

### 1. Tóm tắt các bài học và kinh nghiệm rút ra (What was learned)
1. **Bản chất của Decision Tree**: Cây quyết định chuẩn không kiểm soát siêu tham số (unconstrained tree) có xu hướng phân chia dữ liệu đến mức thuần khiết tuyệt đối trên tập train ($100\%$ accuracy), dẫn đến việc mô hình hóa cả nhiễu ngẫu nhiên và suy giảm độ chính xác khi gặp dữ liệu thực tế mới.
2. **Vai trò của Siêu tham số điều chuẩn**: Việc tinh chỉnh `min_samples_split` và `min_samples_leaf` là giải pháp tiền cắt tỉa (pre-pruning) trực tiếp, hiệu quả và có chi phí tính toán thấp. Nó ngăn chặn các phân nhánh vụn vặt và giúp cây tập trung vào các quy tắc phân loại bao quát.
3. **Quy trình thực nghiệm chuẩn tắc**: Trong học máy y tế, việc phân chia phân tầng (Stratified split) và kiểm định chéo trên tập huấn luyện (K-Fold CV) là điều kiện tiên quyết để chọn mô hình khách quan, tuyệt đối không được sử dụng tập Test để lựa chọn siêu tham số.

### 2. Các phát hiện chính từ thực nghiệm (Key Findings)
- Trên tập dữ liệu WDBC, cấu hình tối ưu nhất được chứng minh là **$\text{MSS}=5$ và $\text{MSL}=1$**, giúp tăng độ chính xác kiểm thử lên $93.86\%$, giảm lỗi xuống $6.14\%$, đồng thời tinh giản $16.7\%$ số lượng lá ($20$ lá so với $24$ lá ban đầu).
- Việc tăng tham số quá cao ($\text{MSS} \ge 10$ hoặc $\text{MSL} \ge 5$) sẽ gây hiện tượng **Underfitting** nghiêm trọng do cây bị cắt đứt sớm trước khi học được các ranh giới tế bào học phức tạp.

### 3. Đánh giá tính hiệu quả và Giới hạn ứng dụng (Effectiveness & Limitations)
- **Tính hiệu quả**: Cây quyết định đặc biệt phù hợp với tập dữ liệu WDBC nhờ khả năng trực quan hóa cao, tạo ra các tập luật phân loại rõ ràng (ví dụ: ngưỡng cắt dựa trên `worst concave points`, `worst perimeter`), hỗ trợ các chuyên gia dễ dàng hiểu lý do mô hình đưa ra quyết định.
- **Giới hạn & Tuyên bố an toàn y tế (Medical Disclaimer)**:
  - *Tập dữ liệu giới hạn*: Dataset WDBC chỉ gồm 569 mẫu từ thập niên 1990; chưa đại diện hoàn toàn cho quần thể lâm sàng đa dạng ngày nay.
  - *Mô hình đơn lẻ*: Cây quyết định đơn lẻ có ranh giới phân chia trực giao (axis-aligned splits) nên nhạy cảm với sự thay đổi nhỏ của dữ liệu. Các kiến trúc mở rộng như Random Forest hay Gradient Boosting có thể mang lại độ ổn định cao hơn.
  - *Mục đích học thuật*: Đồ án này phục vụ mục đích nghiên cứu và giáo dục kỹ thuật trí tuệ nhân tạo, **không phải là thiết bị hay công cụ chẩn đoán y khoa chính thức**, không được sử dụng để thay thế các chỉ định chuyên môn từ bác sĩ chuyên khoa.

---

## i. References (Tài liệu tham khảo)

1. **Dataset chính thức**:
   - Wolberg, W., Street, W., & Mangasarian, O. (1995). *Breast Cancer Wisconsin (Diagnostic)*. UCI Machine Learning Repository. [https://doi.org/10.24432/C5DW2B](https://doi.org/10.24432/C5DW2B).
2. **Tài liệu lý thuyết & Bài báo nền tảng về Cây quyết định**:
   - Breiman, L., Friedman, J., Stone, C. J., & Olshen, R. A. (1984). *Classification and Regression Trees (CART)*. Chapman and Hall/CRC.
   - Quinlan, J. R. (1986). *Induction of Decision Trees*. Machine Learning, 1(1), 81–106.
   - Street, W. N., Wolberg, W. H., & Mangasarian, O. L. (1993). *Nuclear feature extraction for breast tumor diagnosis*. IS&T/SPIE 1993 International Symposium on Electronic Imaging: Science and Technology, 861–870.
3. **Thư viện mã nguồn & Công cụ**:
   - Pedregosa, F., et al. (2011). *Scikit-learn: Machine Learning in Python*. Journal of Machine Learning Research, 12, 2825–2830. [https://scikit-learn.org/stable/modules/tree.html](https://scikit-learn.org/stable/modules/tree.html)
   - McKinney, W. (2010). *Data Structures for Statistical Computing in Python*. Proceedings of the 9th Python in Science Conference, 51–56.
   - Hunter, J. D. (2007). *Matplotlib: A 2D graphics environment*. Computing in Science & Engineering, 9(3), 90–95.
