# Breast Cancer Machine Learning Demo

## English

### Project and team

Breast Cancer Machine Learning Demo is **Team 4's Lab 02 project** for the
**Introduction to Artificial Intelligence** course at the Faculty of Information
Technology, University of Science, Vietnam National University Ho Chi Minh City.

The project studies how a Decision Tree is constructed, evaluated, interpreted,
and improved for binary classification. The final deliverable is an educational
web application that classifies Breast Cancer Wisconsin (Diagnostic) samples as
malignant or benign and presents the model result in an understandable form.

> **Medical disclaimer:** this project is an educational machine-learning demo.
> It is not a medical device, does not provide a clinical diagnosis, and must not
> replace evaluation or advice from qualified healthcare professionals.

| Member | Student ID | Role | Primary responsibilities |
| --- | --- | --- | --- |
| Hoàng Cao Phong | 24127486 | Tech Lead / ML Engineer | Repository setup, Decision Tree from scratch, `max_depth` experiment, integration, and review |
| Võ Mỹ Ngọc | 24127294 | Frontend Developer / ML Researcher | Prediction interface and Gini-versus-Entropy research and experiment |
| Nguyễn Trung Kiên | 24127068 | Backend Developer / DevOps | FastAPI backend, API-model integration, VPS deployment, and frontend contract support |
| Huỳnh Thái Hòa | 24127374 | ML Engineer | `min_samples_split` and `min_samples_leaf` experiments |
| Lương Thiện Nhân | 24127475 | Data & Evaluation Engineer | Data validation and cleaning, metric definition, evaluation, and result tables |

Detailed ownership, internal checkpoints, and pending administrative roles are
tracked in [TEAM.md](TEAM.md).

### Project overview

The project uses the **Breast Cancer Wisconsin (Diagnostic)** dataset from the
UCI Machine Learning Repository. The dataset contains 569 instances and 30
real-valued predictive features derived from digitized images of fine-needle
aspirates of breast masses. The target is `diagnosis`, with `M` for malignant
and `B` for benign.

The agreed project scope includes:

- implementing a Decision Tree classifier from scratch to demonstrate impurity,
  split selection, stopping conditions, tree construction, and traversal;
- building a fixed scikit-learn baseline for controlled comparison;
- evaluating three model-improvement directions:
  - changing `max_depth`;
  - comparing Gini impurity with Entropy;
  - adjusting `min_samples_split` and `min_samples_leaf`;
- comparing all models on the same dataset version, split, seed, preprocessing,
  and evaluation protocol;
- visualizing the resulting tree and explaining important decision rules;
- integrating the selected model into a FastAPI backend and a web frontend;
- delivering reproducible code, a written report, a presentation video, and the
  final submission package.

The official dataset source is the
[UCI Breast Cancer Wisconsin (Diagnostic) page](https://archive.ics.uci.edu/dataset/17/breast-cancer-wisconsin-diagnostic),
DOI [`10.24432/C5DW2B`](https://doi.org/10.24432/C5DW2B), licensed under CC BY 4.0.
See the [data guide](data/README.md) for provenance and handling rules.

### Current status

| Area | Status |
| --- | --- |
| Repository structure, collaboration rules, and GitHub CI | Scaffolded |
| Dataset selection and official provenance | Confirmed |
| Canonical feature order, target mapping, split, seed, and primary metric | Pending team decision |
| Decision Tree from scratch | Planned / assigned |
| Scikit-learn baseline and three improvement experiments | Planned / assigned |
| FastAPI backend and model-serving contract | Scaffolded, implementation pending |
| Frontend prediction experience | Scaffolded, implementation pending |
| Integrated website, report, and video | Pending |

The internal target is to finish the report, video, and final package by
**23:00 on September 1, 2026**, ahead of the official September 2 deadline. See
the [internal timeline](docs/TIMELINE.md).

### Architecture

Training and evaluation run offline. The web application performs inference
through a previously selected and versioned model artifact.

```text
UCI raw data -> validation/preprocessing -> canonical train/test protocol
                                                |
                         +----------------------+----------------------+
                         v                                             v
              custom Decision Tree                         scikit-learn variants
                         |                                             |
                         +--------------> evaluation <-----------------+
                                                |
                                     selected model + metadata
                                                |
                                                v
Web frontend -> FastAPI routes -> prediction service -> loaded model/pipeline
```

```text
project2/
├── backend/                 # FastAPI, ML modules, services, schemas, and tests
│   └── app/ml/
│       ├── custom_tree/     # Decision Tree implemented from scratch
│       ├── sklearn_tree/    # Baseline and improvement experiments
│       ├── preprocessing/   # Dataset schema, split, and preprocessing
│       └── evaluation/      # Metrics, comparisons, and visualizations
├── frontend/                # Web prediction interface
├── data/                    # Raw, processed, and small sample datasets
├── experiments/             # Versioned experiment configs and local results
├── notebooks/               # EDA and presentation-oriented notebooks
├── reports/                 # Drafts, report-ready figures, and tables
├── scripts/                 # Reproducible data, training, and export entry points
├── docs/                    # Requirements, architecture, decisions, and timeline
└── submission/              # Final packaging checklist; large binaries stay local
```

See the [architecture guide](docs/ARCHITECTURE.md) for module boundaries and the
[experiment plan](docs/EXPERIMENT_PLAN.md) for the shared comparison contract.

### Quick start

Python 3.10 or later is required. Run from the repository root:

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

The backend and frontend are currently at the scaffold stage. Their verified run
commands will be documented in the [backend guide](backend/README.md) and
[frontend guide](frontend/README.md) when the corresponding entry points and
package manifest are merged. The repository does not yet provide a complete
end-to-end application.

### Verification

Backend and experiment checks:

```bash
ruff check backend experiments scripts
ruff format --check backend experiments scripts
pytest
```

Tests must be deterministic and must not download the UCI dataset or call external
services. Frontend lint, test, and build checks are activated by CI after its
`package.json` is added.

### Git workflow

- `main`: stable and demonstrable work.
- `dev`: integration branch for the current sprint.
- `feature/<slug>`: model, API, frontend, or infrastructure work.
- `experiment/<slug>`: controlled model experiments.
- `fix/<slug>` and `docs/<slug>`: focused fixes and documentation changes.

Do not push directly to `main` or `dev`. Use a pull request with a reviewer who is
not the author. See [CONTRIBUTING.md](CONTRIBUTING.md) and
[CODING_RULES.md](CODING_RULES.md) for the complete workflow and quality rules.

### Documentation map

- [Team and ownership](TEAM.md)
- [Backend guide](backend/README.md)
- [Frontend guide](frontend/README.md)
- [Data guide](data/README.md)
- [Experiment workspace](experiments/README.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Experiment plan](docs/EXPERIMENT_PLAN.md)
- [Internal timeline](docs/TIMELINE.md)
- [Decision log](docs/DECISIONS.md)
- [Assignment checklist](docs/PROJECT_REQUIREMENTS.md)
- [Report workspace](reports/README.md)
- [Submission checklist](submission/README.md)

The assignment brief, raw/processed datasets, generated model artifacts, videos,
PDFs, and final ZIP files are kept local according to `.gitignore` and are not
intended for normal Git history.

---

## Tiếng Việt

### Giới thiệu dự án và nhóm

Breast Cancer Decision Tree Demo là đồ án **Lab 02 của Nhóm 4** trong môn
**Cơ sở Trí tuệ Nhân tạo**, Khoa Công nghệ Thông tin, Trường Đại học Khoa học
Tự nhiên, Đại học Quốc gia Thành phố Hồ Chí Minh.

Đồ án nghiên cứu cách xây dựng, đánh giá, diễn giải và cải thiện Decision Tree
cho bài toán phân loại nhị phân. Sản phẩm cuối là một website học thuật, nhận bộ
đặc trưng của Breast Cancer Wisconsin (Diagnostic), phân loại mẫu thành ác tính
hoặc lành tính và trình bày kết quả theo cách dễ hiểu.

> **Cảnh báo y khoa:** đây là sản phẩm minh họa Machine Learning phục vụ học tập,
> không phải thiết bị y tế, không cung cấp chẩn đoán lâm sàng và không thay thế
> việc thăm khám hoặc tư vấn của nhân viên y tế có chuyên môn.

| Thành viên | MSSV | Vai trò | Trách nhiệm chính |
| --- | --- | --- | --- |
| Hoàng Cao Phong | 24127486 | Tech Lead / ML Engineer | Setup repository, Decision Tree tự cài đặt, thí nghiệm `max_depth`, tích hợp và review |
| Võ Mỹ Ngọc | 24127294 | Frontend Developer / ML Researcher | Giao diện dự đoán; nghiên cứu và thí nghiệm Gini so với Entropy |
| Nguyễn Trung Kiên | 24127068 | Backend Developer / DevOps | FastAPI, tích hợp API-model, triển khai VPS và phối hợp contract frontend |
| Huỳnh Thái Hòa | 24127374 | ML Engineer | Thí nghiệm `min_samples_split` và `min_samples_leaf` |
| Lương Thiện Nhân | 24127475 | Data & Evaluation Engineer | Kiểm tra/làm sạch dữ liệu, chốt metrics, đánh giá và xuất bảng kết quả |

Phân công chi tiết, các checkpoint và những vai trò hành chính chưa chốt được theo
dõi tại [TEAM.md](TEAM.md).

### Tổng quan dự án

Đồ án sử dụng bộ dữ liệu **Breast Cancer Wisconsin (Diagnostic)** từ UCI Machine
Learning Repository. Dataset có 569 mẫu và 30 đặc trưng số thực được tính từ ảnh
số hóa của mẫu chọc hút kim nhỏ ở khối u vú. Biến mục tiêu là `diagnosis`, gồm
`M` (malignant - ác tính) và `B` (benign - lành tính).

Phạm vi nhóm đã thống nhất gồm:

- tự cài đặt Decision Tree để minh họa impurity, chọn split, điều kiện dừng, quá
  trình dựng cây và traversal;
- xây dựng một baseline cố định bằng scikit-learn để đối chiếu;
- kiểm thử ba hướng cải thiện mô hình:
  - thay đổi `max_depth`;
  - so sánh Gini impurity với Entropy;
  - điều chỉnh `min_samples_split` và `min_samples_leaf`;
- so sánh công bằng trên cùng phiên bản dữ liệu, split, seed, preprocessing và
  protocol đánh giá;
- trực quan hóa cây kết quả và giải thích các luật quyết định quan trọng;
- tích hợp model được chọn vào FastAPI backend và giao diện web;
- bàn giao code tái lập được, báo cáo PDF, video thuyết trình và gói nộp cuối.

Nguồn chính thức là
[UCI Breast Cancer Wisconsin (Diagnostic)](https://archive.ics.uci.edu/dataset/17/breast-cancer-wisconsin-diagnostic),
DOI [`10.24432/C5DW2B`](https://doi.org/10.24432/C5DW2B), giấy phép CC BY 4.0.
Xem [hướng dẫn dữ liệu](data/README.md) để biết provenance và quy tắc xử lý.

### Trạng thái hiện tại

| Hạng mục | Trạng thái |
| --- | --- |
| Cấu trúc repository, quy tắc phối hợp và GitHub CI | Đã scaffold |
| Dataset và nguồn chính thức | Đã chốt |
| Thứ tự feature, target mapping, split, seed và metric chính | Chờ nhóm chốt |
| Decision Tree tự cài đặt | Đã phân công, chưa triển khai |
| Baseline sklearn và ba thí nghiệm cải thiện | Đã phân công, chưa triển khai |
| FastAPI backend và model-serving contract | Đã scaffold, chờ triển khai |
| Giao diện dự đoán | Đã scaffold, chờ triển khai |
| Website tích hợp, report và video | Chưa hoàn tất |

Hạn nội bộ để hoàn thành report, video và toàn bộ gói nộp là **23:00 ngày
01/09/2026**, trước hạn chính thức ngày 02/09. Xem [timeline nội bộ](docs/TIMELINE.md).

### Kiến trúc

Training và evaluation chạy offline. Website chỉ inference bằng model artifact đã
được chọn, lưu version và metadata rõ ràng.

```text
UCI raw data -> kiểm tra/preprocessing -> protocol train/test chung
                                                |
                         +----------------------+----------------------+
                         v                                             v
              Decision Tree tự cài đặt                    các biến thể scikit-learn
                         |                                             |
                         +--------------> đánh giá <-------------------+
                                                |
                                      model + metadata được chọn
                                                |
                                                v
Web frontend -> FastAPI routes -> prediction service -> model/pipeline đã load
```

```text
project2/
├── backend/                 # FastAPI, ML modules, services, schemas và tests
│   └── app/ml/
│       ├── custom_tree/     # Decision Tree tự cài đặt
│       ├── sklearn_tree/    # Baseline và các thí nghiệm cải thiện
│       ├── preprocessing/   # Schema, split và preprocessing
│       └── evaluation/      # Metrics, bảng so sánh và trực quan hóa
├── frontend/                # Giao diện web dự đoán
├── data/                    # Dữ liệu raw, processed và sample nhỏ
├── experiments/             # Config có version và kết quả local
├── notebooks/               # EDA và notebook phục vụ trình bày
├── reports/                 # Bản nháp, figure và table dùng cho report
├── scripts/                 # Entry point tái lập data/train/export
├── docs/                    # Yêu cầu, kiến trúc, quyết định và timeline
└── submission/              # Checklist đóng gói; binary lớn giữ local
```

Xem [tài liệu kiến trúc](docs/ARCHITECTURE.md) để biết ranh giới module và
[kế hoạch thí nghiệm](docs/EXPERIMENT_PLAN.md) để dùng chung protocol so sánh.

### Chạy nhanh

Yêu cầu Python 3.10 trở lên. Từ thư mục gốc repository:

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

Backend và frontend hiện mới ở giai đoạn scaffold. Lệnh chạy đã được kiểm chứng sẽ
được bổ sung vào [hướng dẫn backend](backend/README.md) và
[hướng dẫn frontend](frontend/README.md) sau khi entry point và package manifest
tương ứng được merge. Repository hiện chưa phải ứng dụng end-to-end hoàn chỉnh.

### Kiểm tra

Kiểm tra backend và experiment:

```bash
ruff check backend experiments scripts
ruff format --check backend experiments scripts
pytest
```

Test phải deterministic, không tự tải UCI dataset và không gọi dịch vụ ngoài.
Frontend lint/test/build sẽ được CI kích hoạt sau khi có `frontend/package.json`.

### Quy trình Git

- `main`: mã nguồn ổn định, có thể demo.
- `dev`: nhánh tích hợp của sprint.
- `feature/<slug>`: model, API, frontend hoặc infrastructure.
- `experiment/<slug>`: thí nghiệm model có kiểm soát.
- `fix/<slug>` và `docs/<slug>`: sửa lỗi và tài liệu có phạm vi rõ.

Không push trực tiếp vào `main` hoặc `dev`. Mọi thay đổi merge qua pull request và
được review bởi một thành viên khác tác giả. Xem [CONTRIBUTING.md](CONTRIBUTING.md)
và [CODING_RULES.md](CODING_RULES.md) để biết đầy đủ workflow và quy tắc chất lượng.

### Chỉ mục tài liệu

- [Nhân sự và phân công](TEAM.md)
- [Hướng dẫn backend](backend/README.md)
- [Hướng dẫn frontend](frontend/README.md)
- [Hướng dẫn dữ liệu](data/README.md)
- [Khu vực thí nghiệm](experiments/README.md)
- [Kiến trúc](docs/ARCHITECTURE.md)
- [Kế hoạch thí nghiệm](docs/EXPERIMENT_PLAN.md)
- [Timeline nội bộ](docs/TIMELINE.md)
- [Decision log](docs/DECISIONS.md)
- [Checklist đề bài](docs/PROJECT_REQUIREMENTS.md)
- [Khu vực report](reports/README.md)
- [Checklist bài nộp](submission/README.md)

Đề bài, raw/processed data, model artifact sinh ra, video, PDF và ZIP cuối được giữ
local theo `.gitignore`, không đưa vào Git history thông thường.
