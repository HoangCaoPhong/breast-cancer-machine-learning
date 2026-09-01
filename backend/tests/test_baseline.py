import numpy as np
import pandas as pd
from app.ml.sklearn_tree import BaselineConfig, run_sklearn_baseline


def test_baseline_uses_fixed_parameters_and_stratified_80_20_split() -> None:
    generator = np.random.default_rng(17)
    benign = generator.normal(loc=-1.0, scale=0.8, size=(80, 3))
    malignant = generator.normal(loc=1.0, scale=0.8, size=(20, 3))
    features = pd.DataFrame(
        np.vstack([benign, malignant]),
        columns=["radius", "texture", "area"],
    )
    target = pd.Series(["B"] * len(benign) + ["M"] * len(malignant))

    result = run_sklearn_baseline(features, target)

    assert result.train_size == 80
    assert result.test_size == 20
    assert result.model.min_samples_split == 2
    assert result.model.min_samples_leaf == 1
    assert result.model.max_depth is None
    assert result.model.random_state == 42
    assert result.test_metrics.true_positives + result.test_metrics.false_negatives == 4
    assert result.test_metrics.true_negatives + result.test_metrics.false_positives == 16


def test_baseline_config_defaults_are_the_accepted_contract() -> None:
    config = BaselineConfig()

    assert config.test_size == 0.2
    assert config.random_state == 42
    assert config.criterion == "gini"
    assert config.max_depth is None
    assert config.min_samples_split == 2
    assert config.min_samples_leaf == 1
    assert config.positive_class == "M"
    assert config.negative_class == "B"
