import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LESSON_SECTIONS, createLessonState, lessonFeedback, learnedTechnique, practiceFromRace } from '../shared/driverDevelopment.mjs';
import { advanceTacticalRace, DEFAULT_DECISION, decisionPreview, simulateBlock } from '../shared/tacticalRace.mjs';
import { tacticalMovePlayable } from '../shared/raceContext.mjs';
import { makeRace, simulate } from '../scripts/race-balance.mjs';

test('lesson objectives are physically relevant and passing evaluates decisions rather than lucky race results', () => {
  let state = createLessonState(makeRace().pilot, 12345);
  for (const goal of LESSON_SECTIONS) {
    assert.ok(decisionPreview(state).hasBrakingZone);
    state = advanceTacticalRace(state, null, { ...DEFAULT_DECISION, braking: goal.braking });
    assert.equal(lessonFeedback(state).correct, true);
  }
  assert.equal(state.logs.length, 4);
  state.logs[0].mistakeSeconds = 999;
  assert.equal(lessonFeedback(state, 0).correct, true);
  state.logs[0].decision.braking = 'late';
  assert.equal(lessonFeedback(state, 0).correct, false);
});
test('full braking familiarity modestly improves execution without changing power or grip, and late braking stays risky', () => {
  const base = makeRace(), master = makeRace({ practice: 120 });
  const decision = { ...DEFAULT_DECISION, braking: 'late' };
  assert.ok(decisionPreview(master, decision).errorPercent < decisionPreview(base, decision).errorPercent);
  assert.ok(decisionPreview(master, decision).errorPercent > decisionPreview(master, DEFAULT_DECISION).errorPercent);
  const a = simulateBlock(base.car, base.pilot, null, decision, base.sections[0], base.sections[1], 0, base.environment);
  const b = simulateBlock(master.car, master.pilot, null, decision, master.sections[0], master.sections[1], 0, master.environment);
  assert.equal(a.model.power, b.model.power); assert.equal(a.model.mu, b.model.mu);
  assert.ok(Math.abs(a.time - b.time) / a.time < 0.03);
  assert.ok(b.cornerSpeed <= Math.sqrt(b.model.mu * 9.81 * 22) * 3.6);
});
test('braking familiarity has no free effect on a straight without a braking zone', () => {
  const base = makeRace(), master = makeRace({ practice: 120 });
  base.index = 7; master.index = 7;
  assert.equal(decisionPreview(base).errorPercent, decisionPreview(master).errorPercent);
  assert.equal(decisionPreview(base).seconds, decisionPreview(master).seconds);
});
test('new technique is contextual, has bounded mastery and never changes physical engine output', () => {
  const state = makeRace(), learned = learnedTechnique(), mastered = learnedTechnique(999999);
  assert.deepEqual(mastered.skillBonus, { brake: 3, clean: 2 });
  assert.deepEqual(learnedTechnique(60), mastered);
  assert.ok(tacticalMovePlayable(learned, state.sections[0], state.sections[1], 0));
  assert.equal(tacticalMovePlayable(learned, state.sections[7], null, 0), false);
  const a = simulateBlock(state.car, state.pilot, learned, DEFAULT_DECISION, state.sections[0], state.sections[1], 0, state.environment);
  const b = simulateBlock(state.car, state.pilot, mastered, DEFAULT_DECISION, state.sections[0], state.sections[1], 0, state.environment);
  assert.equal(a.model.power, b.model.power); assert.equal(a.model.mu, b.model.mu);
  assert.ok(Math.abs(a.time - b.time) / a.time < 0.02);
});
test('practice only counts actually driven braking zones, with per-race caps and some learning after mistakes', () => {
  const state = makeRace();
  state.sections = [state.sections[7]];
  state.logs = [{ playerSeconds: 10, decision: { ...DEFAULT_DECISION, braking: 'late' }, moveId: 'progressive-release' }];
  assert.deepEqual(practiceFromRace(state), { gains: { early: 0, optimal: 0, late: 0 }, technique: 0 });
  state.sections = LESSON_SECTIONS; state.logs = LESSON_SECTIONS.map(() => ({ playerSeconds: 10, decision: DEFAULT_DECISION, mistakeSeconds: 1, moveId: 'progressive-release' }));
  assert.equal(practiceFromRace(state).gains.optimal, 4);
  state.logs.forEach(log => { log.mistakeSeconds = 0; });
  assert.equal(practiceFromRace(state).gains.optimal, 6);
  assert.equal(practiceFromRace(state).technique, 6);
});
test('maximal familiarity and the new technique remain a small part of total lap performance', () => {
  let baseSeconds = 0, masterSeconds = 0;
  for (let seed = 1; seed <= 100; seed++) {
    baseSeconds += simulate({ seed: seed * 7919 }).playerTime;
    masterSeconds += simulate({ seed: seed * 7919, practice: 120, technique: true }).playerTime;
  }
  assert.ok(masterSeconds < baseSeconds);
  assert.ok((baseSeconds - masterSeconds) / baseSeconds < 0.02);
});


test('adaptive drivers defend in slow corners and keep their pace through flowing combinations', async () => {
  const { aiDecision } = await import('../shared/tacticalRace.mjs');
  const state = makeRace(); state.gapSeconds = -0.5;
  state.index = 1; assert.equal(aiDecision(state).line, 'defend');
  state.index = 2; assert.equal(aiDecision(state).line, 'exit');
  state.index = 5; assert.equal(aiDecision(state).line, 'exit');
});
