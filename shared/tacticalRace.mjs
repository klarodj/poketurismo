import { brakingFamiliarity } from './driverDevelopment.mjs';
import { tacticalContext, contextualDecision, sectionFeatures, incidentCue, tacticalMovePlayable } from './raceContext.mjs';
// Simplified longitudinal/lateral model in SI units, calibrated as game rules.
const G = 9.81;
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const round = (n, precision = 3) => Number(n.toFixed(precision));
const DEFAULT_DECISION = Object.freeze({ pace: 'balanced', braking: 'optimal', line: 'exit', manoeuvre: 'hold' });
const DECISION_OPTIONS = {
  pace: [{ id: 'save', name: 'Conserva', description: 'Meno consumo e usura; rinunci a un po’ di ritmo.' }, { id: 'balanced', name: 'Ritmo pulito', description: 'Sfrutta l’auto con un margine regolare.' }, { id: 'attack', name: 'Attacca', description: 'Più vicino ai limiti: aumenta usura e probabilità di errore.' }],
  braking: [{ id: 'early', name: 'Anticipata', description: 'Ingresso stabile, ma perdi tempo in staccata.' }, { id: 'optimal', name: 'Al riferimento', description: 'Il pilota cerca il punto di frenata che sa gestire.' }, { id: 'late', name: 'Tardiva', description: 'Può aiutare un attacco: richiede frenata e pulizia, compromette l’uscita se sbagli.' }],
  line: [{ id: 'apex', name: 'Privilegia la percorrenza', description: 'Più velocità in curva, sacrificando il rilancio.' }, { id: 'exit', name: 'Privilegia l’uscita', description: 'Prepari bene la trazione per il tratto successivo.' }, { id: 'defend', name: 'Chiudi l’interno', description: 'Difendi se il rivale è vicino, sacrificando percorrenza e rilancio.' }],
  manoeuvre: [{ id: 'slipstream', name: 'Sfrutta la scia', description: 'Rimani vicino sul rettilineo: minore resistenza, senza aumentare la potenza.' }, { id: 'defend', name: 'Difendi la posizione', description: 'Proteggi la linea con il rivale vicino: perdi un po’ di tempo anche tu.' }, { id: 'hold', name: 'Mantieni il ritmo', description: 'Segui il tuo passo e sfrutta gli allunghi favorevoli.' }, { id: 'prepare', name: 'Prepara il sorpasso', description: 'Lasci un piccolo margine per migliorare il prossimo rilancio.' }, { id: 'overtake', name: 'Tenta il sorpasso', description: 'Solo a contatto: cerca spazio ora, con un rischio maggiore.' }]
};
function validateDecision(value = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Decisione non valida');
  if (Object.keys(value).some(key => !Object.hasOwn(DECISION_OPTIONS, key))) throw new Error('Parametro tattico non riconosciuto');
  const decision = { ...DEFAULT_DECISION, ...value };
  for (const key of Object.keys(DECISION_OPTIONS)) if (!DECISION_OPTIONS[key].some(option => option.id === decision[key])) throw new Error('Scelta tattica non valida');
  return decision;
}
const ability = value => clamp(Math.max(0, Number(value) || 0) / (Math.max(0, Number(value) || 0) + 35), 0, 0.98);
function driverSkills(pilot, move, ideal = false) {
  return Object.fromEntries(['brave', 'clean', 'reflex', 'shift', 'acro', 'turn', 'brake', 'throttle'].map(key => [key, ideal ? 1 : ability((pilot[key] || 0) + (move?.skillBonus?.[key] || 0))]));
}
function vehicleModel(car, environment = {}) {
  const mass = Math.max(400, Number(car.kg || 1000) + Math.max(0, car.currentFuel || 0) * 0.75);
  const baseMass = Math.max(400, car.baseKg || car.kg || 1000);
  const condition = clamp((car.engineHealth ?? 100) / 100, 0, 1);
  const overdue = clamp(((car.km || 0) - (car.serviceKm || 0) - 100000) / 400000, 0, 0.5);
  const power = Math.max(0, car.cv || 100) * 735.5 * 0.82 * (condition === 0 ? 0 : 0.55 + condition * 0.45) * (1 - overdue) * (car.fuelType === 'Premium' ? 1.02 : 1);
  const stockPower = Math.max(1, car.baseCv || car.cv || 100) * 735.5 * 0.82;
  const stockTop = clamp(Number(car.velMax || 180), 80, 450) / 3.6;
  const rolling = mass * G * 0.014;
  const drag = Math.max(0.12, (stockPower - baseMass * G * 0.014 * stockTop) / stockTop ** 3);
  let lo = 0, hi = 150;
  for (let i = 0; i < 35; i++) { const speed = (lo + hi) / 2; if (rolling * speed + drag * speed ** 3 > power) hi = speed; else lo = speed; }
  const weather = (environment.weather || '').toLowerCase(), surface = (environment.surface || '').toLowerCase();
  const gripWeather = /snow|neve|ghiacc/.test(weather) ? 0.55 : /rain|piogg|wet|bagn/.test(weather) ? 0.78 : 1;
  const gripSurface = /dirt|gravel|terra|sterr/.test(surface) ? 0.82 : 1;
  const tire = 0.65 + 0.35 * clamp((car.tireGrip ?? 100) / 100, 0, 1);
  const handling = clamp(((car.turnSlow || 50) + (car.turnFast || 50)) / 2, 0, 100);
  const mu = (0.82 + 0.0028 * handling) * tire * gripWeather * gripSurface * clamp((1100 / mass) ** 0.08, 0.91, 1.06);
  const brake = mu * G * (0.8 + clamp(car.brake ?? 50, 0, 100) * 0.002);
  const driveGrip = /AWD|4WD|4X4/i.test(car.driveType || '') ? 0.82 : /FR|MR|RR|RWD/i.test(car.driveType || '') ? 0.66 : 0.58;
  const launch = 27.7778 / clamp(Number(car.zeroToHundred || 10), 2, 25) * 1.6 * Math.sqrt(Math.max(0.1, (car.cv || 100) / (car.baseCv || car.cv || 100)));
  return { mass, power, rolling, drag, topSpeed: lo, mu, brake, launch, driveGrip };
}
function cornerLimit(model, radius) { return radius > 0 ? Math.sqrt(model.mu * G * radius) : model.topSpeed; }
function simulateBlock(car, pilot, move, decision, section, nextSection, entrySpeed, environment, ideal = false, prepared = false) {
  const model = vehicleModel(car, environment), skill = driverSkills(pilot, move, ideal);
  const pace = decision.pace === 'save' ? 0.965 : decision.pace === 'attack' ? 1.012 : 1;
  const cornerEfficiency = ideal ? 1 : Math.min(1, (0.82 + 0.17 * skill.turn) * pace * (decision.line === 'apex' ? 1.006 : 1) * (decision.line === 'defend' ? 0.955 : 1));
  const throttleEfficiency = ideal ? 1 : Math.min(1, (0.84 + 0.15 * skill.throttle + (prepared ? 0.035 : 0)) * pace);
  const familiarity = sectionFeatures(section, nextSection).hasBrakingZone ? brakingFamiliarity(pilot, decision) : 0;
  const brakingEfficiency = ideal ? 1 : Math.min(1, (decision.braking === 'early' ? 0.74 : decision.braking === 'late' ? 0.98 : 0.84 + 0.13 * skill.brake) + familiarity * 0.012);
  let speed = Math.max(0, entrySpeed), time = 0, peak = speed, peakCorner = 0, shiftLoss = 0;
  for (let index = 0; index < section.segments.length; index++) {
    const segment = section.segments[index], next = section.segments[index + 1] || nextSection?.segments[0];
    const visibilityLimit = environment.routeKind === 'road' ? Math.sqrt(2 * model.brake * Math.max(30, section.visibilityM ?? 160)) * (0.78 + 0.2 * skill.reflex) : Infinity;
    const maxSpeed = Math.min(visibilityLimit, cornerLimit(model, segment.radiusM) * (segment.radiusM > 0 ? cornerEfficiency : 0.97 + 0.03 * skill.brave));
    if (segment.radiusM > 0 && speed > maxSpeed) { time += (speed - maxSpeed) / Math.max(1, model.brake * brakingEfficiency); speed = maxSpeed; }
    const start = speed;
    const nextSpeed = next?.radiusM > 0 ? cornerLimit(model, next.radiusM) * cornerEfficiency : model.topSpeed;
    for (let distance = 0; distance < segment.lengthM; distance += 5) {
      const step = Math.min(5, segment.lengthM - distance), remaining = segment.lengthM - distance;
      const approach = Math.sqrt(nextSpeed ** 2 + 2 * model.brake * brakingEfficiency * Math.max(0, remaining - step));
      const target = Math.min(maxSpeed, approach);
      let acceleration = Math.min(model.launch, model.mu * G * model.driveGrip, (model.power * throttleEfficiency / Math.max(3, speed) - model.rolling - model.drag * (decision.manoeuvre === 'slipstream' && !segment.radiusM ? 0.95 : 1) * speed ** 2) / model.mass) - (segment.grade || 0) * G;
      if (speed > target) acceleration = -model.brake * brakingEfficiency;
      let nextVelocity = Math.sqrt(Math.max(0, speed ** 2 + 2 * acceleration * step));
      if (speed <= target) nextVelocity = Math.min(target, nextVelocity);
      else nextVelocity = Math.max(target, nextVelocity);
      time += step / Math.max(0.8, (speed + nextVelocity) / 2);
      speed = nextVelocity; peak = Math.max(peak, speed);
      if (segment.radiusM > 0) peakCorner = Math.max(peakCorner, speed);
    }
    const shifts = [35, 70, 110, 150, 200, 250].filter(kmh => start * 3.6 < kmh && speed * 3.6 >= kmh).length;
    shiftLoss += shifts * (0.12 + 0.3 * (1 - skill.shift));
    // Protecting the inside makes the following acceleration less effective.
    if (segment.radiusM > 0 && decision.line === 'defend') speed *= 0.96;
    if (segment.radiusM > 0 && decision.line === 'apex') speed *= 0.98;
  }
  time += shiftLoss;
  if (decision.manoeuvre === 'prepare') time += 0.12;
  if (decision.manoeuvre === 'overtake') time += 0.08;
  return { time, exitSpeed: speed, peakSpeed: peak * 3.6, cornerSpeed: peakCorner * 3.6, model, skill, shiftLoss, familiarity };
}
function random(state) { state.rng = (Math.imul(1664525, state.rng >>> 0) + 1013904223) >>> 0; return state.rng / 4294967296; }
function aiDecision(state) {
  const context = tacticalContext(state, 'opponent');
  const section = state.sections[state.index];
  // Protecting every apex on a flowing combination costs more than the position is worth.
  const defendCorner = context.canDefend && context.hasCorner && !context.hasStraight && section.segments.every(segment => segment.radiusM > 0 && segment.radiusM < 45);
  const manoeuvre = context.allowed.manoeuvre.includes('overtake') && context.behind ? 'overtake'
    : context.canDefend ? 'defend' : context.allowed.manoeuvre.includes('prepare') ? 'prepare' : 'hold';
  return contextualDecision(state, { ...DEFAULT_DECISION,
    pace: state.lesson ? 'balanced' : state.incidentCue || state.opponent.car.tireGrip < 35 ? 'save' : context.behind && Math.abs(state.gapSeconds) < 2 && state.index >= state.sections.length - 3 ? 'attack' : 'balanced',
    line: defendCorner ? 'defend' : 'exit', manoeuvre }, 'opponent');
}
function mistakeRisk(skills, decision, section, next, environment, familiarity = 0) {
  const curve = section.segments.some(segment => segment.radiusM > 0) || (next?.segments[0]?.radiusM || 0) > 0;
  const lateRisk = curve && decision.braking === 'late' ? 0.09 * (1 - skills.brake) : 0;
  const visibility = /fog|nebbia|night|notte/.test((environment.weather || '').toLowerCase()) ? 1.5 : 1;
  return clamp((0.004 + 0.055 * (1 - skills.clean) ** 2 + lateRisk + (decision.manoeuvre === 'overtake' ? 0.018 : 0)) * (decision.pace === 'attack' ? 1.8 : decision.pace === 'save' ? 0.55 : 1) * visibility * (1 - familiarity * 0.15), 0, 0.35);
}
function drive(state, side, move, decision, section, next) {
  const player = side === 'player', car = player ? state.car : state.opponent.car, pilot = player ? state.pilot : state.opponent.pilot;
  const prepared = player ? state.prepared : state.opponentPrepared;
  const environment = { ...state.environment, routeKind: (state.routeProfile || {}).kind };
  const result = simulateBlock(car, pilot, move, decision, section, next, player ? state.playerSpeed || 0 : state.opponentSpeed || 0, environment, false, prepared);
  const ideal = simulateBlock(car, pilot, null, DEFAULT_DECISION, section, next, player ? state.playerSpeed || 0 : state.opponentSpeed || 0, environment, true);
  const curve = section.segments.some(segment => segment.radiusM > 0) || (next?.segments[0]?.radiusM || 0) > 0, skill = result.skill;
  const lateRisk = curve && decision.braking === 'late' ? 0.09 * (1 - skill.brake) : 0;
  const errorChance = mistakeRisk(skill, decision, section, next, state.environment, result.familiarity);
  const errorRoll = random(state), severity = random(state), variation = random(state);
  const mistake = errorRoll < errorChance ? 0.25 + severity * (0.5 + 2.2 * (1 - (skill.reflex + skill.clean) / 2)) + (lateRisk > 0 ? 0.8 * (1 - skill.brake) : 0) : 0;
  const lateExitLoss = curve && decision.braking === 'late' ? (1 - skill.brake) * (1 - skill.clean) * 0.38 * (1 - result.familiarity * 0.12) : 0;
  const variance = (variation - 0.5) * 0.06 * (1 - skill.clean);
  const recoveryLoss = mistake * (1 - 0.2 * skill.acro);
  const time = Math.max(0.01, result.time + recoveryLoss + lateExitLoss + variance);
  const km = section.segments.reduce((sum, segment) => sum + segment.lengthM, 0) / 1000;
  const aggression = decision.pace === 'save' ? 0.78 : decision.pace === 'attack' ? 1.3 : 1;
  const techniqueFuel = move?.aggressiveness ? Math.min(1.3, 1 + (move.aggressiveness - 1) * 0.1) : 1;
  const fuel = round(Math.max(0.01, car.cv * 0.0002 * km * aggression * techniqueFuel), 4);
  const tires = round(km * 0.15 * aggression + (move?.costGrip || 0) * 0.12 * aggression, 4);
  const engine = round(km * 0.05 * aggression + (move?.costHealth || 0) * 0.1 * aggression, 4);
  const wear = 1 - clamp(car.engineHealth / 100, 0, 1);
  const failureChance = clamp(km * (0.00002 + wear ** 3 * 0.012) * aggression, 0, 0.2);
  const failureRoll = random(state);
  const broken = !state.lesson && failureRoll < failureChance;
  return { ...result, time, potentialTime: ideal.time, driverLoss: Math.max(0, result.time - ideal.time), mistake: recoveryLoss, errorChance, lateExitLoss, fuel, tires, engine, km, broken,
    exitSpeed: result.exitSpeed * (mistake > 0 ? 0.88 + 0.08 * skill.acro : 1) * (lateExitLoss > 0 ? 0.97 : 1), decision };
}
function decisionPreview(state, decision = DEFAULT_DECISION, moveId = null) {
  const section = state.sections[state.index];
  if (!section) return null;
  const selected = contextualDecision(state, validateDecision(decision)), next = state.sections[state.index + 1];
  const move = moveId === null ? null : state.moves.find(move => move.id === moveId);
  const expected = simulateBlock(state.car, state.pilot, move, selected, section, next, state.playerSpeed || 0, { ...state.environment, routeKind: state.routeProfile?.kind }, false, state.prepared);
  const km = section.segments.reduce((sum, segment) => sum + segment.lengthM, 0) / 1000;
  const aggression = selected.pace === 'save' ? 0.78 : selected.pace === 'attack' ? 1.3 : 1;
  return { seconds: round(expected.time, 1), errorPercent: round(mistakeRisk(expected.skill, selected, section, next, state.environment, expected.familiarity) * 100, 1),
    fuel: round(Math.max(0.01, state.car.cv * 0.0002 * km * aggression * (move?.aggressiveness ? Math.min(1.3, 1 + (move.aggressiveness - 1) * 0.1) : 1))),
    tires: round(km * 0.15 * aggression + (move?.costGrip || 0) * 0.12 * aggression), distanceM: Math.round(section.segments.reduce((sum, segment) => sum + segment.lengthM, 0)),
    cornerLimitKmh: section.segments.some(segment => segment.radiusM > 0) ? round(Math.min(...section.segments.filter(segment => segment.radiusM > 0).map(segment => cornerLimit(expected.model, segment.radiusM) * 3.6)), 0) : null,
    brakingSkill: round(expected.skill.brake * 100, 0), closeEnough: Math.abs(state.gapSeconds || 0) <= 1.2, hasCorner: section.segments.some(segment => segment.radiusM > 0), hasBrakingZone: section.segments.some(segment => segment.radiusM > 0) || (next?.segments[0]?.radiusM || 0) > 0,
    nextStraight: !!next?.segments.some(segment => segment.radiusM === 0 && segment.lengthM >= 200), context: tacticalContext(state), decision: selected };
}
function advanceTacticalRace(input, moveId, rawDecision) {
  const state = structuredClone(input), section = state.sections[state.index];
  if (!section || state.finished) throw new Error('Gara già terminata');
  const requested = validateDecision(rawDecision);
  const decision = contextualDecision(state, requested);
  if (requested.manoeuvre === 'overtake' && state.gapSeconds > 0.01) throw new Error('Sei già davanti: scegli il ritmo o prepara la difesa');
  if (requested.manoeuvre === 'overtake' && Math.abs(state.gapSeconds || 0) > 1.2) throw new Error('Avvicinati entro 1,2 secondi prima di tentare il sorpasso');
  if (requested.manoeuvre === 'overtake' && !tacticalContext(state).allowed.manoeuvre.includes('overtake')) throw new Error('Non c’è spazio o visibilità per sorpassare in questo settore');
  const move = moveId === null ? null : state.moves.find(move => move.id === moveId);
  if (moveId !== null && !move) throw new Error('Mossa non disponibile');
  if (move && !tacticalMovePlayable(move, section, state.sections[state.index + 1], state.gapSeconds)) throw new Error('Mossa non disponibile in questo settore');
  const next = state.sections[state.index + 1], opponentDecision = aiDecision(state, section);
  const player = drive(state, 'player', move, decision, section, next), opponent = drive(state, 'opponent', null, opponentDecision, section, next);
  const log = { section: section.name, move: move?.name || 'Guida normale', moveId, decision, opponentDecision, fuel: 0, tires: 0, engine: 0, delta: 0, comparisons: [], explanations: [] };
  if (state.car.currentFuel + 0.000001 < player.fuel) { state.finished = true; state.failure = 'fuel'; log.event = 'Carburante insufficiente: gara interrotta.'; }
  else {
    const previousGap = state.gapSeconds || 0;
    const cue = incidentCue(state.incidentPlan, state.index);
    if (cue && !state.incidentOccurred) {
      const loss = choice => choice.pace === 'save' ? 0.12 : choice.pace === 'attack' ? 0.65 : 0.3;
      const playerLoss = loss(decision), opponentLoss = loss(opponentDecision);
      player.time += playerLoss; opponent.time += opponentLoss;
      state.incidentOccurred = true;
      log.incident = { kind: cue.kind, playerSeconds: playerLoss, opponentSeconds: opponentLoss };
      log.explanations.push(`${cue.description} Imprevisto esterno: tu +${playerLoss.toFixed(2)} s, rivale +${opponentLoss.toFixed(2)} s. Il ritmo prudente riduce la perdita.`);
    }
    if (decision.manoeuvre === 'defend' && decision.line !== 'defend') { player.time += 0.12; opponent.time += 0.2; log.explanations.push('Hai difeso la linea: entrambi perdete tempo, senza bloccare un’auto molto più veloce.'); }
    if (opponentDecision.manoeuvre === 'defend' && opponentDecision.line !== 'defend') { opponent.time += 0.12; player.time += 0.2; log.explanations.push('Il rivale ha difeso la linea, sacrificando parte del suo passo.'); }
    const opponentOutOfFuel = state.opponent.car.currentFuel + 0.000001 < opponent.fuel;
    // Defending only slows an opponent who is actually close; it costs the defender time too.
    if (previousGap > 0 && previousGap < 1.2 && decision.line === 'defend') { player.time += 0.08; opponent.time += 0.24; log.explanations.push('Hai protetto l’interno: il rivale vicino ha dovuto aspettare.'); }
    if (previousGap < 0 && previousGap > -1.2 && opponentDecision.line === 'defend') { opponent.time += 0.08; player.time += 0.24; log.explanations.push('Il rivale ha chiuso l’interno, rallentando il tuo tentativo.'); }
    const previousPlayerTime = state.playerTime || 0, previousOpponentTime = state.opponentTime || 0;
    state.playerTime = previousPlayerTime + player.time;
    state.opponentTime = previousOpponentTime + opponent.time;
    let gap = state.opponentTime - state.playerTime;
    const passingSpace = sectionFeatures(section, next, state.routeProfile).passingSpace;
    const wide = passingSpace && section.segments.some(segment => segment.widthM >= 10 && segment.lengthM >= 150);
    if (previousGap < 0 && gap > 0 && !(wide && (decision.manoeuvre === 'overtake' || gap > 0.65))) {
      if (decision.manoeuvre !== 'overtake' || !passingSpace) { state.playerTime = state.opponentTime + 0.12; gap = -0.12; log.explanations.push('Hai raggiunto il rivale, ma senza spazio o tentativo resti dietro.'); }
    }
    if (previousGap > 0 && gap < 0 && !(wide && (opponentDecision.manoeuvre === 'overtake' || gap < -0.65))) {
      if (opponentDecision.manoeuvre !== 'overtake' || !passingSpace) { state.opponentTime = state.playerTime + 0.12; gap = 0.12; log.explanations.push('Il rivale ti ha raggiunto, ma non ha completato il sorpasso.'); }
    }
    const openStraight = section.segments.some(segment => !segment.radiusM && segment.widthM >= 10 && segment.lengthM >= 250);
    const defendingCurve = section.segments.some(segment => segment.radiusM > 0);
    if (!openStraight && defendingCurve && previousGap > 0 && previousGap < 1.2 && decision.line === 'defend' && gap < 0 && gap > -0.8) {
      state.opponentTime = state.playerTime + 0.12; gap = 0.12; log.explanations.push('La traiettoria interna ha chiuso il varco: mantieni la posizione, sacrificando tempo sul giro.');
    }
    if (!openStraight && defendingCurve && previousGap < 0 && previousGap > -1.2 && opponentDecision.line === 'defend' && gap > 0 && gap < 0.8) {
      state.playerTime = state.opponentTime + 0.12; gap = -0.12; log.explanations.push('La difesa del rivale ha chiuso il varco: dovrai preparare un altro attacco.');
    }
    state.gapSeconds = round(gap); state.gap = Math.round(state.gapSeconds * 1000);
    state.playerSpeed = player.exitSpeed; state.opponentSpeed = opponent.exitSpeed;
    state.prepared = decision.manoeuvre === 'prepare'; state.opponentPrepared = opponentDecision.manoeuvre === 'prepare';
    for (const [car, result] of [[state.car, player], [state.opponent.car, opponent]]) {
      car.currentFuel = round(Math.max(0, car.currentFuel - result.fuel), 4); car.tireGrip = round(Math.max(0, car.tireGrip - result.tires), 4);
      car.engineHealth = result.broken ? 0 : round(Math.max(0, car.engineHealth - result.engine), 4); car.km += result.km;
    }
    if (player.broken || state.car.engineHealth <= 0) { state.failure = 'engine'; state.finished = true; log.event = 'Motore fuori uso: gara interrotta.'; }
    if (opponent.broken || state.opponent.car.engineHealth <= 0 || opponentOutOfFuel) { state.opponentFailure = 'retired'; state.finished = true; log.explanations.push('Il rivale si è ritirato per un problema alla vettura.'); }
    log.fuel = player.fuel; log.tires = player.tires; log.engine = player.engine;
    log.deltaSeconds = round(state.gapSeconds - previousGap); log.delta = Math.round(log.deltaSeconds * 1000);
    log.playerSeconds = round(state.playerTime - previousPlayerTime); log.opponentSeconds = round(state.opponentTime - previousOpponentTime);
    log.trafficLossSeconds = round(Math.max(0, log.playerSeconds - player.time));
    if (log.trafficLossSeconds > 0.02) log.explanations.push(`Traffico e posizione in pista ti sono costati ${log.trafficLossSeconds.toFixed(2)} s.`);
    log.potentialSeconds = round(player.potentialTime); log.driverLossSeconds = round(player.driverLoss); log.mistakeSeconds = round(player.mistake);
    log.peakKmh = round(player.peakSpeed, 1); log.exitKmh = round(player.exitSpeed * 3.6, 1); log.opponentPeakKmh = round(opponent.peakSpeed, 1);
    if (player.mistake > 0) log.explanations.push(`Piccolo errore di guida: +${player.mistake.toFixed(2)} s. ${decision.braking === 'late' ? 'La staccata tardiva ha richiesto più precisione.' : 'Riflessi e pulizia riducono queste perdite.'}`);
    if (opponent.mistake > 0) log.explanations.push(`Il rivale ha commesso un errore: +${opponent.mistake.toFixed(2)} s.`);
    if (player.lateExitLoss > 0.03) log.explanations.push(`Staccata tardiva: ingresso meno composto, +${player.lateExitLoss.toFixed(2)} s e uscita più lenta.`);
    if (decision.line === 'defend' && !(previousGap > 0 && previousGap < 1.2)) log.explanations.push('Chiudere l’interno senza un rivale vicino ha sacrificato il rilancio senza aiutarti.');
    if (decision.manoeuvre === 'prepare') log.explanations.push('Hai lasciato 0,12 s per preparare il prossimo rilancio.');
    log.explanations.push(`Il pilota ha lasciato ${player.driverLoss.toFixed(2)} s rispetto al potenziale stimato della stessa auto.`);
    if (opponent.peakSpeed > player.peakSpeed + 8) log.explanations.push('La velocità della vettura rivale si è fatta sentire in questo tratto.');
  }
  state.index += 1;
  state.incidentCue = incidentCue(state.incidentPlan, state.index);
  if (state.index === state.sections.length) state.finished = true;
  if (state.finished) state.outcome = state.failure ? 'loss' : state.opponentFailure ? 'win' : state.gapSeconds > 0.01 ? 'win' : state.gapSeconds < -0.01 ? 'loss' : 'draw';
  state.logs.push(log);
  return state;
}
export { DEFAULT_DECISION, DECISION_OPTIONS, validateDecision, ability, vehicleModel, simulateBlock, decisionPreview, aiDecision, advanceTacticalRace };
