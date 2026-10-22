import {replacePart,tuningMetrics} from '../shared/tuning.mjs';
import {simulateBlock,DEFAULT_DECISION} from '../shared/tacticalRace.mjs';
import {DEMO_TRACK} from '../shared/trackGeometry.mjs';
import assert from 'node:assert/strict';
// Controlled comparison: same car conditions, pilot and geometry, no random incidents or wear.
export function tuningBalanceReport(cars,parts){
 const stock=cars.find(car=>car.name==='Seicento Sporting');assert.ok(stock,'Starter di riferimento assente');
 const families=Object.groupBy(parts,part=>part.name);
 for(const variants of Object.values(families)){variants.sort((a,b)=>a.level-b.level);for(let i=0;i<variants.length;i++){assert.ok(variants[i].price>0);if(i)assert.ok(variants[i].price>variants[i-1].price,'Prezzi crescenti per livello');}}
 const car={...stock,car:stock,mods:[],engineHealth:100,tireGrip:100,currentFuel:20,fuelType:'Normale',km:0,serviceKm:0};
 const pilot=Object.fromEntries(['brave','clean','reflex','shift','acro','turn','brake','throttle'].map(key=>[key,30]));
 const lap=vehicle=>{let speed=0,time=0;const input={...vehicle.car,...vehicle,baseCv:vehicle.car.cv,baseKg:vehicle.car.kg};for(let i=0;i<DEMO_TRACK.sections.length;i++){const result=simulateBlock(input,pilot,null,DEFAULT_DECISION,DEMO_TRACK.sections[i],DEMO_TRACK.sections[i+1],speed,{weather:'sunny',surface:'tarmac'});time+=result.time;speed=result.exitSpeed;}return Math.round(time*1000);};
 const early=['ECU','Brake','Weight'].map(name=>families[name]?.[0]);assert.ok(early.every(Boolean));const expensive=Object.values(families).map(variants=>variants.at(-1));
 const prepare=selected=>selected.reduce((vehicle,part)=>replacePart(vehicle,part).after,car);
 const earlyCar=prepare(early),topCar=prepare(expensive);
 const earlyCost=early.reduce((sum,part)=>sum+part.price,0),topCost=expensive.reduce((sum,part)=>sum+part.price,0);
 assert.ok(earlyCost<=1000);assert.ok(lap(earlyCar)<lap(car));assert.ok(topCost>10000);assert.ok(topCar.cv<350);assert.ok(tuningMetrics(topCar).topSpeedKmh<250);
 const physical=['topSpeedKmh','powerToWeight','grip','brakingMs2'];const metrics=tuningMetrics(car);
 const noPhysicalBenefit=parts.filter(part=>{const after=tuningMetrics(replacePart(car,part).after);return physical.every(key=>Math.abs(metrics[key]-after[key])<0.0001);}).map(part=>({name:part.name,level:part.level}));
 return {catalogue:{parts:parts.length,families:Object.keys(families).length,pricesIncreasing:true},stock:{...tuningMetrics(car),controlledLapMs:lap(car)},early:{cost:earlyCost,parts:early.map(part=>({name:part.name,level:part.level})),...tuningMetrics(earlyCar),controlledLapMs:lap(earlyCar)},maximum:{cost:topCost,...tuningMetrics(topCar),controlledLapMs:lap(topCar)},noPhysicalBenefit};
}
