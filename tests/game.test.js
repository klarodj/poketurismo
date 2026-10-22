import { test, before, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtempSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { advanceRace, performance, CAR_STATS, PILOT_STATS } from '../shared/raceEngine.mjs';
import { BASE_MOVES } from '../shared/legacyRaceEngine.mjs';
const require = createRequire(import.meta.url);
const directory = mkdtempSync(join(tmpdir(), 'poketurismo-tests-'));
process.env.DATABASE_URL = `file:${join(directory, 'test.db')}`;
const { app, prisma } = require('../server/index.js');
const { PrismaClient } = require('../server/node_modules/@prisma/client');
let car, garage, otherGarage, part, training, moveTraining, track, championship;
const stats = Object.fromEntries(CAR_STATS.map(key => [key, 100]));
const pilot = Object.fromEntries(PILOT_STATS.map(key => [key, 30]));
const request = async (path, body, method = 'POST', operationId = randomUUID()) => {
  const url = new URL(`http://local/api${path}`), parts = url.pathname.split('/');
  const layer = app.router.stack.find(layer => layer.route?.methods[method.toLowerCase()] && layer.route.path.split('/').length === parts.length && layer.route.path.split('/').every((part, i) => part.startsWith(':') || part === parts[i]));
  assert.ok(layer, `Route ${method} ${path} exists`);
  const params = Object.fromEntries(layer.route.path.split('/').flatMap((part, i) => part.startsWith(':') ? [[part.slice(1), parts[i]]] : []));
  let status = 200, data;
  const response = { status(code) { status = code; return this; }, json(value) { data = JSON.parse(JSON.stringify(value)); return this; } };
  await layer.route.stack[0].handle({ params, body: body ? { operationId, ...body } : {}, query: Object.fromEntries(url.searchParams) }, response);
  return { status, data };
};
const post = (path, body, key) => request(path, { userId: 1, ...body }, 'POST', key);
const get = path => request(path, null, 'GET');
const wallet = async () => (await prisma.user.findUnique({ where: { id: 1 } })).moneyCents;
const stock = async () => (await prisma.inventoryPart.findUnique({ where: { userId_partId: { userId: 1, partId: part.id } } }))?.quantity || 0;
before(async () => {
  for (const sql of readFileSync(new URL('./schema.sql', import.meta.url), 'utf8').split(';')) if (sql.trim()) await prisma.$executeRawUnsafe(sql);
});
beforeEach(async () => {
  for (const table of ['DriverDevelopment', 'GameOperation', 'RaceSession', 'InventoryPart', 'PlayerProgress', 'ChampionshipEntry', 'ChampionshipRace', 'Championship', 'TrainingSession', 'TrackBuild', 'Track', 'TrackType', 'TrackSurface', 'TrackMeteo', 'CustomTrackSection', 'CustomTrack', 'TrackSection', 'CustomOpponent', 'Mod', 'Garage', 'Part', 'Car', 'Brand', 'User']) await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
  await prisma.user.create({ data: { id: 1, username: 'Test', password: 'secret', mail: 'private@example.org', moneyCents: 10000000, carDrive: 0, ...pilot } });
  await prisma.user.create({ data: { id: 2, username: 'Other', password: 'secret', mail: '', moneyCents: 100, carDrive: 0, ...pilot } });
  const brand = await prisma.brand.create({ data: { name: 'Test brand' } });
  car = await prisma.car.create({ data: { brandId: brand.id, name: 'Test car', year: 2000, cv: 100, nm: 150, cc: 1600, kg: 1000, driveType: 'FF', velMax: 180, zeroToHundred: 9, engineType: 'NA', wheelBase: 2400, width: 1600, brakeFront: 250, brakeRear: 200, wheelSize: 15, tyreFront: 195, tyreRear: 195, category: 'Test', image: 'test.png', price: 5000, ...stats } });
  garage = await prisma.garage.create({ data: { userId: 1, carId: car.id, cv: 100, nm: 150, kg: 1000, ...stats } });
  otherGarage = await prisma.garage.create({ data: { userId: 2, carId: car.id, cv: 100, nm: 150, kg: 1000, ...stats } });
  await prisma.user.update({ where: { id: 1 }, data: { carDrive: garage.id } });
  part = await prisma.part.create({ data: { name: 'Test part', description: '', category: 'Engine', level: 1, price: 100, speedBonus: 2, accelBonus: 3, revvBonus: 4, transBonus: 5, turnSlowBonus: 6, turnFastBonus: 7, brakeBonus: 8, tractBonus: 9, image: '', cvBonus: 10, nmBonus: 11, kgBonus: 12 } });
  const type = await prisma.trackType.create({ data: { name: 'Circuit', image: '' } });
  const surface = await prisma.trackSurface.create({ data: { name: 'Asphalt' } });
  const meteo = await prisma.trackMeteo.create({ data: { name: 'Dry', stat: '' } });
  track = await prisma.track.create({ data: { name: 'Test track', typeId: type.id, surfaceId: surface.id, meteoId: meteo.id, lenght: 5, elevation: 0 } });
  const section = await prisma.trackSection.create({ data: { name: 'Rettilineo', image: '', carStat: 'speed', carTech: 'traction', driverStat: 'brave', driverTech: 'shift' } });
  await prisma.trackBuild.create({ data: { trackId: track.id, sectionId: section.id, level: 1, ord: 1 } });
  training = await prisma.trainingSession.create({ data: { name: 'Training', description: '', category: 'stat', targetStat: 'brake', statGain: 2, xpReward: 1000, cost: 500, trackId: track.id } });
  moveTraining = await prisma.trainingSession.create({ data: { name: 'Training move', description: 'Frenata precisa', category: 'move', targetMove: 'Trail Braking', targetStat: 'brake', xpReward: 100, cost: 500, trackId: track.id } });
  championship = await prisma.championship.create({ data: { name: 'Test cup', description: '', category: 'Open', entryFee: 100, rewardMoney: 1000, rewardXp: 500, rounds: { create: { trackId: track.id, ord: 1, opponentName: 'Test', opponentCarName: 'Test car' } } } });
});
after(async () => { await prisma.$disconnect(); rmSync(directory, { recursive: true, force: true }); });
async function begin(mode = 'track', extra = {}) {
  const response = await post('/races', { mode, trackId: track.id, ...extra });
  assert.equal(response.status, 200, JSON.stringify(response.data));
  const race = response.data.race;
  const row = await prisma.raceSession.findUnique({ where: { id: race.id } });
  const state = JSON.parse(row.state); state.rng = 12345;
  await prisma.raceSession.update({ where: { id: race.id }, data: { seed: 12345, state: JSON.stringify(state) } });
  return race;
}
test('player omits private fields and exposes euro balance derived from cents', async () => {
  const { status, data } = await get('/player/1');
  assert.equal(status, 200); assert.equal('password' in data, false); assert.equal('mail' in data, false); assert.equal(data.money, 100000);
});
test('car purchase uses catalogue price and duplicate delivery charges exactly once', async () => {
  const key = randomUUID(), body = { carId: car.id, price: -50000 };
  const a = await post('/purchase', body, key), b = await post('/purchase', body, key);
  assert.equal(a.status, 200); assert.deepEqual(b, a); assert.equal(await wallet(), 9500000);
  assert.equal(await prisma.garage.count({ where: { userId: 1 } }), 2);
});
test('reusing operation key for a different request is rejected', async () => {
  const key = randomUUID(); await post('/parts/purchase', { partId: part.id }, key);
  assert.equal((await post('/purchase', { carId: car.id }, key)).status, 409); assert.equal(await wallet(), 9990000);
});
test('insufficient funds and missing car never alter balances or garages', async () => {
  assert.equal((await request('/purchase', { userId: 2, carId: car.id })).status, 400);
  const money = await wallet(); assert.equal((await post('/purchase', { carId: 999999 })).status, 404); assert.equal(await wallet(), money);
});
test('part inventory persists quantities and mount consumes one while unmount returns it', async () => {
  await post('/parts/purchase', { partId: part.id }); await post('/parts/purchase', { partId: part.id }); assert.equal(await stock(), 2);
  const mounted = await post(`/garage/${garage.id}/mount`, { partId: part.id }); assert.equal(mounted.status, 200); assert.equal(await stock(), 1);
  const mod = mounted.data.garage[0].mods[0];
  const updated = await prisma.garage.findUnique({ where: { id: garage.id } });
  assert.equal(updated.revving, 104); assert.equal(updated.transmission, 105); assert.equal(updated.turnSlow, 106); assert.equal(updated.turnFast, 107);
  assert.equal((await request(`/garage/${garage.id}/mods/${mod.id}`, { userId: 1 }, 'DELETE')).status, 200); assert.equal(await stock(), 2);
  assert.equal((await prisma.garage.findUnique({ where: { id: garage.id } })).kg, 1000);
});
test('mounting an unowned part and using a foreign car or mod are rejected', async () => {
  assert.equal((await post(`/garage/${garage.id}/mount`, { partId: part.id })).status, 400);
  assert.equal((await post(`/garage/${otherGarage.id}/service`, { serviceType: 'tires' })).status, 403);
  assert.equal((await request('/player/1/equip', { userId: 1, carDrive: otherGarage.id }, 'PUT')).status, 403);
});
test('replacement returns the old part without duplicating stats', async () => {
  await post('/parts/purchase', { partId: part.id }); await post(`/garage/${garage.id}/mount`, { partId: part.id });
  const { id: ignoredId, ...definition } = part; void ignoredId;
  const better = await prisma.part.create({ data: { ...definition, level: 2, cvBonus: 20 } });
  await post('/parts/purchase', { partId: better.id });
  assert.equal((await post(`/garage/${garage.id}/mount`, { partId: better.id })).status, 200);
  assert.equal(await stock(), 1); assert.equal((await prisma.garage.findUnique({ where: { id: garage.id } })).cv, 120);
  assert.equal(await prisma.mod.count({ where: { garageId: garage.id } }), 1);
});
test('refueling keeps exact cents, grade and quantity and retries do not charge twice', async () => {
  const key = randomUUID(), body = { liters: 0.1, fuelType: 'Premium', price: 0 };
  const a = await post(`/garage/${garage.id}/refuel`, body, key); await post(`/garage/${garage.id}/refuel`, body, key);
  assert.equal(a.status, 200); assert.equal(await wallet(), 9999975); assert.equal(a.data.cost, 0.25);
  const updated = await prisma.garage.findUnique({ where: { id: garage.id } }); assert.equal(updated.currentFuel, 20.1); assert.equal(updated.fuelType, 'Premium');
  assert.equal((await post(`/garage/${garage.id}/refuel`, { liters: -1, fuelType: 'Normale' })).status, 400);
});
test('maintenance uses server cost and oil change cannot repair a broken engine', async () => {
  await prisma.garage.update({ where: { id: garage.id }, data: { engineHealth: 0 } });
  assert.equal((await post(`/garage/${garage.id}/service`, { serviceType: 'engine', price: 0 })).status, 400);
  assert.equal((await post(`/garage/${garage.id}/service`, { serviceType: 'rebuild', price: 0 })).status, 200);
  assert.equal(await wallet(), 9750000);
});
test('stat training updates once while techniques require a driving-school trial', async () => {
  const key = randomUUID(); await post(`/training-sessions/${training.id}/complete`, {}, key); await post(`/training-sessions/${training.id}/complete`, {}, key);
  const user = await prisma.user.findUnique({ where: { id: 1 } }); assert.equal(user.brake, 32); assert.equal(user.level, 2); assert.equal(user.moneyCents, 9950000);
  assert.equal((await post(`/training-sessions/${moveTraining.id}/complete`, {})).status,410);
  const inv = (await get('/inventory/1')).data;
  assert.deepEqual(inv.moves,[]);assert.deepEqual(inv.equippedMoves,[]);
  assert.equal((await request('/player/1/moves', { userId: 1, moveIds: ['m1'] }, 'PUT')).status,400);
});
test('used car ownership transfer preserves modifications and condition and listing sells once', async () => {
  await post('/parts/purchase', { partId: part.id }); await post(`/garage/${garage.id}/mount`, { partId: part.id });
  await prisma.garage.update({ where: { id: garage.id }, data: { km: 12345, currentFuel: 12.3, engineHealth: 86.4 } });
  assert.equal((await post('/market/sell', { garageId: garage.id })).status, 200);
  const response = await post('/purchase', { marketGarageId: garage.id }); assert.equal(response.status, 200);
  const updated = await prisma.garage.findUnique({ where: { id: garage.id } }); assert.equal(updated.km, 12345); assert.equal(updated.currentFuel, 12.3); assert.equal(updated.engineHealth, 86.4);
  assert.equal(await prisma.mod.count({ where: { garageId: garage.id } }), 1);
  assert.equal((await post('/purchase', { marketGarageId: garage.id })).status, 404);
});
test('race checkpoint persists and final turn cannot duplicate money, XP, fuel or kilometers', async () => {
  const race = await begin(); assert.equal(race.distanceKm, 5); assert.equal('rng' in race, false); assert.equal('seed' in race, false);
  const key = randomUUID(); const a = await post(`/races/${race.id}/turns`, { version: 0, moveId: null, gap: 999999, rewardMoney: 999999 }, key);
  assert.equal(a.status, 200, JSON.stringify(a.data)); assert.equal(a.data.race.status, 'completed'); assert.equal(a.data.race.outcome, 'win');
  const money = await wallet(), updated = await prisma.garage.findUnique({ where: { id: garage.id } });
  assert.equal(money, 10050000); assert.equal(updated.km, 5); assert.ok(updated.currentFuel < 20); assert.equal(updated.engineHealth, 99.75);
  assert.deepEqual(await post(`/races/${race.id}/turns`, { version: 0, moveId: null, gap: 999999, rewardMoney: 999999 }, key), a);
  assert.equal((await post(`/races/${race.id}/turns`, { version: 0, moveId: null })).status, 409); assert.equal(await wallet(), money);
  const fresh = new PrismaClient(); try { assert.equal((await fresh.raceSession.findUnique({ where: { id: race.id } })).status, 'completed'); assert.equal((await fresh.garage.findUnique({ where: { id: garage.id } })).currentFuel, updated.currentFuel); } finally { await fresh.$disconnect(); }
});
test('a race resumes after a sector and rejects stale versions and unplayable moves', async () => {
  const build = await prisma.trackBuild.findFirst({ where: { trackId: track.id } });
  await prisma.trackBuild.create({ data: { trackId: track.id, sectionId: build.sectionId, ord: 2, level: 1 } });
  const race = await begin();
  assert.equal((await post(`/races/${race.id}/turns`, { version: 0, moveId: 'm2' })).status, 400);
  assert.equal((await post(`/races/${race.id}/turns`, { version: 0, moveId: 'unknown' })).status, 400);
  const first = await post(`/races/${race.id}/turns`, { version: 0, moveId: null }); assert.equal(first.status, 200); assert.equal(first.data.race.status, 'active');
  const active = await get('/races/active/1'); assert.equal(active.data.id, race.id); assert.equal(active.data.version, 1);
  assert.equal((await post(`/races/${race.id}/turns`, { version: 0, moveId: null })).status, 409);
  assert.equal((await get(`/races/${race.id}?userId=1`)).data.race.index, 1);
  assert.equal((await post(`/races/${race.id}/turns`, { version: 1, moveId: null })).status, 200);
});
test('active races block edits, refuels, training, loadout changes and a second race', async () => {
  await begin();
  for (const [path, body] of [['/parts/purchase', { partId: part.id }], [`/garage/${garage.id}/refuel`, { liters: 1, fuelType: 'Normale' }], [`/training-sessions/${training.id}/complete`, {}], ['/races', { mode: 'track' }]]) assert.equal((await post(path, body)).status, 409);
  assert.equal((await request('/player/1/moves', { userId: 1, moveIds: [] }, 'PUT')).status, 409);
});
test('street wager is charged once at start and settled once at completion', async () => {
  const race = await begin('street'); assert.equal(await wallet(), 9950000);
  const response = await post(`/races/${race.id}/turns`, { version: 0, moveId: null });
  assert.equal(response.data.race.outcome, 'win'); assert.equal(await wallet(), 10100000);
});
test('abandoning is a saved loss and cannot refund a street wager', async () => {
  const race = await begin('street'); const key = randomUUID();
  const result = await post(`/races/${race.id}/abandon`, { version: 0 }, key); assert.equal(result.data.race.status, 'abandoned'); assert.equal(await wallet(), 9950000);
  await post(`/races/${race.id}/abandon`, { version: 0 }, key); assert.equal(await wallet(), 9950000); assert.equal((await get('/races/active/1')).data, null);
});
test('insufficient fuel causes a persisted loss without negative fuel or a prize', async () => {
  await prisma.garage.update({ where: { id: garage.id }, data: { currentFuel: 0.01 } });
  const race = await begin(); const result = await post(`/races/${race.id}/turns`, { version: 0, moveId: null });
  assert.equal(result.data.race.failure, 'fuel'); assert.equal(result.data.race.status, 'completed'); assert.equal(await wallet(), 10000000);
  assert.equal((await prisma.garage.findUnique({ where: { id: garage.id } })).currentFuel, 0.01);
});
test('championship requirements and round prizes are enforced and client results are disabled', async () => {
  await prisma.championship.update({ where: { id: championship.id }, data: { minLevel: 10 } });
  assert.equal((await post(`/championships/${championship.id}/enter`, {})).status, 400);
  await prisma.championship.update({ where: { id: championship.id }, data: { minLevel: 1 } });
  const entry = (await post(`/championships/${championship.id}/enter`, {})).data.entry;
  assert.equal((await post(`/championship-entries/${entry.id}/results`, { gap: 99999 })).status, 410);
  const race = await begin('championship', { entryId: entry.id });
  const key = randomUUID(), body = { version: 0, moveId: null };
  const result = await post(`/races/${race.id}/turns`, body, key); assert.equal(result.status, 200); assert.equal(result.data.race.championship.champion, true);
  assert.equal(await wallet(), 10090000); await post(`/races/${race.id}/turns`, body, key); assert.equal(await wallet(), 10090000);
  assert.equal((await prisma.championshipEntry.findUnique({ where: { id: entry.id } })).status, 'completed');
});
test('another user cannot read or advance a race and raw wear writes are disabled', async () => {
  const race = await begin(); assert.equal((await get(`/races/${race.id}?userId=2`)).status, 404);
  assert.equal((await request(`/races/${race.id}/turns`, { userId: 2, version: 0, moveId: null })).status, 404);
  assert.equal((await post(`/garage/${garage.id}/stats`, { engineHealth: 100, km: -10 })).status, 410);
});
test('concurrent duplicate requests do not duplicate inventory or charges', async () => {
  const key = randomUUID(); const responses = await Promise.all([post('/parts/purchase', { partId: part.id }, key), post('/parts/purchase', { partId: part.id }, key)]);
  assert.ok(responses.every(response => response.status === 200), JSON.stringify(responses)); assert.equal(await stock(), 1); assert.equal(await wallet(), 9990000);
});
function engineState() {
  return { car: { ...stats, cv: 150, kg: 1000, currentFuel: 20, fuelType: 'Normale', engineHealth: 100, tireGrip: 100, km: 0, serviceKm: 0 }, pilot,
    opponent: { car: { ...stats, kg: 1000, currentFuel: 20, engineHealth: 100, tireGrip: 100 }, pilot },
    sections: [{ name: 'Hairpin Right', carStat: 'acceleration', carTech: 'turnSlow', driverStat: 'acro', driverTech: 'throttle' }], moves: BASE_MOVES, distanceKm: 2, environment: { weather: 'Dry', surface: 'Asphalt' }, index: 0, gap: 0, logs: [], rng: 12345, finished: false };
}
test('engine is deterministic and does not mutate the input snapshot', () => {
  const state = engineState(), copy = structuredClone(state); assert.deepEqual(advanceRace(state, 'm2'), advanceRace(state, 'm2')); assert.deepEqual(state, copy);
});
test('only sector-relevant move bonuses affect comparisons', () => {
  const state = engineState(), plain = advanceRace(state, null), move = advanceRace(state, 'm2');
  assert.equal(move.logs[0].comparisons.find(item => item.stat === 'turnSlow').bonus, 20);
  assert.equal(move.logs[0].comparisons.find(item => item.stat === 'throttle').bonus, 0);
  assert.ok(move.logs[0].delta >= plain.logs[0].delta);
});
test('weight, premium fuel, weather and surface have measurable effects and depleted stats remain zero', () => {
  const car = engineState().car;
  assert.ok(performance({ ...car, kg: 800 }).acceleration > performance({ ...car, kg: 1500 }).acceleration);
  assert.ok(performance({ ...car, fuelType: 'Premium' }).speed > performance(car).speed);
  assert.ok(performance(car, { weather: 'rainy' }).traction < performance(car).traction);
  assert.ok(performance(car, { surface: 'sterrato' }).brake < performance(car).brake);
  assert.equal(performance({ ...car, engineHealth: 0 }).speed, 0); assert.equal(performance({ ...car, tireGrip: 0 }).traction, 0);
});

test('a delayed retry returns the current wallet and inventory instead of a stale snapshot', async () => {
  const key = randomUUID(); await post('/parts/purchase', { partId: part.id }, key);
  await post('/parts/purchase', { partId: part.id });
  const retry = await post('/parts/purchase', { partId: part.id }, key);
  assert.equal(retry.status, 200); assert.equal(retry.data.inventory.parts.length, 2); assert.equal(retry.data.player.money, 99800); assert.equal(await stock(), 2);
});
test('retired instant training cannot grant a technique or XP even with no money', async () => {
  await prisma.user.update({ where: { id: 1 }, data: { moneyCents: 0 } });
  assert.equal((await post(`/training-sessions/${moveTraining.id}/complete`, {})).status, 410);
  assert.equal(await prisma.playerProgress.count({ where: { userId: 1 } }), 0);
  assert.equal((await prisma.user.findUnique({ where: { id: 1 } })).exp, 0);
});
test('concurrent starts with distinct request IDs create one active race and debit one wager', async () => {
  const responses = await Promise.all([post('/races', { mode: 'street', trackId: track.id }), post('/races', { mode: 'street', trackId: track.id })]);
  assert.deepEqual(responses.map(response => response.status).sort(), [200, 409]);
  assert.equal(await prisma.raceSession.count({ where: { userId: 1, status: 'active' } }), 1); assert.equal(await wallet(), 9950000);
});
test('engine exhaustion is saved as a loss with zero health and no reward', async () => {
  await prisma.garage.update({ where: { id: garage.id }, data: { engineHealth: 0.01 } });
  const race = await begin(); const response = await post(`/races/${race.id}/turns`, { version: 0, moveId: null });
  assert.equal(response.data.race.failure, 'engine'); assert.equal(response.data.race.outcome, 'loss');
  assert.equal((await prisma.garage.findUnique({ where: { id: garage.id } })).engineHealth, 0); assert.equal(await wallet(), 10000000);
});
test('custom sandbox opponents cannot mint money or XP and catalogue opponent stats stay fixed', async () => {
  const opponent = await prisma.customOpponent.create({ data: { name: 'Sandbox', carId: car.id, level: 1, ...Object.fromEntries(PILOT_STATS.map(key => [key, 0])) } });
  const race = await begin('street', { opponentId: opponent.id }); assert.equal(race.sandbox, true); assert.equal(await wallet(), 10000000);
  const result = await post(`/races/${race.id}/turns`, { version: 0, moveId: null }); assert.equal(result.data.race.reward.money, 0); assert.equal(result.data.race.reward.xp, 0);
  const standard = await begin(); assert.equal(standard.opponent.car.speed, car.speed); assert.equal(standard.opponent.pilot.brave, 24);
});
test('championship progress survives intermediate rounds and only the final round awards prizes', async () => {
  await prisma.championshipRace.create({ data: { championshipId: championship.id, trackId: track.id, ord: 2, opponentName: 'Second', opponentCarName: 'Test car', opponentDifficulty: 1 } });
  const entry = (await post(`/championships/${championship.id}/enter`, {})).data.entry;
  let race = await begin('championship', { entryId: entry.id });
  const first = await post(`/races/${race.id}/turns`, { version: 0, moveId: null }); assert.equal(first.data.race.championship.nextRound, 2); assert.equal(await wallet(), 9990000);
  const checkpoint = (await get('/championship-entries/active/1')).data; assert.equal(checkpoint.currentRound, 2); assert.equal(checkpoint.results.length, 1);
  race = await begin('championship', { entryId: entry.id });
  const second = await post(`/races/${race.id}/turns`, { version: 0, moveId: null }); assert.equal(second.data.race.championship.completed, true); assert.equal(await wallet(), 10090000);
});

test('the authored demo saves eight timed tactical decisions without entry fees or rewards', async () => {
  const started = await post('/races', { mode: 'track', demo: true, demoPreset: 'matched' });
  assert.equal(started.status, 200); let race = started.data.race;
  assert.equal(race.rulesVersion, 3); assert.equal(race.sections.length, 8); assert.equal(race.geometrySource, 'authored'); assert.equal(race.sandbox, true);
  assert.ok(race.preview.seconds > 0); assert.equal(await wallet(), 10000000);
  assert.equal(race.routeProfile.kind, 'circuit'); assert.equal(race.trackMap.length, 8);
  assert.equal(Object.hasOwn(race, 'incidentPlan'), false); assert.equal(Object.hasOwn(race, 'rng'), false);
  const decision = { pace: 'save', braking: 'early', line: 'exit', manoeuvre: 'hold' };
  const key = randomUUID();
  const first = await post(`/races/${race.id}/turns`, { version: 0, moveId: null, decision }, key);
  assert.equal(first.status, 200); assert.deepEqual(first.data.race.logs[0].decision, decision); assert.ok(first.data.race.playerTime > 0);
  const replay = await post(`/races/${race.id}/turns`, { version: 0, moveId: null, decision }, key); assert.equal(replay.data.race.version, 1);
  race = (await get(`/races/${race.id}?userId=1`)).data.race;
  while (race.status === 'active') {
    const next = await post(`/races/${race.id}/turns`, { version: race.version, moveId: null, decision });
    assert.equal(next.status, 200, JSON.stringify(next.data)); race = next.data.race;
  }
  assert.equal(race.index, 8); assert.equal(race.reward.money, 0); assert.equal(race.reward.xp, 0); assert.equal(await wallet(), 10000000);
  assert.ok(Math.abs(race.car.km - 3.04) < 0.001);
});
test('server rejects tampered tactical choices without advancing or consuming fuel', async () => {
  const race = await begin(); const initial = await prisma.garage.findUnique({ where: { id: garage.id } });
  assert.equal((await post(`/races/${race.id}/turns`, { version: 0, moveId: null, decision: { pace: 'warp' } })).status, 400);
  assert.equal((await post(`/races/${race.id}/turns`, { version: 0, moveId: null, decision: { cv: 5000 } })).status, 400);
  assert.equal((await prisma.raceSession.findUnique({ where: { id: race.id } })).version, 0);
  assert.equal((await prisma.garage.findUnique({ where: { id: garage.id } })).currentFuel, initial.currentFuel);
});
test('a saved legacy race continues with its original snapshots and metre-based rules', async () => {
  const race = await begin(); const row = await prisma.raceSession.findUnique({ where: { id: race.id } });
  const state = JSON.parse(row.state);
  delete state.rulesVersion;
  state.sections = [(await prisma.trackBuild.findFirst({ where: { trackId: track.id }, include: { section: true } })).section];
  state.moves = BASE_MOVES;
  await prisma.raceSession.update({ where: { id: race.id }, data: { state: JSON.stringify(state) } });
  const response = await post(`/races/${race.id}/turns`, { version: 0, moveId: null });
  assert.equal(response.status, 200); assert.equal(response.data.race.status, 'completed'); assert.equal(response.data.race.rulesVersion, undefined);
  assert.equal(response.data.race.logs[0].comparisons.length, 4); assert.equal(response.data.race.logs[0].playerSeconds, undefined);
});


test('incident cue resumes from a checkpoint, hides future events and cannot be applied twice by retry', async () => {
  const started = await post('/races', { mode: 'track', demo: true });
  const race = started.data.race;
  const row = await prisma.raceSession.findUnique({ where: { id: race.id } });
  const state = JSON.parse(row.state);
  state.incidentPlan = { index: 1, kind: 'debris' }; state.incidentCue = null;
  await prisma.raceSession.update({ where: { id: race.id }, data: { state: JSON.stringify(state) } });
  const hidden = (await get(`/races/${race.id}?userId=1`)).data.race;
  assert.equal(hidden.incidentCue, null); assert.equal(Object.hasOwn(hidden, 'incidentPlan'), false);
  const first = await post(`/races/${race.id}/turns`, { version: 0, moveId: null });
  assert.equal(first.status, 200); assert.equal(first.data.race.incidentCue.kind, 'debris');
  const resumed = (await get(`/races/${race.id}?userId=1`)).data.race;
  assert.deepEqual(resumed.incidentCue, first.data.race.incidentCue);
  const key = randomUUID(), body = { version: 1, moveId: null, decision: { pace: 'save' } };
  const incident = await post(`/races/${race.id}/turns`, body, key);
  const retry = await post(`/races/${race.id}/turns`, body, key);
  assert.equal(incident.status, 200); assert.equal(retry.data.race.version, 2);
  assert.equal(retry.data.race.logs.filter(log => log.incident).length, 1);
  assert.equal(retry.data.race.incidentCue, null);
  assert.equal(retry.data.race.playerTime, incident.data.race.playerTime);
});

async function drivingTrial(decisions, read = true) {
  if (read) assert.equal((await post('/driver/lesson', {})).status, 200);
  let response = await post('/races', { mode: 'track', lesson: 'braking-basics' });
  assert.equal(response.status, 200, JSON.stringify(response.data));
  const brakes = ['early', 'optimal', 'late', 'optimal'];
  while (response.data.race.status === 'active') {
    const race = response.data.race;
    response = await post(`/races/${race.id}/turns`, { version: race.version, moveId: null, decision: decisions?.[race.index] || { braking: brakes[race.index], pace: 'balanced', line: 'exit' } });
    assert.equal(response.status, 200, JSON.stringify(response.data));
  }
  return response;
}
async function finishDemo(decision = { pace: 'balanced', braking: 'optimal' }, moveId = null) {
  let response = await post('/races', { mode: 'track', demo: true });
  assert.equal(response.status, 200);
  while (response.data.race.status === 'active') {
    const race = response.data.race;
    const hasBraking = race.preview.hasBrakingZone;
    response = await post(`/races/${race.id}/turns`, { version: race.version, moveId: hasBraking ? moveId : null, decision });
    assert.equal(response.status, 200, JSON.stringify(response.data));
  }
  return response;
}
test('driving lesson rejects forged progress, requires reading and does not grant a technique on demand', async () => {
  assert.equal((await post('/driver/lesson', { lessonPassed: true, xp: 9999 })).status, 400);
  assert.equal((await post('/races', { mode: 'track', lesson: 'braking-basics' })).status, 409);
  assert.equal((await request('/player/1/moves', { userId: 1, moveIds: ['progressive-release'] }, 'PUT')).status, 400);
  assert.equal(await prisma.driverDevelopment.count(), 0);
  assert.equal((await post('/driver/lesson', {})).status, 200);
  assert.equal((await post('/races', { mode: 'street', lesson: 'braking-basics' })).status, 400);
  assert.equal((await post('/races', { mode: 'track', lesson: 'braking-basics', demo: true, passed: true })).status, 400);
  assert.equal((await prisma.user.findUnique({ where: { id: 1 } })).exp, 0);
});
test('passing a driving trial grants a bounded technique once, preserving the real car even without an equipped vehicle', async () => {
  await prisma.user.update({ where: { id: 1 }, data: { carDrive: 0 } });
  const original = await prisma.garage.findUnique({ where: { id: garage.id } });
  const response = await drivingTrial();
  assert.equal(response.data.race.developmentSummary.lesson.passed, true);
  assert.equal(response.data.race.reward.xp, 40); assert.equal(response.data.race.reward.money, 0);
  assert.deepEqual(response.data.development.fundamentals, { early: 4, optimal: 4, late: 4 });
  assert.ok(response.data.inventory.moves.some(move => move.id === 'progressive-release'));
  assert.ok(response.data.inventory.equippedMoves.includes('progressive-release'));
  assert.deepEqual(await prisma.garage.findUnique({ where: { id: garage.id } }), original);
  assert.equal(await wallet(), 10000000);
  const repeated = await drivingTrial();
  assert.equal(repeated.data.race.reward.xp, 0);
  assert.equal(repeated.data.development.lessonPassed, true);
  assert.deepEqual(repeated.data.development.fundamentals, response.data.development.fundamentals);
  assert.equal((await prisma.user.findUnique({ where: { id: 1 } })).exp, 40);
});
test('wrong choices or abandoning the school trial cannot unlock its rewards', async () => {
  const response = await drivingTrial(Array.from({ length: 4 }, () => ({ braking: 'optimal', pace: 'attack' })));
  assert.equal(response.data.race.developmentSummary.lesson.passed, false);
  assert.equal(response.data.development.lessonPassed, false);
  assert.equal(response.data.race.reward.xp, 0);
  const start = await post('/races', { mode: 'track', lesson: 'braking-basics' });
  const abandoned = await post(`/races/${start.data.race.id}/abandon`, { version: 0 });
  assert.equal(abandoned.status, 200); assert.equal(abandoned.data.development.lessonPassed, false);
  assert.equal(abandoned.data.inventory.moves.some(move => move.id === 'progressive-release'), false);
});
test('trial checkpoints and the final reward resist replay, stale requests and concurrent duplicate sends', async () => {
  await post('/driver/lesson', {});
  let race = (await post('/races', { mode: 'track', lesson: 'braking-basics' })).data.race;
  const brakes = ['early', 'optimal', 'late'];
  for (const braking of brakes) {
    const result = await post(`/races/${race.id}/turns`, { version: race.version, moveId: null, decision: { braking } });
    assert.equal(result.status, 200); race = result.data.race;
  }
  const resumed = (await get(`/races/${race.id}?userId=1`)).data.race;
  assert.equal(resumed.index, 3); assert.ok(resumed.logs[2].instructor.correct);
  const body = { version: 3, moveId: null, decision: { braking: 'optimal' }, xp: 100000, practice: 100000, winner: true };
  const key = randomUUID();
  const results = await Promise.all([post(`/races/${race.id}/turns`, body, key), post(`/races/${race.id}/turns`, body, key)]);
  assert.ok(results.every(result => result.status === 200));
  assert.equal((await prisma.user.findUnique({ where: { id: 1 } })).exp, 40);
  const fresh = new PrismaClient();
  try { assert.equal((await fresh.driverDevelopment.findUnique({ where: { userId: 1 } })).referencePractice, 4); } finally { await fresh.$disconnect(); }
  assert.equal((await post(`/races/${race.id}/turns`, body)).status, 409);
});
test('real braking practice diminishes per route and cannot be increased by client-supplied skill values', async () => {
  const expected = [6, 9, 10, 10];
  for (const points of expected) {
    const result = await finishDemo({ braking: 'optimal', pace: 'balanced' });
    assert.equal(result.data.development.fundamentals.optimal, points);
    assert.equal(result.data.development.fundamentals.early, 0);
    assert.equal(result.data.race.reward.xp, 0);
  }
  const started = await post('/races', { mode: 'track', demo: true, pilot: { brake: 9999 }, fundamentals: { optimal: 99999 } });
  assert.equal(started.data.race.pilot.brake, 30);
  assert.equal(started.data.race.pilot.fundamentals.optimal, 10);
  const invalid = await post(`/races/${started.data.race.id}/turns`, { version: 0, moveId: null, decision: { braking: 'optimal', practice: 99999 } });
  assert.equal(invalid.status, 400); assert.equal((await prisma.driverDevelopment.findUnique({ where: { userId: 1 } })).referencePractice, 10);
});
test('legacy stat courses have limited repetitions with diminishing gains, including distinct operation IDs', async () => {
  const gains = [];
  for (let index = 0; index < 3; index++) {
    const response = await post(`/training-sessions/${training.id}/complete`, { statGain: 9999, xpReward: 999999 });
    assert.equal(response.status, 200); gains.push(response.data.training.statGain);
  }
  assert.deepEqual(gains, [2, 1, 1]);
  const money = await wallet();
  assert.equal((await post(`/training-sessions/${training.id}/complete`, {})).status, 409);
  assert.equal(await wallet(), money);
  assert.equal((await prisma.user.findUnique({ where: { id: 1 } })).brake, 34);
});
test('custom sandbox races and straight-only sessions never manufacture braking practice', async () => {
  const rival = await prisma.customOpponent.create({ data: { name: 'Sandbox', carId: car.id, level: 1, ...pilot } });
  const started = await post('/races', { mode: 'street', trackId: track.id, opponentId: rival.id });
  const finished = await post(`/races/${started.data.race.id}/turns`, { version: 0, moveId: null });
  assert.equal(finished.status, 200); assert.equal(finished.data.development.fundamentals.optimal, 0);
  const race = await begin();
  const result = await post(`/races/${race.id}/turns`, { version: 0, moveId: null });
  assert.equal(result.data.development.fundamentals.optimal, 0);
});
test('finishing a genuine race without winning gives modest participation XP, but abandoning does not', async () => {
  const race = await begin();
  const row = await prisma.raceSession.findUnique({ where: { id: race.id } });
  const state = JSON.parse(row.state); state.playerTime = 100; state.gapSeconds = -100;
  await prisma.raceSession.update({ where: { id: race.id }, data: { state: JSON.stringify(state) } });
  const result = await post(`/races/${race.id}/turns`, { version: 0, moveId: null });
  assert.equal(result.data.race.outcome, 'loss'); assert.equal(result.data.race.reward.xp, 20);
  const second = await begin();
  const abandoned = await post(`/races/${second.id}/abandon`, { version: 0 });
  assert.equal(abandoned.data.race.reward.xp, 0);
});

test('a newly learned technique has a separate route allowance and mastery is persisted and capped', async () => {
  await finishDemo(); await finishDemo(); await finishDemo();
  await drivingTrial();
  let result = await finishDemo({ braking: 'optimal' }, 'progressive-release');
  assert.equal(result.data.development.techniquePractice, 6);
  assert.equal(result.data.development.fundamentals.optimal, 14);
  await prisma.driverDevelopment.update({ where: { userId: 1 }, data: { referencePractice: 119, techniquePractice: 59, routePractice: '{}' } });
  result = await finishDemo({ braking: 'optimal' }, 'progressive-release');
  assert.equal(result.data.development.fundamentals.optimal, 120);
  assert.equal(result.data.development.techniquePractice, 60);
  assert.equal(result.data.inventory.moves.find(move => move.id === 'progressive-release').mastery, 'Padroneggiata');
});
test('distinct concurrent final-turn keys cannot award a second lesson certificate', async () => {
  await post('/driver/lesson', {});
  let race = (await post('/races', { mode: 'track', lesson: 'braking-basics' })).data.race;
  for (const braking of ['early', 'optimal', 'late']) race = (await post(`/races/${race.id}/turns`, { version: race.version, moveId: null, decision: { braking } })).data.race;
  const body = { version: race.version, moveId: null, decision: { braking: 'optimal' } };
  const results = await Promise.all([post(`/races/${race.id}/turns`, body), post(`/races/${race.id}/turns`, body)]);
  assert.deepEqual(results.map(result => result.status).sort(), [200, 409]);
  assert.equal((await prisma.user.findUnique({ where: { id: 1 } })).exp, 40);
  assert.equal((await prisma.driverDevelopment.findUnique({ where: { userId: 1 } })).referencePractice, 4);
});

test('switching a catalogue route between circuit and street cannot reset its braking practice allowance', async () => {
  const build = await prisma.trackBuild.findFirst({ where: { trackId: track.id } });
  await prisma.trackSection.update({ where: { id: build.sectionId }, data: { name: 'Tornante' } });
  let race = await begin('track');
  let result = await post(`/races/${race.id}/turns`, { version: 0, moveId: null });
  assert.equal(result.data.development.fundamentals.optimal, 2);
  race = await begin('street');
  result = await post(`/races/${race.id}/turns`, { version: 0, moveId: null });
  assert.equal(result.data.development.fundamentals.optimal, 3);
});
test('a failed course payment cannot consume a repetition or grant experience', async () => {
  await prisma.user.update({ where: { id: 1 }, data: { moneyCents: 1 } });
  const result = await post(`/training-sessions/${training.id}/complete`, {});
  assert.equal(result.status, 400);
  assert.equal(await prisma.driverDevelopment.count({ where: { userId: 1 } }), 0);
  assert.equal((await prisma.user.findUnique({ where: { id: 1 } })).exp, 0);
});

test('fresh inventory contains no free techniques, even with a legacy default loadout', async () => {
  await prisma.playerProgress.create({ data: { userId: 1, equippedMoves: '["m1","m2","m3"]' } });
  const state = (await get('/state/1')).data;
  assert.deepEqual(state.inventory.moves, []); assert.deepEqual(state.inventory.equippedMoves, []);
  assert.equal(state.development.curriculum.length, 50);
  assert.equal(state.development.curriculum.some(item => item.learned), false);
});
test('school rejects forged progress, unread exams, insufficient level and missing prerequisites', async () => {
  assert.equal((await post('/driver/techniques/read', { techniqueId: 'smooth-driving', passed: true })).status, 400);
  assert.equal((await post('/races', { mode: 'track', lesson: 'course-smooth-driving' })).status, 409);
  assert.equal((await post('/driver/techniques/read', { techniqueId: 'trail-braking' })).status, 403);
  await prisma.user.update({ where: { id: 1 }, data: { level: 99, exp: 98000 } });
  assert.equal((await post('/driver/techniques/read', { techniqueId: 'trail-braking' })).status, 403);
  const read = await post('/driver/techniques/read', { techniqueId: 'smooth-driving' });
  assert.equal(read.status, 200);assert.equal(read.data.development.curriculum.find(item=>item.id==='smooth-driving').read,true);
  assert.deepEqual(read.data.inventory.moves, []);
  assert.equal((await request('/player/1/moves', { userId: 1, moveIds: ['smooth-driving'] }, 'PUT')).status, 400);
});
async function curriculumTrial(id, wrong = false) {
  const { TECHNIQUE_BY_ID } = require('../shared/techniqueCatalog.mjs');
  const technique = TECHNIQUE_BY_ID[id];
  let result = await post('/driver/techniques/read', { techniqueId: id });
  assert.equal(result.status,200,JSON.stringify(result.data));
  result = await post('/races', { mode: 'track', lesson: technique.lessonId });
  assert.equal(result.status,200,JSON.stringify(result.data));
  while(result.data.race.status==='active') {
    const race=result.data.race, section=race.sections[race.index];
    const decision = section.goal || { braking: section.braking, line: 'exit', pace: 'balanced' };
    result=await post(`/races/${race.id}/turns`, { version: race.version, moveId: null, decision: wrong ? { ...decision, pace: 'attack' } : decision });
    assert.equal(result.status,200,JSON.stringify(result.data));
  }
  return result;
}
test('all fifty courses can actually be read and passed through the server and survive a new database connection', async () => {
  const { TECHNIQUES } = require('../shared/techniqueCatalog.mjs');
  await prisma.user.update({ where: { id: 1 }, data: { level: 99, exp: 98000, carDrive: 0 } });
  for (const technique of TECHNIQUES) {
    const result=await curriculumTrial(technique.id);
    assert.equal(result.data.race.developmentSummary.lesson.passed,true,technique.id);
    assert.equal(result.data.race.reward.xp,technique.xp,technique.id);
    assert.equal(result.data.inventory.moves.some(move=>move.id===technique.id),true,technique.id);
    assert.ok(result.data.inventory.equippedMoves.length<=4);
  }
  assert.equal((await get('/inventory/1')).data.moves.length,50);
  const fresh=new PrismaClient();try {
    const row=await fresh.driverDevelopment.findUnique({where:{userId:1}});
    assert.equal(Object.values(JSON.parse(row.techniqueProgress)).filter(item=>item.passed).length,49);
    assert.equal(row.lessonPassed,true);
  } finally { await fresh.$disconnect(); }
});
test('new course failures give no unlock; repetitions and final-turn retries cannot mint XP', async () => {
  const failed=await curriculumTrial('smooth-driving',true);
  assert.equal(failed.data.race.developmentSummary.lesson.passed,false);
  assert.equal(failed.data.inventory.moves.some(move=>move.id==='smooth-driving'),false);
  const first=await curriculumTrial('smooth-driving');assert.equal(first.data.race.reward.xp,40);
  const xp=first.data.player.exp;
  const repeat=await curriculumTrial('smooth-driving');assert.equal(repeat.data.race.reward.xp,0);
  assert.equal(repeat.data.player.exp,xp);
  assert.equal(repeat.data.development.curriculum.find(item=>item.id==='smooth-driving').practice,1);
  const final=repeat.data.race;
  assert.equal((await post(`/races/${final.id}/turns`,{version:final.version-1,moveId:null})).status,409);
  assert.equal((await prisma.user.findUnique({where:{id:1}})).exp,xp);
});

test('modern technique practice requires actual completed use, respects its cap and excludes custom races', async () => {
  const { TECHNIQUE_BY_ID, techniqueMove }=require('../shared/techniqueCatalog.mjs');
  const { createTechniqueLesson }=require('../shared/techniqueLessons.mjs');
  const { settleDevelopment }=require('../server/driverDevelopment');
  const technique=TECHNIQUE_BY_ID['exit-line'];
  const records={'exit-line':{read:true,passed:true,practice:58}};
  await prisma.driverDevelopment.create({data:{userId:1,techniqueProgress:JSON.stringify(records)}});
  let state=createTechniqueLesson(technique,pilot,12345);
  delete state.lesson;delete state.courseTechniqueId;state.sandbox=false;state.trackId=track.id;state.moves=[techniqueMove(technique)];
  while(!state.finished)state=advanceRace(state,technique.id,state.sections[state.index].goal);
  const result=await prisma.$transaction(tx=>settleDevelopment(tx,1,state));
  assert.equal(result.techniqueGains['exit-line'],2);
  assert.equal(JSON.parse((await prisma.driverDevelopment.findUnique({where:{userId:1}})).techniqueProgress)['exit-line'].practice,60);
  records['exit-line'].practice=0;await prisma.driverDevelopment.update({where:{userId:1},data:{techniqueProgress:JSON.stringify(records)}});
  state.sandbox=true;await prisma.$transaction(tx=>settleDevelopment(tx,1,state));
  assert.equal(JSON.parse((await prisma.driverDevelopment.findUnique({where:{userId:1}})).techniqueProgress)['exit-line'].practice,0);
  state.sandbox=false;state.failure='abandoned';await prisma.$transaction(tx=>settleDevelopment(tx,1,state));
  assert.equal(JSON.parse((await prisma.driverDevelopment.findUnique({where:{userId:1}})).techniqueProgress)['exit-line'].practice,0);
});
