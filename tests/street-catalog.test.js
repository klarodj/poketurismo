import {test} from 'node:test';
import assert from 'node:assert/strict';
import {STREET_ZONES,STREET_TRACKS,streetPilot,streetReward,repeatFactor} from '../shared/streetCatalog.mjs';
import {trackCatalogInfo} from '../shared/trackCatalog.mjs';
test('five fixed rosters offer forty unique rivals and a reachable progression',()=>{
  assert.equal(STREET_ZONES.length,5);assert.equal(new Set(STREET_ZONES.flatMap(z=>z.rivals.map(r=>r.id))).size,40);
  for(const zone of STREET_ZONES){assert.equal(zone.rivals.length,8);assert.ok(zone.tracks.length);for(const rival of zone.rivals){assert.equal(Object.keys(streetPilot(rival)).length,8);assert.ok(Object.values(streetPilot(rival)).every(n=>n>0));}if(zone.previousZone)assert.ok(zone.minReputation<=8*20);}
  for(const route of STREET_TRACKS)assert.equal(trackCatalogInfo(route.name).format,'point-to-point');
});
test('stakes transfer only the agreed money and never generate a fixed cash prize',()=>{
  const base={completed:true,races:0,easy:false,wager:200};
  assert.equal(streetReward({...base,outcome:'win'}).money,400);assert.equal(streetReward({...base,outcome:'loss'}).money,0);assert.equal(streetReward({...base,outcome:'draw'}).money,200);
  assert.equal(streetReward({...base,outcome:'win',wager:0}).money,0);
  assert.equal(streetReward({...base,outcome:'loss',failure:'abandoned'}).xp,0);
});
test('repeat and trivial rival rewards deplete, and failures do not award reputation or XP',()=>{
  assert.deepEqual([0,1,2,3,4,5].map(repeatFactor),[1,0.6,0.3,0.1,0,0]);
  for(const outcome of ['win','loss','draw']){const base={outcome,completed:true};assert.equal(streetReward({...base,races:4}).xp,0);assert.equal(streetReward({...base,failure:'fuel'}).reputation,0);assert.equal(streetReward({...base,completed:false}).xp,0);}
  assert.ok(streetReward({outcome:'win',completed:true,easy:true}).xp<streetReward({outcome:'win',completed:true}).xp);
});

test('losing repeatedly does not consume future victory rewards after improving',()=>{
 const reward=streetReward({outcome:'win',completed:true,races:10,wins:0});assert.equal(reward.xp,100);assert.equal(reward.reputation,10);
});
