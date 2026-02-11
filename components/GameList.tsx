
import React from 'react';
import { LotteryGame } from '../types';

interface Props {
  games: LotteryGame[];
  onBuy: (game: LotteryGame) => void;
  onShowHistory: () => void;
  winningNumbers: any;
}

const GameList: React.FC<Props> = ({ games, onBuy, onShowHistory, winningNumbers }) => {
  return (
    <div className="p-3 space-y-3">
      {games.map(game => (
        <div key={game.id} className="bg-white border border-gray-200 rounded-sm relative overflow-hidden shadow-sm">
          {/* Carry Over Ribbon */}
          <div className="absolute top-0 right-0 z-10">
             <div className="carry-over-ribbon px-4 py-1.5 text-[7px] font-black text-[#333] italic translate-x-3 -translate-y-0.5">
                キャリーオーバー発生中
             </div>
          </div>

          <div className="p-3">
            {/* Draw Day Header */}
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[10px] font-bold">{game.drawDayText}</span>
              <div className="w-5 h-5 bg-[#f08300] rounded-full flex items-center justify-center text-white text-[10px] font-bold">
                 {game.drawDayIcon}
              </div>
              <span className="text-[10px] font-bold">曜日が抽せん日</span>
            </div>

            <div className="flex items-start gap-4">
               {/* Left: Logo Area */}
               <div className="w-[100px] flex flex-col items-center pt-2">
                  {game.id === 'loto7' && (
                    <div className="flex flex-col items-center">
                       <img src="https://www.takarakuji-official.jp/assets/img/common/logo-loto7.svg" alt="LOTO7" className="w-20 mb-1" />
                       <span className="text-[10px] font-black text-blue-800 tracking-tighter">ロトセブン</span>
                    </div>
                  )}
                  {game.id === 'loto6' && (
                    <div className="flex flex-col items-center">
                       <img src="https://www.takarakuji-official.jp/assets/img/common/logo-loto6.svg" alt="LOTO6" className="w-20 mb-1" />
                       <span className="text-[10px] font-black text-blue-800 tracking-tighter">ロトシックス</span>
                    </div>
                  )}
                  {game.id === 'miniloto' && (
                    <div className="flex flex-col items-center">
                       <div className="bg-[#f08300] text-white px-2 py-0.5 font-black italic text-sm skew-x-[-12deg] mb-1">MINI LOTO</div>
                       <span className="text-[10px] font-black text-blue-800 tracking-tighter">ミニロト</span>
                    </div>
                  )}
               </div>

               {/* Right: Prize Box Area */}
               <div className="flex-1">
                  <div className="price-box p-3 border border-[#fff59d] text-center relative">
                     <div className="text-[9px] text-gray-600 mb-1 font-bold">
                        1等 最高 <span className="text-xl font-black text-red-600 italic tracking-tighter">{game.maxJackpot}</span>
                     </div>
                     <div className="text-[8px] text-gray-500 font-bold leading-none">
                        ※キャリーオーバー発生时
                     </div>
                  </div>
                  <div className="mt-2 text-center text-[10px] font-bold text-gray-700">
                     1口：{game.price}円
                  </div>
               </div>
            </div>

            {/* Deadline Section */}
            <div className="mt-3 pt-3 dotted-line">
               <div className="text-center">
                  <span className="text-[9px] text-gray-500 font-bold">発売締切：</span>
                  <span className="text-[11px] text-[#f08300] font-black">抽せん日当日の18:20まで</span>
               </div>
            </div>
          </div>

          {/* Bottom Buttons */}
          <div className="flex p-3 pt-0 gap-2">
            <button className="flex-1 btn-gray-gradient h-10 rounded-sm text-[11px] font-black active:opacity-80">
               商品概要
            </button>
            <button onClick={() => onBuy(game)} className="flex-1 btn-red h-10 rounded-sm text-[11px] font-black active:opacity-80 shadow-inner">
               ネット購入
            </button>
          </div>
        </div>
      ))}

      {/* Footer Info */}
      <div className="mt-4 p-4 bg-white border border-gray-200 rounded-sm relative">
         <h4 className="text-[11px] font-black mb-2 border-b pb-1">インフォメーション</h4>
         <p className="text-[9px] text-gray-500 leading-relaxed font-bold pr-14">
            ※抽せん時間は毎日 JST 08:00 となります。前日 18:20 以降のご注文は次回の抽せん対象となります。
         </p>
         {/* 这里的红框位置现在作为浮窗停留的视觉参考点 */}
         <div className="absolute bottom-4 right-4 w-12 h-12 pointer-events-none opacity-0"></div>
      </div>
    </div>
  );
};

export default GameList;
