import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {PROFILES,proposalConversion,proposalMetrics} from './proposal.mjs';
const catalogue=JSON.parse(fs.readFileSync(new URL('./catalogue.json',import.meta.url)));
const prepare=stock=>({...stock,car:stock,mods:[],engineHealth:72,tireGrip:63,currentFuel:17,fuelType:'Normale',km:140000,serviceKm:120000});
test('all 200 models retain engine, wear, fuel and installed parts with bounded chassis improvements',()=>{
 assert.equal(catalogue.models.length,200);
 for(const {stock}of catalogue.models)for(const profile of Object.keys(PROFILES)){
  const car=prepare(stock),q=proposalConversion(car,profile);
  for(const key of ['cv','nm','cc','revving','engineType','driveType','engineHealth','tireGrip','currentFuel','fuelType','km','serviceKm'])assert.equal(q.after[key],car[key],key);
  assert.deepEqual(q.after.mods,car.mods);assert(q.after.kg>=stock.kg*.82);assert(q.after.kg<=stock.kg);assert(q.price>=25000);
  for(const key of ['turnSlow','turnFast','brake'])assert(q.after[key]>=car[key]);
  const metrics=proposalMetrics(car,profile);assert.equal(metrics.beforeMetrics.powerKw,metrics.afterMetrics.powerKw);assert(q.after.velMax<=car.velMax);assert(metrics.afterMetrics.topSpeedKmh<=metrics.beforeMetrics.topSpeedKmh*1.015);
 }
});
test('better installed chassis parts are retained and conversion cannot stack or charge again',()=>{
 const stock=catalogue.models.find(m=>m.key==='seicento').stock;
 const car={...prepare(stock),kg:stock.kg*.8,turnSlow:99,turnFast:99,brake:99,mods:[{partId:999}]};
 const first=proposalConversion(car,'touring');assert.equal(first.after.kg,car.kg);assert.equal(first.after.turnSlow,99);assert.equal(first.after.turnFast,99);assert.equal(first.after.brake,99);
 const repeat=proposalConversion(first.after,'touring');assert(repeat.alreadyConverted);assert.equal(repeat.price,0);assert.deepEqual(repeat.after,first.after);
});
