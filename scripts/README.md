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
