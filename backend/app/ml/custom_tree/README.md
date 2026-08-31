# Custom Decision Tree

Implementation tự xây dựng impurity, split search, stopping conditions, tree nodes và
traversal. Không gọi `sklearn.tree.DecisionTreeClassifier` trong code thuật toán.

## Public contract

```python
from app.ml.custom_tree import DecisionTreeClassifierScratch

model = DecisionTreeClassifierScratch(
    criterion="gini",
    max_depth=None,
    min_samples_split=2,
    min_samples_leaf=1,
)
model.fit(X_train, y_train)
predictions = model.predict(X_test)
probabilities = model.predict_proba(X_test)
```

`X` phải là ma trận 2 chiều gồm các giá trị số hữu hạn. Implementation hỗ trợ
`criterion="gini"` hoặc `criterion="entropy"`, cùng các stopping controls phục vụ ba
hướng thí nghiệm của nhóm.

Nếu nhiều split có information gain bằng nhau trong sai số `1e-12`, cây chọn feature có
index nhỏ hơn, sau đó chọn threshold nhỏ hơn. Khi số phiếu class bằng nhau, cây chọn class
đầu tiên trong `classes_` (thứ tự đã sort bởi NumPy). Quy tắc này giúp các run và test có
kết quả deterministic.

## Canonical dataset example

Chạy từ repository root với `PYTHONPATH=backend`:

```python
from app.ml.custom_tree import DecisionTreeClassifierScratch
from app.ml.preprocessing import load_breast_cancer_dataset

dataset = load_breast_cancer_dataset("data/raw/uci_wdbc/wdbc.data")
model = DecisionTreeClassifierScratch(max_depth=3, min_samples_leaf=5)
model.fit(dataset.features, dataset.target)

predictions = model.predict(dataset.features.iloc[:5])
```

Loader validate bản UCI 569 dòng, gắn đúng thứ tự 30 feature và loại `id` trước khi
truyền dữ liệu vào model. Đoạn ví dụ chỉ minh họa integration; experiment chính thức vẫn
phải dùng canonical train/test split sau khi nhóm chốt protocol.

## Gini versus Entropy experiment

`criterion_experiment.py` runs Gini and Entropy on the custom implementation with
the same canonical split, folds, parameters, and shared metrics used by the sklearn
comparison. The report runner is:

```bash
python scripts/run_criterion_experiment.py
```

The runner exports `selected_custom_tree.png`, including feature thresholds, impurity,
sample counts, class counts, and predicted classes through depth 4.
