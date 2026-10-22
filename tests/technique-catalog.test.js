import { test } from 'node:test';
import assert from 'node:assert/strict';
import { TECHNIQUES, TECHNIQUE_BY_ID, PATHS, techniqueMove, publicCurriculum } from '../shared/techniqueCatalog.mjs';
import { createTechniqueLesson, techniqueLessonFeedback } from '../shared/techniqueLessons.mjs';
import { LESSON_SECTIONS } from '../shared/driverDevelopment.mjs';
import { advanceTacticalRace, simulateBlock, DEFAULT_DECISION } from '../shared/tacticalRace.mjs';
import { contextualDecision, tacticalMovePlayable } from '../shared/raceContext.mjs';
import { PILOT_STATS } from '../shared/raceEngine.mjs';
const pilot = Object.fromEntries(PILOT_STATS.map(key => [key, 30]));

test('50 techniques cover 10 complete growing paths, all eight abilities and different racing environments', () => {
  assert.equal(TECHNIQUES.length, 50); assert.equal(new Set(TECHNIQUES.map(t => t.id)).size, 50); assert.equal(PATHS.length, 10);
  assert.deepEqual(new Set(TECHNIQUES.flatMap(t => [t.primary,t.secondary])), new Set(PILOT_STATS));
  for (const path of PATHS) {
    const items = TECHNIQUES.filter(t => t.path === path.id); assert.equal(items.length, 5);
    for (let i=1;i<items.length;i++) { assert.ok(items[i].minLevel > items[i-1].minLevel); assert.equal(items[i].prerequisite, items[i-1].id); assert.ok(items[i].exercises > items[i-1].exercises); }
  }
  for(const weather of ['dry','wet','snow','lowVisibility']) assert.ok(TECHNIQUES.some(t=>t.conditions.weather===weather));
  for(const geometry of ['braking','corner','slowCorner','fastCorner','straight','chicane','uphill','downhill']) assert.ok(TECHNIQUES.some(t=>t.conditions.geometry===geometry));
  for(const route of ['circuit','road']) assert.ok(TECHNIQUES.some(t=>t.conditions.route===route));
  assert.ok(TECHNIQUES.some(t=>t.conditions.surface==='loose'));
});
test('every authored course has executable instructions and at least one exercise matching its own technique context', () => {
  for(const technique of TECHNIQUES) {
    let state=createTechniqueLesson(technique,pilot,12345);let useful=0;
    for(let index=0;index<state.sections.length;index++) {
      const goal=technique.id==='progressive-release'?{...DEFAULT_DECISION,braking:LESSON_SECTIONS[index].braking}:state.sections[index].goal;
      assert.deepEqual(contextualDecision(state,goal),goal,technique.id+' exercise '+index);
      if(tacticalMovePlayable(techniqueMove(technique),state.sections[index],state.sections[index+1],state.gapSeconds,state,goal)) useful++;
      state=advanceTacticalRace(state,null,goal);
      if(state.courseTechniqueId) { assert.equal(techniqueLessonFeedback(state).correct,true,technique.id);if(!state.finished)state.gapSeconds=state.sections[state.index].scenarioGap; }
    }
    assert.ok(useful>0,technique.id+' has no matching exercise'); assert.equal(state.logs.length,technique.exercises);assert.equal(state.failure,undefined);
  }
});
test('catalogue gates depend on level AND prerequisites; no fresh pilot has a learned technique', () => {
  const fresh=publicCurriculum(null,1);assert.equal(fresh.filter(t=>t.learned).length,0);
  assert.equal(fresh.filter(t=>t.unlocked).length,4);
  assert.equal(publicCurriculum(null,99).find(t=>t.id==='trail-braking').unlocked,false);
  const row={techniqueProgress:JSON.stringify({'late-braking':{passed:true}})};
  assert.equal(publicCurriculum(row,20).find(t=>t.id==='trail-braking').unlocked,true);
  assert.equal(publicCurriculum(row,19).find(t=>t.id==='trail-braking').unlocked,false);
});
test('mastery has a strict budget and never changes physical power or tyre adhesion', () => {
  for(const technique of TECHNIQUES) {
    const learned=techniqueMove(technique,0), mastered=techniqueMove(technique,60);
    assert.deepEqual(techniqueMove(technique,999999),mastered);
    assert.equal(Object.values(mastered.skillBonus).reduce((a,b)=>a+b,0)-Object.values(learned.skillBonus).reduce((a,b)=>a+b,0),2);
    assert.ok(Object.values(mastered.skillBonus).reduce((a,b)=>a+b,0)<=9);
    assert.ok(Object.keys(mastered.skillBonus).every(key=>PILOT_STATS.includes(key)));
    const state=createTechniqueLesson(technique,pilot,123),section=state.sections[0],next=state.sections[1];
    const a=simulateBlock(state.car,pilot,null,DEFAULT_DECISION,section,next,0,state.environment),b=simulateBlock(state.car,pilot,mastered,DEFAULT_DECISION,section,next,0,state.environment);
    assert.equal(a.model.power,b.model.power);assert.equal(a.model.mu,b.model.mu);
    assert.ok(b.time>=a.time*0.97,technique.id+' is more than 3% faster on a sector');
  }
});
test('conditions are enforced for both tactical choices and weather, never granting a wet bonus on dry asphalt', () => {
  const technique=TECHNIQUE_BY_ID['wet-exit'],state=createTechniqueLesson(technique,pilot,42);const move=techniqueMove(technique);
  const goal=state.sections[0].goal;
  assert.ok(tacticalMovePlayable(move,state.sections[0],state.sections[1],0,state,goal));
  state.environment.weather='Asciutto';assert.equal(tacticalMovePlayable(move,state.sections[0],state.sections[1],0,state,goal),false);
  state.moves=[move];assert.throws(()=>advanceTacticalRace(state,move.id,goal),/Tecnica non disponibile/);
  state.environment.weather='Pioggia';assert.equal(tacticalMovePlayable(move,state.sections[0],state.sections[1],0,state,{...goal,line:'apex'}),false);
});
