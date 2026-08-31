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

## Run the canonical sklearn baseline

```bash
python scripts/run_baseline.py
```

Baseline B0 được cố định theo D-006: Gini, unlimited depth,
`min_samples_split=2`, `min_samples_leaf=1`, stratified 80/20 split và seed 42.
Runner ghi `experiments/results/baseline/metrics.json`, gồm train/test malignant
F2/recall/precision/F1, specificity, balanced accuracy, accuracy/error rate,
TN/FP/FN/TP và ROC-AUC.

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

## Run the Gini-versus-Entropy experiment

Từ repository root:

```bash
python scripts/run_gini_vs_entropy.py
```

Script chạy cả Custom Decision Tree và Sklearn Decision Tree với cùng dataset,
shuffled stratified 80/20 split, seed và baseline parameters đã chốt trong D-006.
Chỉ `criterion` thay đổi giữa Gini và Entropy trong từng family. Model được chọn bằng
malignant F2 trên stratified 5-fold CV; test set chỉ được dùng sau khi chọn. Output gồm
`cv_results.csv`, `summary.json`, `criterion_comparison.png` và `selected_trees.png`.
