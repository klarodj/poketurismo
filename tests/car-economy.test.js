import { test } from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_MONEY_CENTS, marketTier, newCarPrice, usedRetailPrice, marketAskingPrice, tradeInValue } from '../shared/carEconomy.mjs';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const {planStock}=require('../server/marketStock');
const starter={id:1,cv:55,nm:90,kg:735,velMax:153,zeroToHundred:13.5,price:8470,name:'Starter',speed:40,acceleration:30,revving:30,transmission:30,turnSlow:40,turnFast:40,brake:40,traction:40};
const compact={...starter,id:2,name:'Compact',cv:101,kg:820,velMax:188,zeroToHundred:9.1,price:8913};
const condition={km:80000,engineHealth:90,tireGrip:80,mods:[]};
test('starting budget admits modest cars but not cheap powerful, lightweight or very quick cars',()=>{
  assert.equal(INITIAL_MONEY_CENTS,1000000);assert.equal(marketTier(starter).id,'starter');
  assert.ok(newCarPrice(starter)<=10000);assert.ok(newCarPrice(compact)>10000);
  for(const car of [{...starter,cv:150},{...starter,cv:85,kg:500},{...starter,zeroToHundred:6},{...starter,velMax:230}]) {
    assert.notEqual(marketTier(car).id,'starter');assert.ok(newCarPrice(car)>10000);assert.ok(usedRetailPrice(car,{...condition,engineHealth:0,tireGrip:0})>10000);
  }
});
test('condition and mileage affect retail while trade-in always stays below the price to buy back',()=>{
  const healthy=usedRetailPrice(starter,{...condition,engineHealth:100,tireGrip:100,km:10000});
  assert.ok(healthy>usedRetailPrice(starter,condition));
  assert.ok(usedRetailPrice(starter,condition)>usedRetailPrice(starter,{...condition,km:250000,engineHealth:50,tireGrip:40}));
  for(const car of [starter,compact])for(const km of [0,100000,500000])for(const health of [0,50,100]) {
    const garage={...condition,km,engineHealth:health,tireGrip:health};
    assert.ok(tradeInValue(car,garage)<usedRetailPrice(car,garage));assert.ok(usedRetailPrice(car,garage)<=newCarPrice(car));
  }
});
test('an old or underpriced used listing cannot bypass the beginner power restrictions, including tuned cars',()=>{
  assert.ok(marketAskingPrice(compact,{...condition,sellPrice:1})>10000);
  assert.ok(marketAskingPrice(starter,{...condition,cv:150,kg:735,sellPrice:1})>10000);
});
test('opening stock covers six tiers and provides healthy starter cars with a maintenance reserve',()=>{
  const cars=[starter,compact,{...starter,id:3,cv:150,kg:1100,zeroToHundred:8,velMax:210,price:20000},
    {...starter,id:4,cv:220,kg:1300,zeroToHundred:6.8,velMax:240,price:30000},
    {...starter,id:5,cv:320,kg:1400,zeroToHundred:5,velMax:270,price:60000},
    {...starter,id:6,cv:500,kg:1400,zeroToHundred:3.8,velMax:320,price:150000}];
  const plan=planStock(cars);assert.equal(plan.listings.length,32);assert.deepEqual(planStock(cars),plan);
  const affordable=plan.listings.filter(item=>item.data.sellPrice<=10000);assert.equal(affordable.length,8);
  for(const item of affordable){assert.equal(marketTier(item.car).id,'starter');assert.ok(item.data.engineHealth>=88);assert.ok(item.data.tireGrip>=79);assert.ok(item.data.currentFuel>=10);assert.ok(10000-item.data.sellPrice>=1500);}
  assert.equal(new Set(plan.listings.map(item=>item.tier)).size,6);
});

test('crossing a performance tier with cheap parts cannot inflate trade-in into a money generator',()=>{
  const stock={...condition,cv:starter.cv,kg:starter.kg};
  const tuned={...stock,cv:150,mods:[{part:{price:100}}]};
  assert.ok(marketAskingPrice(starter,{...tuned,sellPrice:1})>10000);
  assert.ok(tradeInValue(starter,tuned)<=usedRetailPrice(starter,stock)*0.72+25);
  assert.ok(tradeInValue(starter,tuned)<usedRetailPrice(starter,stock)+100);
  assert.ok(tradeInValue(starter,tuned)<newCarPrice(starter)+100);
});
