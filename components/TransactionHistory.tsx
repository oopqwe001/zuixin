
import React, { useState } from 'react';
import { Transaction } from '../types';

interface Props {
  userId: string;
  transactions: Transaction[];
  onBack: () => void;
}

const TransactionHistory: React.FC<Props> = ({ userId, transactions, onBack }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // 过滤当前用户的交易并按时间倒序
  const userTxs = transactions
    .filter(t => t.userId === userId)
    .sort((a, b) => b.timestamp - a.timestamp);

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return <span className="text-orange-500 bg-orange-50 px-2 py-0.5 rounded text-[9px] font-black">承認待ち</span>;
      case 'approved': return <span className="text-green-500 bg-green-50 px-2 py-0.5 rounded text-[9px] font-black">完了</span>;
      case 'rejected': return <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded text-[9px] font-black">拒否</span>;
      default: return null;
    }
  };

  return (
    <div className="p-4 bg-white min-h-screen animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="text-gray-400 p-2 -ml-2 active:scale-90 transition-transform">
          <i className="fas fa-chevron-left text-xl"></i>
        </button>
        <h2 className="text-lg font-black tracking-tight">資金履历</h2>
      </div>

      {userTxs.length === 0 ? (
        <div className="py-20 text-center">
          <i className="fas fa-receipt text-gray-100 text-6xl mb-4"></i>
          <p className="text-gray-400 text-sm font-bold">取引履歴がありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {userTxs.map(tx => (
            <div key={tx.id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm bg-white ring-1 ring-black/[0.02]">
              <div 
                className="p-4 flex items-center justify-between active:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => tx.type === 'withdraw' && setExpandedId(expandedId === tx.id ? null : tx.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'deposit' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                    <i className={`fas ${tx.type === 'deposit' ? 'fa-arrow-down' : 'fa-arrow-up'} text-sm`}></i>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-black text-gray-800">{tx.type === 'deposit' ? '入金' : '出金'}</span>
                      {getStatusLabel(tx.status)}
                    </div>
                    <div className="text-[10px] text-gray-400 font-bold">{formatDate(tx.timestamp)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-black ${tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'deposit' ? '+' : '-'} ¥{tx.amount.toLocaleString()}
                  </div>
                  {tx.type === 'withdraw' && (
                    <i className={`fas fa-chevron-${expandedId === tx.id ? 'up' : 'down'} text-[8px] text-gray-300 mt-1`}></i>
                  )}
                </div>
              </div>

              {/* 提现详情面板 */}
              {tx.type === 'withdraw' && expandedId === tx.id && tx.bankDetails && (
                <div className="bg-gray-50/50 px-4 py-4 border-t border-gray-50 animate-in slide-in-from-top-2 duration-200">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">出金先銀行情報</h4>
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    <div>
                      <span className="text-[9px] text-gray-400 block mb-0.5">銀行名</span>
                      <span className="text-[11px] font-bold text-gray-700">{tx.bankDetails.bankName}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 block mb-0.5">支店名</span>
                      <span className="text-[11px] font-bold text-gray-700">{tx.bankDetails.branchName}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 block mb-0.5">口座番号</span>
                      <span className="text-[11px] font-bold text-gray-700">{tx.bankDetails.accountNumber}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 block mb-0.5">口座名義</span>
                      <span className="text-[11px] font-bold text-gray-700">{tx.bankDetails.accountName}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-200/50 flex justify-between items-center">
                    <span className="text-[9px] text-gray-400">取引ID: {tx.id}</span>
                    <span className="text-[9px] text-gray-400 font-bold">ステータス: {tx.status === 'pending' ? '審査中' : '処理済み'}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
