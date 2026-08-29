# Backend tests

- Custom tree: impurity, split, stopping, traversal và deterministic cases.
- Preprocessing: schema, target/ID separation, feature order và leakage guards.
- Evaluation: positive class, averaging, accuracy/error-rate consistency.
- API: valid/invalid input, model-not-ready và safe response/disclaimer.
- Tests không gọi mạng hoặc tải UCI data; dùng fixture nhỏ trong `data/samples/`.
