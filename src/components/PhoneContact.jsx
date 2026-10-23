import React from 'react';
export function ContactActions({phone,peer}){
 const entry=phone.inbox?.friendships?.find(f=>f.peer.id===peer?.id);
 const blocked=phone.inbox?.contacts.find(p=>p.id===peer?.id)?.blocked;
 if(!phone.inbox)return <p>Caricamento rubrica…</p>;
 if(blocked)return <p>Contatto bloccato. Lo scambio del numero non è disponibile.</p>;
 const action=(choice)=>phone.changeFriendship(peer,choice);
 if(entry?.status==='accepted')return <><p>Numero del club: <strong>{entry.number}</strong></p><p>Numero salvato in entrambe le rubriche.</p><div className="phone-actions"><button type="button" onClick={()=>phone.openSms(peer,true)}>Scrivi SMS</button><button type="button" onClick={()=>phone.menu('remove-contact')}>Elimina numero</button></div></>;
 if(entry?.status==='pending')return entry.direction==='incoming'?<><p>{peer.name} vuole scambiare il numero con te.</p><div className="phone-actions"><button type="button" disabled={phone.friendshipBusy} onClick={()=>action('accept')}>Accetta e salva numero</button><button type="button" disabled={phone.friendshipBusy} onClick={()=>action('decline')}>Rifiuta</button></div></>:<><p>Hai chiesto il numero. In attesa di risposta.</p><button type="button" disabled={phone.friendshipBusy} onClick={()=>action('cancel')}>Ritira richiesta</button></>;
 return <><p>Chiedi di scambiare il numero. Se accetta, resterete in rubrica anche quando lasciate il piazzale.</p><button type="button" disabled={phone.friendshipBusy} onClick={()=>action('request')}>Chiedi il numero</button></>;
}
export default function PhoneContact({phone}){const contact=phone.inbox?.contacts.find(c=>c.id===phone.peer?.id);return <><h2>{phone.peer?.name}</h2><ContactActions phone={phone} peer={phone.peer}/>{phone.inbox&&<div className="phone-actions"><button type="button" disabled={!contact||contact.blocked||contact.canMessage===false} onClick={()=>phone.openChallenges(phone.peer)}>Proponi sfida</button><button type="button" onClick={phone.block}>{contact?.blockedByMe?'Sblocca pilota':contact?.blocked?'Blocca anche tu':'Blocca pilota'}</button><button type="button" onClick={()=>phone.menu('report')}>Segnala comportamento</button></div>}</>;}
