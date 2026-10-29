import React from 'react';
import {PILOT_STAT_LABELS} from '../logic/raceEngine';
import { BRAKING_NAMES } from '../../shared/driverDevelopment.mjs';
export default function DevelopmentSummary({ summary }) {
  if (!summary) return null;
  return <section className="border border-blue-700 bg-blue-50 p-3 space-y-2" aria-label="Progressi del pilota"><h3 className="font-bold">Progressi del pilota</h3><p>{summary.message}</p>{summary.lesson && <p>Esercizi corretti: {summary.lesson.correct}/{summary.lesson.total} · {summary.lesson.passed ? 'Prova superata' : 'Prova da ripetere'}</p>}<ul className="text-sm">{Object.entries(summary.gains||{}).filter(([, gain]) => gain > 0).map(([key, gain]) => <li key={key}>{BRAKING_NAMES[key]}: +{gain} pratica</li>)}{Object.entries(summary.statPractice||{}).filter(([,n])=>n>0).map(([k,n])=><li key={`practice-${k}`}>{PILOT_STAT_LABELS[k]}: +{n} pratica verso il prossimo punto</li>)}{Object.entries(summary.statGains||{}).map(([k,n])=><li key={`gain-${k}`}><strong>{PILOT_STAT_LABELS[k]}: +{n} permanente</strong></li>)}{summary.techniqueGain > 0 && <li>Rilascio progressivo: +{summary.techniqueGain} pratica</li>}{summary.xp > 0 && <li>Prima promozione: +{summary.xp} XP</li>}</ul>{summary.advice && <p className="text-sm"><strong>Consiglio:</strong> {summary.advice}</p>}</section>;
}
