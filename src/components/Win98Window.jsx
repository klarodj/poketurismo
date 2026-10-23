import React from 'react';

// Props: title (string), children (ReactNode), onClose (fn), noShadow (boolean), imageUrl (string)
export default function Win98Window({ title, children, onClose, noShadow = false, imageUrl, showControls = true }) {
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
        {showControls && <div className="flex gap-1 h-5">
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
        </div>}
      </div>

      {/* Window Body */}
      <div className="bg-win98-gray p-1 flex flex-col">
        {imageUrl && (
          <figure className="mb-2 border-2 border-t-win98-darkerGray border-l-win98-darkerGray border-b-white border-r-white bg-win98-gray">
            <img src={imageUrl} alt={title} className="w-full h-32 md:h-48 object-cover" style={{imageRendering:'pixelated'}} />
            <figcaption className="px-2 py-1 border-t border-win98-darkerGray text-black font-bold">{title}</figcaption>
          </figure>
        )}
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
