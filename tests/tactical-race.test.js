import { test } from 'node:test';
import assert from 'node:assert/strict';
import { advanceRace, BASE_MOVES } from '../shared/raceEngine.mjs';
import { advanceTacticalRace, vehicleModel, simulateBlock, DEFAULT_DECISION, decisionPreview, validateDecision, aiDecision } from '../shared/tacticalRace.mjs';
import { tacticalContext, routeProfileFor, incidentPlan, incidentCue } from '../shared/raceContext.mjs';
import { DEMO_TRACK, buildTacticalTrack } from '../shared/trackGeometry.mjs';
import { makeRace, simulate, balanceReport } from '../scripts/race-balance.mjs';

test('tactical engine is deterministic, preserves inputs and derives the gap from elapsed times', () => {
  const input = makeRace({ seed: 12345 }), copy = structuredClone(input);
  const a = advanceRace(input, null, DEFAULT_DECISION), b = advanceRace(input, null, DEFAULT_DECISION);
  assert.deepEqual(a, b); assert.deepEqual(input, copy);
  assert.equal(a.gap, Math.round(a.gapSeconds * 1000));
  assert.ok(Math.abs(a.gapSeconds - (a.opponentTime - a.playerTime)) < 0.001);
});
test('driver abilities and techniques never increase physical power or speed limits', () => {
  const input = makeRace(), model = vehicleModel(input.car, input.environment);
  const section = { name: 'Straight', segments: [{ lengthM: 3000, radiusM: 0, widthM: 12 }] };
  const rookie = simulateBlock(input.car, input.pilot, null, DEFAULT_DECISION, section, null, 0, input.environment);
  const expert = simulateBlock(input.car, Object.fromEntries(Object.keys(input.pilot).map(key => [key, 1000])), BASE_MOVES[2], { ...DEFAULT_DECISION, pace: 'attack' }, section, null, 0, input.environment);
  assert.equal(rookie.model.power, expert.model.power);
  assert.ok(expert.peakSpeed <= model.topSpeed * 3.6 + 0.001);
  assert.ok(expert.time < rookie.time);
});
test('lateral grip bounds corner speed even for exceptional pilots', () => {
  const input = makeRace(), section = { name: 'Hairpin', segments: [{ lengthM: 120, radiusM: 20, widthM: 9 }] };
  const pilot = Object.fromEntries(Object.keys(input.pilot).map(key => [key, 10000]));
  const result = simulateBlock(input.car, pilot, null, { ...DEFAULT_DECISION, pace: 'attack' }, section, null, 30, input.environment);
  const limit = Math.sqrt(result.model.mu * 9.81 * 20) * 3.6;
  assert.ok(result.cornerSpeed <= limit + 0.001);
  assert.ok(result.time > 120 / (limit / 3.6));
});
test('preserving tires trades speed for lower fuel, wear and mistake risk', () => {
  const input = makeRace(), save = advanceTacticalRace(input, null, { ...DEFAULT_DECISION, pace: 'save' });
  const attack = advanceTacticalRace(input, null, { ...DEFAULT_DECISION, pace: 'attack' });
  assert.ok(save.logs[0].fuel < attack.logs[0].fuel);
  assert.ok(save.logs[0].tires < attack.logs[0].tires);
  assert.ok(save.playerTime > attack.playerTime);
  assert.ok(decisionPreview(input, { ...DEFAULT_DECISION, pace: 'save' }).errorPercent < decisionPreview(input, { ...DEFAULT_DECISION, pace: 'attack' }).errorPercent);
});
test('late braking is riskier, especially for a novice; it does not provide a free gain before a curve', () => {
  const novice = makeRace({ mySkill: 5 }), expert = makeRace({ mySkill: 100 });
  const late = { ...DEFAULT_DECISION, braking: 'late' };
  assert.ok(decisionPreview(novice, late).errorPercent > decisionPreview(novice, DEFAULT_DECISION).errorPercent);
  assert.ok(decisionPreview(novice, late).errorPercent > decisionPreview(expert, late).errorPercent);
  const result = advanceTacticalRace(novice, null, late);
  assert.ok(result.logs[0].explanations.some(text => /Staccata tardiva/.test(text)));
});
test('stale defence is reset to a valid line when the rival is far away', () => {
  const input = makeRace(); input.index = 1; input.gapSeconds = 4; input.gap = 4000; input.playerSpeed = 20;
  const clean = advanceTacticalRace(input, null, DEFAULT_DECISION);
  const defend = advanceTacticalRace(input, null, { ...DEFAULT_DECISION, line: 'defend' });
  assert.equal(defend.playerTime, clean.playerTime);
  assert.equal(defend.logs[0].decision.line, 'exit');
});
test('overtaking requires being close and behind; malformed decisions are rejected', () => {
  const input = makeRace(); input.gapSeconds = -3;
  assert.throws(() => advanceTacticalRace(input, null, { ...DEFAULT_DECISION, manoeuvre: 'overtake' }), /1,2/);
  input.gapSeconds = 0.5;
  assert.throws(() => advanceTacticalRace(input, null, { ...DEFAULT_DECISION, manoeuvre: 'overtake' }), /già davanti/);
  assert.throws(() => validateDecision({ pace: 'unlimited' }), /non valida/);
  assert.throws(() => validateDecision({ power: 10000 }), /non riconosciuto/);
  assert.throws(() => validateDecision(null), /non valida/);
});
test('wet roads lengthen the same lap and novice pilots lose more usable performance', () => {
  const dry = simulate({ seed: 12345 }), wet = simulate({ seed: 12345, weather: 'rainy' });
  assert.ok(wet.playerTime > dry.playerTime);
  const novice = makeRace({ mySkill: 5 }), expert = makeRace({ mySkill: 100 });
  const section = DEMO_TRACK.sections[2];
  const n = simulateBlock(novice.car, novice.pilot, null, DEFAULT_DECISION, section, null, 15, novice.environment);
  const e = simulateBlock(expert.car, expert.pilot, null, DEFAULT_DECISION, section, null, 15, expert.environment);
  const ideal = simulateBlock(expert.car, expert.pilot, null, DEFAULT_DECISION, section, null, 15, expert.environment, true);
  assert.ok(n.time > e.time); assert.ok(e.time >= ideal.time);
});
test('legacy tracks are grouped into at most eight decisions without losing their distance', () => {
  const source = Array.from({ length: 64 }, (_, i) => ({ name: i % 2 ? 'Hairpin Right' : 'Long Straight' }));
  const blocks = buildTacticalTrack(source, 16);
  assert.equal(blocks.length, 8);
  assert.equal(blocks.reduce((sum, block) => sum + block.segments.length, 0), 64);
  assert.ok(Math.abs(blocks.flatMap(block => block.segments).reduce((sum, segment) => sum + segment.lengthM, 0) - 16000) < 0.001);
  assert.equal(DEMO_TRACK.sections.length, 8);
  assert.equal(DEMO_TRACK.sections.flatMap(section => section.segments).reduce((sum, segment) => sum + segment.lengthM, 0), 3040);
});
test('repeated balance scenarios preserve mechanical advantage and allow appropriate skill upsets', () => {
  const report = balanceReport(150);
  for (const row of report) assert.equal(row.accepted, true, JSON.stringify(row));
});

test('defending can preserve position in a close corner fight, at a cost to lap time', () => {
  const input = makeRace({ mySkill: 5, theirSkill: 5, seed: 12345 });
  Object.assign(input, { index: 1, gapSeconds: 0.05, playerTime: 10, opponentTime: 10.05, playerSpeed: 20, opponentSpeed: 20 });
  const clean = advanceTacticalRace(input, null, DEFAULT_DECISION), defend = advanceTacticalRace(input, null, { ...DEFAULT_DECISION, line: 'defend' });
  assert.ok(clean.gapSeconds < 0); assert.ok(defend.gapSeconds > 0);
  assert.ok(defend.logs[0].playerSeconds > clean.logs[0].playerSeconds);
});
test('preparing a long straight improves the next acceleration while remaining inside the power envelope', () => {
  const input = makeRace(), section = input.sections[3], next = input.sections[4];
  const normal = simulateBlock(input.car, input.pilot, null, DEFAULT_DECISION, section, next, 18, input.environment, false, false);
  const prepared = simulateBlock(input.car, input.pilot, null, DEFAULT_DECISION, section, next, 18, input.environment, false, true);
  assert.ok(normal.time - prepared.time > 0.12);
  assert.equal(normal.model.power, prepared.model.power);
  assert.ok(prepared.peakSpeed <= prepared.model.topSpeed * 3.6);
});
test('logged sector durations reconcile with race clocks, including traffic delays', () => {
  const result = simulate({ seed: 12345 });
  const player = result.logs.reduce((sum, log) => sum + (log.playerSeconds || 0), 0);
  const opponent = result.logs.reduce((sum, log) => sum + (log.opponentSeconds || 0), 0);
  assert.ok(Math.abs(player - result.playerTime) < 0.01);
  assert.ok(Math.abs(opponent - result.opponentTime) < 0.01);
});


test('choices follow straight, braking approach, position and passing space for both drivers', () => {
  const state = makeRace();
  state.index = 7; state.gapSeconds = 0.5;
  let context = tacticalContext(state);
  assert.deepEqual(context.allowed.braking, ['optimal']);
  assert.deepEqual(context.allowed.line, ['exit']);
  assert.deepEqual(context.allowed.manoeuvre, ['hold', 'defend']);
  assert.ok(tacticalContext(state, 'opponent').allowed.manoeuvre.includes('overtake'));
  state.index = 0; state.gapSeconds = -0.5;
  context = tacticalContext(state);
  assert.equal(context.brakingAhead, true);
  assert.ok(context.allowed.braking.includes('late'));
  assert.ok(context.allowed.manoeuvre.includes('slipstream'));
  assert.ok(!context.allowed.line.includes('defend'));
  state.gapSeconds = -4;
  assert.deepEqual(tacticalContext(state).allowed.manoeuvre, ['hold']);
  state.index = 1; state.gapSeconds = 0.5;
  assert.ok(tacticalContext(state).allowed.line.includes('defend'));
  assert.ok(!tacticalContext(state).allowed.manoeuvre.includes('prepare'));
});

test('server normalizes irrelevant choices but rejects an attack with no visibility or space', () => {
  const state = makeRace(); state.index = 7; state.gapSeconds = 3;
  const result = advanceTacticalRace(state, null, { pace: 'balanced', braking: 'late', line: 'defend', manoeuvre: 'prepare' });
  assert.deepEqual(result.logs[0].decision, DEFAULT_DECISION);
  state.routeProfile = routeProfileFor('street'); state.sections[7].visibilityM = 65; state.gapSeconds = -0.5;
  assert.throws(() => advanceTacticalRace(state, null, { ...DEFAULT_DECISION, manoeuvre: 'overtake' }), /visibilità/);
  const ai = aiDecision({ ...state, gapSeconds: 0.5 });
  assert.equal(ai.manoeuvre, 'hold');
});

test('road profiles narrow inferred geometry and visibility limits actual speed', () => {
  const state = makeRace(), profile = routeProfileFor('street');
  assert.equal(profile.traffic, 'none');
  assert.equal(routeProfileFor('street', 'Traffico urbano').traffic, 'light');
  const blocks = buildTacticalTrack([{ name: 'Rettilineo cieco' }], 2, profile);
  assert.equal(blocks[0].visibilityM, 65);
  assert.ok(blocks[0].segments[0].widthM < 8);
  const open = { ...blocks[0], visibilityM: 1000 };
  const hidden = simulateBlock(state.car, state.pilot, null, DEFAULT_DECISION, blocks[0], null, 0, { ...state.environment, routeKind: 'road' });
  const clear = simulateBlock(state.car, state.pilot, null, DEFAULT_DECISION, open, null, 0, { ...state.environment, routeKind: 'road' });
  assert.ok(hidden.peakSpeed < clear.peakSpeed);
  assert.ok(hidden.time > clear.time);
});

test('slipstream lowers straight losses only when behind and close without increasing engine power', () => {
  const state = makeRace(); state.index = 3; state.gapSeconds = -0.5;
  const normal = decisionPreview(state);
  const draft = decisionPreview(state, { ...DEFAULT_DECISION, manoeuvre: 'slipstream' });
  assert.ok(draft.seconds <= normal.seconds);
  state.gapSeconds = 2;
  assert.equal(decisionPreview(state, { ...DEFAULT_DECISION, manoeuvre: 'slipstream' }).decision.manoeuvre, 'hold');
});

test('external incidents affect about five percent of races, independent of sector count and position', () => {
  let count = 0;
  for (let seed = 1; seed <= 10000; seed++) {
    const short = incidentPlan(seed * 7919, 8, routeProfileFor('track'));
    const long = incidentPlan(seed * 7919, 80, routeProfileFor('track'));
    assert.equal(Boolean(short), Boolean(long));
    if (short) { count++; assert.ok(short.index >= 0 && short.index < 8); }
  }
  assert.ok(count > 400 && count < 600, `incidents: ${count}`);
});

test('a signalled external incident is deterministic, affects both cars and happens at most once', () => {
  const state = makeRace({ seed: 12345 });
  state.incidentPlan = { index: 0, kind: 'debris' };
  state.incidentCue = incidentCue(state.incidentPlan, 0);
  const save = advanceTacticalRace(state, null, { ...DEFAULT_DECISION, pace: 'save' });
  const attack = advanceTacticalRace(state, null, { ...DEFAULT_DECISION, pace: 'attack' });
  assert.ok(save.logs[0].incident.playerSeconds < attack.logs[0].incident.playerSeconds);
  assert.ok(save.logs[0].incident.opponentSeconds > 0);
  assert.equal(save.incidentCue, null);
  assert.deepEqual(save, advanceTacticalRace(state, null, { ...DEFAULT_DECISION, pace: 'save' }));
  let race = save;
  while (!race.finished) race = advanceTacticalRace(race, null, DEFAULT_DECISION);
  assert.equal(race.logs.filter(log => log.incident).length, 1);
  assert.ok(Math.abs(race.logs.reduce((sum, log) => sum + log.playerSeconds, 0) - race.playerTime) < 0.01);
});
