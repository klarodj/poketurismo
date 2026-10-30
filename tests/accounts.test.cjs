// HTTP authorization contract tests. PostgreSQL migration has a separate real-database check.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('../server/node_modules/express');
process.env.POKETURISMO_AUTH_ENABLED = '1';
process.env.DATABASE_URL = 'postgresql://contract-test@127.0.0.1/unused';
process.env.SUPABASE_ANON_KEY = 'public-test-key';
process.env.LEGACY_OWNER_EMAIL = '';
process.env.ADMIN_EMAILS = 'two@example.invalid';
const { install, playerId } = require('../server/accounts');
const identities = {
  'valid-token-one': { id: '11111111-1111-4111-8111-111111111111', email: 'one@example.invalid', email_confirmed_at: '2026-01-01' },
  'valid-token-two': { id: '22222222-2222-4222-8222-222222222222', email: 'two@example.invalid', email_confirmed_at: '2026-01-01' },
  'unverified-token': { id: '33333333-3333-4333-8333-333333333333', email: 'unverified@example.invalid' },
};
const rows = [{ id: 1, username: 'Historical pilot', authUserId: null, isAdmin: false, moneyCents: 123456 }];
const prisma = {
  user: {
    findUnique: async ({ where }) => rows.find(row => where.id !== undefined ? row.id === where.id : row.authUserId === where.authUserId) || null,
    create: async ({ data: { progress: _progress, development: _development, ...data } }) => {
      const row = { id: rows.length + 1, level: 1, exp: 0, isAdmin: false, ...data }; rows.push(row); return row;
    },
    update: async ({where,data}) => {const row=rows.find(row=>row.id===where.id);Object.assign(row,data);return row;},
    updateMany: async () => { throw new Error('The first signup must not claim the historical save'); },
  },
  $transaction: async work => work(prisma),
};
let upstream, server, base;
const endpoint = handler => async (req, res) => {
  try { res.json(await handler(req)); }
  catch (error) { res.status(error.status || 500).json({ error: error.message }); }
};
before(async () => {
  upstream = http.createServer((req, res) => {
    const user = identities[(req.headers.authorization || '').replace('Bearer ', '')];
    res.setHeader('Content-Type', 'application/json');
    res.writeHead(user ? 200 : 401); res.end(JSON.stringify(user || { error: 'invalid token' }));
  });
  await new Promise(resolve => upstream.listen(0, '127.0.0.1', resolve));
  process.env.AUTH_INTERNAL_URL = 'http://127.0.0.1:' + upstream.address().port;
  const app = express(); app.use(express.json()); install(app, prisma, endpoint);
  app.get('/api/state/:userId', endpoint(req => ({ id: playerId(req, req.params.userId) })));
  app.get('/api/phone/:userId/notifications',endpoint(req=>({id:playerId(req,req.params.userId)})));
  app.get('/api/phone/:userId',endpoint(req=>({id:playerId(req,req.params.userId)})));
  app.get('/api/story/:userId',endpoint(req=>({id:playerId(req,req.params.userId)})));
  for(const path of ['/api/story/read','/api/story/respond'])app.post(path,endpoint(req=>({id:playerId(req,req.body.userId)})));
  app.get('/api/dev/opponents', endpoint(async () => []));
  app.post('/api/player/:id/avatar',endpoint(req=>{const{userId,...body}=req.body;return require('../server/pilotProfile').changeAvatar(prisma,playerId(req,userId),body,req.params);}));
  app.post('/api/meet/friendship',endpoint(req=>({id:playerId(req,req.body.userId)})));
  app.post('/api/purchase', endpoint(async req => ({ id: playerId(req, req.body.userId) })));
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = 'http://127.0.0.1:' + server.address().port;
});
after(async () => {
  for (const listener of [server, upstream]) { listener.closeAllConnections(); await new Promise(resolve => listener.close(resolve)); }
});
async function request(path, token, body) {
  const response = await fetch(base + '/api' + path, { method: body ? 'POST' : 'GET',
    headers: { ...(token ? { Authorization: 'Bearer ' + token } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}) });
  return { status: response.status, data: await response.json() };
}
const pilot = (nickname = 'New Pilot') => ({ nickname, avatar: 'rally-woman', stats: Object.fromEntries(['brave','clean','reflex','shift','acro','turn','brake','throttle'].map(key => [key, 11])) });
test('anonymous, invalid and unverified accounts cannot read a save', async () => {
  for (const token of [null, 'forged-token-value', 'unverified-token']) assert.equal((await request('/state/1', token)).status, 401);
});
test('a verified new account must create its own pilot and cannot claim player one', async () => {
  const account = await request('/account/me', 'valid-token-one');
  assert.equal(account.status, 200); assert.equal(account.data.player, null);
  assert.equal((await request('/state/1', 'valid-token-one')).status, 428);
  assert.equal(rows[0].authUserId, null);
});
test('pilot creation refuses forged money, administrative privileges and impossible stats', async () => {
  for (const body of [{ ...pilot(), moneyCents: 999999 }, { ...pilot(), isAdmin: true }, { ...pilot(), stats: { ...pilot().stats, brave: 99 } }]) {
    assert.equal((await request('/account/pilot', 'valid-token-one', body)).status, 400);
  }
  assert.equal(rows.length, 1);
});
test('pilot creation grants the server budget once, no equipped car, and preserves the historical save', async () => {
  const first = await request('/account/pilot', 'valid-token-one', pilot());
  const second = await request('/account/pilot', 'valid-token-one', pilot());
  assert.equal(first.status, 200); assert.equal(first.data.created, true); assert.equal(second.data.created, false);
  assert.equal(first.data.player.id, second.data.player.id);
  assert.equal(first.data.player.avatar,'rally-woman');assert.equal(first.data.player.money, 10000); assert.equal(first.data.player.carDrive, 0);
  assert.equal(first.data.player.isAdmin, false); assert.equal('authUserId' in first.data.player, false);
  assert.equal(rows.length, 2); assert.equal(rows[0].moneyCents, 123456); assert.equal(rows[0].authUserId, null);
});
test('URL and body user IDs cannot select another pilot; tools remain administrator-only', async () => {
  await request('/account/pilot', 'valid-token-two', pilot('Second Pilot'));
  assert.equal((await request('/state/2', 'valid-token-one')).status, 200);
  assert.equal((await request('/state/2', 'valid-token-two')).status, 403);
  assert.equal((await request('/purchase', 'valid-token-two', { userId: 2 })).status, 403);
  assert.equal((await request('/dev/opponents', 'valid-token-one')).status, 403);
});
test('only the configured verified email receives admin privileges on a fresh pilot', async () => {
  const me = await request('/account/me', 'valid-token-two');
  assert.equal(me.data.player.isAdmin, true);
  assert.equal(me.data.player.money, 10000);
  assert.equal(me.data.player.carDrive, 0);
  assert.equal((await request('/dev/opponents', 'valid-token-two')).status, 200);
  assert.equal(rows[0].authUserId, null);
});

test('twenty cosmetic avatars are advertised and profile changes require the verified owner',async()=>{
 const config=await request('/auth/config');assert.equal(config.data.avatars.length,20);assert.equal(new Set(config.data.avatars).size,20);
 const own=await request('/account/me','valid-token-one'),id=own.data.player.id,before=JSON.parse(JSON.stringify(rows.find(row=>row.id===id)));
 assert.equal((await request(`/player/${id}/avatar`,null,{userId:id,avatar:'mechanic-woman'})).status,401);
 assert.equal((await request(`/player/${id}/avatar`,'unverified-token',{userId:id,avatar:'mechanic-woman'})).status,401);
 assert.equal((await request(`/player/${id}/avatar`,'valid-token-two',{userId:id,avatar:'mechanic-woman'})).status,403);
 assert.equal((await request('/player/3/avatar','valid-token-one',{userId:id,avatar:'mechanic-woman'})).status,403);
 for(const body of [{userId:id,avatar:'https://evil.invalid/avatar.png'},{userId:id,avatar:'../file'},{userId:id,avatar:'mechanic-woman',moneyCents:999999}])assert.equal((await request(`/player/${id}/avatar`,'valid-token-one',body)).status,400);
 const saved=await request(`/player/${id}/avatar`,'valid-token-one',{userId:id,avatar:'mechanic-woman'});assert.equal(saved.status,200);assert.equal(saved.data.player.avatar,'mechanic-woman');assert.deepEqual({...rows.find(row=>row.id===id),avatar:before.avatar},before);
});

test('phone inbox and notification URLs require the verified owner',async()=>{for(const route of ['/phone/2','/phone/2/notifications']){assert.equal((await request(route)).status,401);assert.equal((await request(route,'valid-token-two')).status,403);assert.equal((await request(route,'valid-token-one')).status,200);}});

test('friendship writes require the verified owner, including while another pilot is targeted',async()=>{const body={userId:2,peerId:3,action:'request'};assert.equal((await request('/meet/friendship',null,body)).status,401);assert.equal((await request('/meet/friendship','unverified-token',body)).status,401);assert.equal((await request('/meet/friendship','valid-token-two',body)).status,403);assert.equal((await request('/meet/friendship','valid-token-one',body)).status,200);});


test('narrative inbox, reads and responses require the verified save owner',async()=>{
 assert.equal((await request('/story/2')).status,401);assert.equal((await request('/story/2','valid-token-two')).status,403);assert.equal((await request('/story/2','valid-token-one')).status,200);
 for(const path of ['/story/read','/story/respond']){const body={userId:2,messageId:'club-invite',missionId:'club-first-finish',choice:'accept'};assert.equal((await request(path,null,body)).status,401);assert.equal((await request(path,'unverified-token',body)).status,401);assert.equal((await request(path,'valid-token-two',body)).status,403);assert.equal((await request(path,'valid-token-one',body)).status,200);}
});
