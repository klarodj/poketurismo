import useGameStore from '../store/gameStore';
import React from'react';
import usePhoneStore from'../store/phoneStore';
import './phone.css';
export default function PhoneNotification(){const{notice,isOpen,openSms,dismiss}=usePhoneStore();const otherPhone=useGameStore(state=>state.isHistoryOpen||!!(state.activeEvent&&state.activeEvent.type!=='error'));if(!notice||isOpen||otherPhone)return null;return <aside className="phone-notice" aria-label="Notifica SMS"><div role="status"><strong>✉ {notice.backlog?`${notice.count} SMS da leggere`:'Nuovo SMS'}</strong><span>{notice.peer?.name?`Da: ${notice.peer.name}`:'Apri il cellulare'}</span></div><div><button type="button" onClick={()=>{openSms(notice.peer);usePhoneStore.getState().openMessage(notice.id);dismiss();}}>Leggi SMS</button><button type="button" onClick={dismiss}>Dopo</button></div></aside>;}
