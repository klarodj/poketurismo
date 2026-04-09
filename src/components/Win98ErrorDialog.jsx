import React from 'react';
import useGameStore from '../store/gameStore';

export default function Win98ErrorDialog() {
  const { activeEvent, clearEvent } = useGameStore();

  if (!activeEvent || activeEvent.type !== 'error') return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100]">
      {/* Invisible backdrop */}
      <div className="absolute inset-0" onClick={clearEvent}></div>
      
      {/* Win98 Error Window */}
      <div className="bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray shadow-win98-outset w-[350px] flex flex-col z-10 relative">
        {/* Title Bar - Gradient Background */}
        <div className="bg-gradient-to-r from-win98-blue to-win98-lightBlue px-1 py-[4px] mb-1 flex justify-between items-center text-white min-h-[28px] select-none">
          <span className="font-bold pl-2 text-base tracking-tight">{activeEvent.title || 'Error'}</span>
          <button 
            onClick={clearEvent}
            className="w-5 h-5 bg-win98-gray border border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray flex items-center justify-center text-black font-bold text-sm active:border-t-win98-darkerGray active:border-l-win98-darkerGray active:border-b-white active:border-r-white"
          >
            ×
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 flex gap-5">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-600 flex items-center justify-center border-2 border-white text-white font-bold text-2xl leading-none">
            ✕
          </div>
          <div className="flex-1 text-base pt-1 leading-snug font-bold">
            {activeEvent.message}
          </div>
        </div>

        {/* Buttons Area */}
        <div className="flex justify-center p-3 mt-2">
          <button 
            onClick={clearEvent}
            className="px-6 py-1 bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray font-bold active:border-t-win98-darkerGray active:border-l-win98-darkerGray active:border-b-white active:border-r-white focus:outline focus:outline-1 focus:outline-black focus:outline-offset-2"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
