import OpponentComparison from './OpponentComparison';
import {streetZoneImage} from '../../shared/streetVisuals.mjs';
import {Link} from 'react-router-dom';
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
    <div className="street-encounter-heading"><div><p className="street-eyebrow">Hai incontrato</p><h3>{offer.rival.name}</h3><p>{offer.rival.style}</p></div>{!offer.comparison&&<span className={`street-challenge ${offer.easy?'street-challenge-easy':''}`}>{offer.challenge}</span>}</div>
    <div className="street-rival-grid"><div className="street-rival-car"><RaceCarArtwork car={offer.rival.car}/><strong>{offer.rival.car.brand} {offer.rival.car.name}</strong><p>{offer.rival.car.cv} CV · {offer.rival.car.kg} kg · motore {offer.rival.car.engineHealth}% · gomme {offer.rival.car.tireGrip}%</p></div>
      <div className="street-route"><h4>Percorso della sfida</h4><strong>{track.name}</strong><p>{track.distanceKm.toLocaleString('it-IT')} km · {weatherNames[track.weather]||track.weather}</p><p>Precedenti: {offer.record.wins} vittorie · {offer.record.losses} sconfitte · {offer.record.draws} pareggi</p><p>Vittoria: fino a <strong>{offer.winXp} XP</strong> e <strong>+{offer.winReputation} reputazione</strong>.</p>{!offer.comparison&&<p className="street-small">La valutazione considera auto, piloti e percorso. Le tue scelte possono cambiare l’esito.</p>}</div></div>
    <OpponentComparison comparison={offer.comparison}/>
    <details className="street-map"><summary>Esamina i settori prima di accettare</summary><TrackPreview trackName={track.name} sections={sections} profile={routeProfileFor('street')}/></details>
    {(offer.races>0||offer.easy)&&<p className="street-notice">{offer.easy?'Il rivale è nettamente inferiore: ricompense e puntate ridotte. ':''}{offer.races>0?'Le sfide ripetute con lo stesso rivale riducono XP, reputazione e puntata massima. ':''}{offer.rewardFactor===0?'Questo confronto è ormai assimilato: puoi correre solo senza puntata, senza altri XP o reputazione.':''}</p>}
    <fieldset className="street-wagers" disabled={pending>0}><legend>Scommessa facoltativa</legend><div>{offer.wagers.map(value=><label key={value} className={wager===value?'street-wager-selected':''}><input type="radio" name="street-wager" checked={wager===value} onChange={()=>setWager(value)}/>{value===0?'Senza puntata':euros(value)}</label>)}</div></fieldset>
    <p className="street-small">{wager>0?`Saldo dopo la puntata: ${euros(money-wager)}. Se vinci ricevi ${euros(wager*2)} (guadagno netto ${euros(wager)}); pareggio: rimborso; sconfitta o abbandono: perdi ${euros(wager)}.`:'Nessuna quota e nessun premio in denaro. Esperienza e reputazione dipendono dal risultato e dai precedenti.'} Consumi e usura restano a tuo carico.</p>
    <p className="street-small">Limite: 15% del saldo, lasciando almeno €1.000 per la vettura. I limiti del ritrovo e del rivale possono essere più bassi.</p>
    <div className="street-actions"><button className="street-button street-button-primary" disabled={pending>0} onClick={challenge}>Sfida {offer.rival.name}{wager>0?` · ${euros(wager)}`:' · senza puntata'}</button><button className="street-button" disabled={pending>0} onClick={onNext}>Cerca un altro avversario · gratis</button></div>
  </section>;
}
export default function StreetMeetups({onStarted,onLocationChange}){
  const {id:userId,money}=usePlayerStore();
  const pending=useRequestStore(state=>state.pending);
  const [hub,setHub]=useState(null),[stage,setStage]=useState('locations');
  const [zoneId,setZoneId]=useState(null);
  const [error,setError]=useState('');
  useEffect(()=>{let cancelled=false;fetchStreetHub(userId).then(data=>{if(!cancelled)setHub(data);}).catch(error=>{if(!cancelled)setError(error.message);});return()=>{cancelled=true;};},[userId]);
  const zone=hub?.zones.find(item=>item.id===zoneId)||null;
  useEffect(()=>{onLocationChange?.(stage==='opponent'?zone:null);},[stage,zone,onLocationChange]);
  const encounter=async(selected=zone,replace=true)=>{try{setError('');const data=await findStreetOpponent(userId,{zoneId:selected.id,...(replace&&selected.offer?{replace:true,offerId:selected.offer.id}:{})});setHub(data.street);}catch(error){setError(error.message);}};
  const choose=async selected=>{
    setZoneId(selected.id);setError('');
    if(!selected.unlocked)return;
    setStage('opponent');
    if(!selected.offer)await encounter(selected,false);
  };
  return <div className="street-meetups"><header className="street-header"><p className="street-eyebrow">Corse clandestine · {stage==='locations'?'1. Scegli il luogo':'2. Scegli l’avversario'}</p><h1>{stage==='locations'?'Dove si corre stasera?':zone?.name||'Il ritrovo'}</h1><p>{stage==='locations'?'Scegli un ritrovo per incontrare i piloti della zona.':'Guarda chi c’è, scegli se sfidarlo e decidi la puntata.'}</p></header>
    {error&&<p role="alert" className="street-error">{error} <button className="underline" onClick={()=>{setError('');fetchStreetHub(userId).then(setHub).catch(e=>setError(e.message));}}>Aggiorna ritrovi</button></p>}
    {!hub?<p>Caricamento dei ritrovi…</p>:stage==='locations'||!zone?<>
      <nav className="street-zones" aria-label="Scegli il ritrovo">{hub.zones.map(item=><button type="button" disabled={pending>0} key={item.id} className={`street-zone ${zone?.id===item.id?'street-zone-selected':''}`} aria-pressed={zone?.id===item.id} onClick={()=>choose(item)}><img className="street-zone-preview" src={streetZoneImage(item.id)} alt="" width="320" height="180" loading="lazy" decoding="async"/><span>{item.unlocked?'● Aperto':'Da sbloccare'}</span><strong>{item.name}</strong><small>Liv. {item.minLevel} · IP {item.minPerformance}+</small><small>{item.description}</small><small>Reputazione {item.reputation} · {item.wins} vittorie</small></button>)}</nav>
      {zone&&!zone.unlocked&&<section className="street-locked"><h2>{zone.name} · per accedere ti manca:</h2><ul>{zone.reasons.map(reason=><li key={reason}>{reason}</li>)}</ul></section>}
      <Link className="street-button" to="/tracks">Atlante del club · piste e strade</Link>
    </>:<>
      <button type="button" className="street-button" disabled={pending>0} onClick={()=>{setStage('locations');setZoneId(null);setError('');}}>← Cambia luogo</button>
      <section className="street-zone-intro" aria-label="Scegli l’avversario"><p className="street-small">{zone.rivalCount} piloti abituali · reputazione locale {zone.reputation}</p>
        {zone.offer?<EncounterCard key={zone.offer.id} offer={zone.offer} zone={zone} userId={userId} money={money} onNext={()=>encounter()} onStarted={onStarted} onError={setError}/>:pending>0?<p role="status">Stai arrivando al ritrovo…</p>:<button className="street-button street-button-primary" onClick={()=>encounter(zone,false)}>Incontra un rivale</button>}
      </section>
      <p className="street-small">Cercare un rivale è gratuito. Incontrerai tutti i piloti disponibili prima che la selezione ricominci.</p>
    </>}
  </div>;
}
