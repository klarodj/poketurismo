import React from 'react';

// Props: title (string), children (ReactNode), onClose (fn), noShadow (boolean), imageUrl (string)
export default function Win98Window({ title, children, onClose, noShadow = false, imageUrl }) {
  return (
    <div className={`
      bg-win98-gray 
      border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray
      ${!noShadow ? 'shadow-[2px_2px_0_0_#000000]' : ''} 
      p-1 flex flex-col w-full min-h-0
    `}>
      {/* Title Bar - Gradient Background */}
      <div className="bg-gradient-to-r from-win98-blue to-win98-lightBlue px-1 py-[2px] mb-1 flex justify-between items-center text-white h-7 select-none">
        
        {/* Title and Icon Area */}
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-4 h-4 bg-white/20 border border-white/50 flex items-center justify-center text-[10px]">
            🚗
          </div>
          <span className="font-bold text-sm truncate tracking-tight">{title}</span>
        </div>

        {/* Window Controls */}
        <div className="flex gap-1 h-5">
          <button className="w-5 h-5 bg-win98-gray border border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray flex items-center justify-center text-black font-bold text-xs pb-1 active:border-t-win98-darkerGray active:border-l-win98-darkerGray active:border-b-white active:border-r-white">
            _
          </button>
          <button className="w-5 h-5 bg-win98-gray border border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray flex items-center justify-center text-black font-bold text-xs active:border-t-win98-darkerGray active:border-l-win98-darkerGray active:border-b-white active:border-r-white">
            □
          </button>
          <button 
            onClick={onClose}
            className="w-5 h-5 bg-win98-gray border border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray flex items-center justify-center text-black font-bold text-xs active:border-t-win98-darkerGray active:border-l-win98-darkerGray active:border-b-white active:border-r-white"
          >
            ×
          </button>
        </div>
      </div>

      {/* Window Body */}
      <div className="bg-win98-gray p-1 flex flex-col">
        {imageUrl && (
          <div className="w-full h-32 md:h-48 border-2 border-win98-darkerGray mb-2 relative overflow-hidden shrink-0 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] bg-black">
            <img src={imageUrl} alt={title} className="w-full h-full object-cover opacity-80 mix-blend-screen" onError={(e) => e.target.style.display='none'} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2 pointer-events-none">
               <span className="text-white font-pixel font-bold text-xl drop-shadow-[2px_2px_0_rgba(0,0,0,1)] uppercase tracking-widest bg-black/40 px-2 py-1">{title}</span>
            </div>
            {/* Scanline effect */}
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)] pointer-events-none mix-blend-overlay"></div>
          </div>
        )}
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
