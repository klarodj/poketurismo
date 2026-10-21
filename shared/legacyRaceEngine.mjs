// Pure, deterministic rules. Only the server creates seeds and advances a race.
const CAR_STATS = ['speed', 'acceleration', 'revving', 'transmission', 'turnSlow', 'turnFast', 'brake', 'traction'];
const PILOT_STATS = ['brave', 'clean', 'reflex', 'shift', 'acro', 'turn', 'brake', 'throttle'];
const BASE_MOVES = [
  { id: 'm1', name: 'Guida Pulita', description: 'Guida regolare, senza usura extra.', trigger: 'always', bonus: { speed: 5, clean: 2 }, costGrip: 0, costHealth: 0, aggressiveness: 1 },
  { id: 'm2', name: 'Punta-Tacco', description: 'Vantaggio nelle curve lente e in frenata.', trigger: 'Tornante', bonus: { turnSlow: 20, brake: 15 }, costGrip: 2, costHealth: 0, aggressiveness: 2 },
  { id: 'm3', name: 'Recupero Disperato', description: 'Recupero aggressivo: maggiore consumo e rischio motore.', trigger: 'Gap-Negative', bonus: { acceleration: 30, speed: 20 }, costGrip: 1, costHealth: 5, aggressiveness: 3 }
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
  const target = ['brave', 'clean', 'reflex', 'shift', 'acro', 'turn', 'brake', 'throttle'].includes(session.targetStat) ? session.targetStat : 'reflex';
  return { id: `training-${session.id}`, name: session.targetMove, description: session.description,
    trigger: 'always', bonus: { [target]: 12 }, costGrip: 0.5, costHealth: 0, aggressiveness: 1.2 };
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
function random(state) {
  state.rng = (Math.imul(1664525, state.rng >>> 0) + 1013904223) >>> 0;
  return state.rng / 4294967296;
}
function engineRisk(car, move) {
  const wear = (100 - car.engineHealth) / 100;
  const overdue = clamp(((car.km || 0) - (car.serviceKm || 0) - 100000) / 300000, 0, 1);
  return clamp((0.002 + (wear + overdue) ** 2 * 0.08) * (move.costHealth > 1 ? 1.5 : 1), 0, 0.8);
}
function advanceRace(input, moveId) {
  const state = structuredClone(input);
  const section = state.sections[state.index];
  if (!section || state.finished) throw new Error('Gara già terminata');
  const move = moveId === null ? NORMAL_MOVE : state.moves.find(move => move.id === moveId);
  if (!move || !movePlayable(move, section, state.gap)) throw new Error('Mossa non disponibile in questo settore');
  const distanceKm = state.distanceKm / state.sections.length;
  const fuel = round(Math.max(0.05, state.car.cv * 0.0002 * distanceKm * move.aggressiveness));
  const log = { section: section.name, move: move.name, delta: 0, comparisons: [], fuel: 0, tires: 0, engine: 0 };
  if (state.car.currentFuel + 0.000001 < fuel) {
    state.finished = true; state.failure = 'fuel'; state.outcome = 'loss';
    log.event = 'Carburante insufficiente: gara interrotta. Nessun addebito aggiuntivo.';
  } else {
    const myStats = performance(state.car, state.environment);
    const oppStats = performance(state.opponent.car, state.environment);
    const key = name => name === 'braking' ? 'brake' : name;
    for (const [field, type] of [['carStat', 'car'], ['carTech', 'car'], ['driverStat', 'pilot'], ['driverTech', 'pilot']]) {
      const stat = key(section[field]);
      const base = (type === 'car' ? myStats : state.pilot)[stat] || 0;
      const bonus = move.bonus[stat] || 0;
      const mine = Math.max(0, base + bonus);
      const opponent = (type === 'car' ? oppStats : state.opponent.pilot)[stat] || 0;
      const advantage = (mine + opponent) === 0 ? 0 : (mine - opponent) / (mine + opponent);
      log.comparisons.push({ stat, type, base: round(base), bonus, mine: round(mine), opponent: round(opponent), advantage: round(advantage, 4) });
    }
    let advantage = log.comparisons.reduce((sum, item) => sum + item.advantage, 0) / 4;
    const hazard = random(state);
    const poorVisibility = /fog|nebbia|night|notte/.test((state.environment.weather || '').toLowerCase());
    if (hazard < (poorVisibility ? 0.22 : 0.12)) {
      const saved = random(state) < clamp(0.25 + state.pilot.reflex / 200, 0.25, 0.9);
      log.event = saved ? 'Imprevisto evitato grazie ai riflessi.' : 'Imprevisto sul tracciato: penalità al vantaggio.';
      if (!saved) advantage -= 0.15;
    }
    log.luck = round((random(state) - 0.5) * 0.12, 4);
    log.delta = Math.round(clamp(advantage + log.luck, -1, 1) * 25);
    state.gap += log.delta;
    log.fuel = fuel;
    log.tires = round(0.15 * distanceKm + move.costGrip);
    log.engine = round(0.05 * distanceKm + move.costHealth);
    const broken = random(state) < engineRisk(state.car, move);
    state.car.currentFuel = round(Math.max(0, state.car.currentFuel - fuel));
    state.car.tireGrip = round(Math.max(0, state.car.tireGrip - log.tires));
    state.car.engineHealth = broken ? 0 : round(Math.max(0, state.car.engineHealth - log.engine));
    state.car.km += distanceKm;
    state.opponent.car.currentFuel = round(Math.max(0, state.opponent.car.currentFuel - Math.max(0.05, (state.opponent.car.cv || state.car.cv) * 0.0002 * distanceKm)));
    state.opponent.car.tireGrip = round(Math.max(0, state.opponent.car.tireGrip - 0.15 * distanceKm));
    state.opponent.car.engineHealth = round(Math.max(0, state.opponent.car.engineHealth - 0.05 * distanceKm));
    state.opponent.car.km = (state.opponent.car.km || 0) + distanceKm;
    if (broken || state.car.engineHealth === 0) { state.finished = true; state.failure = 'engine'; log.event = 'Motore fuori uso: gara interrotta.'; }
    if (state.index + 1 === state.sections.length) state.finished = true;
    if (state.finished) state.outcome = state.failure ? 'loss' : state.gap > 0 ? 'win' : state.gap === 0 ? 'draw' : 'loss';
  }
  state.index += 1;
  state.logs.push(log);
  return state;
}
export { CAR_STATS, PILOT_STATS, BASE_MOVES, NORMAL_MOVE, sectionType, movePlayable, trainingMove, performance, advanceRace, engineRisk };
