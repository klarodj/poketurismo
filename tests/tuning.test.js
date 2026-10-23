import {test} from 'node:test';
import assert from 'node:assert/strict';
import {replacePart,partStatDeltas,tuningMetrics,tuningAdvice} from '../shared/tuning.mjs';
import {simulateBlock,DEFAULT_DECISION} from '../shared/tacticalRace.mjs';
const car={cv:55,nm:86,kg:735,velMax:153,zeroToHundred:13.5,driveType:'FF',speed:14.8,acceleration:11.6,revving:4,transmission:8.3,turnSlow:80.9,turnFast:28.1,brake:46.3,traction:73.7};
const stock=()=>({...car,car,engineHealth:90,tireGrip:85,currentFuel:10,fuelType:'Normale',km:40000,serviceKm:35000,mods:[]});
const piece=data=>({id:1,name:'Test',price:100,level:1,cvBonus:0,nmBonus:0,kgBonus:0,speedBonus:0,accelBonus:0,revvBonus:0,transBonus:0,turnSlowBonus:0,turnFastBonus:0,brakeBonus:0,tractBonus:0,...data});
test('tuning replacements subtract installed bonuses and use the actual mounting rounding',()=>{
 const low=piece({cvBonus:2.5,nmBonus:.5,kgBonus:2.5,turnSlowBonus:3.33}),high=piece({id:2,level:2,cvBonus:5,nmBonus:2,kgBonus:5,turnSlowBonus:6.25});
 const base=stock(),first=replacePart(base,low).after,result=replacePart(first,high);
 assert.equal(result.before.cv,58);assert.equal(result.after.cv,60);assert.equal(result.after.kg,730);assert.equal(result.after.nm,88);assert.equal(result.after.turnSlow,car.turnSlow+6.25);assert.equal(result.after.mods.length,1);assert.equal(result.installed.id,low.id);assert.equal(result.alreadyMounted,false);
 assert.deepEqual(partStatDeltas(low),Object.fromEntries(Object.entries(partStatDeltas(low,-1)).map(([k,v])=>[k,-v])));
 assert.deepEqual(base,stock());assert.equal(first.cv,58);
});
test('preview preserves existing wear, fuel, other parts and historical restored handling',()=>{
 const other=piece({id:3,name:'Suspension',turnFastBonus:8});const low=piece({cvBonus:3,revvBonus:4});const base=replacePart(replacePart(stock(),other).after,low).after;base.revving=0;base.turnFast=0;
 const {before,after}=replacePart(base,piece({id:2,cvBonus:6,revvBonus:6}));assert.equal(before.revving,8);assert.equal(after.revving,10);assert.equal(after.turnFast,car.turnFast+8);assert.equal(after.mods.length,2);
 for(const field of ['engineHealth','tireGrip','currentFuel','fuelType','km','serviceKm'])assert.equal(after[field],base[field]);
 const same=replacePart(base,low);assert.equal(same.alreadyMounted,true);assert.deepEqual(same.after,same.before);
});
test('physical advice distinguishes improvements, downgrades and index-only changes',()=>{
 const base=stock(),gear=piece({transBonus:12.5,revvBonus:12.5});assert.match(tuningAdvice(base,replacePart(base,gear).after).join(' '),/Nessun beneficio/);
 const high=piece({cvBonus:20}),low=piece({id:2,cvBonus:5});assert.match(tuningAdvice(base,replacePart(base,high).after).join(' '),/rettilinei/);const tuned=replacePart(base,high).after;assert.match(tuningAdvice(tuned,replacePart(tuned,low).after).join(' '),/peggiora/);
});
test('an affordable starter upgrade improves a controlled lap without granting supercar performance',()=>{
 const base=stock(),engine=piece({cvBonus:6,nmBonus:6}),brake=piece({id:2,name:'Brake',turnSlowBonus:3.33,brakeBonus:3.33});const upgraded=replacePart(replacePart(base,engine).after,brake).after;
 const pilot=Object.fromEntries(['brave','clean','reflex','shift','acro','turn','brake','throttle'].map(key=>[key,30]));const segments=[{lengthM:500,radiusM:0},{lengthM:100,radiusM:30},{lengthM:400,radiusM:0},{lengthM:120,radiusM:60}];
 const lap=g=>{const input={...g.car,...g,baseCv:g.car.cv,baseKg:g.car.kg};return simulateBlock(input,pilot,null,DEFAULT_DECISION,{segments},null,0,{weather:'sunny',surface:'tarmac'}).time;};
 assert.ok(lap(upgraded)<lap(base));assert.ok(upgraded.cv<85);assert.ok(tuningMetrics(upgraded).topSpeedKmh<180);assert.ok(lap({...base,cv:450,kg:1250})<lap(upgraded));
});
test('tuning preview consumption follows actual net power and mass, never the number of installed parts',()=>{
 const base={...stock(),car:{...car,cc:1108,engineType:'NA'}};const motor=piece({cvBonus:12}),brakes=piece({id:2,name:'Brakes',brakeBonus:10});
 assert.ok(tuningMetrics(replacePart(base,motor).after).fuelConsumption>tuningMetrics(base).fuelConsumption);assert.equal(tuningMetrics(replacePart(base,brakes).after).fuelConsumption,tuningMetrics(base).fuelConsumption);
 const high=replacePart(base,motor).after,lower=replacePart(high,piece({id:3,cvBonus:3})).after;assert.ok(tuningMetrics(lower).fuelConsumption<tuningMetrics(high).fuelConsumption);
});
