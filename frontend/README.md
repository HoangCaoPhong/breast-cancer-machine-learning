# Frontend — Breast Cancer Decision Tree Classifier

Owner: Võ Mỹ Ngọc. API/deployment counterpart: Nguyễn Trung Kiên.

## Tech Stack
- **Framework:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS + Bespoke Scientific Dark Theme Glassmorphism
- **Iconography:** Lucide Icons
- **HTTP Client:** Service module (`frontend/src/services/api.ts`) với fallback Decision Tree simulator khi chạy offline

## Cấu trúc thư mục
```text
frontend/
├── public/                  # Favicon & static assets
├── src/
│   ├── components/          # Shared layout & modal primitives (Header, Footer, DisclaimerBanner, GuideModal)
│   ├── data/                # 30-feature metadata, preset test samples, and experiment matrix
│   ├── features/prediction/ # FeatureInputForm, PredictionResultCard, DecisionPathViewer, ModelComparisonModal
│   ├── services/            # HTTP client & Decision Tree prediction engine
│   ├── types/               # TypeScript interfaces & types
│   ├── App.tsx              # Main dashboard application
│   ├── index.css            # Tailwind & glassmorphism theme styling
│   └── main.tsx             # Entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Lệnh Chạy & Kiểm Thử
Từ thư mục `frontend/`:

```bash
# Cài đặt thư viện
npm install

# Khởi chạy server phát triển
npm run dev

# Kiểm tra kiểu dữ liệu TypeScript (CI check)
npm run test:ci

# Build production bundle
npm run build

# Xem thử bản build production
npm run preview
```

## Quy Tắc An Toàn & Trải Nghiệm
- UI có đầy đủ các trạng thái `Idle`, `Loading`, `Success`, `Error` và validation dữ liệu số thực.
- Sử dụng thuật ngữ phân loại khoa học: "Mô hình phân loại: Ác tính (Malignant) / Lành tính (Benign)".
- Luôn hiển thị cảnh báo miễn trừ trách nhiệm y khoa cố định trên đầu trang.

