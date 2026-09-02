# Notebooks

Quy ước dự kiến:

- `01_data_validation_eda.ipynb` - Nhân
- `02_custom_tree_demo.ipynb` - Phong
- `03_sklearn_improvements.ipynb` - các owner experiment
- `03_max_depth_experiment.ipynb` - Phong; presentation layer cho dual custom/sklearn
  `max_depth` runner, gồm bảng metric, comparison charts, confusion matrices và tree figures
- `04_model_comparison.ipynb` - tích hợp kết quả report

Notebook không là nguồn duy nhất của preprocessing/train/evaluation cuối. Đưa logic
dùng lại vào `backend/app/ml/` và entry point vào `scripts/`. Trước khi merge: restart,
run all, xóa output/debug không cần thiết và kiểm tra không có dữ liệu nhạy cảm.
