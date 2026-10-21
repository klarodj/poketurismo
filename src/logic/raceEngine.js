export const CAR_STAT_LABELS = {
  speed: 'Velocità',
  acceleration: 'Accelerazione',
  revving: 'Ripresa',
  transmission: 'Cambio',
  turnSlow: 'Curve Lente',
  turnFast: 'Curve Veloci',
  brake: 'Freni',
  braking: 'Freni',
  traction: 'Trazione'
};

export const PILOT_STAT_LABELS = {
  brave: 'Coraggio',
  clean: 'Pulizia',
  reflex: 'Riflessi',
  acro: 'Acrobazia',
  turn: 'Curva',
  brake: 'Frenata',
  throttle: 'Accelerata',
  shift: 'Cambiata'
};

export { sectionType as getSectionType } from '../../shared/raceEngine.mjs';
import { performance, CAR_STATS } from '../../shared/raceEngine.mjs';
export const calculateRaceStats = car => {
  const stats = performance(car);
  return { ...stats, malusInfo: Object.fromEntries(CAR_STATS.map(key => [key, Number(((car[key] || 0) - stats[key]).toFixed(2))])) };
};
