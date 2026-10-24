import{test}from'node:test';
import assert from'node:assert/strict';
import{kmPerLiter,experienceProgress}from'../src/logic/displayUnits.mjs';
import{partName,partDescription}from'../src/logic/partLabels.mjs';
test('fuel efficiency conversion reverses the comparison direction without changing inputs',()=>{
 const before={fuelConsumption:8},after={fuelConsumption:10},saved=structuredClone([before,after]);assert.equal(kmPerLiter(8),12.5);assert.equal(kmPerLiter(10),10);assert.ok(kmPerLiter(after.fuelConsumption)-kmPerLiter(before.fuelConsumption)<0);assert.deepEqual([before,after],saved);for(const invalid of[0,-1,NaN,Infinity,undefined])assert.equal(kmPerLiter(invalid),null);
});
test('experience progress uses the actual 1000-XP level boundaries',()=>{
 for(const[exp,level,current,remaining]of[[0,1,0,1000],[999,1,999,1],[1000,2,0,1000],[1350,2,350,650],[2999,3,999,1]]){const p=experienceProgress(exp);assert.equal(p.level,level);assert.equal(p.current,current);assert.equal(p.remaining,remaining);assert.equal(p.nextLevel,level+1);assert.equal(p.required,1000);}
});
test('technical part labels preserve identifiers and custom descriptions',()=>{
 const original={id:7,name:'Gearbox',level:2,description:'Dogbox system',price:1234,preview:{quoteKey:'frozen'}};const saved=structuredClone(original);assert.equal(partName(original.name),'Cambio');assert.equal(partDescription(original),'Cambio a innesti frontali');assert.equal(partName('ECU'),'Centralina ECU');assert.equal(partDescription({description:'Semislick tyres'}),'Pneumatici semislick');assert.equal(partDescription({description:'Descrizione privata'}),'Descrizione privata');assert.equal(partName('Ricambio speciale'),'Ricambio speciale');assert.deepEqual(original,saved);
});
