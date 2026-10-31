import {conditionLabel,formatRaceTime,isSoloRace,ghostCheckpoint} from '../logic/racePresentation';
import StreetRivalPortrait from './StreetRivalPortrait';
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
import {RaceTiming} from './RaceTiming';
import {trackVisual,TRACK_SECTOR_COLORS} from '../../shared/trackVisuals.mjs';

function CarPreview({car,pilot,label,driver,avatar,onClick,player=false,relation,opponentLabel='Auto rivale'}) {
 return <button type="button" className={`championship-entry-card${player?' is-player':' is-rival'}`} onClick={onClick} aria-label={`Apri dettaglio: ${player?'La tua auto':opponentLabel}`}>
  <span className="championship-entry-label">{label} <span aria-hidden="true">↗</span></span>
  <RaceCarArtwork car={car}/>
  <strong className="championship-entry-model">{car.name}</strong>
  <span className="championship-entry-indices"><PerformanceBadge car={car}/><PerformanceBadge kind="IG" pilot={pilot}/></span>
  {player?<span className="championship-entry-condition"><span className="championship-entry-fuel">Benzina <b>{Number(car.currentFuel||0).toFixed(1)} L</b><FuelGauge currentFuel={car.currentFuel} compact/></span><span>Gomme <b>{Math.round(car.tireGrip??100)}%</b> · Motore <b>{Math.round(car.engineHealth??100)}%</b></span></span>:<span className="championship-entry-driver"><span className="street-rival-name"><StreetRivalPortrait compact avatar={avatar} name={driver}/><b>{driver}</b></span><span>{relation}</span></span>}
 </button>;
}
function SectorBrief({race,onDetail}) {
 const section=race.sections[race.index],next=race.sections[race.index+1];
 const features=sectionFeatures(section,next,race.routeProfile),corners=(section.segments||[]).filter(s=>s.radiusM>0),distance=(section.segments||[]).reduce((sum,s)=>sum+s.lengthM,0);
 const shape=!section.segments?'Caratteristiche nel dettaglio tecnico':corners.length?Math.min(...corners.map(s=>s.radiusM))<=40?'Curve lente e rilancio':'Curve e tratti veloci':'Rettilineo';
 return <section className="championship-sector-brief" aria-label="Settore da affrontare"><header><h2>Settore da affrontare</h2><button type="button" className="race-text-button" onClick={onDetail}>Dati tecnici ↗</button></header><strong>{trackSectionLabel(section.name)}</strong><p>{section.segments?`${Math.round(distance)} m · `:''}{shape}</p>{section.segments&&<p>{features.hasBrakingZone?features.brakingAhead?'Staccata in fondo al rettilineo.':'Frenata e traiettoria contano nel prossimo tratto.':'Tratto senza staccate.'} {!isSoloRace(race)&&!race.opponentFailure&&(features.passingSpace?'Spazio per un attacco, se sei a contatto.':'Poco spazio per superare.')}</p>}<small>{next?`Poi: ${trackSectionLabel(next.name)}`:'Poi: traguardo'}</small></section>;
}

function SessionRoute({race,paths}) {
 if(trackVisual(race.trackName)||paths?.length)return <TrackIllustration name={race.trackName} sections={race.sections} index={race.index} paths={paths} cockpit/>;
 // A course or custom route has no geographic map: show its actual exercise order.
 return <div className="track-art track-art-cockpit"><figure className="track-art-scene"><img src={race.lesson?'/images/world/sections/school-training.png':race.mode==='street'?'/images/world/street.png':'/images/world/track.png'} alt={race.lesson?'Piazzale di esercitazione della scuola guida':'Percorso personalizzato del club'} width="320" height="180"/></figure><figure className="track-art-map"><ol className="race-course-roadbook" aria-label={race.lesson?'Sequenza degli esercizi':'Sequenza dei settori'}>{race.sections.map((section,i)=><li key={section.id||i} aria-current={i===race.index?'step':undefined} title={trackSectionLabel(section.name)} style={{borderBottomColor:TRACK_SECTOR_COLORS[i%8]}}>{i+1}</li>)}</ol><figcaption>{race.lesson?'Sequenza degli esercizi':'Schema dei settori · non in scala'}</figcaption></figure></div>;
}

function SessionSnapshot({race}) {
 const solo=isSoloRace(race),tactical=race.rulesVersion===3,gap=tactical?race.gapSeconds||0:race.gap||0,epsilon=tactical ? 0.01 : 0;
 const last=race.logs.at(-1),ghost=ghostCheckpoint(race);
 const position=race.failure?'Ritirato':!race.index?'Al via':race.opponentFailure?'1° / 2':Math.abs(gap)<=epsilon?'Affiancati':gap>0?'1° / 2':'2° / 2';
 return <section className="grid-race-snapshot race-session-snapshot" aria-label={solo?'Cronometro della prova':'Posizione e distacco'} aria-live="polite" aria-atomic="true">
  <header><strong className="grid-snapshot-position">{solo?formatRaceTime(race.playerTime):position}</strong><span>{solo?'Il tuo tempo':tactical?<>Tempo <b>{formatRaceTime(race.playerTime)}</b></>:'Duello a distanza'}<small>{race.index?`Dopo il settore ${race.index}`:'In attesa del via'}</small></span></header>
  {!solo&&race.index>0&&<p className="race-checkpoint-line">{race.opponentFailure?'Il rivale si è ritirato.':race.failure?'Distacco all’ultimo rilevamento: ':Math.abs(gap)<=epsilon?'Siete affiancati.':gap>0?'Vantaggio: ':'Ritardo: '}{!race.opponentFailure&&Math.abs(gap)>epsilon&&<strong>{Math.abs(gap).toFixed(tactical?3:0)} {tactical?'s':'m'}</strong>}</p>}
  {solo&&Number.isFinite(last?.playerSeconds)&&<p className="race-checkpoint-line">Ultimo settore: <strong>{formatRaceTime(last.playerSeconds)}</strong></p>}
  {race.meetTrial&&<p className="race-checkpoint-line">{ghost===null?race.meetGhost?'Confronto col fantasma al prossimo rilevamento.':'Il tuo tempo sarà il primo riferimento.':Math.abs(ghost)<=10?'Stesso tempo del fantasma al rilevamento.':<>{ghost>0?'Vantaggio sul fantasma: ':'Ritardo dal fantasma: '}<strong>{(Math.abs(ghost)/1000).toFixed(3)} s</strong></>}</p>}
 </section>;
}
function TimingDetail({race}) {
 if(isSoloRace(race))return <div className="space-y-3"><p><strong>Tempo personale: {formatRaceTime(race.playerTime)}</strong></p>{race.meetGhost&&<p>Tempo completo del fantasma: {formatRaceTime(race.meetGhost.totalMs/1000)}. Il confronto riguarda solo i rilevamenti già completati.</p>}<table className="race-table"><thead><tr><th>Settore</th><th>Il tuo tempo</th>{race.meetGhost&&<th>Fantasma</th>}</tr></thead><tbody>{race.logs.map((log,i)=><tr key={i}><td>{trackSectionLabel(log.section)}</td><td>{Number.isFinite(log.playerSeconds)?log.playerSeconds.toFixed(3)+' s':'—'}</td>{race.meetGhost&&<td>{Number.isFinite(race.meetGhost.splits[i])?(race.meetGhost.splits[i]/1000).toFixed(3)+' s':'—'}</td>}</tr>)}</tbody></table>{!race.logs.length&&<p>Il primo rilevamento arriva alla fine del primo settore.</p>}</div>;
 if(race.rulesVersion!==3)return <p>Distacco all’ultimo rilevamento: {Math.abs(race.gap||0)} m · {race.gap>0?'eri davanti':race.gap<0?'eri dietro':'affiancati'}.</p>;
 return <div className="space-y-3"><RaceTiming race={race}/><div className="overflow-x-auto"><table className="race-table"><caption>Tempi per settore · secondi</caption><thead><tr><th>Settore</th><th>Tu</th><th>Rivale</th><th>Guadagno</th></tr></thead><tbody>{race.logs.map((log,i)=><tr key={i}><td>{trackSectionLabel(log.section)}</td><td>{log.playerSeconds?.toFixed(3)??'—'}</td><td>{log.opponentSeconds?.toFixed(3)??'—'}</td><td>{(log.deltaSeconds||0)>0?'+':''}{(log.deltaSeconds||0).toFixed(3)}</td></tr>)}</tbody></table></div><p>Guadagno positivo: tempo recuperato sul rivale. Il distacco totale deriva dai tempi cumulati.</p></div>;
}
function sessionDescription(race) {
 if(race.clubEvent)return 'Evento del club: regolamento e premi congelati alla partenza. Consumi e usura reali. Nessuna pratica aggiuntiva; premi ridotti dopo le prime partecipazioni.';
 if(race.meetTrial)return `Scadenza del tentativo: ${new Date(race.meetChallenge.expiresAt).toLocaleString('it-IT',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}. Unico tentativo asincrono: nessun premio o XP, nessun consumo o usura sulla vettura di carriera. Il tempo viene salvato nella sfida del Meet, separato dai record personali.`;
 if(race.targetedCourseId)return 'Allenamento su auto scuola in prestito: migliori la pratica dell’abilità indicata, secondo esercizi corretti e rendimento del corso. Nessun XP o usura sulla tua vettura.';
 if(race.storyCampaign?.id.startsWith('club-rematch-'))return 'Confronto facoltativo del club: nessun denaro, XP o pratica delle abilità. Conta per i rapporti e la reputazione, entro i tre confronti della serie. Il prestito non consuma la tua auto; con la tua vettura carburante e usura sono reali.';
 if(race.storyCampaign)return race.storyCampaign.loan?'Prova narrativa su vettura del club: nessun consumo o usura sulla tua auto, nessun XP aggiuntivo. Il premio unico arriva solo alla fine della storia.':'Prova narrativa con la tua auto: carburante e usura reali, nessuna puntata o XP aggiuntivo. Il premio unico arriva alla fine della storia.';
 if(race.lesson)return 'Prova su auto scuola in prestito: la tua vettura rimane invariata. Promozione, tecnica e premi seguono il corso; ripetere una prova già superata non concede di nuovo il premio.';
 if(race.timeTrial)return 'Prova a tempo personale: nessun premio o XP. Un tempo valido entra nel registro personale. Consumi e usura sono reali.';
 if(race.championship)return 'I premi e i risultati seguono il contratto del campionato accettato all’iscrizione.';
 if(race.sandbox)return 'Allenamento senza premi economici o XP. Carburante e usura vengono salvati.';
 if(race.street&&race.wager===0)return 'Sfida senza puntata: nessun premio in denaro; esperienza e reputazione seguono il confronto e i precedenti.';
 if(race.wager>0)return `Quota versata: €${race.wager}. Abbandonando perdi la quota. Consumi e usura sono reali.`;
 return 'La gara assegna i premi previsti alla conclusione. Consumi e usura sono reali.';
}

export default function RaceCockpit({race, pending, onAbandon, children}) {
  const [detail, setDetail] = useState(null);
  const timingRef = useRef(null);
  const resultRef = useRef(null);
  const previous = useRef({id:race.id, index:race.index});
  const active = race.status === 'active';
  const grid=!!race.gridOpponentId||race.championship?.format==='grid';
  const solo=isSoloRace(race);
  const tactical=race.rulesVersion===3;
  const section = race.sections[race.index];
  const paths = race.trackMap || (race.demo ? DEMO_TRACK.mapPaths : null);
  const featured = race.gridTiming?.rows?.find(row => row.id === (race.gridTacticsVersion===1?race.tacticalRivalId:race.gridOpponentId));
  const hasRival=!!race.opponent&&!solo;
  const rivalRetired=!!race.opponentFailure;
  const opponentLabel=grid?'Auto del rivale tattico':'Auto rivale';
  const heading=race.clubEvent?`Eventi del club · ${race.clubEvent.title}`:race.storyCampaign?'Storia del club':grid?'Campionato':race.meetTrial?'Meet · Sfida asincrona':race.targetedCourseId?'Scuola guida · Allenamento':race.lesson?'Scuola guida · Prova pratica':race.timeTrial?'Prova a tempo personale':race.mode==='street'?'Sfida su strada':'Autodromo · Gara singola';
  const gap=tactical?race.gapSeconds||0:race.gap||0;
  const relation=rivalRetired?'Ritirato':gap>(tactical ? 0.01 : 0)?'Dietro di te':gap<-(tactical ? 0.01 : 0)?'Davanti a te':'Affiancato';
  const hasAlerts=!!race.incidentCue||race.car.currentFuel<2||race.car.tireGrip<45||race.car.engineHealth<30||/rain|piogg|wet|bagn|snow|neve/.test(race.environment.weather.toLowerCase());
  const titles = {player:'La tua auto e il pilota', sector:'Settore da affrontare', track:'Pista e condizioni', timing:grid?'Classifica e rilevamenti':'Tempi e rilevamenti', history:'Cronaca della gara', opponent:grid?'Confronto tattico':'Auto e pilota del rivale', session:'Sessione e opzioni'};
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
      <div><p className="race-eyebrow">{heading}{race.street?` · ${race.street.zoneName}`:!race.clubEvent&&!race.lesson&&!race.meetTrial&&race.sandbox?' · Allenamento':''}</p><h1>{race.trackName}</h1></div>
      <div className="race-heading-meta"><strong>{active ? `Settore ${race.index + 1}/${race.sections.length}` : 'Gara conclusa'}</strong><span>{conditionLabel(race.environment.weather)} · {conditionLabel(race.environment.surface)}</span></div>
    </header>
    <section className="championship-route" aria-label="Mappa e ambientazione durante la gara">
      <SessionRoute race={race} paths={paths}/>
    </section>
    <section className="championship-cars" aria-label={hasRival?grid?"La tua auto e il rivale tattico":"La tua auto e il rivale":"La tua auto e la sessione"}>
      <CarPreview player car={race.car} pilot={race.pilot} label="La tua auto" onClick={()=>setDetail('player')}/>
      {hasRival?<CarPreview car={race.opponent.car} pilot={race.opponent.pilot} opponentLabel={opponentLabel} label={grid?race.tacticalRivalChanged?'Nuovo rivale tattico':'Rivale tattico':'Auto rivale'} driver={race.opponent.name} avatar={race.opponent.avatar} relation={`${featured?.position?`${featured.position}° · `:''}${relation}`} onClick={()=>setDetail('opponent')}/>:<div className="championship-entry-card championship-entry-empty race-solo-card"><strong>{race.clubEvent?.regularity?'Roadbook del club':grid?'Pista libera':race.meetTrial?'Fantasma cronometrico':race.lesson?'Auto scuola in prestito':'Contro il cronometro'}</strong>{race.clubEvent?.regularity&&<img src={race.clubEvent.image} alt="Posto di controllo del club" width="320" height="180" className="championship-cover"/>}<p>{race.clubEvent?.regularity?'Guida precisa e passaggio al momento giusto.':grid?'Gli altri piloti si sono ritirati. Nessun rivale tattico.':race.meetTrial?race.meetChallenge.otherName:race.lesson?'Conta eseguire la consegna dell’istruttore.':'Il tuo giro, settore dopo settore.'}</p>{race.meetTrial&&<p>{race.meetGhost?`Tempo da battere: ${formatRaceTime(race.meetGhost.totalMs/1000)}`:'L’altro pilota non ha ancora un tempo valido.'}</p>}</div>}
    </section>
    {(active||!grid)&&<div ref={timingRef} tabIndex={-1} className="championship-checkpoint">{grid?<GridRaceSnapshot timing={race.gridTiming}/>:<SessionSnapshot race={race}/>}</div>}
    {active && section && <SectorBrief race={race} onDetail={()=>setDetail('sector')}/>}
    {active && hasAlerts && <div className="race-alerts" aria-label="Avvisi di gara">
      {race.incidentCue && <p role="status">⚠ {race.incidentCue.description} «Conserva» lascia più margine.</p>}
      {race.car.currentFuel < 2 && <p role="status">Carburante basso: {race.car.currentFuel.toFixed(2)} L rimasti.</p>}
      {race.car.tireGrip < 45 && <p role="status">Gomme usurate: {race.car.tireGrip.toFixed(1)}%. Lascia più margine.</p>}
      {race.car.engineHealth < 30 && <p role="status">Motore compromesso: {race.car.engineHealth.toFixed(1)}%.</p>}
      {/rain|piogg|wet|bagn|snow|neve/.test(race.environment.weather.toLowerCase()) && <p role="status">Aderenza ridotta: guida con prudenza.</p>}
    </div>}
    {race.lesson&&active&&race.logs.at(-1)?.instructor&&<p className="race-inline-warning"><strong>Istruttore:</strong> {race.logs.at(-1).instructor.message}</p>}
    <div className="race-action-area" ref={resultRef} tabIndex={-1}>{children}</div>
    <nav className="championship-tools" aria-label={grid?"Dettagli del campionato":"Dettagli della gara"}>
      <button type="button" className="race-button" onClick={() => setDetail('timing')}>{grid?'Classifica e settori':'Tempi e settori'}</button>
      <button type="button" className="race-button" onClick={() => setDetail('history')}>Cronaca</button>
      <button type="button" className="race-button" onClick={() => setDetail('track')}>Pista e meteo</button>
    </nav>
    <footer className="race-session-bar"><span>{active ? race.meetTrial?'Tentativo unico · scadenza della sfida nelle opzioni':'Nessun timer · puoi riprendere la gara' : race.meetTrial?'Tentativo salvato nel Meet':'Risultato salvato'}</span><button type="button" onClick={() => setDetail('session')}>Opzioni ↗</button></footer>
    {detail && <RaceDetailDialog title={titles[detail]} onClose={() => setDetail(null)}>
      {detail === 'player' && <CarDetail car={race.car} pilot={race.pilot} name="Tu"/>}
      {detail === 'sector' && <SectorDetail race={race}/>}
      {detail === 'track' && <><p>{conditionLabel(race.environment.weather)} · {conditionLabel(race.environment.surface)} · {race.distanceKm.toFixed(2)} km</p>{tactical?<TrackPreview trackName={race.trackName} sections={race.sections} paths={paths} index={race.index} profile={race.routeProfile || routeProfileFor(race.mode)}/>:<ol>{race.sections.map((s,i)=><li key={i}>{trackSectionLabel(s.name)}</li>)}</ol>}</>}
      {detail === 'timing' && (grid?<div className="space-y-3"><GridRaceTiming timing={race.gridTiming}/><h3 className="font-bold">Posizione e distacchi per settore</h3>{race.logs.length ? <ol className="grid-sector-history">{race.logs.map((log, i) => <li key={i}><strong>Settore {i + 1} · {trackSectionLabel(log.section)}</strong>{log.gridTiming ? <GridSectorSummary timing={log.gridTiming}/> : <p>Rilevamento non registrato nel vecchio salvataggio.</p>}</li>)}</ol> : <p>Il primo rilevamento arriva alla fine del primo settore.</p>}</div>:<TimingDetail race={race}/>)}
      {detail === 'history' && <RaceHistory race={race}/>}
      {detail === 'opponent' && hasRival && <>{grid&&<p className="championship-tactical-note">{race.opponent.name}{featured?.position ? ` · ${featured.position}° posto` : ''} {race.gridTacticsVersion===1?'è il pilota in corsa più vicino al precedente rilevamento, davanti o dietro di te. Il confronto cambia soltanto dopo un settore completato.':'è il rivale delle manovre tattiche di questa gara precedente.'}</p>}<CarDetail car={race.opponent.car} pilot={race.opponent.pilot} name={race.opponent.name}/></>}
      {detail === 'session' && <div className="space-y-4"><p>Puoi uscire dalla pagina e riprendere la sessione. Durante la gara le modifiche a pilota e vetture sono bloccate.</p><p>{sessionDescription(race)}</p>{active && <button type="button" className="race-button race-abandon" disabled={pending > 0} onClick={() => {setDetail(null); onAbandon();}}>Abbandona gara</button>}</div>}
    </RaceDetailDialog>}
  </div>;
}
