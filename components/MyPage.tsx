
import React from 'react';
import { User, AppView } from '../types';

interface Props {
  user: User;
  onAction: (view: AppView) => void;
}

const MyPage: React.FC<Props> = ({ user, onAction }) => {
  return (
    <div className="p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-2xl">
            <i className="fas fa-user"></i>
          </div>
          <div>
            <h2 className="text-xl font-bold">{user.isLoggedIn ? user.username : '未ログイン'}</h2>
            <p className="text-xs text-gray-400">ID: {user.id}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center mb-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">チャージ残高</p>
            <p className="text-2xl font-black text-red-600">¥ {user.balance.toLocaleString()}</p>
          </div>
          <button 
            onClick={() => onAction('deposit')}
            className="bg-red-600 text-white px-6 py-2 rounded-full font-bold text-sm shadow-md active:scale-95 transition-all"
          >入金</button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => onAction('withdraw')}
            className="border border-gray-100 py-4 rounded-xl flex flex-col items-center gap-2 hover:bg-gray-50 transition-all shadow-sm"
          >
            <i className="fas fa-university text-red-600"></i>
            <span className="text-xs font-bold text-gray-700">出金申請</span>
          </button>
          <button 
            onClick={() => onAction('transactions')}
            className="border border-gray-100 py-4 rounded-xl flex flex-col items-center gap-2 hover:bg-gray-50 transition-all shadow-sm"
          >
            <i className="fas fa-history text-red-600"></i>
            <span className="text-xs font-bold text-gray-700">資金履歴</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 border-b bg-gray-50/50">
          <h3 className="font-bold text-sm text-gray-600">メニュー</h3>
        </div>
        <div className="divide-y divide-gray-50">
          <button 
            onClick={() => onAction('transactions')}
            className="w-full px-4 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors group text-left"
          >
            <div className="flex items-center gap-3">
              <i className="fas fa-list-ul text-red-500/50 text-xs"></i>
              <span className="text-sm font-medium">すべての取引履歴</span>
            </div>
            <i className="fas fa-chevron-right text-gray-300 text-[10px] group-hover:translate-x-1 transition-transform"></i>
          </button>
          <button className="w-full px-4 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors group text-left">
            <div className="flex items-center gap-3">
              <i className="fas fa-credit-card text-red-500/50 text-xs"></i>
              <span className="text-sm font-medium">銀行口座設定</span>
            </div>
            <i className="fas fa-chevron-right text-gray-300 text-[10px] group-hover:translate-x-1 transition-transform"></i>
          </button>
          <button className="w-full px-4 py-4 flex justify-between items-center hover:bg-gray-50 transition-colors group text-left">
            <div className="flex items-center gap-3">
              <i className="fas fa-shield-alt text-red-500/50 text-xs"></i>
              <span className="text-sm font-medium">セキュリティ設定</span>
            </div>
            <i className="fas fa-chevron-right text-gray-300 text-[10px] group-hover:translate-x-1 transition-transform"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
