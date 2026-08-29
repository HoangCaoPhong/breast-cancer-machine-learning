# Contributing

## Branch strategy

| Branch | Mục đích | Tạo từ | Merge vào |
| --- | --- | --- | --- |
| `main` | Bản ổn định, có thể demo/nộp | - | - |
| `dev` | Tích hợp frontend, backend và model | `main` | `main` |
| `feature/<slug>` | Model/API/UI mới | `dev` | `dev` |
| `experiment/<slug>` | Thí nghiệm có giả thuyết | `dev` | `dev` nếu dùng cho kết luận |
| `fix/<slug>` | Sửa lỗi | `dev` | `dev` |
| `docs/<slug>` | Report/tài liệu/video script | `dev` | `dev` |

Tên branch viết thường, dùng dấu gạch ngang, không dùng tên cá nhân.

Gợi ý các branch đầu:

- `feature/custom-decision-tree`
- `experiment/max-depth`
- `experiment/gini-vs-entropy`
- `experiment/min-samples`
- `feature/data-metrics-pipeline`
- `feature/fastapi-prediction`
- `feature/prediction-frontend`

## Luồng làm việc

```bash
git switch dev
git pull --ff-only origin dev
git switch -c feature/short-description

# Chỉnh sửa và kiểm tra phần liên quan
git status
git add <files-in-scope>
git commit -m "feat(scope): short imperative summary"
git push -u origin feature/short-description
```

Mở pull request vào `dev` và gán reviewer không phải tác giả.

## Commit convention

```text
<type>(<scope>): <imperative summary>
```

Ví dụ:

- `feat(tree): implement entropy split selection`
- `feat(api): expose versioned prediction endpoint`
- `feat(frontend): add validated prediction form`
- `test(tree): cover constant feature input`
- `docs(report): compare depth experiments`
- `fix(metric): use malignant class as positive label`

Không dùng `update`, `fix code`, `done` hoặc tên thành viên làm commit message.

## Pull request rules

- Một PR chỉ có một mục tiêu; tránh trộn UI, API và model nếu không phải integration PR.
- PR model/experiment ghi dataset version, split, seed, config, command và metrics.
- PR API cập nhật request/response contract và test invalid input.
- PR frontend có ảnh hoặc bước kiểm tra loading/error/success.
- PR deployment không chứa IP/password/key riêng tư trong code hoặc log.
- Tác giả tự review diff, xóa debug output và giải quyết conflict trước khi xin review.

## Integration order

1. Merge dataset schema, target mapping, split và feature order.
2. Merge model contracts và artifact metadata.
3. Merge API request/response contract.
4. Frontend và backend phát triển song song dựa trên contract.
5. Merge experiment results, chọn model, rồi mới chốt report/video.
