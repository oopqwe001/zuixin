
import React from 'react';

interface Props {
  lineLink: string;
}

const CustomerService: React.FC<Props> = ({ lineLink }) => {
  return (
    /* 外层容器：固定在屏幕底部，宽度与主容器一致 (390px)，水平居中 */
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[390px] pointer-events-none z-[60]">
      {/* 按钮本身：设置在容器内部的绝对位置，通过 bottom-60 调整到您标记的高度 */}
      <a 
        href={lineLink}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-60 right-4 w-12 h-12 bg-[#06c755] rounded-full flex items-center justify-center shadow-[0_4px_15px_rgba(6,199,85,0.4)] pointer-events-auto hover:scale-110 active:scale-95 transition-all border-2 border-white/30"
      >
        <i className="fab fa-line text-white text-2xl"></i>
        {/* 消息角标提示 */}
        <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white font-black shadow-sm">1</div>
      </a>
    </div>
  );
};

export default CustomerService;
