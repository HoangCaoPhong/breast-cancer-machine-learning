# Scripts

Entry point dự kiến:

- download/verify UCI dataset;
- validate/preprocess and create canonical split;
- train/test the custom Decision Tree;
- run sklearn baseline and three improvement configs;
- export selected model plus metadata;
- generate metrics, tree figures and comparison tables.

Mỗi script chạy từ repository root, nhận config/path tường minh, có seed và không
dùng đường dẫn tuyệt đối. Không để training logic chỉ tồn tại trong notebook.

## Run the custom tree

Từ repository root:

```bash
python scripts/run_custom_tree.py
```

Ví dụ thay đổi tham số:

```bash
python scripts/run_custom_tree.py --criterion entropy --max-depth 3 --min-samples-leaf 5
```

Script dùng stratified 80/20 split với seed 42 theo mặc định, in train/test accuracy,
error rate, confusion matrix, classification report và malignant false-negative count.
Các giá trị mặc định phục vụ demo local, chưa phải protocol chính thức cho report.
