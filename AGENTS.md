# Repository Instructions for Coding Agents

These instructions apply to the entire repository.

## Read first

Before changing code, read:

1. `README.md` for the fixed scope and ownership.
2. `CODING_RULES.md` for ML, API, UI, data, and test contracts.
3. `CONTRIBUTING.md` for branch, commit, and pull request rules.
4. `docs/ARCHITECTURE.md` before crossing backend/frontend/ML boundaries.
5. `docs/EXPERIMENT_PLAN.md` before changing data, split, metrics, or a model experiment.
6. `docs/DECISIONS.md` before changing an accepted project decision.

## Architecture boundaries

- Keep HTTP routes thin: validate schemas, call services, and serialize responses.
- Keep model loading/inference orchestration in `backend/app/services/`.
- Keep ML code independent from FastAPI and frontend code under `backend/app/ml/`.
- Put the from-scratch implementation only in `backend/app/ml/custom_tree/`.
- Put sklearn baseline/improvements in `backend/app/ml/sklearn_tree/`.
- Put learned preprocessing in a pipeline fitted on training data only.
- Keep frontend API access in `frontend/src/services/`; UI components must not embed model logic.
- Do not introduce a database or authentication unless the agreed scope changes.

## Fixed project contracts

- Canonical dataset: UCI Breast Cancer Wisconsin (Diagnostic), dataset ID 17.
- Task: binary classification of `M` versus `B` for an educational demo.
- Planned improvements: `max_depth`, Gini-vs-Entropy, and `min_samples_split`/`min_samples_leaf`.
- The custom tree may use NumPy/Pandas helpers but must not delegate tree construction to sklearn.
- Frontend/report must state that output is not a medical diagnosis.

## Change discipline

- Do not commit patient-identifiable data, secrets, VPS credentials, model binaries, videos, or ZIP submissions.
- Do not silently change feature order, target mapping, split, seed, metric averaging, or positive class.
- Do not add a dependency without documenting its purpose in the relevant requirements/package manifest.
- Do not mix unrelated frontend, backend, model, and report changes in one pull request.
- Record material experimental or interface decisions in `docs/DECISIONS.md`.

## Verification

- Add deterministic tests for behavior changes; tests must not download data or call the network.
- Compare the custom implementation with small hand-built cases and the agreed sklearn reference behavior.
- Run focused checks first, then lint, formatting, and the relevant backend/frontend suites.
- Report checks that could not run; never claim unexecuted checks passed.
