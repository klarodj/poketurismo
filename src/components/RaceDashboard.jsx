import PerformanceBadge from './PerformanceBadge';
import FuelGauge from './FuelGauge';
import ChampionshipCockpit from './ChampionshipCockpit';
import TrackIllustration from './TrackIllustration';
import {trackVisual} from '../../shared/trackVisuals.mjs';
import {trackSectionLabel} from '../../shared/trackSectionLabels.mjs';
import React, { useState } from 'react';
import RaceCarArtwork from './RaceCarArtwork';
import RaceDetailDialog from './RaceDetailDialog';
import TrackPreview from './TrackPreview';
import { CarDetail, SectorDetail, RaceHistory } from './RaceDetails';
import { RaceTiming } from './RaceTiming';
import { formatRaceTime, conditionLabel } from '../logic/racePresentation';
import { DEMO_TRACK } from '../../shared/trackGeometry.mjs';
import { routeProfileFor } from '../../shared/raceContext.mjs';

function CarCard({ car, label, pilot, abilities, rival, onClick }) {
  const brand = typeof car.brand === 'string' ? car.brand : car.brand?.name;
  return <button type="button" className={`race-car-card ${rival ? 'race-car-rival' : ''}`} onClick={onClick} aria-label={`Apri dettaglio: ${label}`}>
    <span className="race-eyebrow">{label} <span aria-hidden="true">↗</span></span>
    <RaceCarArtwork car={car} />
    <span className="race-car-name">{brand} {car.name}</span>
    <span><PerformanceBadge car={car}/><PerformanceBadge kind="IG" pilot={abilities}/></span>
    <span className="race-car-spec">{car.cv} CV · {car.kg} kg</span>
    <span className="race-car-status"><span>{Number(car.currentFuel || 0).toFixed(1)} L{!rival&&<FuelGauge currentFuel={car.currentFuel} compact/>}</span><span>Gomme {Math.round(car.tireGrip ?? 100)}%</span></span>
    {rival && <span className="race-car-spec">{pilot}</span>}
  </button>;
}
function TimingDetail({ race }) {
  if((race.timeTrial||race.meetTrial))return <div className="space-y-3"><p className="font-bold">Tempo personale: {formatRaceTime(race.playerTime)}</p><table className="race-table"><thead><tr><th>Settore</th><th>Tempo</th></tr></thead><tbody>{race.logs.map((log,index)=><tr key={index}><td>{trackSectionLabel(log.section)}</td><td>{log.playerSeconds?.toFixed(3) ?? '—'} s</td></tr>)}</tbody></table></div>;
  return <div className="space-y-4">
    <RaceTiming race={race} />
    <div className="overflow-x-auto"><table className="race-table"><caption>Tempi per settore · secondi</caption><thead><tr><th>Settore</th><th>Tu</th><th>Rivale</th><th>Guadagno</th></tr></thead><tbody>{race.logs.map((log, i) => <tr key={i}><td>{trackSectionLabel(log.section)}</td><td>{log.playerSeconds?.toFixed(3) ?? '—'}</td><td>{log.opponentSeconds?.toFixed(3) ?? '—'}</td><td>{(log.deltaSeconds || 0) > 0 ? '+' : ''}{(log.deltaSeconds || 0).toFixed(3)}</td></tr>)}</tbody></table></div>
    {!race.logs.length && <p>Il confronto si aggiornerà dopo il primo settore.</p>}
    <p className="text-sm">Un guadagno positivo indica tempo recuperato sul rivale; il distacco totale deriva dai tempi cumulati.</p>
  </div>;
}
export default function RaceDashboard({ race, pending, onAbandon, children }) {
  const [detail, setDetail] = useState(null);
  const grid=!!race.gridOpponentId||race.championship?.format==='grid';
  if (grid) return <ChampionshipCockpit race={race} pending={pending} onAbandon={onAbandon}>{children}</ChampionshipCockpit>;
  const tactical = race.rulesVersion === 3;
  const active = race.status === 'active';
  const section = race.sections[race.index];
  const next = race.sections[race.index + 1];
  const last = race.logs.at(-1);
  const gap = tactical ? race.gapSeconds || 0 : race.gap;
  const level = tactical ? 0.01 : 0;
  const position = gap > level ? 'Sei davanti' : gap < -level ? 'Sei dietro' : 'Affiancati';
  const titles = { player: 'La tua auto e il pilota', opponent: 'Avversario · auto e pilota', track: 'Pista e condizioni', sector: 'Dettaglio del settore', timing: 'Tempi e confronto', history: 'Cronologia della gara', session: 'Sessione di gara' };
  return <div className="race-dashboard">
    <header className="race-heading"><div><p className="race-eyebrow">{race.meetTrial ? 'Meet · Sfida asincrona' : race.lesson ? 'Scuola guida · Prova pratica' : (race.timeTrial||race.meetTrial) ? 'Prova a tempo personale' : race.mode === 'street' ? 'Sfida su strada' : 'Autodromo'}{race.meetTrial ? '' : race.sandbox ? ' · Allenamento' : race.street ? ` · ${race.street.zoneName}` : ''}</p><h1>{race.trackName}</h1></div><div className="race-heading-meta"><span>{conditionLabel(race.environment.weather)} · {conditionLabel(race.environment.surface)}</span><strong>{active ? `Settore ${race.index + 1}/${race.sections.length}` : 'Gara conclusa'}</strong></div></header>
    {race.meetTrial&&<p className="p-3 border bg-blue-50">Unico tentativo contro {race.meetChallenge.otherName}. Condizioni della carriera invariate; nessun premio o XP. {race.meetGhost?`Fantasma disponibile: tempo da battere ${formatRaceTime(race.meetGhost.totalMs/1000)}.${race.index>0?` Distacco al settore: ${((race.meetGhost.splits.slice(0,race.index).reduce((sum,t)=>sum+t,0)-race.playerTime*1000)/1000).toFixed(3)} s (positivo: sei davanti).`:''}`:'L’altro pilota non ha ancora completato un giro valido. Il tuo tempo sarà il riferimento.'}</p>}
    {tactical&&(trackVisual(race.trackName)||race.demo)&&<section className="race-route-live" aria-label="Mappa e ambientazione durante la gara">
      <header><h2>Il percorso · {race.sections.length} settori</h2><button type="button" className="win98-btn" onClick={()=>setDetail('track')}>Esamina tutti i settori</button></header>
      <TrackIllustration name={race.trackName} sections={race.sections} paths={race.trackMap||(race.demo?DEMO_TRACK.mapPaths:null)} index={race.index} compact/>
      <p className="race-route-current" aria-live="polite">{section?`Ora: ${trackSectionLabel(section.name)}${next?` · Poi: ${trackSectionLabel(next.name)}`:' · Poi: traguardo'}`:'Traguardo raggiunto'}</p>
    </section>}
    <section className={`race-stage ${race.mode === 'street' ? 'race-stage-street' : ''} ${(race.timeTrial||race.meetTrial) ? 'race-stage-trial' : ''}`} aria-label="Duello e posizione">
      <CarCard car={race.car} abilities={race.pilot} label="La tua auto" onClick={() => setDetail('player')} />
      <button type="button" className={`race-position ${gap < -level ? 'race-position-behind' : ''}`} onClick={() => setDetail('timing')} aria-label="Apri dettaglio: tempi e distacco">
        <span className="race-eyebrow">{(race.timeTrial||race.meetTrial) ? 'Tempo personale' : position}</span>
        <strong aria-live="polite">{(race.timeTrial||race.meetTrial) ? race.playerTime.toFixed(3) : Math.abs(gap).toFixed(tactical ? 3 : 0)} <small>{tactical ? 's' : 'm'}</small></strong>
        <span className="race-timing-mini">{tactical ? formatRaceTime(race.playerTime) : 'Sfida in corso'}</span>
        <span className="race-detail-link">Tempi e confronto ↗</span>
      </button>
      {!(race.timeTrial||race.meetTrial) && <CarCard car={race.opponent.car} abilities={race.opponent.pilot} label="Auto rivale" pilot={race.opponent.name} rival onClick={() => setDetail('opponent')} />}
    </section>
    <nav className="race-instruments" aria-label="Esplora i dettagli della gara">
      <button type="button" onClick={() => setDetail('track')}><span>Pista ↗</span><strong>{race.distanceKm.toFixed(2)} km</strong></button>
      <button type="button" onClick={() => setDetail('sector')}><span>{active ? 'Settore attuale ↗' : 'Percorso completato ↗'}</span><strong>{trackSectionLabel(section?.name) || 'Traguardo'}</strong><small>{section?.segments ? `${Math.round(section.segments.reduce((sum, segment) => sum + segment.lengthM, 0))} m · ` : ''}{next ? `Poi: ${trackSectionLabel(next.name)}` : active ? 'Poi: traguardo' : `${race.index}/${race.sections.length} settori percorsi`}</small></button>
      <button type="button" onClick={() => setDetail('history')}><span>Cronologia ↗</span><strong>{last ? trackSectionLabel(last.section) : 'In attesa del via'}</strong><small>{last && race.meetTrial ? `Il tuo settore: ${last.playerSeconds?.toFixed(3)||'—'} s` : last && tactical ? `${(last.deltaSeconds || 0) >= 0 ? 'Recuperati' : 'Persi'} ${Math.abs(last.deltaSeconds || 0).toFixed(2)} s nell’ultimo settore` : 'Scelte, consumi e avvenimenti'}</small></button>
    </nav>
    {active && <div className="race-alerts" aria-label="Avvisi di gara">
      {race.incidentCue && <p role="status">⚠ {race.incidentCue.description} Scegli «Conserva» per lasciare più margine.</p>}
      {race.car.currentFuel < 2 && <p role="status">Carburante basso: {race.car.currentFuel.toFixed(2)} L rimasti.</p>}
      {race.car.tireGrip < 45 && <p role="status">Gomme usurate: {race.car.tireGrip.toFixed(1)}%. Lascia più margine.</p>}
      {race.car.engineHealth < 30 && <p role="status">Motore compromesso: {race.car.engineHealth.toFixed(1)}%.</p>}
      {/rain|piogg|wet|bagn|snow|neve/.test(race.environment.weather.toLowerCase()) && <p role="status">Aderenza ridotta: valuta ritmo e frenata con prudenza.</p>}
    </div>}
    {race.lesson && last?.instructor && active && <p className="race-inline-warning"><strong>Istruttore:</strong> {last.instructor.message}</p>}
    <div className="race-action-area">{children}</div>
    <footer className="race-session-bar"><span>{active ? 'Scelte senza timer · puoi riprendere la sessione' : 'Risultato e condizioni della vettura salvati'}</span><button type="button" onClick={() => setDetail('session')}>Sessione e opzioni ↗</button></footer>
    {detail && <RaceDetailDialog title={titles[detail]} onClose={() => setDetail(null)}>
      {detail === 'player' && <CarDetail car={race.car} pilot={race.pilot} name="Tu" />}
      {detail === 'opponent' && <CarDetail car={race.opponent.car} pilot={race.opponent.pilot} name={race.opponent.name} />}
      {detail === 'track' && <div className="space-y-4"><p>{conditionLabel(race.environment.weather)} · {conditionLabel(race.environment.surface)} · {race.distanceKm.toFixed(2)} km</p>{tactical ? <TrackPreview trackName={race.trackName} sections={race.sections} paths={race.trackMap || (race.demo ? DEMO_TRACK.mapPaths : null)} index={race.index} profile={race.routeProfile || routeProfileFor(race.mode)} /> : <ol className="list-decimal pl-6">{race.sections.map((item, i) => <li key={i}>{trackSectionLabel(item.name)}</li>)}</ol>}</div>}
      {detail === 'sector' && <SectorDetail race={race} />}
      {detail === 'timing' && (tactical ? <TimingDetail race={race} /> : <p>{position} · {Math.abs(gap)} m</p>)}
      {detail === 'history' && <RaceHistory race={race} />}
      {detail === 'session' && <div className="space-y-4"><p>{race.lesson ? 'Prova su auto scuola in prestito. La tua auto rimane invariata. La prima promozione assegna pratica, tecnica e 40 XP; le ripetizioni non danno altri premi.' : (race.timeTrial||race.meetTrial) ? 'Prova a tempo: nessun premio o XP, il tempo valido viene conservato tra i record personali. Consumi e usura vengono salvati.' : race.sandbox ? 'Allenamento senza premi economici o XP. Carburante e usura vengono salvati.' : race.street && race.wager === 0 ? 'Sfida senza puntata: nessun premio in denaro, esperienza e reputazione secondo il confronto e i precedenti.' : race.wager > 0 ? `Quota versata: €${race.wager}. Abbandonando la gara perdi la quota.` : 'La gara assegna i premi previsti alla conclusione.'}</p><p>Puoi uscire dalla pagina e riprendere la sessione. Durante una gara attiva le modifiche a pilota e vetture sono bloccate.</p>{active && <button type="button" className="race-button race-abandon" disabled={pending > 0} onClick={() => { setDetail(null); onAbandon(); }}>Abbandona gara{race.wager > 0 ? ' · quota persa' : ''}</button>}</div>}
    </RaceDetailDialog>}
  </div>;
}
