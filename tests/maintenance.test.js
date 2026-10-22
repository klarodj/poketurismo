import {test} from 'node:test';
import assert from 'node:assert/strict';
import {maintenanceQuotes,essentialRepair} from '../shared/maintenance.mjs';
import {tradeInValue} from '../shared/carEconomy.mjs';
const model={cv:55,nm:90,kg:735,velMax:153,zeroToHundred:13.5,price:8500,speed:40,acceleration:35,revving:35,transmission:35,turnSlow:45,turnFast:45,brake:40,traction:40};
const vehicle=changes=>({id:1,car:model,...model,engineHealth:90,tireGrip:80,currentFuel:10,fuelType:'Normale',km:80000,serviceKm:75000,mods:[],...changes});
test('maintenance quotes distinguish small servicing, full rebuild and unnecessary work',()=>{
 const quotes=maintenanceQuotes(vehicle({}));assert.equal(quotes.find(q=>q.id==='engine').after.engineHealth,100);
 assert.equal(maintenanceQuotes(vehicle({engineHealth:40})).find(q=>q.id==='engine').after.engineHealth,50);
 assert.equal(maintenanceQuotes(vehicle({engineHealth:0})).find(q=>q.id==='engine').enabled,false);
 const a=maintenanceQuotes(vehicle({engineHealth:1})).find(q=>q.id==='rebuild').price,b=maintenanceQuotes(vehicle({engineHealth:0})).find(q=>q.id==='rebuild').price;assert.ok(b>a&&b-a<500);
 assert.ok(maintenanceQuotes(vehicle({engineHealth:100,tireGrip:100})).every(q=>!q.enabled&&q.price===0));
});
test('buy, repair and immediately trade in cannot manufacture cash across vehicle tiers',()=>{
 for(const car of [model,{...model,cv:200,kg:1250,velMax:230,zeroToHundred:7,price:42000},{...model,cv:500,kg:1400,velMax:300,zeroToHundred:4,price:180000}])for(const health of [0,1,30,70,90,100])for(const tires of [0,50,100]){
  const before=vehicle({car,cv:car.cv,kg:car.kg,engineHealth:health,tireGrip:tires});for(const quote of maintenanceQuotes(before).filter(q=>q.enabled))assert.ok(tradeInValue(car,{...before,...quote.changes})-tradeInValue(car,before)<quote.price);
  const recovery=essentialRepair(before);assert.ok(tradeInValue(car,{...before,...recovery.changes})-tradeInValue(car,before)<recovery.price);
 }
});
test('essential repairs restore usable conditions without erasing modifications or filling every component',()=>{const car=vehicle({engineHealth:0,tireGrip:25,currentFuel:0});const plan=essentialRepair(car);assert.equal(plan.changes.engineHealth,60);assert.equal(plan.changes.tireGrip,60);assert.equal(plan.changes.currentFuel,8);assert.equal(plan.changes.cv,undefined);assert.ok(plan.price>0);});
