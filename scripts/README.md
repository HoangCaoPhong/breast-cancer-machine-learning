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

## Run Experiment I3 Benchmark (min_samples tuning vs baseline)

```bash
python scripts/benchmark_min_samples.py --include-custom-tree
```

Script thực hiện:
- Nạp cấu hình từ `experiments/configs/min_samples.json`.
- Chạy 5-Fold Stratified Cross-Validation trên tập Train trên không gian $5 \times 5$ (`min_samples_split` $\in [2..50]$, `min_samples_leaf` $\in [1..20]$), chọn bằng malignant F2 theo D-006.
- Đo đạc thời gian huấn luyện (`training_time_ms`) và độ trễ suy luận (`inference_latency_us`).
- In bảng so sánh đối đầu giữa Baseline (B0), Tuned Model (I3) và Custom Decision Tree.
- Tự động xuất kết quả JSON ra `experiments/results/min_samples/benchmark_summary.json`.

## Generate comparison charts (4-in-1 figure)

```bash
python scripts/plot_min_samples_comparison.py
```

Tự động sinh ảnh biểu đồ so sánh đa chiều (độ phân giải 300 DPI) gồm:
1. Grouped Bar Chart: So sánh 6 chỉ số phân loại chính.
2. 2D Heatmap: Thể hiện điểm CV Malignant F2 của 25 cặp tham số và đánh dấu ô `[Best]`.
3. Test Confusion Matrices: Đặt cạnh nhau giữa Baseline B0 và Tuned I3.
4. Complexity & Speed: So sánh số nút lá và thời gian chạy.

File ảnh được lưu tại `reports/figures/min_samples_comparison.png`.
