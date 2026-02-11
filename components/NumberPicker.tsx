
import React, { useState } from 'react';
import { LotteryGame } from '../types';

interface Props {
  game: LotteryGame;
  selectionId: string;
  initialNumbers: number[];
  onCancel: () => void;
  onComplete: (numbers: number[]) => void;
}

const NumberPicker: React.FC<Props> = ({ game, selectionId, initialNumbers, onCancel, onComplete }) => {
  const [selected, setSelected] = useState<number[]>(initialNumbers);
  const totalSlots = game.pickCount;

  const toggleNumber = (num: number) => {
    if (selected.includes(num)) {
      setSelected(selected.filter(n => n !== num));
    } else {
      if (selected.length < totalSlots) {
        setSelected([...selected, num].sort((a, b) => a - b));
      }
    }
  };

  const reset = () => setSelected([]);

  const randomSelect = () => {
    const nums: number[] = [];
    while (nums.length < totalSlots) {
      const r = Math.floor(Math.random() * game.maxNumber) + 1;
      if (!nums.includes(r)) nums.push(r);
    }
    setSelected(nums.sort((a, b) => a - b));
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Mini Header */}
      <div className="bg-white border-b py-2 px-4 flex items-center justify-between">
         <div className="flex flex-col">
            <span className="text-blue-700 font-black italic leading-none">{game.name.split(' ')[0]}</span>
            <span className="text-[#f08300] font-black italic leading-none">{game.name.split(' ')[1]}</span>
         </div>
         <div className="flex items-center gap-4">
            <button className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center"><i className="fas fa-chevron-left"></i></button>
            <span className="text-xl font-bold">{selectionId}</span>
            <button className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center"><i className="fas fa-chevron-right"></i></button>
         </div>
         <div className="w-10"></div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto bg-gray-100">
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="grid grid-cols-5 gap-2 mb-6">
            {Array.from({ length: game.maxNumber }, (_, i) => i + 1).map(num => (
              <button
                key={num}
                onClick={() => toggleNumber(num)}
                className={`h-11 border rounded text-sm font-bold transition-colors ${
                  selected.includes(num) ? 'bg-[#0091ea] text-white border-transparent' : 'bg-gray-100 border-gray-300 text-gray-700'
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3 text-[11px] font-bold">
               <span className="flex items-center gap-1"><span className="w-3 h-3 bg-[#0091ea]"></span> 自分で選択</span>
               <span className="flex items-center gap-1"><span className="w-3 h-3 bg-[#7cb342]"></span> ランダム選択</span>
             </div>
             <button onClick={reset} className="btn-gray px-6 py-2 rounded text-xs font-bold">リセット</button>
          </div>

          <div className="flex justify-end mb-4">
            <div className="text-right">
               <span className="text-[12px] font-bold">あと{totalSlots - selected.length}個</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <button onClick={randomSelect} className="bg-[#7cb342] text-white py-3 rounded font-bold text-sm shadow-sm">ランダム選択</button>
            <button onClick={randomSelect} className="bg-[#f08300] text-white py-3 rounded font-bold text-sm shadow-sm">クイックピック</button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
             <div className="flex flex-col gap-1">
               <span className="text-[10px] font-bold">購入口数</span>
               <select className="border border-gray-300 rounded p-2 bg-white text-sm"><option>1</option></select>
             </div>
             <div className="flex flex-col gap-1">
               <span className="text-[10px] font-bold">継続回数</span>
               <select className="border border-gray-300 rounded p-2 bg-white text-sm"><option>1</option></select>
             </div>
          </div>

          <button 
            onClick={() => onComplete(selected)}
            disabled={selected.length !== totalSlots}
            className={`w-full py-4 rounded-lg font-black text-lg shadow-md transition-all ${
              selected.length === totalSlots ? 'bg-red-600 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            完了
          </button>

          <p className="text-[10px] text-gray-500 mt-4 leading-tight">
            ※ 購入口数と継続回数を指定した場合、すべて同じ申込数字での購入になります。
          </p>
        </div>
      </div>
    </div>
  );
};

export default NumberPicker;
