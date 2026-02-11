
import React, { useState, useEffect } from 'react';
import { AppView, LotteryGame, Selection, User, AdminConfig, Purchase, Transaction } from './types';
import { lotteryApi } from './services/api';
import GameList from './components/GameList';
import SummaryView from './components/SummaryView';
import NumberPicker from './components/NumberPicker';
import MyPage from './components/MyPage';
import AdminPanel from './components/AdminPanel';
import Navbar from './components/Navbar';
import CustomerService from './components/CustomerService';
import DrawHistory from './components/DrawHistory';
import WithdrawForm from './components/WithdrawForm';
import DepositView from './components/DepositView';
import TransactionHistory from './components/TransactionHistory';

const GAMES: LotteryGame[] = [
  { id: 'loto7', name: 'LOTO 7', fullName: 'ロトセブン', drawDayText: '每周', drawDayIcon: '金', maxJackpot: '12億円', price: 300, maxNumber: 37, pickCount: 7, color: '#e60012', colorSecondary: '#005bac' },
  { id: 'loto6', name: 'LOTO 6', fullName: 'ロトシックス', drawDayText: '每周', drawDayIcon: '月・木', maxJackpot: '6億円', price: 200, maxNumber: 43, pickCount: 6, color: '#d81b60', colorSecondary: '#f08300' },
  { id: 'miniloto', name: 'MINI LOTO', fullName: 'ミニロト', drawDayText: '每周', drawDayIcon: '火', maxJackpot: '1,000万円', price: 200, maxNumber: 31, pickCount: 5, color: '#009b4f', colorSecondary: '#f08300' }
];

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('home');
  const [loading, setLoading] = useState(false);
  
  // 数据状态
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [adminConfig, setAdminConfig] = useState<AdminConfig | null>(null);

  // 初始化加载
  useEffect(() => {
    const init = async () => {
      const user = await lotteryApi.getActiveUser();
      const config = await lotteryApi.getConfig();
      const txs = await lotteryApi.getTransactions();
      const users = await lotteryApi.getAllUsers();
      
      setActiveUser(user);
      setAdminConfig(config);
      setTransactions(txs);
      setAllUsers(users.length ? users : [user]);
    };
    init();
  }, []);

  // UI 选号相关状态
  const [selectedGame, setSelectedGame] = useState<LotteryGame>(GAMES[0]);
  const [selections, setSelections] = useState<Selection[]>(
    ['A', 'B', 'C', 'D', 'E'].map(id => ({ id, numbers: [], count: 1, duration: 1 }))
  );
  const [activeSelectionId, setActiveSelectionId] = useState<string>('A');

  // --- 业务操作代理 ---

  const handleLogin = async () => {
    if (!activeUser) return;
    const updated = { ...activeUser, isLoggedIn: true };
    setActiveUser(updated);
    await lotteryApi.saveActiveUser(updated);
    // 同时更新所有用户列表
    const newAll = allUsers.map(u => u.id === updated.id ? updated : u);
    setAllUsers(newAll);
    await lotteryApi.saveAllUsers(newAll);
  };

  const finalizePurchase = async () => {
    if (!activeUser?.isLoggedIn) { alert("ログインしてください。"); return; }
    setLoading(true);
    const res = await lotteryApi.processPurchase(activeUser.id, selectedGame, selections);
    setLoading(false);
    
    if (res.success && res.newUser) {
      setActiveUser(res.newUser);
      setAllUsers(prev => prev.map(u => u.id === res.newUser!.id ? res.newUser! : u));
      alert("購入が完了しました。");
      setView('home');
      setSelections(['A', 'B', 'C', 'D', 'E'].map(id => ({ id, numbers: [], count: 1, duration: 1 })));
    } else {
      alert(res.message);
    }
  };

  const handleExecuteDraw = async (date: string) => {
    const result = await lotteryApi.executeDraw(date, GAMES);
    setAdminConfig(result.config);
    setAllUsers(result.users);
    const updatedActive = result.users.find(u => u.id === activeUser?.id);
    if (updatedActive) setActiveUser(updatedActive);
    alert(`${date} の抽せんが完了しました。`);
  };

  const processTransaction = async (txId: string, status: 'approved' | 'rejected') => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;
    
    const newTxs = transactions.map(t => t.id === txId ? { ...t, status } : t);
    setTransactions(newTxs);
    await lotteryApi.saveTransactions(newTxs);

    if (status === 'approved') {
      const newUsers = allUsers.map(u => {
        if (u.id === tx.userId) {
          const newBalance = tx.type === 'deposit' ? u.balance + tx.amount : u.balance - tx.amount;
          const updated = { ...u, balance: newBalance };
          if (u.id === activeUser?.id) setActiveUser(updated);
          return updated;
        }
        return u;
      });
      setAllUsers(newUsers);
      await lotteryApi.saveAllUsers(newUsers);
    }
  };

  const handleGlobalBack = () => {
    if (view === 'picker') setView('summary');
    else if (view === 'summary') setView('home');
    else if (view === 'deposit' || view === 'withdraw' || view === 'transactions') setView('mypage');
    else setView('home');
  };

  if (!activeUser || !adminConfig) return <div className="flex items-center justify-center h-screen bg-gray-100 text-gray-400 font-bold">Loading...</div>;

  return (
    <div className="flex justify-center bg-[#eeeeee] min-h-screen font-sans">
      <div className={`w-full max-w-[390px] bg-[#f8f8f8] min-h-screen relative flex flex-col shadow-2xl text-[#333] ${loading ? 'opacity-50 pointer-events-none' : ''}`}>
        <Navbar 
          user={activeUser} 
          view={view}
          logoUrl={adminConfig.logoUrl}
          onLogin={handleLogin}
          onAdmin={() => setView('admin')}
          onBack={handleGlobalBack}
        />
        <main className="flex-1 pb-20 overflow-y-auto">
          {view === 'home' && <GameList games={GAMES} onBuy={(g) => { setSelectedGame(g); setView('summary'); }} onShowHistory={() => setView('history')} winningNumbers={adminConfig.winningNumbers} />}
          {view === 'summary' && <SummaryView game={selectedGame} selections={selections} onBack={() => setView('home')} onSelect={(id) => { setActiveSelectionId(id); setView('picker'); }} onQuickPick={(id) => { const nums = []; while(nums.length < selectedGame.pickCount) { const r = Math.floor(Math.random() * selectedGame.maxNumber) + 1; if(!nums.includes(r)) nums.push(r); } setSelections(prev => prev.map(s => s.id === id ? { ...s, numbers: nums.sort((a,b)=>a-b) } : s)); }} onDelete={(id) => setSelections(prev => prev.map(s => s.id === id ? { ...s, numbers: [] } : s))} onFinalize={finalizePurchase} />}
          {view === 'picker' && <NumberPicker game={selectedGame} selectionId={activeSelectionId} initialNumbers={selections.find(s => s.id === activeSelectionId)?.numbers || []} onCancel={() => setView('summary')} onComplete={(nums) => { setSelections(prev => prev.map(s => s.id === activeSelectionId ? { ...s, numbers: nums } : s)); setView('summary'); }} />}
          {view === 'mypage' && <MyPage user={activeUser} onAction={(v) => setView(v)} />}
          {view === 'history' && <DrawHistory games={GAMES} history={adminConfig.winningNumbers} onBack={() => setView('home')} />}
          {view === 'deposit' && <DepositView onBack={() => setView('mypage')} onSubmit={async (amt) => { const newTx: Transaction = { id: 'D'+Date.now(), userId: activeUser.id, type: 'deposit', amount: amt, status: 'pending', timestamp: Date.now() }; setTransactions(prev => [...prev, newTx]); await lotteryApi.saveTransactions([...transactions, newTx]); alert("入金申請が送信されました。"); setView('mypage'); }} />}
          {view === 'withdraw' && <WithdrawForm onBack={() => setView('mypage')} onSubmit={async (data) => { const newTx: Transaction = { id: 'W'+Date.now(), userId: activeUser.id, type: 'withdraw', amount: data.amount, status: 'pending', timestamp: Date.now(), bankDetails: { bankName: data.bankName, branchName: data.branchName, accountNumber: data.accountNumber, accountName: data.nameKana } }; setTransactions(prev => [...prev, newTx]); await lotteryApi.saveTransactions([...transactions, newTx]); alert("出金申请が送信されました。"); setView('mypage'); }} />}
          {view === 'transactions' && <TransactionHistory userId={activeUser.id} transactions={transactions} onBack={() => setView('mypage')} />}
        </main>
        
        {view === 'admin' && <AdminPanel config={adminConfig} setConfig={async (c) => { setAdminConfig(c); await lotteryApi.saveConfig(c); }} onBack={() => setView('home')} users={allUsers} transactions={transactions} onProcessTx={processTransaction} onUpdateUser={async (uid, data) => { const newAll = allUsers.map(u => u.id === uid ? { ...u, ...data } : u); setAllUsers(newAll); await lotteryApi.saveAllUsers(newAll); }} onExecuteDraw={handleExecuteDraw} />}
        
        <nav className="fixed bottom-0 w-full max-w-[390px] bg-[#e60012] flex justify-around py-2 z-40 shadow-[0_-2px_10px_rgba(230,0,18,0.2)]">
          <button onClick={() => setView('home')} className={`flex-1 flex flex-col items-center gap-0.5 transition-all ${view === 'home' ? 'text-white' : 'text-white/60 hover:text-white/80'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-0.5 transition-all ${view === 'home' ? 'bg-white/10' : ''}`}>
              <i className="fas fa-home text-lg"></i>
            </div>
            <span className={`text-[9px] font-bold ${view === 'home' ? 'opacity-100' : 'opacity-80'}`}>ホーム</span>
          </button>
          <button onClick={() => setView('history')} className={`flex-1 flex flex-col items-center gap-0.5 transition-all ${view === 'history' ? 'text-white' : 'text-white/60 hover:text-white/80'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-0.5 transition-all ${view === 'history' ? 'bg-white/10' : ''}`}>
              <i className="fas fa-list-check text-lg"></i>
            </div>
            <span className={`text-[9px] font-bold ${view === 'history' ? 'opacity-100' : 'opacity-80'}`}>抽せん結果</span>
          </button>
          <button onClick={() => setView('mypage')} className={`flex-1 flex flex-col items-center gap-0.5 transition-all ${view === 'mypage' ? 'text-white' : 'text-white/60 hover:text-white/80'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-0.5 transition-all ${view === 'mypage' ? 'bg-white/10' : ''}`}>
              <i className="fas fa-user text-lg"></i>
            </div>
            <span className={`text-[9px] font-bold ${view === 'mypage' ? 'opacity-100' : 'opacity-80'}`}>マイページ</span>
          </button>
        </nav>

        <CustomerService lineLink={adminConfig.lineLink} />
      </div>
    </div>
  );
};

export default App;
