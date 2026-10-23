import{test}from'node:test';import assert from'node:assert/strict';
import{buildTacticalTrack,DEMO_TRACK,tacticalSectorCount}from'../shared/trackGeometry.mjs';
import{TRACK_CATALOG}from'../shared/trackCatalog.mjs';import{advanceTacticalRace,DEFAULT_DECISION,mistakeRisk,decisionPreview}from'../shared/tacticalRace.mjs';import{makeRace}from'../scripts/race-balance.mjs';
const names=['Short Straight','Long Straight','Slow Right Turn','Slow Left Turn','Fast Right Turn','Fast Left Turn','Hump','Depression','Descent','Climb','Chicane','Hairpin Right','Hairpin Left','Right Inversion','Left Inversion','Obstacle'];
const route=t=>buildTacticalTrack(t.sections.map(id=>({name:names[id-1]})),t.distanceM/1000,{kind:t.format==='circuit'?'circuit':'road'});
test('catalogue circuits and roads have different decision counts, school stays authored',()=>{
 const counts=TRACK_CATALOG.map(t=>route(t).length);assert.ok(new Set(counts).size>=8);assert.equal(counts[3],6);assert.equal(counts[10],18);assert.equal(counts[18],20);assert.equal(DEMO_TRACK.sections.length,8);
 const source=names.map(name=>({name}));let last=0;for(let km=0.5;km<=20;km+=0.25){const count=tacticalSectorCount(source,km);assert.ok(count>=last);assert.ok(count>=4&&count<=20);last=count;}assert.deepEqual(buildTacticalTrack([],3),[]);
});
test('variable sectors keep distance, ordering, slope and corners, splitting only long straights',()=>{
 for(const t of TRACK_CATALOG){const source=t.sections.map(id=>({name:names[id-1]})),before=JSON.stringify(source),sections=route(t),segments=sections.flatMap(s=>s.segments);assert.equal(JSON.stringify(source),before);assert.deepEqual(sections,route(t));
 assert.ok(Math.abs(segments.reduce((sum,s)=>sum+s.lengthM,0)-t.distanceM)<1e-6);assert.ok(Math.abs(sections.reduce((sum,s)=>sum+s.riskExposure,0)-t.distanceM/500)<1e-8);
 let previous=-1;for(const segment of segments){assert.ok(segment.sourceIndex>=previous);previous=segment.sourceIndex;assert.ok(segment.lengthM>0);if(t.format==='point-to-point')assert.ok(segment.widthM<=7.5);}
 for(let i=0;i<source.length;i++){const pieces=segments.filter(s=>s.sourceIndex===i);assert.ok(pieces.length);if(pieces[0].radiusM>0)assert.equal(pieces.length,1,'A curve cannot be cut in half');}
 }
});
test('error exposure follows distance, not the number of decisions',()=>{
 const skills={brake:0.5,clean:0.5},decision=DEFAULT_DECISION,segment={lengthM:1000,radiusM:0,widthM:12};
 const whole={segments:[segment],riskExposure:2},half={segments:[{...segment,lengthM:500}],riskExposure:1};
 const p=mistakeRisk(skills,decision,whole,null,{weather:'sunny'}),q=mistakeRisk(skills,decision,half,null,{weather:'sunny'});assert.ok(Math.abs((1-p)-(1-q)**2)<1e-12);
});
test('fuel and wear stay proportional to distance across four and twenty decisions',()=>{
 function run(count){let state=makeRace({seed:1234});state.timeTrial=true;state.meetTrial=true;state.incidentPlan=null;state.sections=Array.from({length:count},(_,i)=>({id:String(i),name:'Long Straight',type:'Rettilineo',layoutVersion:2,riskExposure:8/count,segments:[{lengthM:4000/count,radiusM:0,widthM:12}]}));state.distanceKm=4;
 let fuel=0,tires=0,engine=0;while(!state.finished){const preview=decisionPreview(state);state=advanceTacticalRace(state,null,DEFAULT_DECISION);const log=state.logs.at(-1);assert.ok(Math.abs(preview.fuel-log.fuel)<0.001);fuel+=log.fuel;tires+=log.tires;engine+=log.engine;}return{fuel,tires,engine};}
 const a=run(4),b=run(20);for(const key of ['fuel','tires','engine'])assert.ok(Math.abs(a[key]-b[key])<0.002,key);
});
