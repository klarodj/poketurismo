import React from 'react';
import LocationGuide from './LocationGuide';
export default function Win98Window({title, children, onClose, noShadow=false, imageUrl, showControls=true, guideId}) {
 return <section className={`game-window bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray p-1 flex flex-col w-full min-h-0 ${noShadow?'':'shadow-[2px_2px_0_0_#000000]'}`} aria-label={title}>
  <div className="game-window-title"><span className="game-window-title-text"><span aria-hidden="true">▣</span> {title}</span>{guideId&&<LocationGuide key={guideId} guideId={guideId}/>} {showControls&&<div className="game-window-controls"><span aria-hidden="true">_</span><span aria-hidden="true">□</span>{onClose?<button type="button" onClick={onClose} aria-label={`Chiudi ${title}`}>×</button>:<span aria-hidden="true">×</span>}</div>}</div>
  {imageUrl&&<figure className="game-window-scene"><img src={imageUrl} alt={title} width="800" height="450" decoding="async"/></figure>}
  <div className="game-window-body">{children}</div>
 </section>;
}
