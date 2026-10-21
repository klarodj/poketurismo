import React, { useState } from 'react';
import { DEFAULT_DECISION, DECISION_OPTIONS, decisionPreview } from '../../shared/tacticalRace.mjs';
import { contextualDecision, tacticalContext, tacticalMovePlayable } from '../../shared/raceContext.mjs';
import { PILOT_STAT_LABELS } from '../logic/raceEngine';
import RaceDetailDialog from './RaceDetailDialog';

export default function TacticalControls({ race, pending, onTurn, showAlerts = true }) {
  const [selection, setDecision] = useState({ ...DEFAULT_DECISION });
  const [moveId, setMoveId] = useState(null);
  const [inspect, setInspect] = useState(false);
  const decision = contextualDecision(race, selection);
  const context = tacticalContext(race);
  const options = key => DECISION_OPTIONS[key].filter(option => context.allowed[key].includes(option.id));
  const section = race.sections[race.index];
  const preview = decisionPreview(race, decision, moveId);
  const select = (key, value) => setDecision(current => ({ ...current, [key]: value }));
  const moves = race.moves.filter(move => tacticalMovePlayable(move, section, race.sections[race.index + 1], race.gapSeconds));
  const groups = [{ key: 'braking', label: context.brakingAhead ? 'Staccata in fondo al rettilineo' : 'Staccata', show: context.hasBrakingZone },
    { key: 'line', label: 'Traiettoria', show: context.hasCorner }, { key: 'manoeuvre', label: 'Duello', show: context.allowed.manoeuvre.length > 1 }];
  return <section className="race-controls" aria-label="Scelte di guida">
    <div className="race-control-heading"><h2>La tua prossima mossa</h2><button type="button" className="race-text-button" onClick={() => setInspect(true)}>Dettagli strategia ↗</button></div>
    <p className="race-driving-situation">{race.lesson ? 'Segui la consegna dell’istruttore: il distacco non decide la promozione.' : context.ahead ? context.canDefend ? 'Rivale vicino: puoi difendere la posizione.' : 'Hai margine: gestisci il tuo passo.' : context.behind ? context.close ? 'Sei a contatto: cerca la tua occasione.' : 'Recupera il distacco prima di attaccare.' : 'Siete affiancati: cerca spazio senza forzare.'}</p>
    {race.lesson && <p className="race-inline-warning" role="status"><strong>Istruttore:</strong> {section.instruction}</p>}
    {showAlerts && race.incidentCue && <p className="race-inline-warning" role="status">{race.incidentCue.description} «Conserva» lascia più margine.</p>}
    <fieldset disabled={pending > 0} className="min-w-0">
      <legend className="sr-only">Imposta e conferma la strategia</legend>
      <fieldset className="race-pace"><legend>Ritmo</legend><div>{options('pace').map(option => <button type="button" aria-pressed={decision.pace === option.id} key={option.id} onClick={() => select('pace', option.id)} className={decision.pace === option.id ? 'is-selected' : ''}>{option.name}</button>)}</div></fieldset>
      <div className="race-choices">
        {groups.filter(group => group.show).map(({ key, label }) => <label key={key}>{label}<select value={decision[key]} onChange={event => select(key, event.target.value)}>{options(key).map(option => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>)}
        {moves.length > 0 && <label>Tecnica del pilota<select value={moveId || ''} onChange={event => setMoveId(event.target.value || null)}><option value="">Guida normale</option>{moves.map(move => <option value={move.id} key={move.id}>{move.name}</option>)}</select></label>}
      </div>
      <div className="race-confirm"><div role="status"><span>Stima settore <strong>{preview.seconds.toFixed(1)} s</strong></span><span className={preview.errorPercent >= 8 ? 'race-risk-high' : ''}>Rischio errore <strong>{preview.errorPercent.toFixed(1)}%</strong></span></div><button type="button" onClick={() => onTurn(moveId, decision)} className="race-drive-button">{pending > 0 ? 'Salvataggio…' : 'Percorri il settore →'}</button></div>
    </fieldset>
    {inspect && <RaceDetailDialog title="Strategia · effetti e stime" onClose={() => setInspect(false)}>
      <div className="space-y-5">
        <p>Stai scegliendo come affrontare <strong>{section.name}</strong>. Le tecniche aiutano a sfruttare la vettura; non ne aumentano potenza o aderenza fisica.</p>
        <dl className="race-specs"><div><dt>Tempo indicativo</dt><dd>{preview.seconds.toFixed(1)} s</dd></div><div><dt>Rischio errore</dt><dd>{preview.errorPercent.toFixed(1)}%</dd></div><div><dt>Carburante stimato</dt><dd>{preview.fuel.toFixed(2)} L</dd></div><div><dt>Usura gomme stimata</dt><dd>−{preview.tires.toFixed(2)}%</dd></div>{context.hasBrakingZone && <div><dt>Efficacia frenata del pilota</dt><dd>{preview.brakingSkill}/100</dd></div>}{preview.cornerLimitKmh !== null && <div><dt>Limite di aderenza stimato</dt><dd>{preview.cornerLimitKmh} km/h</dd></div>}</dl>
        <p className="text-sm">La stima non include duelli, errori o imprevisti. Non c’è un timer per scegliere.</p>
        {[{ key: 'pace', label: 'Ritmo', show: true }, ...groups].filter(group => group.show).map(({ key, label }) => <section key={key}><h3 className="font-bold mb-2">{label}</h3><ul className="space-y-2">{options(key).map(option => <li key={option.id} className={decision[key] === option.id ? 'bg-blue-50 border-l-4 border-blue-700 p-2' : 'p-2'}><strong>{option.name}{decision[key] === option.id ? ' · selezionata' : ''}</strong><p className="text-sm">{option.description}</p></li>)}</ul></section>)}
        <section><h3 className="font-bold mb-2">Tecniche disponibili</h3>{moves.length ? moves.map(move => <div className="border-b border-gray-300 py-2" key={move.id}><strong>{move.name}{move.id === moveId ? ' · selezionata' : ''}</strong><p>{move.description}</p><p className="text-sm">{Object.entries(move.skillBonus || move.bonus || {}).map(([key, value]) => `+${value} ${PILOT_STAT_LABELS[key] || key}`).join(' · ')}</p><p className="text-sm">{move.costGrip > 0 ? 'Richiede più lavoro alle gomme. ' : ''}{move.costHealth > 0 ? 'Tecnica impegnativa per il motore. ' : ''}{move.aggressiveness > 1 ? 'Aumenta anche il consumo di carburante.' : 'Nessun consumo aggiuntivo dovuto alla tecnica.'}</p></div>) : <p>Nessuna tecnica equipaggiata utilizzabile qui. Stai usando la guida normale.</p>}</section>
      </div>
    </RaceDetailDialog>}
  </section>;
}
