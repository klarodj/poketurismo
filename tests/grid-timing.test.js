import{test}from'node:test';import assert from'node:assert/strict';import{createRequire}from'node:module';
import{gridTiming,gridCheckpoint}from'../shared/gridTiming.mjs';import{makeRace}from'../scripts/race-balance.mjs';import{sectorFuel}from'../shared/fuelConsumption.mjs';
const require=createRequire(import.meta.url),server=require('../server/gridTiming'),{simulateDriver}=require('../server/championships');
const rows=()=>[{id:'a',name:'Andrea',carName:'A',timeMs:10000},{id:'b',name:'Sonia',carName:'B',timeMs:11000},{id:'player',name:'Tu',carName:'Tua',timeMs:12000},...Array.from({length:5},(_,i)=>({id:'npc-'+i,name:'Pilota '+i,carName:'Auto '+i,timeMs:14000+i*1500}))];
const options={sector:2,totalSectors:8,featuredId:'npc-4'};
test('grid neighbors are the adjacent classified drivers, not the featured rival at the back',()=>{
 const input=rows(),copy=structuredClone(input),timing=gridTiming(input,options);assert.equal(timing.position,3);assert.equal(timing.total,8);assert.equal(timing.ahead.name,'Sonia');assert.equal(timing.ahead.gapMs,1000);assert.equal(timing.behind.id,'npc-0');assert.equal(timing.behind.gapMs,2000);assert.equal(timing.leaderGapMs,2000);assert.equal(timing.rows.find(r=>r.featured).position,8);assert.deepEqual(input,copy);assert.equal(timing.rows[3].intervalMs,2000);assert.equal('rows'in gridCheckpoint(timing),false);
});
test('leading and trailing players have only a real running neighbor and retired entrants have no gaps',()=>{
 const data=rows();data.find(r=>r.id==='player').timeMs=1;let timing=gridTiming(data,options);assert.equal(timing.position,1);assert.equal(timing.ahead,null);assert.equal(timing.behind.id,'a');
 data.find(r=>r.id==='player').timeMs=99999;data.find(r=>r.id==='npc-4').failure='engine';timing=gridTiming(data,options);assert.equal(timing.position,7);assert.equal(timing.behind,null);assert.equal(timing.rows.at(-1).leaderGapMs,null);
 data.find(r=>r.id==='player').failure='fuel';timing=gridTiming(data,options);assert.equal(timing.playerRetired,true);assert.equal(timing.ahead,null);assert.equal(timing.behind,null);assert.equal(timing.leaderGapMs,null);
});
test('starting grid does not invent a running position and ties keep the championship tolerance',()=>{
 const data=rows();let timing=gridTiming(data,{...options,sector:0});assert.equal(timing.started,false);assert.equal(timing.position,null);assert.ok(timing.rows.every(r=>r.position===null&&r.timeMs===null));
 data.find(r=>r.id==='player').timeMs=10008;timing=gridTiming(data,options);assert.equal(timing.position,1);assert.equal(timing.ahead.tied,true);assert.equal(timing.ahead.gapMs,8);
});
function sample(){const state=makeRace({seed:1234});Object.assign(state,{gridSeed:1234,gridOpponentId:'npc-0',entryId:1});const contract={playerName:'Tu',drivers:Array.from({length:7},(_,i)=>({id:'npc-'+i,name:'Rivale '+i,car:{...state.car,name:'Auto '+i},pilot:{...state.pilot}}))};return{state,contract};}
test('cached checkpoints match full final simulations without changing their frozen inputs',()=>{
 const{state,contract}=sample(),before=JSON.stringify({state,contract}),reference=server.references(contract,state);for(let i=0;i<7;i++){const{checkpoints,...result}=reference[i];assert.deepEqual(result,simulateDriver(contract.drivers[i],state,(state.gridSeed+i*7919)>>>0));assert.equal(checkpoints.at(-1).timeMs,result.timeMs);}assert.equal(JSON.stringify({state,contract}),before);
 state.index=1;state.playerTime=12;state.opponentTime=99;const projected=server.project(contract,state);assert.equal(projected.rows.find(r=>r.featured).timeMs,99000);assert.equal(JSON.stringify(projected).includes('checkpoints'),false);assert.equal(JSON.stringify(projected).includes('seed'),false);assert.equal(projected.rows.find(r=>r.id==='npc-1').timeMs,reference[1].checkpoints[0].timeMs);
});
test('a future retirement is not disclosed before the corresponding sector checkpoint',()=>{
 const{state,contract}=sample(),car=contract.drivers[1].car;car.currentFuel=sectorFuel(car,state.sections[0],{pace:'balanced'},null,state.fuelModelVersion||1)+0.001;const reference=server.references(contract,state);assert.equal(reference[1].failure,'fuel');assert.equal(reference[1].checkpoints[0].failure,null);state.index=1;state.playerTime=10;state.opponentTime=11;assert.equal(server.project(contract,state).rows.find(r=>r.id==='npc-1').failure,null);state.index=2;assert.equal(server.project(contract,state).rows.find(r=>r.id==='npc-1').failure,'fuel');
});

test('completed classifications use their frozen positions and never replay an old round',()=>{
 const{state}=sample(),frozen=[{id:'player',name:'Tu',carName:'Tua',timeMs:11000,position:1,failure:null},{id:'npc-0',name:'Rivale',carName:'Altra',timeMs:10000,position:2,failure:null}];Object.assign(state,{finished:true,index:state.sections.length,championship:{format:'grid',classification:frozen}});const timing=server.project(null,state);assert.equal(timing.position,1);assert.deepEqual(timing.rows.map(r=>[r.id,r.position]),[['player',1],['npc-0',2]]);assert.deepEqual(state.championship.classification,frozen);
});
