import React from 'react';

export default function FuelGauge({ currentFuel, maxFuel }) {
  const percentage = (currentFuel / maxFuel) * 100;
  const isReserve = percentage < 15;

  return (
    <div className="flex items-center gap-2 bg-black px-3 py-1 border-2 border-win98-darkerGray shadow-win98-inset">
      <span className="text-white font-bold text-lg select-none">E</span>
      
      {/* Gauge Container */}
      <div className="relative w-32 h-4 bg-gray-900 border border-gray-700 mx-1 overflow-hidden">
        {/* Progress Fill */}
        <div 
          className={`h-full transition-all duration-500 ease-in-out ${
            isReserve ? 'bg-orange-500 animate-pulse' : 'bg-green-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
        
        {/* Analog Ticks Overlay */}
        <div className="absolute inset-0 flex justify-between px-1">
          <div className="w-[1px] h-full bg-white/30" />
          <div className="w-[1px] h-2 bg-white/30" />
          <div className="w-[1px] h-3 bg-white/30" />
          <div className="w-[1px] h-2 bg-white/30" />
          <div className="w-[1px] h-full bg-white/30" />
        </div>
      </div>
      
      <span className="text-white font-bold text-lg select-none">F</span>
      
      {/* Reserve Indicator Light */}
      <div className={`w-3 h-3 rounded-full ml-1 border border-black shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)] ${isReserve ? 'bg-yellow-400 animate-pulse shadow-[0_0_8px_4px_rgba(250,204,21,0.6)]' : 'bg-stone-800'}`} />
    </div>
  );
}
