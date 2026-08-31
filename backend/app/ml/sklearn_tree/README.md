# Sklearn Decision Tree experiments

- Baseline cố định để so sánh.
- `max_depth` - owner: Hoàng Cao Phong.
- Gini vs. Entropy - owner: Võ Mỹ Ngọc; Nguyễn Trung Kiên hỗ trợ integration setup.
- `min_samples_split`/`min_samples_leaf` - owner: Huỳnh Thái Hòa.

Mọi experiment phải đọc cùng split/config và export kết quả theo
`docs/EXPERIMENT_PLAN.md`.

## Gini versus Entropy (I2)

`criterion_experiment.py` contains Ngọc's controlled criterion comparison. The
caller supplies the canonical training partition, feature names, and all shared
baseline parameters. The function rejects a caller-provided `criterion` and
requires the canonical `random_state`, which prevents the two runs from accidentally
differing in more than the splitting criterion.

```python
from app.ml.sklearn_tree.criterion_experiment import fit_gini_and_entropy

runs = fit_gini_and_entropy(
    X_train,
    y_train,
    model_parameters={
        # Copy these values from the accepted baseline config.
        "random_state": canonical_seed,
        "max_depth": baseline_max_depth,
        "min_samples_split": baseline_min_samples_split,
        "min_samples_leaf": baseline_min_samples_leaf,
    },
    feature_names=canonical_feature_order,
)
```

Each sklearn run exposes the fitted estimator, model parameters, tree depth, leaf
count, feature importances, and readable rules. The report runner also executes the
same Gini/Entropy protocol with `DecisionTreeClassifierScratch`. Both model families
use the same canonical stratified 80/20 split, stratified 5-fold CV, parameters, and
shared metrics; within each family, only `criterion` changes.

Run the complete experiment from the repository root:

```bash
python scripts/run_criterion_experiment.py
```

The runner reads `experiments/configs/criterion.json` and writes report-ready CSV and
JSON tables plus Accuracy/F2 figures with side-by-side Custom and Sklearn panels and
separate selected Custom/Sklearn tree figures under `experiments/results/criterion/`.
