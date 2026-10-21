// Diagnostic timed simulation: same pure engine as the API, no database writes.
const { advanceRace, CAR_STATS, PILOT_STATS } = require('./raceEngine');
const { DEMO_TRACK } = require('../shared/trackGeometry.mjs');
const { DEFAULT_DECISION } = require('../shared/tacticalRace.mjs');
const car = { ...Object.fromEntries(CAR_STATS.map(key => [key, 70])), cv: 150, baseCv: 150, kg: 1100, baseKg: 1100, velMax: 210, zeroToHundred: 8, currentFuel: 20, fuelType: 'Normale', engineHealth: 100, tireGrip: 100, km: 0, serviceKm: 0 };
let state = { rulesVersion: 3, car, pilot: Object.fromEntries(PILOT_STATS.map(key => [key, 30])), opponent: { car: { ...car }, pilot: Object.fromEntries(PILOT_STATS.map(key => [key, 30])) },
  sections: DEMO_TRACK.sections, environment: DEMO_TRACK.environment, distanceKm: DEMO_TRACK.distanceKm, rng: 12345, moves: [], gap: 0, gapSeconds: 0, playerTime: 0, opponentTime: 0, index: 0, logs: [], finished: false };
while (!state.finished) state = advanceRace(state, null, DEFAULT_DECISION);
console.log(JSON.stringify({ track: DEMO_TRACK.name, turns: state.index, playerSeconds: state.playerTime, opponentSeconds: state.opponentTime, gapSeconds: state.gapSeconds, outcome: state.outcome }, null, 2));
