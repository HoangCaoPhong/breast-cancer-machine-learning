# Frontend

Owner: Võ Mỹ Ngọc. API/deployment counterpart: Nguyễn Trung Kiên.

```text
frontend/
├── public/
└── src/
    ├── components/          # shared UI primitives
    ├── features/prediction/ # form, result and feature-specific state
    ├── pages/
    ├── services/            # HTTP client and API mapping
    └── types/               # request/response types
```

Framework/build tool sẽ do frontend owner scaffold để tránh khóa công nghệ sai ở bước
setup repo. Khi thêm `package.json`, phải cập nhật file này với lệnh install/dev/test/build.
Để khớp CI, nên cung cấp các script `lint`, `test:ci` và `build`.

UI bắt buộc có validation, loading, error và success states; dùng ngôn ngữ “model
classification/prediction”, không khẳng định người dùng bị hay không bị ung thư; luôn
hiển thị cảnh báo đây không phải chẩn đoán y khoa.
