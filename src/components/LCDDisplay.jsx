import React from 'react';

export default function LCDDisplay({ value, unit, label }) {
  // Format value to always show 2 decimal places if it's a number, padded to length
  let displayValue = typeof value === 'number' ? value.toFixed(2) : value;

  return (
    <div className="flex flex-col items-center bg-gray-300 p-2 border-4 border-gray-400 rounded-sm">
      <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-1">{label}</span>
      <div className="bg-[#8A9A5B] border-4 border-gray-600 shadow-[inset_0_2px_5px_rgba(0,0,0,0.5)] p-2 w-full max-w-[200px] flex justify-end items-end relative overflow-hidden">
        {/* Faint Background Digits to simulate LCD */}
        <div className="absolute inset-0 flex justify-end items-end p-2 opacity-10 font-pixel text-4xl tracking-widest text-black/50 pointer-events-none">
          8888.88
        </div>
        
        <div className="font-pixel text-4xl text-black/90 font-bold tracking-widest z-10 drop-shadow-[1px_1px_0_rgba(255,255,255,0.2)]">
          {displayValue} <span className="text-xl ml-1">{unit}</span>
        </div>
      </div>
    </div>
  );
}
