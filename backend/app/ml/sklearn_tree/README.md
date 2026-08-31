# Sklearn Decision Tree experiments

- Baseline cố định để so sánh.
- `max_depth` - owner: Hoàng Cao Phong.
- Gini vs. Entropy - owner: Võ Mỹ Ngọc; Nguyễn Trung Kiên hỗ trợ integration setup.
- `min_samples_split`/`min_samples_leaf` - owner: Huỳnh Thái Hòa.

Mọi experiment phải đọc cùng split/config và export kết quả theo
`docs/EXPERIMENT_PLAN.md`.

## Gini versus Entropy (I2)

`gini_vs_entropy.py` contains the reusable sklearn-only comparison logic. It
keeps every baseline parameter fixed and changes only `criterion` between `gini` and
`entropy`. Model selection uses mean malignant F2 from stratified CV on the training
split; the held-out test set is evaluated only after selecting the criterion.

Run from the repository root:

```bash
python scripts/run_criterion_experiment.py
```

The runner reads `experiments/configs/criterion.json` and writes one CV table, one JSON
summary, one comparison chart, and one selected sklearn-tree figure under
`experiments/results/criterion/`. The custom-tree implementation remains independent.
