// HTTP authorization contract tests. PostgreSQL migration has a separate real-database check.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const express = require('../server/node_modules/express');
process.env.POKETURISMO_AUTH_ENABLED = '1';
process.env.DATABASE_URL = 'postgresql://contract-test@127.0.0.1/unused';
process.env.SUPABASE_ANON_KEY = 'public-test-key';
process.env.LEGACY_OWNER_EMAIL = '';
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
  app.get('/api/dev/opponents', endpoint(async () => []));
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
const pilot = (nickname = 'New Pilot') => ({ nickname, avatar: 'blue', stats: Object.fromEntries(['brave','clean','reflex','shift','acro','turn','brake','throttle'].map(key => [key, 11])) });
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
  assert.equal(first.data.player.money, 10000); assert.equal(first.data.player.carDrive, 0);
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
