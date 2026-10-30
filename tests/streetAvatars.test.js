import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {STREET_AVATARS,streetRivalAvatar,streetAvatar} from '../shared/streetAvatarCatalog.mjs';
import {STREET_ZONES} from '../shared/streetCatalog.mjs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {presentRace}=require('../server/races.js');
test('thirty distinct 64px NPC portraits cover all forty stable street identities',()=>{
 assert.equal(STREET_AVATARS.length,30);const hashes=new Set(),used=new Set();
 for(const a of STREET_AVATARS){const p=fs.readFileSync(new URL(`../public/images/street-avatars/${a.id}.png`,import.meta.url));assert.equal(p.readUInt32BE(16),64);assert.equal(p.readUInt32BE(20),64);hashes.add(createHash('sha256').update(p).digest('hex'));}
 for(const rival of STREET_ZONES.flatMap(z=>z.rivals)){assert.equal(rival.avatar,streetRivalAvatar(rival.id));assert(streetAvatar(rival.avatar));used.add(rival.avatar);}
 assert.equal(hashes.size,30);assert.equal(used.size,30);assert.equal(STREET_ZONES.flatMap(z=>z.rivals).length,40);
 assert.equal(streetRivalAvatar('__proto__'),null);assert.equal(streetAvatar('../../secret'),null);
});
test('old checkpoints gain a display portrait without changing their saved state or race data',()=>{
 const state={trackName:'Prova',opponent:{name:'Teo',pilot:{turn:8}},street:{zoneId:'parking',rivalId:'parking-1'},sections:[],rng:42};const row={state:JSON.stringify(state),mode:'street',status:'active',version:1,id:5};const original=row.state;const visible=presentRace(row);
 assert.equal(visible.opponent.avatar,streetRivalAvatar('parking-1'));assert.equal(row.state,original);assert.deepEqual(visible.opponent.pilot,state.opponent.pilot);assert(!('rng' in visible));
 const ordinary=presentRace({...row,state:JSON.stringify({...state,street:undefined})});assert(!('avatar' in ordinary.opponent));
});
