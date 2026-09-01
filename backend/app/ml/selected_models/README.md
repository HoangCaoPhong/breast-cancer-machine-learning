# Selected model presets

Thư mục này chứa cấu hình đã được chọn bởi các experiment, dùng làm điểm import ổn
định khi tích hợp backend. Nó không chứa implementation của thuật toán, logic tuning,
model artifact hoặc code FastAPI.

| Method | File | Status |
| --- | --- | --- |
| I1 - `max_depth` | `i1_max_depth.py` | Selected: depth 8 |
| I2 - Gini/Entropy | `i2_criterion.py` | Selected: Gini for custom and sklearn |
| I3 - minimum samples | `i3_min_samples.py` | Selected on sklearn: split 5, leaf 1 |

Ví dụ sử dụng:

```python
from app.ml.selected_models import build_selected_max_depth_model

model = build_selected_max_depth_model("custom")  # or "sklearn"
model.fit(X_train, y_train)

from app.ml.selected_models import build_selected_criterion_model

criterion_model = build_selected_criterion_model("sklearn")
criterion_model.fit(X_train, y_train)

from app.ml.selected_models import build_selected_min_samples_model

min_samples_model = build_selected_min_samples_model("sklearn")
min_samples_model.fit(X_train, y_train)
```

I3 được chọn bởi benchmark sklearn của nhánh thí nghiệm. Factory cũng cho phép dựng
custom tree với cùng tham số để integration so sánh, nhưng metadata không tuyên bố đó
là cấu hình đã được tune riêng cho custom tree.

Mỗi preset phải có model ID, version, tham số, class semantics và provenance của
selection protocol. Không hard-code lại các giá trị này trong service hoặc frontend.
