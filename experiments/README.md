# Experiments

- `configs/`: config có tên, owner, seed, split/model parameters và hypothesis.
- `results/`: output local/generated, chỉ README được track mặc định.

Ba experiment chính: `max_depth`, Gini-vs-Entropy và
`min_samples_split`/`min_samples_leaf`. Không tự tạo split riêng theo từng branch.
