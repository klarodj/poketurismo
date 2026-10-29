import {test} from 'node:test';
import assert from 'node:assert/strict';
import {dynoEstimate} from '../shared/dynoEstimate.mjs';
test('illustrative dyno curves preserve the supplied peaks and torque/power relation',()=>{for(const car of [{cv:55,nm:86},{cv:200,nm:350},{cv:600,nm:600}]){const before=JSON.stringify(car),e=dynoEstimate(car);assert(Math.abs(Math.max(...e.points.map(p=>p.cv))-car.cv)<1e-8);assert(Math.abs(Math.max(...e.points.map(p=>p.nm))-car.nm)<1e-8);for(const p of e.points)assert(Math.abs(p.cv-p.nm*p.rpm/7023.5)<1e-8);const torquePeak=e.points.reduce((a,b)=>a.nm>b.nm?a:b),powerPeak=e.points.reduce((a,b)=>a.cv>b.cv?a:b);assert(torquePeak.rpm<powerPeak.rpm);assert.equal(JSON.stringify(car),before);}});
test('missing or invalid engine peaks produce no fictional measurements',()=>{for(const car of [null,{}, {cv:0,nm:100},{cv:100,nm:0},{cv:Infinity,nm:100},{cv:NaN,nm:100}])assert.equal(dynoEstimate(car),null);});
