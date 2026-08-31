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

## Run the max-depth experiment

```bash
python scripts/run_max_depth_experiment.py \
  --config experiments/configs/max_depth.json
```

Experiment chạy trên cả custom tree và sklearn tree, dùng chung split/folds và chọn độ
sâu riêng cho từng implementation chỉ bằng training CV. Sau đó runner so sánh baseline
không giới hạn với model đã chọn trên held-out test. Primary metric là malignant F2
(`beta=2`) theo D-006/D-007; accuracy và error rate vẫn được báo theo đề. Runner ghi
CSV metric đầy đủ, JSON provenance, report notes, accuracy/F2/complexity charts,
held-out metric comparison, confusion matrices và hai selected-tree figures vào
`experiments/results/max_depth/`.
