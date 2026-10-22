import {test} from 'node:test';
import assert from 'node:assert/strict';
import {makeRace} from '../scripts/race-balance.mjs';
import {advanceRace} from '../shared/raceEngine.mjs';
import {DEFAULT_DECISION} from '../shared/tacticalRace.mjs';
import {tacticalContext} from '../shared/raceContext.mjs';
test('meet laps have no traffic, defensive delays, slipstream or external incidents',()=>{
 const base=makeRace({seed:12345});Object.assign(base,{meetTrial:true,incidentPlan:null,incidentCue:null});const changed=structuredClone(base);changed.opponent.car.cv=800;changed.opponent.pilot.turn=999;changed.opponent.car.kg=500;changed.gapSeconds=-.1;
 assert.deepEqual(tacticalContext(base).allowed.manoeuvre,['hold']);assert.ok(!tacticalContext(base).allowed.line.includes('defend'));
 let a=base,b=changed;while(!a.finished){a=advanceRace(a,null,DEFAULT_DECISION);b=advanceRace(b,null,DEFAULT_DECISION);}assert.equal(a.playerTime,b.playerTime);assert.deepEqual(a.car,b.car);assert.ok(a.logs.every(log=>!log.incident&&!log.explanations.some(text=>/varco|chiuso l’interno|hai raggiunto/i.test(text))));
});
