import { test } from 'node:test';
import assert from 'node:assert/strict';
const saved = new Map();
Object.defineProperty(globalThis, 'window', { configurable: true, value: { location: { hostname: '192.168.1.10' } } });
Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: { getItem: key => saved.get(key) || null, setItem: (key, value) => saved.set(key, value) } });
const { action, setSnapshotHandler, newOperationId, configureIdentity } = await import('../src/services/api.js');
const { default: useRequestStore } = await import('../src/store/requestStore.js');
const response = body => ({ ok: true, json: async () => body });

test('browser requests share an in-flight operation and apply one authoritative snapshot', async t => {
  let deliver, count = 0;
  t.mock.method(globalThis, 'fetch', async () => { count++; return new Promise(resolve => { deliver = resolve; }); });
  const applied = []; setSnapshotHandler(state => applied.push(state));
  const a = action('/parts/purchase', { userId: 1, partId: 1 });
  const b = action('/parts/purchase', { userId: 1, partId: 1 });
  assert.equal(a, b); assert.equal(useRequestStore.getState().pending, 1);
  deliver(response({ player: { money: 42 } })); await a;
  assert.equal(count, 1); assert.equal(applied.length, 1); assert.equal(useRequestStore.getState().pending, 0);
});
test('a lost response preserves the operation ID for retry instead of charging twice', async t => {
  const payloads = []; let first = true;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    payloads.push(JSON.parse(options.body));
    if (first) { first = false; throw new TypeError('Connessione interrotta'); }
    return response({ player: { money: 12.5 } });
  });
  await assert.rejects(action('/garage/1/refuel', { userId: 1, liters: 1, fuelType: 'Normale' }), /interrotta/);
  assert.equal(typeof useRequestStore.getState().retry, 'function');
  await useRequestStore.getState().retry();
  assert.equal(payloads.length, 2); assert.equal(payloads[0].operationId, payloads[1].operationId); assert.equal(useRequestStore.getState().error, '');
});
test('operation IDs also work over LAN HTTP where randomUUID is unavailable', () => {
  const id = newOperationId({ getRandomValues(bytes) { bytes.fill(7); return bytes; } });
  assert.match(id, /^[a-f0-9]{48}$/);
});
test('stale-version conflicts expose the message without offering an invalid retry', async t => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 409, json: async () => ({ error: 'Settore già giocato' }) }));
  await assert.rejects(action('/races/test/turns', { userId: 1, version: 0, moveId: null }), /già giocato/);
  assert.equal(useRequestStore.getState().retry, null); assert.equal(useRequestStore.getState().pending, 0);
});

test('logout and account change discard late replies and never apply another pilot snapshot', async t => {
  configureIdentity('first-user', async () => 'first-token');
  let deliver;
  const applied = [];
  setSnapshotHandler(data => applied.push(data));
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    assert.equal(options.headers.Authorization, 'Bearer first-token');
    return new Promise(resolve => { deliver = resolve; });
  });
  const operation = action('/parts/purchase', { userId: 1, partId: 1 });
  await new Promise(resolve => setImmediate(resolve));
  configureIdentity('second-user', async () => 'second-token');
  deliver(response({ player: { id: 1, money: 10000 } }));
  await assert.rejects(operation, error => error.status === 499);
  assert.deepEqual(applied, []);
  assert.equal(useRequestStore.getState().pending, 0);
  assert.equal(useRequestStore.getState().retry, null);
  configureIdentity('legacy', null);
});
