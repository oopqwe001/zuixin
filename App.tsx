
import React, { useState, useEffect } from 'react';
import { AppView, LotteryGame, Selection, User, AdminConfig, Purchase, Transaction } from './types';
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

const GAMES: LotteryGame[] = [
  { id: 'loto7', name: 'LOTO 7', fullName: 'ロトセブン', drawDayText: '毎週', drawDayIcon: '金', maxJackpot: '12億円', price: 300, maxNumber: 37, pickCount: 7, color: '#e60012', colorSecondary: '#005bac' },
  { id: 'loto6', name: 'LOTO 6', fullName: 'ロトシックス', drawDayText: '毎週', drawDayIcon: '月・木', maxJackpot: '6億円', price: 200, maxNumber: 43, pickCount: 6, color: '#d81b60', colorSecondary: '#f08300' },
  { id: 'miniloto', name: 'MINI LOTO', fullName: 'ミニロト', drawDayText: '毎週', drawDayIcon: '火', maxJackpot: '1,000万円', price: 200, maxNumber: 31, pickCount: 5, color: '#009b4f', colorSecondary: '#f08300' }
];

const DEFAULT_LOGO = "https://www.takarakuji-official.jp/assets/img/common/logo.svg";

const PRIZE_AMOUNTS: Record<string, number> = {
  'loto7': 1200000000,
  'loto6': 600000000,
  'miniloto': 10000000
};

const STORAGE_KEYS = {
  USER: 'lottery_active_user',
  ALL_USERS: 'lottery_all_users',
  TRANSACTIONS: 'lottery_transactions',
  CONFIG: 'lottery_admin_config'
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('home');
  
  // 初始化状态（优先从 localStorage 加载）
  const [activeUser, setActiveUser] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    return saved ? JSON.parse(saved) : {
      id: 'U88291',
      username: '山田 太郎',
      isLoggedIn: false,
      balance: 0,
      bankInfo: { bankName: '', branchName: '', accountNumber: '', accountName: '' },
      purchases: []
    };
  });

  const [allUsers, setAllUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ALL_USERS);
    return saved ? JSON.parse(saved) : [activeUser];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : [];
  });

  const [adminConfig, setAdminConfig] = useState<AdminConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return saved ? JSON.parse(saved) : {
      lineLink: 'https://line.me/ti/p/service123',
      logoUrl: DEFAULT_LOGO,
      winningNumbers: {
        loto7: { '2024-05-22': [1, 5, 12, 18, 22, 29, 35] },
        loto6: { '2024-05-22': [3, 9, 15, 21, 33, 41] },
        miniloto: { '2024-05-22': [2, 8, 14, 20, 26] }
      }
    };
  });

  const [selectedGame, setSelectedGame] = useState<LotteryGame>(GAMES[0]);
  const [selections, setSelections] = useState<Selection[]>(
    ['A', 'B', 'C', 'D', 'E'].map(id => ({ id, numbers: [], count: 1, duration: 1 }))
  );
  const [activeSelectionId, setActiveSelectionId] = useState<string>('A');

  // 持久化逻辑：每当状态改变时保存到 localStorage
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(activeUser)); }, [activeUser]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ALL_USERS, JSON.stringify(allUsers)); }, [allUsers]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(adminConfig)); }, [adminConfig]);

  const executeDraw = (date: string) => {
    let newAdminConfig = { ...adminConfig };
    let hasChanges = false;
    GAMES.forEach(game => {
      if (!newAdminConfig.winningNumbers[game.id]) newAdminConfig.winningNumbers[game.id] = {};
      if (!newAdminConfig.winningNumbers[game.id][date]) {
        const randomNums: number[] = [];
        while (randomNums.length < game.pickCount) {
          const r = Math.floor(Math.random() * game.maxNumber) + 1;
          if (!randomNums.includes(r)) randomNums.push(r);
        }
        newAdminConfig.winningNumbers[game.id][date] = randomNums.sort((a, b) => a - b);
        hasChanges = true;
      }
    });
    if (hasChanges) setAdminConfig(newAdminConfig);

    const updatedUsers = allUsers.map(user => {
      let balanceAdded = 0;
      const updatedPurchases = user.purchases.map(purchase => {
        if (purchase.status !== 'pending') return purchase;
        const winNums = newAdminConfig.winningNumbers[purchase.gameId][date];
        if (!winNums) return purchase;
        let won = false;
        purchase.numbers.forEach(userNums => {
          const matches = userNums.filter(n => winNums.includes(n)).length;
          if (matches === winNums.length) won = true;
        });
        if (won) {
          const prize = PRIZE_AMOUNTS[purchase.gameId];
          balanceAdded += prize;
          return { ...purchase, status: 'won' as const, isProcessed: true, winAmount: prize };
        } else {
          return { ...purchase, status: 'lost' as const, isProcessed: true, winAmount: 0 };
        }
      });
      const newUser = { ...user, balance: user.balance + balanceAdded, purchases: updatedPurchases };
      if (user.id === activeUser.id) setActiveUser(newUser);
      return newUser;
    });
    setAllUsers(updatedUsers);
    alert(`${date} の抽せんおよび自動配当が完了しました。`);
  };

  const handleGlobalBack = () => {
    if (view === 'picker') setView('summary');
    else if (view === 'summary') setView('home');
    else if (view === 'deposit' || view === 'withdraw') setView('mypage');
    else setView('home');
  };

  const processTransaction = (txId: string, status: 'approved' | 'rejected') => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;
    setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status } : t));
    if (status === 'approved') {
      const updatedUsers = allUsers.map(u => {
        if (u.id === tx.userId) {
          const newBalance = tx.type === 'deposit' ? u.balance + tx.amount : u.balance - tx.amount;
          const updated = { ...u, balance: newBalance };
          if (u.id === activeUser.id) setActiveUser(updated);
          return updated;
        }
        return u;
      });
      setAllUsers(updatedUsers);
    }
  };

  const finalizePurchase = () => {
    if (!activeUser.isLoggedIn) { alert("アカウントにログインしてください。"); return; }
    const validSelections = selections.filter(s => s.numbers.length > 0);
    const totalCost = validSelections.length * selectedGame.price;
    if (activeUser.balance < totalCost) { alert("残高が不足しています。カスタマー服务へご連絡ください。"); return; }
    const newPurchase: Purchase = {
      id: 'P' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      userId: activeUser.id,
      gameId: selectedGame.id,
      numbers: validSelections.map(s => s.numbers),
      timestamp: Date.now(),
      isProcessed: false,
      status: 'pending',
      winAmount: 0
    };
    const updatedActiveUser = { ...activeUser, balance: activeUser.balance - totalCost, purchases: [...activeUser.purchases, newPurchase] };
    setActiveUser(updatedActiveUser);
    setAllUsers(prev => prev.map(u => u.id === activeUser.id ? updatedActiveUser : u));
    alert("購入が完了しました。08:00の抽せん結果をお待ちください。");
    setView('home');
    setSelections(['A', 'B', 'C', 'D', 'E'].map(id => ({ id, numbers: [], count: 1, duration: 1 })));
  };

  return (
    <div className="flex justify-center bg-[#eeeeee] min-h-screen font-sans">
      <div className="w-full max-w-[390px] bg-[#f8f8f8] min-h-screen relative flex flex-col shadow-2xl text-[#333]">
        <Navbar 
          user={activeUser} 
          view={view}
          logoUrl={adminConfig.logoUrl}
          onLogin={() => {
            const loggedInUser = { ...activeUser, isLoggedIn: true };
            setActiveUser(loggedInUser);
            setAllUsers(prev => prev.map(u => u.id === activeUser.id ? loggedInUser : u));
          }}
          onAdmin={() => setView('admin')}
          onBack={handleGlobalBack}
        />
        <main className="flex-1 pb-20 overflow-y-auto">
          {view === 'home' && <GameList games={GAMES} onBuy={(g) => { setSelectedGame(g); setView('summary'); }} onShowHistory={() => setView('history')} winningNumbers={adminConfig.winningNumbers} />}
          {view === 'summary' && <SummaryView game={selectedGame} selections={selections} onBack={() => setView('home')} onSelect={(id) => { setActiveSelectionId(id); setView('picker'); }} onQuickPick={(id) => { const nums = []; while(nums.length < selectedGame.pickCount) { const r = Math.floor(Math.random() * selectedGame.maxNumber) + 1; if(!nums.includes(r)) nums.push(r); } setSelections(prev => prev.map(s => s.id === id ? { ...s, numbers: nums.sort((a,b)=>a-b) } : s)); }} onDelete={(id) => setSelections(prev => prev.map(s => s.id === id ? { ...s, numbers: [] } : s))} onFinalize={finalizePurchase} />}
          {view === 'picker' && <NumberPicker game={selectedGame} selectionId={activeSelectionId} initialNumbers={selections.find(s => s.id === activeSelectionId)?.numbers || []} onCancel={() => setView('summary')} onComplete={(nums) => { setSelections(prev => prev.map(s => s.id === activeSelectionId ? { ...s, numbers: nums } : s)); setView('summary'); }} />}
          {view === 'mypage' && <MyPage user={activeUser} onAction={(v) => setView(v)} />}
          {view === 'history' && <DrawHistory games={GAMES} history={adminConfig.winningNumbers} onBack={() => setView('home')} />}
          {view === 'deposit' && <DepositView onBack={() => setView('mypage')} onSubmit={(amt) => { const newTx: Transaction = { id: 'D'+Date.now(), userId: activeUser.id, type: 'deposit', amount: amt, status: 'pending', timestamp: Date.now() }; setTransactions(prev => [...prev, newTx]); alert("入金申請が送信されました。承認までお待ちください。"); setView('mypage'); }} />}
          {view === 'withdraw' && <WithdrawForm onBack={() => setView('mypage')} onSubmit={(data) => { const newTx: Transaction = { id: 'W'+Date.now(), userId: activeUser.id, type: 'withdraw', amount: data.amount, status: 'pending', timestamp: Date.now(), bankDetails: { bankName: data.bankName, branchName: data.branchName, accountNumber: data.accountNumber, accountName: data.nameKana } }; setTransactions(prev => [...prev, newTx]); alert("出金申請が送信されました。承認をお待ちください。"); setView('mypage'); }} />}
        </main>
        
        {view === 'admin' && <AdminPanel config={adminConfig} setConfig={setAdminConfig} onBack={() => setView('home')} users={allUsers} transactions={transactions} onProcessTx={processTransaction} onUpdateUser={(uid, data) => setAllUsers(prev => prev.map(u => u.id === uid ? { ...u, ...data } : u))} onExecuteDraw={executeDraw} />}
        
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

        {/* 确保 CustomerService 始终渲染在顶层，不随 Main 滚动 */}
        <CustomerService lineLink={adminConfig.lineLink} />
      </div>
    </div>
  );
};

export default App;
