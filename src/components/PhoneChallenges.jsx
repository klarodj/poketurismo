import {partName} from '../logic/partLabels.mjs';
import React,{useCallback,useEffect,useRef,useState} from 'react';
import {useNavigate} from 'react-router-dom';
import usePhoneStore from '../store/phoneStore';
import useRaceStore from '../store/raceStore';
import useRequestStore from '../store/requestStore';
import {fetchMeetSocial,fetchPhoneInbox,fetchTracks,inviteMeetChallenge,respondMeetChallenge,startMeetChallenge} from '../services/api';
import {challengeContacts,challengeCarAllowed,CHALLENGE_STATUSES} from '../logic/meetChallenges.mjs';
import {clubDate} from '../logic/clubDate';
const condition=value=>({sunny:'sereno',rainy:'pioggia',snowy:'neve',night:'notte',foggy:'nebbia',dry:'asciutto',wet:'bagnato',asphalt:'asfalto',tarmac:'asfalto',gravel:'sterrato',dirt:'sterrato'})[value?.toLowerCase()]||value;
const time=ms=>ms==null?'—':`${(ms/1000).toLocaleString('it-IT',{minimumFractionDigits:3,maximumFractionDigits:3})} s`;
function CarSummary({car}){return <><p>{car.brand} {car.name} · {car.cv} CV · {car.kg} kg · IP {car.performanceIndex}</p><details><summary>Preparazione · {car.parts.length} pezzi</summary>{car.parts.length?<ul>{car.parts.map((part,i)=><li key={i}>{partName(part.name)} · liv. {part.level}</li>)}</ul>:<p>Allestimento di serie.</p>}</details></>;}
export function PhoneChallengeItem({challenge,userId,car,disabled,activeRace,now=0,onRespond,onStart,onRace}){
 const sent=challenge.senderId===userId,other=challenge[sent?'recipient':'sender']?.pilot.name||'pilota',mine=challenge.results[sent?'sender':'recipient'];
 const expired=now>=+new Date(challenge.expiresAt),canAccept=challengeCarAllowed(challenge,car);
 return <li className="phone-challenge"><details><summary><strong>{sent?'A: ':'Da: '}{other}</strong><span>{CHALLENGE_STATUSES[challenge.status]||challenge.status}</span><small>{challenge.track.name}</small></summary>
 <p>{condition(challenge.track.weather)} · {condition(challenge.track.surface)}</p><p>{challenge.format==='open'?'Auto a scelta del destinatario':challenge.format==='model'?`Stesso modello: ${challenge.sender.car.name}`:`Fascia IP ${challenge.minIP}–${challenge.maxIP}`}</p><small>Scadenza: {clubDate(challenge.expiresAt)}</small><p>Motore e gomme 100%, 20 L normale. Un tentativo a testa, senza premi o usura della tua auto.</p>
 <h3>{challenge.sender.pilot.name}</h3><CarSummary car={challenge.sender.car}/><h3>{challenge.recipient?.pilot.name||'Auto da confermare'}</h3>{challenge.recipient?<CarSummary car={challenge.recipient.car}/>:!sent&&car?<CarSummary car={car}/>:<p>La sceglierà il destinatario.</p>}
 {['sender','recipient'].map(side=><p key={side}>{side==='sender'?'Mittente':'Destinatario'}: {challenge.results[side]?.status==='finished'?time(challenge.results[side].timeMs):challenge.results[side]?'Ritirato':'Tentativo non completato'}</p>)}
 {challenge.status==='completed'&&<p>{challenge.draw?'Pareggio / doppio ritiro':challenge.winnerId===userId?'Hai vinto':'Ha vinto l’altro pilota'}</p>}
 <div className="phone-actions">{challenge.status==='pending'&&(sent?<button type="button" disabled={disabled||expired} onClick={()=>onRespond('cancel')}>Ritira invito</button>:<><button type="button" disabled={disabled||expired||!canAccept} onClick={()=>onRespond('accept')}>Accetta con l’auto selezionata</button><button type="button" disabled={disabled||expired} onClick={()=>onRespond('decline')}>Rifiuta invito</button></>)}
 {challenge.status==='accepted'&&!challenge.myRaceId&&<button type="button" disabled={disabled||expired||!!activeRace} onClick={onStart}>Inizia il tuo tentativo</button>}
 {challenge.myRaceId&&<button type="button" disabled={disabled} onClick={onRace}>{mine||challenge.status==='cancelled'?'Rivedi il tentativo':'Riprendi il tentativo'}</button>}</div>
 {!sent&&challenge.status==='pending'&&!canAccept&&<p>{car?'Questa auto non rispetta le condizioni dell’invito precedente.':'Seleziona una tua auto per accettare.'}</p>}{expired&&['pending','accepted'].includes(challenge.status)&&<p>Tempo scaduto: aggiorna le sfide.</p>}
 </details></li>;
}
export default function PhoneChallenges({ownerId,targetPeer,onClose}){
 const navigate=useNavigate(),activeRace=useRaceStore(state=>state.activeRace),pending=useRequestStore(state=>state.pending);
 const [screen,setScreen]=useState(targetPeer?'compose':'list'),[sentFingerprint,setSentFingerprint]=useState(null);
 const feedback=useRef(null);
 const [data,setData]=useState(null),[contacts,setContacts]=useState([]),[tracks,setTracks]=useState([]),[peerId,setPeerId]=useState(String(targetPeer?.id||'')),[garageId,setGarageId]=useState(''),[trackId,setTrackId]=useState('');
 const [now,setNow]=useState(()=>Date.now());
 const [error,setError]=useState(''),[notice,setNotice]=useState(''),[loading,setLoading]=useState(false),[busy,setBusy]=useState(false);
 const live=useRef(false),loadVersion=useRef(0),acting=useRef(false);
 const current=useCallback(()=>live.current&&usePhoneStore.getState().ownerId===ownerId,[ownerId]);
 const refresh=useCallback(async()=>{
  const version=++loadVersion.current;setLoading(true);
  try{const [hub,book,allTracks]=await Promise.all([fetchMeetSocial(ownerId),fetchPhoneInbox(ownerId),fetchTracks()]);if(!current()||version!==loadVersion.current)return;
   const circuits=allTracks.filter(track=>track.catalog?.format==='circuit'||['Track','Circuit'].includes(track.type.name));
   setNow(Date.now());setData(hub);setContacts(challengeContacts(book.contacts,ownerId));setTracks(circuits);setGarageId(previous=>previous||String(hub.cars[0]?.id||''));setTrackId(previous=>previous||String(circuits.find(t=>t.name==='Pistino di San Rocco · Pavese')?.id||circuits[0]?.id||''));setError('');
  }catch(e){if(current()&&version===loadVersion.current)setError(e.message);}finally{if(current()&&version===loadVersion.current)setLoading(false);}
 },[ownerId,current]);
 useEffect(()=>{live.current=true;refresh();const wake=()=>{if(!document.hidden&&!acting.current)refresh();};const timer=setInterval(wake,30000);window.addEventListener('focus',wake);document.addEventListener('visibilitychange',wake);return()=>{live.current=false;clearInterval(timer);window.removeEventListener('focus',wake);document.removeEventListener('visibilitychange',wake);};},[refresh]);
 useEffect(()=>{if(error||notice)feedback.current?.scrollIntoView({block:'nearest'});},[error,notice]);
 const act=async(work,message,after)=>{if(acting.current||!current())return;acting.current=true;setBusy(true);setError('');setNotice('');try{const result=await work();if(!current())return;setNotice(message);if(after){after(result);return;}await Promise.all([refresh(),usePhoneStore.getState().refresh().catch(()=>{})]);}catch(e){if(current())setError(e.message);}finally{acting.current=false;if(current())setBusy(false);}};
 const goToRace=id=>{onClose();navigate(`/track-race?raceId=${encodeURIComponent(id)}`);};
 const car=data?.cars.find(c=>c.id===Number(garageId)),peer=contacts.find(p=>p.id===Number(peerId)),disabled=busy||pending>0;
 const fingerprint=JSON.stringify([peerId,garageId,trackId,car?.quoteKey]);
 const alreadySent=sentFingerprint===fingerprint;
 const challenges=data?.challenges.filter(c=>!peerId||c.senderId===Number(peerId)||c.recipientId===Number(peerId))||[];
 return <section className="phone-challenges"><h2>Sfide del club</h2><p>Invito asincrono: scegli il confronto, l’altro pilota decide se accettare. 48 ore, un tentativo a testa.</p>
 <div ref={feedback}>{error&&<p role="alert" className="phone-error">{error}</p>}{notice&&<p role="status">{notice}</p>}</div><div className="phone-actions"><button type="button" aria-pressed={screen==='list'} onClick={()=>setScreen('list')}>Inviti e risultati</button><button type="button" aria-pressed={screen==='compose'} onClick={()=>setScreen('compose')}>Nuovo invito</button></div><button type="button" disabled={loading||busy} onClick={refresh}>{loading?'Collegamento…':'Aggiorna sfide'}</button>
 {!data?<p>Caricamento delle sfide…</p>:<>
 <label>Pilota della sfida<select value={peerId} onChange={event=>setPeerId(event.target.value)}><option value="">{screen==='list'?'Tutti i piloti':'Scegli un pilota'}</option>{contacts.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
 {targetPeer&&!peer&&<p>Il contatto selezionato non è disponibile. Scegli un altro pilota o aggiorna la rubrica.</p>}
 <label>Auto per inviti e accettazioni<select value={garageId} onChange={event=>setGarageId(event.target.value)}>{!data.cars.length&&<option value="">Nessuna auto posseduta</option>}{data.cars.map(c=><option key={c.id} value={c.id}>{c.brand} {c.name} · IP {c.performanceIndex}</option>)}</select></label>
 {!data.cars.length&&<p>Serve una tua auto per proporre o accettare una sfida. Puoi comunque leggere gli inviti.</p>}
 <details><summary>Auto selezionata e condizioni</summary>{car&&<CarSummary car={car}/>}<p>Motore/gomme 100%, 20 L normale, condizioni virtuali. La scelta non cambia l’auto equipaggiata. La preparazione si fissa all’accettazione.</p></details>
 {screen==='compose'&&<form onSubmit={event=>{event.preventDefault();if(!car||!peer||!trackId||disabled||alreadySent)return;act(async()=>{const result=await inviteMeetChallenge(ownerId,{peerId:Number(peerId),garageId:Number(garageId),quoteKey:car.quoteKey,trackId:Number(trackId)});if(current()){setSentFingerprint(fingerprint);setScreen('list');}return result;},'Invito inviato. Il destinatario può rispondere dal cellulare o dal raduno.');}}>
 <h3>Proponi una sfida{peer?` a ${peer.name}`:''}</h3><label>Circuito della sfida<select value={trackId} onChange={event=>setTrackId(event.target.value)}>{tracks.map(t=><option key={t.id} value={t.id}>{t.name} · {condition(t.meteo.name)}</option>)}</select></label>
 <p>Chi riceve l’invito vede la tua auto e sceglie liberamente quale vettura usare. Massimo 3 inviti l’ora e 2 sfide aperte per coppia.</p>
 <button type="submit" disabled={disabled||!peer||!car||!trackId||alreadySent}>{busy?'Operazione in corso…':alreadySent?'Invito già inviato':'Invia invito'}</button></form>}
 {screen==='list'&&<>{activeRace&&<p>Hai già una gara in corso. Concludila prima di iniziare un tentativo.</p>}
 <h3>Inviti e tentativi ({challenges.length})</h3><p>Ultime 100 sfide: {data.record.wins} vittorie · {data.record.losses} sconfitte · {data.record.draws} pareggi.</p>
 {challenges.length?<ol className="phone-list">{challenges.map(challenge=><PhoneChallengeItem key={challenge.id} challenge={challenge} userId={ownerId} car={car} disabled={disabled} activeRace={activeRace} now={now}
 onRespond={action=>act(()=>respondMeetChallenge(ownerId,{challengeId:challenge.id,action,...(action==='accept'?{garageId:Number(garageId),quoteKey:car?.quoteKey}:{})}),'Invito aggiornato.')}
 onStart={()=>act(()=>startMeetChallenge(ownerId,challenge.id),'Tentativo iniziato.',result=>goToRace(result.race.id))} onRace={()=>goToRace(challenge.myRaceId)}/> )}</ol>:<p>Nessuna sfida per il pilota scelto.</p>}
 </>}
 </>}
 </section>;
}
