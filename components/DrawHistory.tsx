
import React from 'react';
import { LotteryGame } from '../types';

interface Props {
  games: LotteryGame[];
  history: any;
  onBack: () => void;
}

const DrawHistory: React.FC<Props> = ({ games, history, onBack }) => {
  return (
    <div className="p-4 bg-white min-h-screen animate-in fade-in duration-300">
       <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="text-gray-400"><i className="fas fa-chevron-left text-xl"></i></button>
        <h2 className="text-lg font-bold">過去の抽せん結果</h2>
      </div>

      {games.map(game => (
        <div key={game.id} className="mb-8">
           <h3 className="text-sm font-bold text-blue-700 border-b pb-2 mb-4">{game.fullName}</h3>
           <div className="space-y-4">
              {Object.entries(history[game.id] || {}).map(([date, nums]: any) => (
                <div key={date} className="bg-gray-50 p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-[10px] text-gray-400 font-bold">{date} (第622回)</span>
                    <div className="flex gap-1 mt-1">
                      {nums.map((n: number, i: number) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">{n}</div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] font-bold text-red-600">1等：12億円</p>
                  </div>
                </div>
              ))}
           </div>
        </div>
      ))}
    </div>
  );
};

export default DrawHistory;
