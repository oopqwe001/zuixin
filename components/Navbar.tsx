
import React, { useState } from 'react';
import { User, AppView } from '../types';

interface Props {
  user: User;
  view: AppView;
  logoUrl: string;
  onLogin: () => void;
  onAdmin: () => void;
  onBack: () => void;
}

const Navbar: React.FC<Props> = ({ user, view, logoUrl, onLogin, onAdmin, onBack }) => {
  const isHome = view === 'home';
  const [imgError, setImgError] = useState(false);

  // 默认备选显示内容，如果图片无法加载
  const FallbackLogo = () => (
    <div className="flex items-center gap-1.5">
      <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center shadow-sm">
        <i className="fas fa-star text-white text-[10px]"></i>
      </div>
      <div className="flex flex-col">
        <span className="text-[11px] font-black leading-none text-red-600 tracking-tighter uppercase">Takarakuji</span>
        <span className="text-[8px] font-bold leading-none text-gray-400 tracking-widest uppercase">Official Net</span>
      </div>
    </div>
  );

  return (
    <div className="bg-white border-b px-3 py-2 flex items-center justify-between sticky top-0 z-50 h-14 shadow-sm">
      <div className="flex items-center h-full min-w-[150px]">
        {!isHome ? (
          <button 
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 -ml-1 active:scale-90 transition-transform text-red-600"
          >
            <i className="fas fa-chevron-left text-xl"></i>
          </button>
        ) : (
          <div 
            className="flex items-center active:scale-95 transition-transform cursor-pointer h-full" 
            onClick={onAdmin}
          >
            {/* 这里的 logo 增加 onError 逻辑 */}
            {!imgError ? (
              <img 
                src={logoUrl || "https://www.takarakuji-official.jp/assets/img/common/logo.svg"} 
                alt="宝くじ公式サイト" 
                className="h-7 max-w-[180px] object-contain"
                onError={() => setImgError(true)}
              />
            ) : (
              <FallbackLogo />
            )}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {user.isLoggedIn ? (
          <div className="flex flex-col items-end">
            <div className="text-[10px] font-black text-red-600 leading-none mb-0.5">¥{user.balance.toLocaleString()}</div>
            <div className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">ID: {user.id}</div>
          </div>
        ) : (
          <div className="flex gap-1.5">
            <button 
              onClick={onLogin} 
              className="text-[11px] font-bold border border-red-200 text-red-600 px-3 py-1.5 rounded-full bg-white active:bg-red-50 transition-colors shadow-sm"
            >
              ログイン
            </button>
            <button 
              className="text-[11px] font-bold px-3 py-1.5 bg-red-600 text-white rounded-full active:opacity-80 shadow-md transition-opacity"
            >
              新規登録
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
