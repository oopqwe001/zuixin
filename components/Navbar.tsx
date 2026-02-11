
import React from 'react';
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

  // 统一的品牌标识组件：宝くじ
  const BrandLogo = () => (
    <div className="flex items-center gap-2 h-full">
      {/* 品牌图标：经典的红底白星 */}
      <div className="w-7 h-7 bg-[#e60012] rounded-lg flex items-center justify-center shadow-sm">
        <i className="fas fa-star text-white text-xs"></i>
      </div>
      {/* 品牌名称：宝くじ */}
      <div className="flex flex-col">
        <span className="text-[17px] font-[900] leading-none text-[#e60012] tracking-tighter">
          宝くじ
        </span>
        <span className="text-[7px] font-bold leading-none text-gray-400 tracking-[0.2em] mt-0.5 uppercase">
          OFFICIAL NET
        </span>
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
            {/* 直接显示精心设计的品牌文字标识 */}
            <BrandLogo />
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {user.isLoggedIn ? (
          <div className="flex flex-col items-end">
            <div className="text-[11px] font-black text-red-600 leading-none mb-1 tracking-tight">
              ¥{user.balance.toLocaleString()}
            </div>
            <div className="text-[8px] text-gray-400 font-bold uppercase tracking-tighter">
              ID: {user.id}
            </div>
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
