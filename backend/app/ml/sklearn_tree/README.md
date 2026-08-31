# Sklearn Decision Tree experiments

- Baseline cố định để so sánh.
- `max_depth` - owner: Hoàng Cao Phong.
- Gini vs. Entropy - owner: Võ Mỹ Ngọc; Nguyễn Trung Kiên hỗ trợ integration setup.
- `min_samples_split`/`min_samples_leaf` - owner: Huỳnh Thái Hòa.

Mọi experiment phải đọc cùng split/config và export kết quả theo
`docs/EXPERIMENT_PLAN.md`.

## Gini versus Entropy (I2)

`gini_vs_entropy.py` contains the reusable I2 orchestration for both the existing
custom tree and sklearn tree. It imports the original estimators without modifying
their implementation, keeps every baseline parameter fixed, and changes only
`criterion` between `gini` and `entropy`. Both families use the same shuffled,
stratified split and CV folds.

Run from the repository root:

```bash
python scripts/run_gini_vs_entropy.py
```

The runner reads `experiments/configs/criterion.json` and writes one CV table, one JSON
summary, one two-family comparison chart, and one combined selected-trees figure under
`experiments/results/criterion/`. The custom-tree implementation remains independent.
