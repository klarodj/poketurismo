import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
process.env.POKETURISMO_AUTH_ENABLED = '1';
let auth, gateway, base;
const received = [];
before(async () => {
  auth = http.createServer((req, res) => {
    received.push(req.url);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ path: req.url, authorization: req.headers.authorization, cookie: req.headers.cookie }));
  });
  await new Promise(resolve => auth.listen(0, '127.0.0.1', resolve));
  process.env.AUTH_INTERNAL_URL = 'http://127.0.0.1:' + auth.address().port;
  const { app } = await import('../scripts/public-preview.mjs');
  gateway = app.listen(0, '127.0.0.1');
  await new Promise(resolve => gateway.once('listening', resolve));
  base = 'http://127.0.0.1:' + gateway.address().port;
});
after(async () => {
  for (const listener of [gateway, auth]) { listener.closeAllConnections(); await new Promise(resolve => listener.close(resolve)); }
});
test('personal-account gateway forwards Auth tokens, state cookies and callback paths', async () => {
  const response = await fetch(base + '/auth/v1/user', { headers: { Authorization: 'Bearer fixture-token', Cookie: 'oauth-state=fixture' } });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { path: '/user', authorization: 'Bearer fixture-token', cookie: 'oauth-state=fixture' });
  const callback = await fetch(base + '/auth/v1/callback?code=fixture');
  assert.equal((await callback.json()).path, '/callback?code=fixture');
});
test('both public origins are accepted and unrelated browser origins are rejected', async () => {
  for (const origin of ['https://server-klaro.tail6c534c.ts.net', 'https://server-klaro.tail6c534c.ts.net:8443']) {
    const response = await fetch(base + '/auth/v1/otp', { method: 'POST', headers: { Origin: origin } });
    assert.equal(response.status, 200);
  }
  const response = await fetch(base + '/auth/v1/otp', { method: 'POST', headers: { Origin: 'https://unrelated.example' } });
  assert.equal(response.status, 403);
});
test('Auth administration and source files remain inaccessible from the public gateway', async () => {
  const count = received.length;
  for (const path of ['/auth/v1/admin/users', '/server/index.js', '/.env', '/scripts/preview.sh']) {
    assert.equal((await fetch(base + path)).status, 404);
  }
  assert.equal(received.length, count);
});
import process from 'node:process';
