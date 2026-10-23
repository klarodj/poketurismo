import { advanceTacticalRace, aiDecision, DEFAULT_DECISION } from '../shared/tacticalRace.mjs';
import { incidentPlan, incidentCue, routeProfileFor } from '../shared/raceContext.mjs';
import { learnedTechnique, PRACTICE_CAP } from '../shared/driverDevelopment.mjs';
import { tacticalMovePlayable } from '../shared/raceContext.mjs';
import { DEMO_TRACK } from '../shared/trackGeometry.mjs';
const PILOT_KEYS = ['brave', 'clean', 'reflex', 'shift', 'acro', 'turn', 'brake', 'throttle'];
const pilot = value => Object.fromEntries(PILOT_KEYS.map(key => [key, value]));
const CARS = {
  hatch: { cc:1600,engineType:'NA',name: 'Compatta 120', cv: 120, kg: 1000, velMax: 190, zeroToHundred: 9, turnSlow: 75, turnFast: 65, brake: 65, traction: 68, driveType: 'FF' },
  sport: { cc:2000,engineType:'NA',name: 'Sportiva 150', cv: 150, kg: 1100, velMax: 210, zeroToHundred: 8, turnSlow: 70, turnFast: 70, brake: 70, traction: 70, driveType: 'FR' },
  gt: { cc:3000,engineType:'Turbo',name: 'GT 300', cv: 300, kg: 1450, velMax: 260, zeroToHundred: 5.5, turnSlow: 70, turnFast: 80, brake: 80, traction: 78, driveType: 'FR' },
  supercar: { cc:5000,engineType:'NA',name: 'Supercar 500', cv: 500, kg: 1450, velMax: 310, zeroToHundred: 3.8, turnSlow: 72, turnFast: 85, brake: 88, traction: 82, driveType: 'AWD' }
};
const condition = car => ({ ...car, baseCv: car.cv, baseKg: car.kg, engineHealth: 100, tireGrip: 100, currentFuel: 35, fuelType: 'Normale', km: 0, serviceKm: 0 });
const TRACKS = {
  mixed: DEMO_TRACK.sections,
  fast: Array.from({ length: 6 }, (_, index) => ({ name: `Allungo ${index + 1}`, type: 'Rettilineo', segments: [{ lengthM: 950, radiusM: 0, widthM: 12 }, { lengthM: 160, radiusM: 180, widthM: 12 }] })),
  technical: Array.from({ length: 8 }, (_, index) => ({ name: `Curve ${index + 1}`, type: 'Tornante', segments: [{ lengthM: 100, radiusM: 0, widthM: 10 }, { lengthM: 100, radiusM: index % 2 ? 25 : 40, widthM: 9 }] }))
};
function makeRace({ mine = 'hatch', theirs = 'hatch', mySkill = 30, theirSkill = 30, track = 'mixed', weather = 'Asciutto', seed = 1, practice = 0, technique = false } = {}) {
  const sections = structuredClone(TRACKS[track]);
  const routeProfile = routeProfileFor('track');
  const plan = incidentPlan(seed, sections.length, routeProfile);
  return { rulesVersion: 3, fuelModelVersion:2, routeProfile, incidentPlan: plan, incidentCue: incidentCue(plan, 0), car: condition(CARS[mine]), pilot: { ...pilot(mySkill), fundamentals: { early: Math.min(PRACTICE_CAP, practice), optimal: Math.min(PRACTICE_CAP, practice), late: Math.min(PRACTICE_CAP, practice) } }, opponent: { car: condition(CARS[theirs]), pilot: pilot(theirSkill) },
    sections, moves: technique ? [learnedTechnique(60)] : [], index: 0, gap: 0, gapSeconds: 0, playerTime: 0, opponentTime: 0, playerSpeed: 0, opponentSpeed: 0, logs: [], rng: seed, finished: false,
    distanceKm: sections.reduce((sum, section) => sum + section.segments.reduce((sum, segment) => sum + segment.lengthM, 0), 0) / 1000,
    environment: { weather, surface: 'Asfalto' } };
}
function simulate(config, policy = 'adaptive') {
  let state = makeRace(config);
  while (!state.finished) {
    const decision = policy === 'adaptive' ? aiDecision({ ...state, car: state.opponent.car, opponent: { ...state.opponent, car: state.car }, gapSeconds: -state.gapSeconds }, state.sections[state.index])
      : policy === 'reckless' ? { ...DEFAULT_DECISION, pace: 'attack', braking: 'late', line: 'defend' }
      : policy === 'save' ? { ...DEFAULT_DECISION, pace: 'save' } : DEFAULT_DECISION;
    const move = state.moves.find(move => tacticalMovePlayable(move, state.sections[state.index], state.sections[state.index + 1], state.gapSeconds));
    state = advanceTacticalRace(state, move?.id || null, decision);
  }
  return state;
}
const SCENARIOS = [
  { name: 'Stessa auto, piloti equivalenti', mine: 'hatch', theirs: 'hatch', mySkill: 30, theirSkill: 30, track: 'mixed', min: 0.35, max: 0.65 },
  { name: 'Stessa auto, pratica e tecnica massime contro pilota senza pratica', mine: 'hatch', theirs: 'hatch', mySkill: 30, theirSkill: 30, track: 'mixed', practice: 120, technique: true, min: 0.5, max: 0.75 },
  { name: 'Stessa auto, esperto contro principiante', mine: 'hatch', theirs: 'hatch', mySkill: 100, theirSkill: 5, track: 'mixed', min: 0.85, max: 1 },
  { name: 'Auto più potente, piloti equivalenti', mine: 'hatch', theirs: 'sport', mySkill: 30, theirSkill: 30, track: 'mixed', min: 0, max: 0.15 },
  { name: 'Compatta esperta contro sportiva principiante sul misto', mine: 'hatch', theirs: 'sport', mySkill: 100, theirSkill: 5, track: 'mixed', min: 0.55, max: 1 },
  { name: 'Compatta esperta contro sportiva principiante sul tecnico', mine: 'hatch', theirs: 'sport', mySkill: 100, theirSkill: 5, track: 'technical', min: 0.7, max: 1 },
  { name: 'Compatta esperta contro GT principiante sul veloce', mine: 'hatch', theirs: 'gt', mySkill: 100, theirSkill: 5, track: 'fast', min: 0, max: 0.05 },
  { name: 'Compatta esperta contro supercar preparata', mine: 'hatch', theirs: 'supercar', mySkill: 100, theirSkill: 40, track: 'mixed', min: 0, max: 0.03 },
  { name: 'Padronanza massima in compatta contro GT sul veloce', mine: 'hatch', theirs: 'gt', mySkill: 100, theirSkill: 5, track: 'fast', practice: 120, technique: true, min: 0, max: 0.05 },
  { name: 'Padronanza massima in compatta contro supercar preparata', mine: 'hatch', theirs: 'supercar', mySkill: 100, theirSkill: 40, track: 'mixed', practice: 120, technique: true, min: 0, max: 0.03 },
  { name: 'Equivalenti sul bagnato', mine: 'hatch', theirs: 'hatch', mySkill: 30, theirSkill: 30, track: 'mixed', weather: 'rainy', min: 0.35, max: 0.65 }
];
function balanceReport(samples = 500) {
  return SCENARIOS.map(scenario => {
    let wins = 0, draws = 0, gap = 0, myTime = 0, theirTime = 0;
    for (let seed = 1; seed <= samples; seed++) {
      const race = simulate({ ...scenario, seed: seed * 7919 });
      wins += race.outcome === 'win' ? 1 : 0; draws += race.outcome === 'draw' ? 1 : 0;
      gap += race.gapSeconds; myTime += race.playerTime; theirTime += race.opponentTime;
    }
    const rate = (wins + draws / 2) / samples;
    return { scenario: scenario.name, samples, winPercent: Number((rate * 100).toFixed(1)), averageGapSeconds: Number((gap / samples).toFixed(2)), mySeconds: Number((myTime / samples).toFixed(2)), opponentSeconds: Number((theirTime / samples).toFixed(2)), accepted: rate >= scenario.min && rate <= scenario.max };
  });
}
if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  const samples = Number(process.argv[2] || 500);
  if (!Number.isSafeInteger(samples) || samples < 1 || samples > 10000) throw new Error('Numero simulazioni non valido');
  const report = balanceReport(samples);
  console.table(report);
  if (report.some(row => !row.accepted)) process.exitCode = 1;
}
export { CARS, TRACKS, makeRace, simulate, SCENARIOS, balanceReport };
