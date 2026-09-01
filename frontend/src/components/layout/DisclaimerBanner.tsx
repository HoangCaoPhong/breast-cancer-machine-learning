import React from 'react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-primary text-on-primary py-2 px-gutter text-center font-sans text-xs flex items-center justify-center gap-2">
      <span className="material-symbols-outlined text-sm">info</span>
      <span>
        <strong>Lưu ý:</strong> Ứng dụng phục vụ mục đích nghiên cứu &amp; học thuật mô hình Machine Learning, không thay thế cho các kết luận y khoa chuyên nghiệp.
      </span>
    </div>
  );
};
