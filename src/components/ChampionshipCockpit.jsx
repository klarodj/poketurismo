import {conditionLabel} from '../logic/racePresentation';
import PerformanceBadge from './PerformanceBadge';
import {sectionFeatures} from '../../shared/raceContext.mjs';
import FuelGauge from './FuelGauge';
import React, {useEffect, useRef, useState} from 'react';
import GridRaceTiming, {GridRaceSnapshot, GridSectorSummary} from './GridRaceTiming';
import TrackIllustration from './TrackIllustration';
import TrackPreview from './TrackPreview';
import RaceCarArtwork from './RaceCarArtwork';
import RaceDetailDialog from './RaceDetailDialog';
import {CarDetail, SectorDetail, RaceHistory} from './RaceDetails';
import {trackSectionLabel} from '../../shared/trackSectionLabels.mjs';
import {DEMO_TRACK} from '../../shared/trackGeometry.mjs';
import {routeProfileFor} from '../../shared/raceContext.mjs';

function CarPreview({car,pilot,label,driver,onClick,player=false,relation}) {
 return <button type="button" className={`championship-entry-card${player?' is-player':' is-rival'}`} onClick={onClick} aria-label={`Apri dettaglio: ${player?'La tua auto':'Auto del rivale tattico'}`}>
  <span className="championship-entry-label">{label} <span aria-hidden="true">↗</span></span>
  <RaceCarArtwork car={car}/>
  <strong className="championship-entry-model">{car.name}</strong>
  <span className="championship-entry-indices"><PerformanceBadge car={car}/><PerformanceBadge kind="IG" pilot={pilot}/></span>
  {player?<span className="championship-entry-condition"><span className="championship-entry-fuel">Benzina <b>{Number(car.currentFuel||0).toFixed(1)} L</b><FuelGauge currentFuel={car.currentFuel} compact/></span><span>Gomme <b>{Math.round(car.tireGrip??100)}%</b> · Motore <b>{Math.round(car.engineHealth??100)}%</b></span></span>:<span className="championship-entry-driver"><b>{driver}</b><span>{relation}</span></span>}
 </button>;
}
function SectorBrief({race,onDetail}) {
 const section=race.sections[race.index],next=race.sections[race.index+1];
 const features=sectionFeatures(section,next,race.routeProfile),corners=(section.segments||[]).filter(s=>s.radiusM>0),distance=(section.segments||[]).reduce((sum,s)=>sum+s.lengthM,0);
 const shape=!section.segments?'Caratteristiche nel dettaglio tecnico':corners.length?Math.min(...corners.map(s=>s.radiusM))<=40?'Curve lente e rilancio':'Curve e tratti veloci':'Rettilineo';
 return <section className="championship-sector-brief" aria-label="Settore da affrontare"><header><h2>Settore da affrontare</h2><button type="button" className="race-text-button" onClick={onDetail}>Dati tecnici ↗</button></header><strong>{trackSectionLabel(section.name)}</strong><p>{section.segments?`${Math.round(distance)} m · `:''}{shape}</p>{section.segments&&<p>{features.hasBrakingZone?features.brakingAhead?'Staccata in fondo al rettilineo.':'Frenata e traiettoria contano nel prossimo tratto.':'Tratto senza staccate.'} {features.passingSpace?'Spazio per un attacco, se sei a contatto.':'Poco spazio per superare.'}</p>}<small>{next?`Poi: ${trackSectionLabel(next.name)}`:'Poi: traguardo'}</small></section>;
}

export default function ChampionshipCockpit({race, pending, onAbandon, children}) {
  const [detail, setDetail] = useState(null);
  const timingRef = useRef(null);
  const resultRef = useRef(null);
  const previous = useRef({id:race.id, index:race.index});
  const active = race.status === 'active';
  const section = race.sections[race.index];
  const paths = race.trackMap || (race.demo ? DEMO_TRACK.mapPaths : null);
  const featured = race.gridTiming?.rows.find(row => row.id === (race.gridTacticsVersion===1?race.tacticalRivalId:race.gridOpponentId));
  const hasRival=race.gridTacticsVersion!==1||!!race.tacticalRivalId;
  const relation=race.gapSeconds>0.01?'Dietro di te':race.gapSeconds<-.01?'Davanti a te':'Affiancato';
  const hasAlerts=!!race.incidentCue||race.car.currentFuel<2||race.car.tireGrip<45||race.car.engineHealth<30||/rain|piogg|wet|bagn|snow|neve/.test(race.environment.weather.toLowerCase());
  const titles = {player:'La tua auto e il pilota', sector:'Settore da affrontare', track:'Pista e condizioni', timing:'Classifica e rilevamenti', history:'Cronaca della gara', opponent:'Confronto tattico', session:'Sessione e opzioni'};
  useEffect(() => {
    const advanced = previous.current.id === race.id && race.index > previous.current.index;
    previous.current = {id:race.id, index:race.index};
    if (!advanced || detail || !window.matchMedia('(max-width: 620px)').matches) return;
    const target = active ? timingRef.current : resultRef.current;
    const frame = requestAnimationFrame(() => {
      target?.focus({preventScroll:true});
      target?.scrollIntoView({block:'start', behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
    });
    return () => cancelAnimationFrame(frame);
  }, [race.id, race.index, active, detail]);
  return <div className="race-dashboard championship-cockpit">
    <header className="race-heading">
      <div><p className="race-eyebrow">Campionato</p><h1>{race.trackName}</h1></div>
      <div className="race-heading-meta"><strong>{active ? `Settore ${race.index + 1}/${race.sections.length}` : 'Gara conclusa'}</strong><span>{conditionLabel(race.environment.weather)} · {conditionLabel(race.environment.surface)}</span></div>
    </header>
    <section className="championship-route" aria-label="Mappa e ambientazione durante la gara">
      <TrackIllustration name={race.trackName} sections={race.sections} index={race.index} paths={paths} cockpit/>
    </section>
    <section className="championship-cars" aria-label="La tua auto e il rivale tattico">
      <CarPreview player car={race.car} pilot={race.pilot} label="La tua auto" onClick={()=>setDetail('player')}/>
      {hasRival?<CarPreview car={race.opponent.car} pilot={race.opponent.pilot} label={race.tacticalRivalChanged?'Nuovo rivale tattico':'Rivale tattico'} driver={race.opponent.name} relation={`${featured?.position?`${featured.position}° · `:''}${relation}`} onClick={()=>setDetail('opponent')}/>:<div className="championship-entry-card championship-entry-empty"><strong>Pista libera</strong><p>Gli altri piloti si sono ritirati. Nessun rivale tattico.</p></div>}
    </section>
    {active && <div ref={timingRef} tabIndex={-1} className="championship-checkpoint"><GridRaceSnapshot timing={race.gridTiming}/></div>}
    {active && section && <SectorBrief race={race} onDetail={()=>setDetail('sector')}/>}
    {active && hasAlerts && <div className="race-alerts" aria-label="Avvisi di gara">
      {race.incidentCue && <p role="status">⚠ {race.incidentCue.description} «Conserva» lascia più margine.</p>}
      {race.car.currentFuel < 2 && <p role="status">Carburante basso: {race.car.currentFuel.toFixed(2)} L rimasti.</p>}
      {race.car.tireGrip < 45 && <p role="status">Gomme usurate: {race.car.tireGrip.toFixed(1)}%. Lascia più margine.</p>}
      {race.car.engineHealth < 30 && <p role="status">Motore compromesso: {race.car.engineHealth.toFixed(1)}%.</p>}
      {/rain|piogg|wet|bagn|snow|neve/.test(race.environment.weather.toLowerCase()) && <p role="status">Aderenza ridotta: guida con prudenza.</p>}
    </div>}
    <div className="race-action-area" ref={resultRef} tabIndex={-1}>{children}</div>
    <nav className="championship-tools" aria-label="Dettagli del campionato">
      <button type="button" className="race-button" onClick={() => setDetail('timing')}>Classifica e settori</button>
      <button type="button" className="race-button" onClick={() => setDetail('history')}>Cronaca</button>
      <button type="button" className="race-button" onClick={() => setDetail('track')}>Pista e meteo</button>
    </nav>
    <footer className="race-session-bar"><span>{active ? 'Nessun timer · puoi riprendere la gara' : 'Risultato salvato'}</span><button type="button" onClick={() => setDetail('session')}>Opzioni ↗</button></footer>
    {detail && <RaceDetailDialog title={titles[detail]} onClose={() => setDetail(null)}>
      {detail === 'player' && <CarDetail car={race.car} pilot={race.pilot} name="Tu"/>}
      {detail === 'sector' && <SectorDetail race={race}/>}
      {detail === 'track' && <><p>{conditionLabel(race.environment.weather)} · {conditionLabel(race.environment.surface)} · {race.distanceKm.toFixed(2)} km</p><TrackPreview trackName={race.trackName} sections={race.sections} paths={paths} index={race.index} profile={race.routeProfile || routeProfileFor(race.mode)}/></>}
      {detail === 'timing' && <div className="space-y-3"><GridRaceTiming timing={race.gridTiming}/><h3 className="font-bold">Posizione e distacchi per settore</h3>{race.logs.length ? <ol className="grid-sector-history">{race.logs.map((log, i) => <li key={i}><strong>Settore {i + 1} · {trackSectionLabel(log.section)}</strong>{log.gridTiming ? <GridSectorSummary timing={log.gridTiming}/> : <p>Rilevamento non registrato nel vecchio salvataggio.</p>}</li>)}</ol> : <p>Il primo rilevamento arriva alla fine del primo settore.</p>}</div>}
      {detail === 'history' && <RaceHistory race={race}/>}
      {detail === 'opponent' && <><p className="championship-tactical-note">{race.opponent.name}{featured?.position ? ` · ${featured.position}° posto` : ''} {race.gridTacticsVersion===1?'è il pilota in corsa più vicino al precedente rilevamento, davanti o dietro di te. Il confronto cambia soltanto dopo un settore completato.':'è il rivale delle manovre tattiche di questa gara precedente.'}</p><CarDetail car={race.opponent.car} pilot={race.opponent.pilot} name={race.opponent.name}/></>}
      {detail === 'session' && <div className="space-y-4"><p>Puoi uscire dalla pagina e riprendere la sessione. Durante la gara le modifiche a pilota e vetture sono bloccate. I premi sono assegnati secondo il contratto del campionato.</p>{active && <button type="button" className="race-button race-abandon" disabled={pending > 0} onClick={() => {setDetail(null); onAbandon();}}>Abbandona gara</button>}</div>}
    </RaceDetailDialog>}
  </div>;
}
