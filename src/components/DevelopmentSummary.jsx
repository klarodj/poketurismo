import React from 'react';
import { BRAKING_NAMES } from '../../shared/driverDevelopment.mjs';
export default function DevelopmentSummary({ summary }) {
  if (!summary) return null;
  return <section className="border border-blue-700 bg-blue-50 p-3 space-y-2" aria-label="Progressi del pilota"><h3 className="font-bold">Progressi del pilota</h3><p>{summary.message}</p>{summary.lesson && <p>Esercizi corretti: {summary.lesson.correct}/{summary.lesson.total} · {summary.lesson.passed ? 'Prova superata' : 'Prova da ripetere'}</p>}<ul className="text-sm">{Object.entries(summary.gains).filter(([, gain]) => gain > 0).map(([key, gain]) => <li key={key}>{BRAKING_NAMES[key]}: +{gain} pratica</li>)}{summary.techniqueGain > 0 && <li>Rilascio progressivo: +{summary.techniqueGain} pratica</li>}{summary.xp > 0 && <li>Prima promozione: +{summary.xp} XP</li>}</ul>{summary.advice && <p className="text-sm"><strong>Consiglio:</strong> {summary.advice}</p>}</section>;
}
