
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
  { id: 'loto7', name: 'LOTO 7', fullName: 'ロトセブン', drawDayText: '毎日', drawDayIcon: '全', maxJackpot: '12億円', price: 300, maxNumber: 37, pickCount: 7, color: '#e60012', colorSecondary: '#005bac' },
  { id: 'loto6', name: 'LOTO 6', fullName: 'ロトシックス', drawDayText: '毎日', drawDayIcon: '全', maxJackpot: '6億円', price: 200, maxNumber: 43, pickCount: 6, color: '#d81b60', colorSecondary: '#f08300' },
  { id: 'miniloto', name: 'MINI LOTO', fullName: 'ミニロト', drawDayText: '毎日', drawDayIcon: '全', maxJackpot: '1,000万円', price: 200, maxNumber: 31, pickCount: 5, color: '#009b4f', colorSecondary: '#f08300' }
];

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('home');
  const [loading, setLoading] = useState(false);
  const [activeUser, setActiveUser] = useState<User | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [adminConfig, setAdminConfig] = useState<AdminConfig | null>(null);

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

  const [selectedGame, setSelectedGame] = useState<LotteryGame>(GAMES[0]);
  const [selections, setSelections] = useState<Selection[]>(
    ['A', 'B', 'C', 'D', 'E'].map(id => ({ id, numbers: [], count: 1, duration: 1 }))
  );
  const [activeSelectionId, setActiveSelectionId] = useState<string>('A');

  const handleLogin = async () => {
    if (!activeUser) return;
    const updated = { ...activeUser, isLoggedIn: true };
    setActiveUser(updated);
    await lotteryApi.saveActiveUser(updated);
  };

  const handleLogout = async () => {
    if (!activeUser) return;
    const updated = { ...activeUser, isLoggedIn: false };
    setActiveUser(updated);
    await lotteryApi.saveActiveUser(updated);
    setView('home');
  };

  const finalizePurchase = async () => {
    if (!activeUser?.isLoggedIn) { alert("ログインしてください。"); return; }
    setLoading(true);
    const res = await lotteryApi.processPurchase(activeUser.id, selectedGame, selections);
    setLoading(false);
    if (res.success && res.newUser) {
      setActiveUser(res.newUser);
      alert("購入が完了しました。");
      setView('home');
      setSelections(['A', 'B', 'C', 'D', 'E'].map(id => ({ id, numbers: [], count: 1, duration: 1 })));
    } else {
      alert(res.message);
    }
  };

  const handleGlobalBack = () => {
    if (view === 'picker') setView('summary');
    else if (view === 'summary') setView('home');
    else if (view === 'deposit' || view === 'withdraw' || view === 'transactions') setView('mypage');
    else setView('home');
  };

  if (!activeUser || !adminConfig) return null;

  return (
    <div className="flex justify-center bg-[#f2f2f2] min-h-screen">
      <div className={`w-full max-w-[390px] bg-white min-h-screen relative flex flex-col shadow-xl`}>
        <Navbar user={activeUser} view={view} logoUrl={adminConfig.logoUrl} onLogin={handleLogin} onAdmin={() => setView('admin')} onBack={handleGlobalBack} />

        <main className="flex-1 pb-20 overflow-y-auto">
          {view === 'home' && <GameList games={GAMES} onBuy={(g) => { setSelectedGame(g); setView('summary'); }} onShowHistory={() => setView('history')} winningNumbers={adminConfig.winningNumbers} />}
          {view === 'summary' && <SummaryView game={selectedGame} selections={selections} onBack={() => setView('home')} onSelect={(id) => { setActiveSelectionId(id); setView('picker'); }} onQuickPick={(id) => { const nums = []; while(nums.length < selectedGame.pickCount) { const r = Math.floor(Math.random() * selectedGame.maxNumber) + 1; if(!nums.includes(r)) nums.push(r); } setSelections(prev => prev.map(s => s.id === id ? { ...s, numbers: nums.sort((a,b)=>a-b) } : s)); }} onDelete={(id) => setSelections(prev => prev.map(s => s.id === id ? { ...s, numbers: [] } : s))} onFinalize={finalizePurchase} />}
          {view === 'picker' && <NumberPicker game={selectedGame} selectionId={activeSelectionId} initialNumbers={selections.find(s => s.id === activeSelectionId)?.numbers || []} onCancel={() => setView('summary')} onComplete={(nums) => { setSelections(prev => prev.map(s => s.id === activeSelectionId ? { ...s, numbers: nums } : s)); setView('summary'); }} />}
          {view === 'mypage' && <MyPage user={activeUser} onAction={(v) => setView(v)} onLogout={handleLogout} />}
          {view === 'history' && <DrawHistory games={GAMES} history={adminConfig.winningNumbers} onBack={() => setView('home')} />}
          {view === 'deposit' && <DepositView onBack={() => setView('mypage')} onSubmit={async (amt) => { alert("入金申請が送信されました。"); setView('mypage'); }} />}
          {view === 'withdraw' && <WithdrawForm onBack={() => setView('mypage')} onSubmit={(data) => { alert("出金申请が送信されました。"); setView('mypage'); }} />}
          {view === 'transactions' && <TransactionHistory userId={activeUser.id} transactions={transactions} onBack={() => setView('mypage')} />}
        </main>
        
        {view === 'admin' && <AdminPanel config={adminConfig} setConfig={async (c) => { setAdminConfig(c); await lotteryApi.saveConfig(c); }} onBack={() => setView('home')} users={allUsers} transactions={transactions} onProcessTx={()=>{}} onUpdateUser={()=>{}} onExecuteDraw={()=>{}} />}
        
        <nav className="fixed bottom-0 w-full max-w-[390px] bg-white flex justify-around items-center h-16 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] border-t border-gray-100">
          {[
            { id: 'home', icon: 'fa-home', label: 'ホーム' },
            { id: 'history', icon: 'fa-trophy', label: '抽選結果' },
            { id: 'mypage', icon: 'fa-user-circle', label: 'マイページ' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setView(tab.id as AppView)} 
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${view === tab.id ? 'text-[#e60012]' : 'text-gray-400'}`}
            >
              <i className={`fas ${tab.icon} text-[20px]`}></i>
              <span className="text-[10px] font-black">{tab.label}</span>
            </button>
          ))}
        </nav>

        <CustomerService lineLink={adminConfig.lineLink} />

        {loading && (
          <div className="absolute inset-0 bg-white/60 z-[100] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#e60012] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
