import { advanceRace as advanceLegacyRace } from './legacyRaceEngine.mjs';
import { advanceTacticalRace } from './tacticalRace.mjs';
// Pure, deterministic rules. Only the server creates seeds and advances a race.
const CAR_STATS = ['speed', 'acceleration', 'revving', 'transmission', 'turnSlow', 'turnFast', 'brake', 'traction'];
const PILOT_STATS = ['brave', 'clean', 'reflex', 'shift', 'acro', 'turn', 'brake', 'throttle'];
const BASE_MOVES = [
  { id: 'm1', name: 'Guida Pulita', description: 'Guida regolare, senza usura extra.', trigger: 'always', bonus: { clean: 3 }, skillBonus: { clean: 3 }, costGrip: 0, costHealth: 0, aggressiveness: 1 },
  { id: 'm2', name: 'Punta-Tacco', description: 'Vantaggio nelle curve lente e in frenata.', trigger: 'Tornante', bonus: { brake: 8, shift: 6 }, skillBonus: { brake: 8, shift: 6 }, costGrip: 2, costHealth: 0, aggressiveness: 2 },
  { id: 'm3', name: 'Recupero Disperato', description: 'Recupero aggressivo: maggiore consumo e rischio motore.', trigger: 'Gap-Negative', bonus: { throttle: 6, brave: 8 }, skillBonus: { throttle: 6, brave: 8 }, costGrip: 1, costHealth: 5, aggressiveness: 3 }
];
const NORMAL_MOVE = { id: null, name: 'Guida normale', trigger: 'always', bonus: {}, costGrip: 0, costHealth: 0, aggressiveness: 1 };
const round = (n, precision = 2) => Number(n.toFixed(precision));
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
function sectionType(section) {
  const name = (section.name || '').toLowerCase();
  if (/chicane|variante|esse/.test(name)) return 'Chicane';
  if (/tornant|hairpin|curva|parabolica|slow.*turn|inversion/.test(name)) return 'Tornante';
  if (/rettifil|rettiline|straight|semaforo/.test(name)) return 'Rettilineo';
  return 'Misto';
}
function movePlayable(move, section, gap) {
  return move.trigger === 'always' || (move.trigger === 'Gap-Negative' && gap < 0) || move.trigger === sectionType(section);
}
function trainingMove(session) {
  const inferredTarget = /brak|frenat|punta.*tacco/i.test(session.targetMove || '') ? 'brake' : /recuper|testacod/i.test(session.targetMove || '') ? 'throttle' : 'reflex';
  const target = ['brave', 'clean', 'reflex', 'shift', 'acro', 'turn', 'brake', 'throttle'].includes(session.targetStat) ? session.targetStat : inferredTarget;
  return { id: `training-${session.id}`, name: session.targetMove, description: session.description,
    trigger: 'always', bonus: { [target]: 12 }, skillBonus: { [target]: 12 }, costGrip: 0.5, costHealth: 0, aggressiveness: 1.2 };
}
function performance(car, environment = {}) {
  const grip = clamp(car.tireGrip ?? 100, 0, 100) / 100;
  const health = clamp(car.engineHealth ?? 100, 0, 100) / 100;
  const km = Math.max(0, (car.km || 0) - (car.serviceKm || 0));
  const kmFactor = km >= 400000 ? 0 : km >= 300000 ? 0.5 : km >= 200000 ? 0.9 : km >= 100000 ? 0.99 : 1;
  const dynamicKG = Math.max(300, car.kg + (car.currentFuel || 0) * 0.75);
  // Lower weight improves acceleration and handling, without changing rated CV.
  const weightFactor = clamp(1000 / dynamicKG, 0.65, 1.25);
  const weather = (environment.weather || '').toLowerCase();
  const surface = (environment.surface || '').toLowerCase();
  const weatherGrip = /piogg|bagn|rain|wet/.test(weather) ? 0.8 : /neve|snow|ghiacc/.test(weather) ? 0.6 : 1;
  const surfaceGrip = /terra|sterr|gravel|dirt/.test(surface) ? 0.85 : 1;
  const premium = car.fuelType === 'Premium' ? 1.02 : 1;
  const stats = {};
  for (const key of CAR_STATS) {
    const engineFactor = ['speed', 'acceleration', 'revving', 'transmission'].includes(key) ? health * premium : 1;
    const tireFactor = ['acceleration', 'turnSlow', 'turnFast', 'brake', 'traction'].includes(key) ? grip * weatherGrip * surfaceGrip : 1;
    const massFactor = ['acceleration', 'revving', 'turnSlow', 'turnFast', 'brake'].includes(key) ? weightFactor : 1;
    stats[key] = round(Math.max(0, car[key] || 0) * engineFactor * tireFactor * massFactor * kmFactor);
  }
  return { ...stats, dynamicKG };
}
function engineRisk(car, move) {
  const wear = (100 - car.engineHealth) / 100;
  const overdue = clamp(((car.km || 0) - (car.serviceKm || 0) - 100000) / 300000, 0, 1);
  return clamp((0.002 + (wear + overdue) ** 2 * 0.08) * (move.costHealth > 1 ? 1.5 : 1), 0, 0.8);
}
function advanceRace(input, moveId, decision) {
  return input.rulesVersion === 3 ? advanceTacticalRace(input, moveId, decision) : advanceLegacyRace(input, moveId);
}

export { CAR_STATS, PILOT_STATS, BASE_MOVES, NORMAL_MOVE, sectionType, movePlayable, trainingMove, performance, advanceRace, engineRisk };
