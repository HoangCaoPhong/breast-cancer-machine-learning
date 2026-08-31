# I2 - Gini versus Entropy

## Lab requirement mapping

This experiment implements the Lab 2 improvement method "changing the splitting
criterion (Gini versus Entropy)" for both the from-scratch and scikit-learn Decision
Trees.

| Lab requirement | Evidence |
| --- | --- |
| Describe the method | Gini and Entropy are compared while all other model settings remain fixed. |
| Present the updated result | `cv_results.csv`, `final_comparison.csv`, `comparison.json`, and PNG figures are generated locally. |
| Compute accuracy and error rate | Both are included in the CV table and selected-model held-out table. |
| Compare results fairly | Both implementations use the same canonical dataset, stratified 80/20 split, seed 42, and stratified 5-fold training CV. |
| Explain improvement or non-improvement | Selection and interpretation use mean validation malignant F2; the test set is not searched. |
| Provide visual aids | Accuracy and malignant F2 figures show side-by-side Custom and Sklearn panels with mean and standard deviation. |

## Reproduction

From the repository root:

```bash
python scripts/run_criterion_experiment.py
```

Generated files are written under `experiments/results/criterion/` and intentionally
remain Git-ignored until selected report artifacts are copied with provenance.

## Canonical result

Configuration: unlimited depth, `min_samples_split=2`, `min_samples_leaf=1`,
stratified 80/20 split, seed 42, and stratified 5-fold CV on the training partition.

| Implementation | Criterion | Mean validation accuracy | Error rate | Mean malignant F2 | Selected |
| --- | --- | ---: | ---: | ---: | --- |
| Custom | Gini | 0.9319 | 0.0681 | 0.9027 | Yes |
| Custom | Entropy | 0.9187 | 0.0813 | 0.8890 | No |
| Sklearn | Gini | 0.9231 | 0.0769 | 0.8948 | Yes |
| Sklearn | Entropy | 0.9187 | 0.0813 | 0.8891 | No |

Held-out results after training-CV selection:

| Implementation | Selected criterion | Test accuracy | Test error rate | Malignant recall | Malignant F2 |
| --- | --- | ---: | ---: | ---: | ---: |
| Custom | Gini | 0.9298 | 0.0702 | 0.8810 | 0.8894 |
| Sklearn | Gini | 0.9298 | 0.0702 | 0.9048 | 0.9048 |

## Interpretation

Entropy does not improve mean validation malignant F2 or accuracy over the Gini
baseline under the accepted protocol, so Gini is selected for both implementations.
The criterion change alone is therefore not an improvement for this dataset and split.

Both unlimited trees reach mean training accuracy and malignant F2 of 1.0 while their
validation results are lower. This train-validation gap indicates likely overfitting;
regularization through `max_depth` or minimum-sample controls is still worth evaluating.
Small differences between Custom and Sklearn are expected because implementations may
resolve equal or near-equal candidate splits differently.

These results describe an educational experiment on a small historical dataset. They
do not establish clinical effectiveness and are not a medical diagnosis.

## Remaining project-level Lab work

This branch completes the I2 criterion method, not the entire Lab submission. The full
project still needs integration of the other improvement methods, a consolidated
baseline-versus-improvements comparison, written report, presentation video, and final
submission package.
