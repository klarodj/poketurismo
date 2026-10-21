import React from 'react';
import { DECISION_OPTIONS } from '../../shared/tacticalRace.mjs';
import { formatRaceTime } from '../logic/racePresentation';
export function RaceTiming({ race }) {
  const gap = race.gapSeconds || 0;
  return <div className="bg-black text-green-400 p-4 font-pixel space-y-3">
    <div className="text-3xl text-center" aria-live="polite">{gap > 0.01 ? `Davanti di ${gap.toFixed(3)} s` : gap < -0.01 ? `Dietro di ${Math.abs(gap).toFixed(3)} s` : 'Affiancati'}</div>
    <div className="grid grid-cols-2 gap-2 text-center"><div>Il tuo tempo<strong className="block text-xl">{formatRaceTime(race.playerTime)}</strong></div><div>Tempo rivale<strong className="block text-xl">{formatRaceTime(race.opponentTime)}</strong></div></div>
    <ol className="flex gap-1" aria-label="Avanzamento gara">{race.sections.map((section, i) => <li key={section.id || i} title={section.name} aria-current={i === race.index ? 'step' : undefined} className={`flex-1 p-1 text-center border text-sm ${i < race.index ? 'bg-green-800 text-white' : i === race.index ? 'bg-yellow-200 text-black' : 'border-gray-600 text-gray-400'}`}>{i + 1}<span className="block text-xs">{section.segments.every(segment => !segment.radiusM) ? '━' : '↝'}</span></li>)}</ol>
  </div>;
}
export function TacticalLog({ log }) {
  return <div className="space-y-2 text-sm mt-2">
    {log.playerSeconds !== undefined && <><div className="grid grid-cols-2 gap-2"><p>Tu: <strong>{log.playerSeconds.toFixed(3)} s</strong></p><p>Rivale: <strong>{log.opponentSeconds.toFixed(3)} s</strong></p></div><p>Velocità massima: {log.peakKmh.toFixed(1)} km/h · Uscita: {log.exitKmh.toFixed(1)} km/h</p><p>Potenziale stimato della tua auto: {log.potentialSeconds.toFixed(3)} s · Margine di guida: +{log.driverLossSeconds.toFixed(3)} s</p></>}
    {(log.decision || log.opponentDecision) && <div className="grid sm:grid-cols-2 gap-3 bg-slate-100 p-3">{[[log.decision, 'Le tue scelte'], [log.opponentDecision, 'Scelte del rivale']].filter(([decision]) => decision).map(([decision, title]) => <div key={title}><h3 className="font-bold">{title}</h3><ul>{Object.entries(decision).map(([key, id]) => <li key={key}>{DECISION_OPTIONS[key]?.find(option => option.id === id)?.name || id}</li>)}</ul></div>)}</div>}
    {log.instructor && <p className={`p-2 border-l-4 ${log.instructor.correct ? 'bg-green-50 border-green-700' : 'bg-amber-50 border-amber-700'}`}><strong>Istruttore:</strong> {log.instructor.message}</p>}
    {log.event && <p className="font-bold">{log.event}</p>}
    <ul className="list-disc pl-5 space-y-1">{(log.explanations || []).map((text, i) => <li key={i}>{text}</li>)}</ul>
    <p>Consumi: {log.fuel.toFixed(2)} L · gomme −{log.tires.toFixed(2)}% · motore −{log.engine.toFixed(2)}%</p>
  </div>;
}
