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

### Best variant and current finding

For I2, "best" means the better of the two controlled variants (`gini` and
`entropy`) under the accepted experiment protocol. It does not mean the globally
best Decision Tree configuration. The runner selects the highest mean validation
malignant F2 from stratified 5-fold CV on the training split. Mean validation
malignant recall breaks an F2 tie; accuracy is reported for reference and the
held-out test set is not used for selection.

The reproducible run with the canonical UCI dataset, shuffled stratified 80/20
split, seed `42`, and all non-criterion baseline parameters fixed selected `gini`
for both implementations:

| Implementation | Gini validation F2 | Entropy validation F2 | Selected test F2 |
| --- | ---: | ---: | ---: |
| Custom tree | `0.9027 +/- 0.0524` | `0.8890 +/- 0.0241` | `0.8894` |
| Sklearn tree | `0.8948 +/- 0.0533` | `0.8891 +/- 0.0259` | `0.9048` |

The selected Gini variants are refitted on the full training split before their
single held-out test evaluation. Their observed depth (`8`) and leaf count (`24`)
describe the fitted trees; those values are not tuned or used as selection
conditions in I2.

The report should therefore state that Gini is the best **tested criterion under
this fixed protocol**, not that Gini is universally superior. Gini has the higher
mean validation F2 in this run, while its larger cross-fold standard deviation
also indicates less stable results than Entropy. The exported `summary.json` and
`criterion_comparison.png` are the source of truth if the experiment is rerun.
