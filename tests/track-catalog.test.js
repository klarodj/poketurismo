import {test} from 'node:test';
import assert from 'node:assert/strict';
import {TRACK_CATALOG,trackCatalogInfo} from '../shared/trackCatalog.mjs';
import {buildTacticalTrack} from '../shared/trackGeometry.mjs';
import {routeProfileFor} from '../shared/raceContext.mjs';
import {makeRace} from '../scripts/race-balance.mjs';
import {advanceTacticalRace, DEFAULT_DECISION} from '../shared/tacticalRace.mjs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {applyTracks}=require('../server/trackStock');
const names=['Short Straight','Long Straight','Slow Right Turn','Slow Left Turn','Fast Right Turn','Fast Left Turn','Hump','Depression','Descent','Climb','Chicane','Hairpin Right','Hairpin Left','Right Inversion','Left Inversion','Obstacle'];
test('all twenty routes finish in the tactical engine with finite times and fuel',()=>{
  for(const track of TRACK_CATALOG){
    let state=makeRace({weather:track.weather,seed:1234});
    state.routeProfile=routeProfileFor(track.format==='circuit'?'track':'street');
    state.sections=buildTacticalTrack(track.sections.map(id=>({name:names[id-1]})),track.distanceM/1000,state.routeProfile);
    state.distanceKm=track.distanceM/1000;
    for(let turn=0;!state.finished&&turn<9;turn++)state=advanceTacticalRace(state,null,DEFAULT_DECISION);
    assert.ok(state.finished,track.name);assert.equal(state.index,8,track.name);
    assert.ok(Number.isFinite(state.playerTime)&&state.playerTime>0,track.name);
    assert.ok(Number.isFinite(state.car.currentFuel)&&state.car.currentFuel>=0,track.name);
  }
});
test('twenty distinct routes cover both formats, five conditions and varied playable geometry',()=>{
  assert.equal(TRACK_CATALOG.length,20);assert.equal(new Set(TRACK_CATALOG.map(t=>t.name)).size,20);
  assert.equal(TRACK_CATALOG.filter(t=>t.format==='circuit').length,10);
  assert.equal(new Set(TRACK_CATALOG.map(t=>t.weather)).size,5);
  assert.equal(new Set(TRACK_CATALOG.map(t=>t.sections.join(','))).size,20);
  for(const track of TRACK_CATALOG){
    const profile=routeProfileFor(track.format==='circuit'?'track':'street');
    const sectors=buildTacticalTrack(track.sections.map(id=>({name:names[id-1]})),track.distanceM/1000,profile);
    assert.equal(sectors.length,8);
    assert.ok(Math.abs(sectors.flatMap(s=>s.segments).reduce((sum,s)=>sum+s.lengthM,0)-track.distanceM)<0.001);
    assert.ok(sectors.every(s=>s.segments.every(segment=>segment.lengthM>0&&Number.isFinite(segment.radiusM))));
    assert.ok(track.difficulty>=1&&track.difficulty<=5);
    assert.equal(trackCatalogInfo(track.name).format,track.format);
  }
  assert.equal(trackCatalogInfo('Legacy'),null);
});
test('catalog seed preserves existing tracks and does not duplicate tracks or sectors on rerun',async()=>{
  const rows=[{id:1,name:'Legacy',builds:{create:[{ord:1,sectionId:1,level:1}]}}];
  const tx={trackType:{findMany:async()=>['Track','Touge','City','Highway'].map((name,id)=>({id:id+1,name}))},trackSurface:{findMany:async()=>[{id:1,name:'tarmac'}]},trackMeteo:{findMany:async()=>['sunny','rainy','snowy','night','foggy'].map((name,id)=>({id:id+1,name}))},trackSection:{findMany:async()=>names.map((name,id)=>({id:id+1,name}))},track:{findFirst:async({where})=>rows.find(row=>row.name===where.name),create:async({data})=>{const row={id:rows.length+1,...data};rows.push(row);return row;}}};
  const db={$transaction:async callback=>callback(tx)};
  assert.equal((await applyTracks(db)).created.length,20);
  const before=JSON.stringify(rows);
  assert.equal((await applyTracks(db)).created.length,0);assert.equal(JSON.stringify(rows),before);
  assert.equal(rows[0].name,'Legacy');
  for(const row of rows.slice(1))assert.deepEqual(row.builds.create.map(s=>s.ord),row.builds.create.map((_,i)=>i+1));
});
