import React from 'react';
import useGameStore from '../store/gameStore';

export default function NokiaModal() {
  const { activeEvent, clearEvent, isHistoryOpen, toggleHistory, notifications } = useGameStore();

  const isVisible = (activeEvent && activeEvent.type !== 'error') || isHistoryOpen;

  if (!isVisible) return null;

  const handleClose = () => {
    if (activeEvent) clearEvent();
    if (isHistoryOpen) toggleHistory();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
      <div className="bg-gray-800 p-8 rounded-[40px] shadow-2xl border-4 border-gray-600 max-w-sm w-full flex flex-col items-center">
        {/* Speaker grille */}
        <div className="flex gap-2 mb-6">
          <div className="w-8 h-1 bg-gray-900 rounded-full"></div>
          <div className="w-8 h-1 bg-gray-900 rounded-full"></div>
        </div>

        {/* Screen */}
        <div className="bg-[#87A96B] w-full aspect-[4/5] border-8 border-gray-900 rounded-xl p-4 flex flex-col shadow-[inset_0_4px_10px_rgba(0,0,0,0.5)] relative overflow-hidden">
          {/* LCD scanline effect overlay */}
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.05)_2px,rgba(0,0,0,0.05)_4px)] pointer-events-none z-10"></div>
          
          {/* Status Bar */}
          <div className="flex justify-between items-center border-b-2 border-green-900/40 pb-1 mb-2 z-0">
            <div className="flex space-x-1 items-end h-4">
              <div className="w-1 h-2 bg-black"></div>
              <div className="w-1 h-3 bg-black"></div>
              <div className="w-1 h-4 bg-black"></div>
            </div>
            <span className="font-pixel text-black text-sm font-bold uppercase truncate px-1">
               {isHistoryOpen ? 'MESSAGGI' : activeEvent?.title}
            </span>
            <div className="w-5 h-2.5 border border-black p-[1px] flex justify-end">
              <div className="w-full h-full bg-black"></div>
            </div>
          </div>

          {/* Content Body */}
          <div className="flex-1 font-pixel text-black font-bold flex flex-col overflow-y-auto mb-2 pr-1 custom-scroll z-0">
             {isHistoryOpen ? (
                notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.map((n, i) => (
                      <div key={i} className="border-b border-black/20 pb-2">
                        <div className="text-sm opacity-70 mb-1">{n.timestamp} - {n.title}</div>
                        <div className="text-lg leading-tight">{n.message}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-center text-lg">Nessun Messaggio</div>
                )
             ) : (
                <div className="flex-1 flex items-center justify-center text-center leading-tight text-lg font-pixel">
                  {activeEvent?.message}
                </div>
             )}
          </div>

          {/* Bottom Action Bar */}
          <div className="flex justify-center mt-auto border-t-2 border-green-900/40 pt-1 z-0">
            <span className="font-pixel text-black text-base animate-pulse">Esci</span>
          </div>
        </div>

        {/* Keypad area dummy */}
        <div className="mt-8 flex justify-center w-full relative">
           <button 
             onClick={handleClose}
             className="bg-gray-400 hover:bg-gray-300 active:bg-gray-500 w-16 h-8 rounded-full border-b-4 border-gray-600 active:border-b-0 active:translate-y-1 font-bold text-xs"
           >
             C
           </button>
        </div>
      </div>
    </div>
  );
}
