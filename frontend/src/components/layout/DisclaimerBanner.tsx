import React from 'react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-primary text-on-primary py-2 px-gutter text-center font-label-mono text-label-mono flex items-center justify-center gap-2">
      <span className="material-symbols-outlined text-sm">warning</span>
      Đây là đồ án học thuật, không có giá trị thay đổi chẩn đoán y khoa thực tế. Luôn tham khảo ý kiến bác sĩ chuyên khoa.
    </div>
  );
};
