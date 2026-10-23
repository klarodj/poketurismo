import{test}from'node:test';import assert from'node:assert/strict';
import{consumptionEstimate,sectorFuel}from'../shared/fuelConsumption.mjs';
import{makeRace}from'../scripts/race-balance.mjs';import{decisionPreview,advanceTacticalRace,DEFAULT_DECISION}from'../shared/tacticalRace.mjs';
const stock={cc:1600,cv:100,baseCv:100,kg:1000,engineType:'NA'};
const road=(lengthM,grade=0)=>({layoutVersion:2,segments:[{lengthM,radiusM:0,grade}]});
test('displacement, effective horsepower and engine tuning each increase consumption independently',()=>{
 const ref=consumptionEstimate(stock);assert.ok(consumptionEstimate({...stock,cc:2000}).balanced>ref.balanced);assert.ok(consumptionEstimate({...stock,cv:150,baseCv:150}).balanced>ref.balanced);
 assert.ok(consumptionEstimate({...stock,cv:150}).balanced>consumptionEstimate({...stock,cv:150,baseCv:150}).balanced);assert.ok(consumptionEstimate({...stock,engineType:'Turbo'}).balanced>ref.balanced);
 assert.equal(consumptionEstimate({...stock,mods:[{category:'Brakes',level:99}]}).balanced,ref.balanced);
});
test('warm mixed estimates and racing consumption remain credible across vehicle classes',()=>{
 const small=consumptionEstimate({cc:1108,cv:54,baseCv:54,kg:735}),sport=consumptionEstimate({cc:1998,cv:220,baseCv:220,kg:1300,engineType:'Turbo'}),large=consumptionEstimate({cc:5700,cv:485,baseCv:485,kg:1500});
 assert.ok(small.mixed>5&&small.mixed<7);assert.ok(sport.mixed>9&&sport.mixed<13);assert.ok(large.mixed>15&&large.mixed<23);assert.ok(small.balanced<sport.balanced&&sport.balanced<large.balanced);
 for(const estimate of[small,sport,large])assert.ok(estimate.save<estimate.balanced&&estimate.balanced<estimate.attack&&estimate.balanced>estimate.mixed);
});
test('distance and grade drive fuel usage without a minimum charge per decision',()=>{
 const total=sectorFuel(stock,road(4000)),split=Array.from({length:20},()=>sectorFuel(stock,road(200))).reduce((a,b)=>a+b,0);assert.ok(Math.abs(total-split)<1e-12);assert.equal(sectorFuel(stock,road(0)),0);
 assert.ok(sectorFuel(stock,road(1000,0.06))>sectorFuel(stock,road(1000)));assert.ok(sectorFuel(stock,road(1000,-0.06))<sectorFuel(stock,road(1000)));
 assert.ok(sectorFuel(stock,road(1000),{pace:'attack'})>sectorFuel(stock,road(1000)));assert.ok(sectorFuel(stock,road(1000),{}, {aggressiveness:2})>sectorFuel(stock,road(1000)));
});
test('nested garage inputs and missing legacy metadata have deterministic finite estimates',()=>{
 assert.deepEqual(consumptionEstimate({...stock,car:{cc:1600,cv:100,engineType:'NA'}}),consumptionEstimate(stock));
 for(const input of[{}, {cv:NaN,cc:Infinity,kg:-3},{car:{cv:90},cv:120},{cc:0,cv:0,baseCv:0}])for(const key of['mixed','save','balanced','attack'])assert.ok(Number.isFinite(consumptionEstimate(input)[key])&&consumptionEstimate(input)[key]>0);
});
test('fuel version one retains the old formula and existing tactical states keep it',()=>{
 const old=makeRace({seed:7});delete old.fuelModelVersion;old.meetTrial=true;old.incidentPlan=null;const section=old.sections[0],km=section.segments.reduce((n,s)=>n+s.lengthM,0)/1000;
 const driven=advanceTacticalRace(old,null,DEFAULT_DECISION);assert.equal(driven.logs[0].fuel,Number(Math.max(0.01,old.car.cv*0.0002*km).toFixed(4)));assert.equal(driven.fuelModelVersion,undefined);
 assert.equal(sectorFuel(stock,road(1000),{},null,1),0.02);assert.ok(sectorFuel(stock,road(1000))>0.02);
});
test('preview and actual consumption agree for both conserved and aggressive new races',()=>{
 for(const pace of['save','balanced','attack']){let state=makeRace({seed:13});state.meetTrial=true;state.incidentPlan=null;const initial=state.car.currentFuel;let consumed=0;while(!state.finished){const decision={...DEFAULT_DECISION,pace},preview=decisionPreview(state,decision);state=advanceTacticalRace(state,null,decision);assert.ok(Math.abs(preview.fuel-state.logs.at(-1).fuel)<1e-8);consumed+=state.logs.at(-1).fuel;}assert.ok(Math.abs(initial-state.car.currentFuel-consumed)<0.001);}
});
