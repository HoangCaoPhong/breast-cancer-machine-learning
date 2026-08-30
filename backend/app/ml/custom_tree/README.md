# Custom Decision Tree

Owner: Hoàng Cao Phong.

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
