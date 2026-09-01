import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface-container-lowest dark:bg-on-background border-t border-outline-variant dark:border-outline docked full-width bottom-0 w-full py-stack-md px-gutter flex flex-col sm:flex-row justify-between items-center max-w-container-max mx-auto mt-auto text-xs gap-3">
      <div className="font-sans text-on-surface-variant text-center sm:text-left">
        Đồ án Môn học Machine Learning · Phân tích &amp; Cải tiến Mô hình Cây Quyết định (Decision Tree)
      </div>
      <div className="flex gap-4 font-sans text-on-surface-variant">
        <span className="text-outline-variant">Nguồn dữ liệu: UCI ID #17</span>
        <span className="text-outline-variant">·</span>
        <span className="text-outline-variant">Giấy phép: CC BY 4.0</span>
      </div>
    </footer>
  );
};
