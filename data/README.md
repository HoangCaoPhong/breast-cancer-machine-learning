# Breast Cancer Wisconsin (Diagnostic) data

## Canonical source

- UCI dataset: `https://archive.ics.uci.edu/dataset/17/breast-cancer-wisconsin-diagnostic`
- DOI: `10.24432/C5DW2B`
- License: Creative Commons Attribution 4.0 International (CC BY 4.0)
- UCI metadata: 569 instances, 30 real-valued predictive features, binary target
  `diagnosis` (`M` malignant, `B` benign), no missing values.
- Features are derived from digitized fine-needle aspirate images of breast masses.
- Tracked raw files: `data/raw/uci_wdbc/wdbc.data` and `wdbc.names`, downloaded
  directly from the official UCI archive on 2026-08-30.
- SHA-256 of `wdbc.data`:
  `d606af411f3e5be8a317a5a8b652b425aaf0ff38ca683d5327ffff94c3695f4a`.
- SHA-256 of `wdbc.names`:
  `840e04e3f20f8a5b326892f3b9cbc01c4cd6f7e6c597630b701ef6c0ac79f5ef`.

UCI is the authoritative project source. Tutorial/GitHub copies may be used for
reference only; do not silently replace the canonical data with an unknown revision.

## Layout

```text
data/
├── raw/        # immutable canonical source files; explicit files may be tracked
├── processed/  # reproducible derived data; Git ignored
└── samples/    # small redistributable fixtures for tests
```

## Rules

- Retrieval method đã chốt: official UCI archive files.
- Ghi ngày tải, raw filename, size và SHA-256 vào experiment metadata.
- Không dùng ID làm feature; target mapping và feature order phải khai báo một nơi.
- Dù UCI nói không missing, loader vẫn validate missing, duplicates, shape và types.
- Split trước khi fit mọi transformer/selector; không dùng test data để chọn tham số.
- Raw file không sửa thủ công. Processed file phải tái tạo được bằng script.
- Giữ attribution UCI trong report và submission theo CC BY 4.0.
