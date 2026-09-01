# Report workspace

```text
reports/
├── drafts/
│   └── report_f_g_h_i.md                # Bản nháp báo cáo mục F, G, H, I (Tối ưu I3: MSS=5, MSL=1)
├── figures/
│   └── min_samples_comparison.png       # Biểu đồ so sánh 4-trong-1 cho Thí nghiệm I3 (300 DPI)
└── tables/                              # dataset/model/metric tables đã chọn
```

Report cuối theo đề:

1. Group Introduction và contribution.
2. Decision Tree introduction và mục tiêu website demo.
3. UCI Breast Cancer Wisconsin (Diagnostic) dataset.
4. Custom-tree construction và sklearn baseline.
5. Analysis of the generated trees/rules.
6. Ba improvement methods: depth, criterion và minimum samples.
7. Fair comparison trên cùng protocol.
8. Kết luận, limitations và medical-safety disclaimer.
9. References, gồm UCI dataset và paper/library đã dùng.

Figure/table phải có caption, split, seed, metric/positive class đủ rõ và truy ngược
được về script/config. Không chép tay metric nếu có thể export tự động; không mô tả
website là công cụ chẩn đoán lâm sàng.
