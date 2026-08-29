# Coding Rules - Breast Cancer Decision Tree Demo

Đây là contract chung cho model, experiment, FastAPI, frontend và report.

## 1. Quy ước chung

- Code, tên file/biến/hàm/class, API field, branch và commit message dùng tiếng Anh.
- Python 3.10+; public function có type hints và docstring khi hành vi không hiển nhiên.
- Python dùng `snake_case`, class dùng `PascalCase`, constant dùng `UPPER_SNAKE_CASE`.
- Frontend component/type dùng `PascalCase`; function/variable dùng `camelCase`.
- Không hard-code đường dẫn tuyệt đối, secret, VPS credential hoặc URL theo máy cá nhân.
- Không commit cache, `.venv`, `node_modules`, raw data, generated model, video hay ZIP.

## 2. An toàn nội dung y khoa

- Sản phẩm chỉ được mô tả là **educational classification demo**, không gọi là công cụ chẩn đoán lâm sàng.
- UI, README, report và video phải nói rõ kết quả không thay thế bác sĩ hoặc xét nghiệm y tế.
- Không thu thập tên, số điện thoại, địa chỉ, hồ sơ bệnh án hoặc thông tin định danh bệnh nhân.
- Không dùng accuracy cao để tuyên bố mô hình an toàn hoặc sẵn sàng triển khai y tế.
- Phải thảo luận false negative/false positive và giới hạn của dataset nhỏ, cũ, có phạm vi hẹp.

## 3. Ranh giới module

- `backend/app/api/`: route và HTTP concerns, không chứa logic huấn luyện.
- `backend/app/services/`: orchestration, model registry/loading và use case prediction.
- `backend/app/ml/custom_tree/`: thuật toán Decision Tree tự cài đặt.
- `backend/app/ml/sklearn_tree/`: baseline và các biến thể sklearn.
- `backend/app/ml/preprocessing/`: schema, target mapping và pipeline dữ liệu.
- `backend/app/ml/evaluation/`: metric, bảng so sánh và visualization helpers.
- `frontend/src/services/`: HTTP client; component không gọi `fetch` rải rác.
- Notebook chỉ dùng EDA/trình bày; logic tạo kết quả cuối phải nằm trong backend/scripts.

## 4. Dataset contract

- Nguồn chuẩn: UCI Breast Cancer Wisconsin (Diagnostic), dataset ID 17.
- Target mapping phải được khai báo một nơi và dùng nhất quán; positive class cho metric phải ghi rõ.
- Cột ID không được dùng làm predictive feature.
- Feature order và tên phải được lưu cùng model artifact/API schema.
- `data/raw/` bất biến; `data/processed/` chỉ được tạo bởi code/script tái lập được.
- Không fit imputer, selector hoặc transformer trên test data. Dataset hiện không có missing value theo UCI, nhưng code vẫn phải validate schema.
- Nếu dùng `sklearn.datasets.load_breast_cancer` thay file UCI, phải ghi quyết định vì tên/format có thể khác dù nội dung tương ứng.

## 5. Decision Tree from scratch

- Không import/gọi `sklearn.tree.DecisionTreeClassifier` trong implementation.
- Public contract tối thiểu: `fit(X, y)`, `predict(X)`; `predict_proba` chỉ thêm khi tính đúng và có test.
- Tách rõ node representation, impurity, candidate split, stopping condition và traversal.
- Xử lý deterministically khi nhiều split bằng điểm nhau; tie-breaking phải được tài liệu hóa.
- Validate input shape, feature type và trạng thái model chưa fit.
- Test tối thiểu: pure leaf, one useful split, max depth, min samples, constant feature, duplicated values và deterministic prediction.
- Có thể dùng sklearn làm oracle so sánh trên case tương thích, không dùng nó để thực thi thuật toán custom.

## 6. Sklearn baseline và ba cải thiện

- Baseline và mọi variant dùng cùng data version, split, preprocessing, seed và metric.
- Experiment `max_depth` chỉ thay depth/search space đã ghi trước.
- Experiment criterion so sánh Gini/Entropy trên cùng điều kiện; tham số hoặc ngưỡng lấy từ paper phải có citation và không được chọn bằng test set.
- Experiment `min_samples_split`/`min_samples_leaf` ghi rõ search space và tác động tới độ phức tạp cây.
- Tuning chỉ dùng training folds/validation; final test chỉ dùng sau khi đã chọn model.
- Không chỉ giữ kết quả tốt nhất; lưu cả cấu hình không cải thiện và giải thích.

## 7. Metrics và diễn giải

- Classification report tối thiểu: confusion matrix, accuracy, error rate, precision, recall và F1.
- Ghi rõ positive class và averaging; ROC-AUC chỉ dùng khi có score/probability hợp lệ.
- Error rate phải tính nhất quán: `1 - accuracy`.
- Báo train và validation/test để có bằng chứng overfit/underfit.
- Với bối cảnh này phải trình bày riêng malignant recall/false-negative count, nhưng primary metric cuối do owner metrics đề xuất và nhóm ghi vào decision log.
- Mọi tree figure/rule phải khớp feature names sau preprocessing và đủ đọc được.

## 8. FastAPI

- API public đặt dưới `/api/v1`; health endpoint có thể đặt tại `/health`.
- Route chỉ validate input, gọi service và map domain error sang HTTP response.
- Request/response dùng Pydantic schema, có ví dụ và test cho invalid input.
- Model chỉ load một lần khi khởi động/lazy singleton, không load lại ở mỗi request.
- Response phải có model/version identifier và disclaimer; không trả stack trace cho client.
- CORS dùng allowlist từ environment, không wildcard khi triển khai public.

## 9. Frontend

- Feature dự đoán nằm dưới `frontend/src/features/prediction/`.
- API client đặt trong `frontend/src/services/`; base URL lấy từ environment.
- Có loading, validation, error, empty và success states rõ ràng.
- Không gọi kết quả là “bạn bị/không bị ung thư”; dùng nhãn phân loại của model kèm cảnh báo học thuật.
- Không log hoặc lưu input người dùng nếu chưa có yêu cầu và đánh giá privacy riêng.

## 10. Test, Git và Definition of Done

- Unit test không gọi mạng; dataset test dùng fixture nhỏ có quyền phân phối.
- Bug fix phải có regression test.
- Commit theo Conventional Commits: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `ci`.
- PR thay schema/split/seed/metric/API phải cập nhật docs và báo ảnh hưởng tới nhánh liên quan.
- Task hoàn tất khi acceptance criteria đạt, checks liên quan pass, kết quả tái lập được,
  không có secret/data leakage và đã có reviewer khác tác giả.
