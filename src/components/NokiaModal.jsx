import React,{useEffect,useId,useRef}from'react';
import useGameStore from'../store/gameStore';
import usePhoneStore from'../store/phoneStore';
import PhoneScreen from'./PhoneScreen';
import './phone.css';
export default function NokiaModal(){
 const game=useGameStore(),phone=usePhoneStore(),ref=useRef(null),title=useId();
 const visible=phone.isOpen||game.isHistoryOpen||!!(game.activeEvent&&game.activeEvent.type!=='error');
 const view=phone.isOpen?phone.view:game.isHistoryOpen?'events':'event';
 const close=()=>{phone.close();if(game.activeEvent?.type!=='error')game.clearEvent();if(game.isHistoryOpen)game.toggleHistory();};
 useEffect(()=>{if(!visible||!ref.current)return;const dialog=ref.current,focus=document.activeElement,overflow=document.body.style.overflow;dialog.showModal();document.body.style.overflow='hidden';return()=>{dialog.close();document.body.style.overflow=overflow;if(focus?.isConnected)focus.focus();};},[visible]);
 if(!visible)return null;
 const back=()=>{if(['inbox','event'].includes(view)){close();return;}if(['compose','message','options','report'].includes(view)&&phone.peer)phone.openSms(phone.peer);else phone.menu('inbox');};
 return <dialog ref={ref} className="phone-dialog" aria-labelledby={title} onCancel={event=>{event.preventDefault();close();}}><div className="phone-case"><div className="phone-speaker" aria-hidden="true"><i/><i/><i/><i/></div><div className="phone-top"><span id={title}>CELLULARE</span><button type="button" onClick={close} aria-label="Chiudi cellulare">×</button></div><div className="phone-lcd"><div className="phone-status"><span aria-hidden="true">▂▄▆</span><strong>POKETEL</strong><span aria-label={`${phone.unread} SMS non letti`}>✉ {phone.unread}</span><span aria-hidden="true">▰</span></div><div className="phone-scroll"><PhoneScreen view={view} onClose={close} events={game.notifications} activeEvent={game.activeEvent}/></div><div className="phone-lcd-footer"><span>{phone.connected?'Club Motori del Nord':'Linea assente'}</span></div></div><nav className="phone-softkeys" aria-label="Comandi del cellulare"><button type="button" onClick={()=>phone.menu('inbox')}>SMS{phone.unread?` (${phone.unread})`:''}</button><button type="button" onClick={back}>Indietro</button></nav><div className="phone-hardware"><button type="button" onClick={()=>phone.menu('events')}>Avvisi del gioco</button><button type="button" onClick={phone.toggleSound}>Suono: {phone.sound?'sì':'no'}</button><button type="button" className="phone-cancel" onClick={close} aria-label="Chiudi telefono">C</button></div></div></dialog>;
}
