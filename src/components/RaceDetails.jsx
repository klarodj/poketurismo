import {trackSectionLabel} from '../../shared/trackSectionLabels.mjs';
import React from 'react';
import RaceCarArtwork from './RaceCarArtwork';
import { CAR_STAT_LABELS, PILOT_STAT_LABELS } from '../logic/raceEngine';
import { sectionFeatures } from '../../shared/raceContext.mjs';
import { TacticalLog } from './RaceTiming';

const value = (number, decimals = 0, unit = '') => Number.isFinite(Number(number)) && number !== null && number !== undefined ? `${Number(number).toFixed(decimals)}${unit}` : '—';
export function CarDetail({ car, pilot, name }) {
  const specs = { cv: ['Potenza', 0, ' CV'], nm: ['Coppia', 0, ' Nm'], kg: ['Peso a secco', 0, ' kg'], velMax: ['Velocità nominale', 0, ' km/h'], zeroToHundred: ['0–100 km/h', 1, ' s'], currentFuel: ['Carburante', 2, ' L'], tireGrip: ['Gomme', 1, '%'], engineHealth: ['Motore', 1, '%'], km: ['Chilometraggio', 2, ' km'], serviceKm: ['Ultimo tagliando', 0, ' km'] };
  return <div className="space-y-4">
    <RaceCarArtwork car={car} large />
    <p className="text-xl font-bold">{typeof car.brand === 'string' ? car.brand : car.brand?.name} {car.name}</p>
    <dl className="race-specs">{Object.entries(specs).map(([key, [label, decimals, unit]]) => <div key={key}><dt>{label}</dt><dd>{value(car[key], decimals, unit)}</dd></div>)}<div><dt>Trazione</dt><dd>{car.driveType || '—'}</dd></div><div><dt>Tipo carburante</dt><dd>{car.fuelType || '—'}</dd></div><div><dt>Rapporto potenza/peso</dt><dd>{car.kg > 0 ? value(car.cv / car.kg * 1000, 0, ' CV/t') : '—'}</dd></div></dl>
    <h3 className="font-bold">Caratteristiche della vettura</h3>
    <dl className="race-specs">{Object.entries(CAR_STAT_LABELS).filter(([key]) => key !== 'braking').map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{value(car[key])}</dd></div>)}</dl>
    <h3 className="font-bold">Pilota · {name}</h3>
    <dl className="race-specs">{Object.entries(PILOT_STAT_LABELS).map(([key, label]) => <div key={key}><dt>{label}</dt><dd>{value(pilot?.[key])}</dd></div>)}</dl>
  </div>;
}
export function SectorDetail({ race }) {
  const section = race.sections[race.index];
  if (!section) return <p>Tutti i settori sono stati percorsi.</p>;
  const next = race.sections[race.index + 1];
  if (!section.segments) return <div><h3 className="font-bold">{trackSectionLabel(section.name)}</h3><p>Auto: {CAR_STAT_LABELS[section.carStat]} · {CAR_STAT_LABELS[section.carTech]}</p><p>Pilota: {PILOT_STAT_LABELS[section.driverStat]} · {PILOT_STAT_LABELS[section.driverTech]}</p></div>;
  const features = sectionFeatures(section, next, race.routeProfile);
  return <div className="space-y-4">
    <h3 className="font-bold text-xl">{trackSectionLabel(section.name)}</h3>
    <p>{features.hasCorner ? 'Curve e rilancio' : 'Rettilineo'} · {Math.round(section.segments.reduce((sum, segment) => sum + segment.lengthM, 0))} m</p>
    <p>{features.hasBrakingZone ? features.brakingAhead ? 'La staccata è in fondo al rettilineo, verso la curva successiva.' : 'Questo settore richiede di gestire frenata e percorrenza.' : 'Non sono previste staccate in questo settore.'}</p>
    <p>{features.passingSpace ? 'La geometria offre spazio per un attacco, se sei a contatto.' : 'Spazio o visibilità rendono difficile il sorpasso.'}</p>
    {race.routeProfile?.kind === 'road' && <p>Visibilità: {features.visibilityM} m</p>}
    {race.preview?.cornerLimitKmh != null && <p>Limite di aderenza stimato della tua auto: {race.preview.cornerLimitKmh} km/h. Non è una velocità obiettivo garantita.</p>}
    <div className="overflow-x-auto"><table className="race-table"><caption>Geometria dei tratti</caption><thead><tr><th>Tratto</th><th>Lunghezza</th><th>Raggio</th><th>Larghezza</th><th>Pendenza</th></tr></thead><tbody>{section.segments.map((segment, i) => <tr key={i}><td>{segment.radiusM ? 'Curva' : 'Rettilineo'}</td><td>{value(segment.lengthM, 0, ' m')}</td><td>{segment.radiusM ? value(segment.radiusM, 0, ' m') : '—'}</td><td>{value(segment.widthM, 1, ' m')}</td><td>{value((segment.grade || 0) * 100, 1, '%')}</td></tr>)}</tbody></table></div>
    <p>Prossimo: <strong>{trackSectionLabel(next?.name) || 'Traguardo'}</strong></p>
  </div>;
}
export function RaceHistory({ race }) {
  const labels = { ...CAR_STAT_LABELS, ...PILOT_STAT_LABELS };
  if (!race.logs.length) return <p>Nessun settore ancora percorso. Qui troverai tempi, scelte, consumi e avvenimenti della gara.</p>;
  return <div className="space-y-3">{race.logs.slice().reverse().map((log, index) => <details key={race.logs.length - index} open={index === 0} className="border border-gray-400 p-3 bg-white">
    <summary className="font-bold cursor-pointer">{trackSectionLabel(log.section)} · {log.move} · {race.meetTrial?`${log.playerSeconds?.toFixed(3)||'—'} s`:race.rulesVersion === 3 ? `${(log.deltaSeconds || 0) > 0 ? '+' : ''}${(log.deltaSeconds || 0).toFixed(3)} s` : `${log.delta > 0 ? '+' : ''}${log.delta} m`}</summary>
    {race.rulesVersion === 3 ? <TacticalLog solo={race.meetTrial} log={log} /> : <div className="space-y-2 mt-2"><p>{log.event}</p><p>Consumi: {value(log.fuel, 2, ' L')} · gomme −{value(log.tires, 2, '%')} · motore −{value(log.engine, 2, '%')}</p><table className="race-table"><thead><tr><th>Fattore</th><th>Tu</th><th>Bonus</th><th>Rivale</th></tr></thead><tbody>{log.comparisons.map((item, i) => <tr key={i}><td>{labels[item.stat] || item.stat}</td><td>{item.base}</td><td>+{item.bonus}</td><td>{item.opponent}</td></tr>)}</tbody></table></div>}
  </details>)}</div>;
}
