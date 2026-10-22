import React, {useEffect,useState} from 'react';
import {fetchStreetHub,findStreetOpponent,startRace} from '../services/api';
import usePlayerStore from '../store/playerStore';
import useRequestStore from '../store/requestStore';
import RaceCarArtwork from './RaceCarArtwork';
import TrackPreview from './TrackPreview';
import {buildTacticalTrack} from '../../shared/trackGeometry.mjs';
import {routeProfileFor} from '../../shared/raceContext.mjs';
import './street-meetups.css';
const weatherNames={sunny:'Sereno',rainy:'Pioggia',snowy:'Neve',night:'Notte',foggy:'Nebbia'};
const euros=value=>`€${value.toLocaleString('it-IT')}`;
function EncounterCard({offer,zone,userId,money,onNext,onStarted,onError}){
  const [wager,setWager]=useState(0);
  const pending=useRequestStore(state=>state.pending);
  const track=offer.track;
  const sections=buildTacticalTrack(track.builds.map(build=>build.section),track.distanceKm,routeProfileFor('street'));
  const challenge=async()=>{try{const data=await startRace(userId,{mode:'street',zoneId:zone.id,offerId:offer.id,wager});onStarted(data);}catch(error){onError(error.message);}};
  return <section className="street-encounter" aria-label="Avversario incontrato">
    <div className="street-encounter-heading"><div><p className="street-eyebrow">Hai incontrato</p><h3>{offer.rival.name}</h3><p>{offer.rival.style} · abilità {offer.rival.skill}</p></div><span className={`street-challenge ${offer.easy?'street-challenge-easy':''}`}>{offer.challenge}</span></div>
    <div className="street-rival-grid"><div className="street-rival-car"><RaceCarArtwork car={offer.rival.car}/><strong>{offer.rival.car.brand} {offer.rival.car.name}</strong><p>{offer.rival.car.cv} CV · {offer.rival.car.kg} kg · IP {offer.rival.car.performance} · motore {offer.rival.car.engineHealth}% · gomme {offer.rival.car.tireGrip}%</p></div>
      <div className="street-route"><h4>Percorso della sfida</h4><strong>{track.name}</strong><p>{track.distanceKm.toLocaleString('it-IT')} km · {weatherNames[track.weather]||track.weather}</p><p>Precedenti: {offer.record.wins} vittorie · {offer.record.losses} sconfitte · {offer.record.draws} pareggi</p><p>Vittoria: fino a <strong>{offer.winXp} XP</strong> e <strong>+{offer.winReputation} reputazione</strong>.</p><p className="street-small">La valutazione considera auto, piloti e percorso. Le tue scelte possono cambiare l’esito.</p></div></div>
    <details className="street-map"><summary>Esamina i settori prima di accettare</summary><TrackPreview sections={sections} profile={routeProfileFor('street')}/></details>
    {(offer.races>0||offer.easy)&&<p className="street-notice">{offer.easy?'Il rivale è nettamente inferiore: ricompense e puntate ridotte. ':''}{offer.races>0?'Le sfide ripetute con lo stesso rivale riducono XP, reputazione e puntata massima. ':''}{offer.rewardFactor===0?'Questo confronto è ormai assimilato: puoi correre solo senza puntata, senza altri XP o reputazione.':''}</p>}
    <fieldset className="street-wagers" disabled={pending>0}><legend>Scommessa facoltativa</legend><div>{offer.wagers.map(value=><label key={value} className={wager===value?'street-wager-selected':''}><input type="radio" name="street-wager" checked={wager===value} onChange={()=>setWager(value)}/>{value===0?'Senza puntata':euros(value)}</label>)}</div></fieldset>
    <p className="street-small">{wager>0?`Saldo dopo la puntata: ${euros(money-wager)}. Se vinci ricevi ${euros(wager*2)} (guadagno netto ${euros(wager)}); pareggio: rimborso; sconfitta o abbandono: perdi ${euros(wager)}.`:'Nessuna quota e nessun premio in denaro. Esperienza e reputazione dipendono dal risultato e dai precedenti.'} Consumi e usura restano a tuo carico.</p>
    <p className="street-small">Limite: 15% del saldo, lasciando almeno €1.000 per la vettura. I limiti del ritrovo e del rivale possono essere più bassi.</p>
    <div className="street-actions"><button className="street-button street-button-primary" disabled={pending>0} onClick={challenge}>Sfida {offer.rival.name}{wager>0?` · ${euros(wager)}`:' · senza puntata'}</button><button className="street-button" disabled={pending>0} onClick={onNext}>Cerca un altro avversario · gratis</button></div>
  </section>;
}
export default function StreetMeetups({onStarted}){
  const {id:userId,money,level}=usePlayerStore();
  const pending=useRequestStore(state=>state.pending);
  const [hub,setHub]=useState(null);
  const [zoneId,setZoneId]=useState(()=>{try{return sessionStorage.getItem(`street-zone-${userId}`)||'parking';}catch{return 'parking';}});
  const [error,setError]=useState('');
  useEffect(()=>{let cancelled=false;fetchStreetHub(userId).then(data=>{if(!cancelled)setHub(data);}).catch(error=>{if(!cancelled)setError(error.message);});return()=>{cancelled=true;};},[userId]);
  const zone=hub?.zones.find(item=>item.id===zoneId)||hub?.zones[0];
  const choose=id=>{setZoneId(id);setError('');try{sessionStorage.setItem(`street-zone-${userId}`,id);}catch{/* Keep the selection for this visit. */}};
  const encounter=async()=>{try{setError('');const data=await findStreetOpponent(userId,{zoneId:zone.id,...(zone.offer?{replace:true,offerId:zone.offer.id}:{})});setHub(data.street);}catch(error){setError(error.message);}};
  return <div className="street-meetups"><header className="street-header"><p className="street-eyebrow">Corse clandestine</p><h1>I ritrovi</h1><p>Fatti conoscere, incontra i piloti della zona e scegli chi sfidare.</p><div className="street-player"><span>Livello {level}</span><span>La tua auto: IP {hub?.performance??'—'}</span><span>Saldo {euros(money)}</span></div></header>
    {error&&<p role="alert" className="street-error">{error} <button className="underline" onClick={()=>{setError('');fetchStreetHub(userId).then(setHub).catch(e=>setError(e.message));}}>Aggiorna ritrovi</button></p>}
    {!hub?<p>Caricamento dei ritrovi…</p>:<><nav className="street-zones" aria-label="Scegli il ritrovo">{hub.zones.map(item=><button key={item.id} className={`street-zone ${zone.id===item.id?'street-zone-selected':''}`} aria-pressed={zone.id===item.id} onClick={()=>choose(item.id)}><span>{item.unlocked?'● Aperto':'🔒 Da sbloccare'}</span><strong>{item.name}</strong><small>Liv. {item.minLevel} · IP {item.minPerformance}+</small><small>Reputazione {item.reputation} · {item.wins} vittorie</small></button>)}</nav>
    <section className="street-zone-intro"><h2>{zone.name}</h2><p>{zone.description}</p><p className="street-small">{zone.rivalCount} piloti abituali · puntate fino a {euros(zone.maxWager)} · reputazione locale {zone.reputation}</p>{!zone.unlocked?<div className="street-locked"><strong>Per accedere ti manca:</strong><ul>{zone.reasons.map(reason=><li key={reason}>{reason}</li>)}</ul></div>:zone.offer?<EncounterCard key={zone.offer.id} offer={zone.offer} zone={zone} userId={userId} money={money} onNext={encounter} onStarted={onStarted} onError={setError}/>:<button className="street-button street-button-primary" disabled={pending>0} onClick={encounter}>Entra nel ritrovo · incontra un rivale</button>}</section>
    <p className="street-small">Cercare un rivale è gratuito. Incontrerai tutti i piloti disponibili prima che la selezione ricominci. Auto e abilità dei rivali sono fisse: migliorando puoi tornare nelle vecchie zone.</p></>}
  </div>;
}
