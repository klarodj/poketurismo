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
  for (const table of ['MeetFriendship','MeetReport','MeetMessage','MeetBlock','MeetChallenge','DriverDevelopment', 'GameOperation', 'RaceSession', 'InventoryPart', 'PlayerProgress', 'ChampionshipEntry', 'ChampionshipRace', 'Championship', 'TrainingSession', 'TrackBuild', 'Track', 'TrackType', 'TrackSurface', 'TrackMeteo', 'CustomTrackSection', 'CustomTrack', 'TrackSection', 'CustomOpponent', 'Mod', 'Garage', 'Part', 'Car', 'Brand', 'User']) await prisma.$executeRawUnsafe(`DELETE FROM "${table}"`);
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
async function streetSetup(wager = 100) {
  const { STREET_ZONES } = await import('../shared/streetCatalog.mjs');
  for (const name of new Set(STREET_ZONES[0].rivals.map(r=>r.carName))) {
    if (!await prisma.car.findFirst({where:{name}})) { const {id: _id,...data}=car; await prisma.car.create({data:{...data,name}}); }
  }
  await prisma.track.update({where:{id:track.id},data:{name:'Parcheggio · anello dei magazzini'}});
  const found=await post('/street/encounter',{zoneId:'parking'});
  assert.equal(found.status,200,JSON.stringify(found.data));
  const offer=found.data.street.zones[0].offer;
  return {mode:'street',zoneId:'parking',offerId:offer.id,wager};
}
async function begin(mode = 'track', extra = {}) {
  const setup = mode === 'street' && extra.opponentId === undefined && extra.customTrackId === undefined ? {...await streetSetup(), ...extra} : { mode, trackId: track.id, ...extra };
  const response = await post('/races', setup);
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
  assert.equal(a.status, 200); assert.deepEqual(b, a); assert.equal(await wallet(), 8500000);
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
  const quote=(await get('/workshop/1')).data.cars.find(c=>c.id===garage.id).services.find(s=>s.id==='rebuild');
  assert.equal((await post(`/garage/${garage.id}/service`, { serviceType: 'rebuild', price: 0, quoteKey:quote.key })).status, 200);
  assert.equal(await wallet(), 10000000-quote.price*100);
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
  const race = await begin('street'); assert.equal(await wallet(), 9990000);
  const response = await post(`/races/${race.id}/turns`, { version: 0, moveId: null });
  assert.equal(response.data.race.outcome, 'win'); assert.equal(await wallet(), 10010000);
});
test('abandoning is a saved loss and cannot refund a street wager', async () => {
  const race = await begin('street'); const key = randomUUID();
  const result = await post(`/races/${race.id}/abandon`, { version: 0 }, key); assert.equal(result.data.race.status, 'abandoned'); assert.equal(await wallet(), 9990000);
  await post(`/races/${race.id}/abandon`, { version: 0 }, key); assert.equal(await wallet(), 9990000); assert.equal((await get('/races/active/1')).data, null);
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
  const setup=await streetSetup();
  const responses = await Promise.all([post('/races', setup), post('/races', setup)]);
  assert.deepEqual(responses.map(response => response.status).sort(), [200, 409]);
  assert.equal(await prisma.raceSession.count({ where: { userId: 1, status: 'active' } }), 1); assert.equal(await wallet(), 9990000);
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
  const firstGain=result.data.development.fundamentals.optimal;assert.ok(firstGain>=1&&firstGain<=2);
  race = await begin('street');
  result = await post(`/races/${race.id}/turns`, { version: 0, moveId: null });
  assert.ok(result.data.development.fundamentals.optimal>=firstGain&&result.data.development.fundamentals.optimal<=firstGain+1);
  assert.equal(JSON.parse((await prisma.driverDevelopment.findUnique({where:{userId:1}})).routePractice)[`track-${track.id}`].optimal,2);
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

test('market stock and price revision run once without altering players or their owned cars', async()=>{
  const {applyStock}=require('../server/marketStock');
  const user=await prisma.user.findUnique({where:{id:1}}),owned=await prisma.garage.findMany({where:{userId:1}});
  const first=await applyStock(prisma),count=await prisma.garage.count({where:{userId:-1}});
  assert.equal(first.applied,true);assert.ok(count>0);assert.equal((await applyStock(prisma)).applied,false);
  assert.equal(await prisma.garage.count({where:{userId:-1}}),count);
  assert.deepEqual(await prisma.user.findUnique({where:{id:1}}),user);assert.deepEqual(await prisma.garage.findMany({where:{userId:1}}),owned);
});
test('used purchase applies the same protected asking price shown by the market', async()=>{
  const {marketAskingPrice}=require('../shared/carEconomy.mjs');
  await prisma.user.create({data:{id:-1,username:'Market',password:'',mail:'',carDrive:0,...pilot}});
  const listing=await prisma.garage.create({data:{userId:-1,carId:car.id,cv:car.cv,nm:car.nm,kg:car.kg,...stats,sellPrice:1}});
  const shown=(await get('/market')).data.find(item=>item.id===listing.id);assert.ok(shown.sellPrice>10000);
  const before=await wallet(),bought=await post('/purchase',{marketGarageId:listing.id,price:1});assert.equal(bought.status,200);
  assert.equal(await wallet(),before-marketAskingPrice(car,listing)*100);
});
test('trade-in quote matches the UI and buying back an unchanged car cannot generate money',async()=>{
  const state=(await get('/state/1')).data,quote=state.garage.find(item=>item.id===garage.id).resaleValue,before=await wallet();
  const sold=await post('/market/sell',{garageId:garage.id});assert.equal(sold.data.sellValue,quote);assert.equal(await wallet(),before+quote*100);
  const listing=(await get('/market')).data.find(item=>item.id===garage.id);assert.ok(listing.sellPrice>quote);
  const key=randomUUID();await post('/purchase',{marketGarageId:garage.id},key);await post('/purchase',{marketGarageId:garage.id},key);
  assert.equal(await wallet(),before+(quote-listing.sellPrice)*100);assert.ok(await wallet()<before);
});

test('street encounters persist and cycle all eight rivals before repeating for free',async()=>{
  await streetSetup(0);
  let hub=(await get('/street/1')).data;let offer=hub.zones[0].offer;
  const first=offer.id;const ids=[offer.rival.id];
  assert.equal((await post('/street/encounter',{zoneId:'parking'})).data.street.zones[0].offer.id,first);
  for(let i=1;i<8;i++){const result=await post('/street/encounter',{zoneId:'parking',replace:true,offerId:offer.id});assert.equal(result.status,200);offer=result.data.street.zones[0].offer;ids.push(offer.rival.id);}
  assert.equal(new Set(ids).size,8);assert.equal(await wallet(),10000000);
  assert.equal((await get('/street/1')).data.zones[0].offer.id,offer.id);
});
test('normal street starts require a valid server encounter and reject forged setup and stakes',async()=>{
  assert.equal((await post('/races',{mode:'street',trackId:track.id})).status,400);
  const setup=await streetSetup(0);
  for(const forged of [{...setup,wager:-1},{...setup,wager:99999},{...setup,trackId:track.id},{...setup,offerId:'inventato'}])assert.ok((await post('/races',forged)).status>=400);
  assert.equal(await wallet(),10000000);assert.equal(await prisma.raceSession.count(),0);
  assert.equal((await post('/races',setup)).status,200);
});
test('changing rival invalidates the old offer and requires the current token to skip again',async()=>{
  const setup=await streetSetup(0);
  const next=await post('/street/encounter',{zoneId:'parking',replace:true,offerId:setup.offerId});assert.equal(next.status,200);
  assert.equal((await post('/races',setup)).status,409);
  assert.equal((await post('/street/encounter',{zoneId:'parking',replace:true,offerId:setup.offerId})).status,409);
});
test('changing the equipped car condition invalidates an encounter instead of changing the accepted challenge',async()=>{
  const setup=await streetSetup(0);await prisma.garage.update({where:{id:garage.id},data:{cv:500}});
  assert.equal((await post('/races',setup)).status,409);
  assert.equal((await get('/street/1')).data.zones[0].offer,null);
  assert.equal((await post('/street/encounter',{zoneId:'parking'})).status,200);
});
test('street access enforces level, performance, reputation and school on the server',async()=>{
  await streetSetup(0);
  assert.equal((await post('/street/encounter',{zoneId:'industrial'})).status,403);
  await prisma.user.update({where:{id:1},data:{level:6,exp:5000}});
  const row=await prisma.playerProgress.findUnique({where:{userId:1}});const saved=JSON.parse(row.streetState);
  for(const id of ['parking','industrial','coast','mountain'])saved[id]={...saved[id],reputation:100};
  await prisma.playerProgress.update({where:{userId:1},data:{streetState:JSON.stringify(saved)}});
  assert.equal((await get('/street/1')).data.zones.find(z=>z.id==='mountain').unlocked,false);
  await prisma.driverDevelopment.create({data:{userId:1,lessonPassed:true}});
  assert.ok((await get('/street/1')).data.zones.every(z=>z.unlocked));
  await prisma.garage.update({where:{id:garage.id},data:{cv:10,engineHealth:1,speed:0,acceleration:0,turnSlow:0,turnFast:0,brake:0,traction:0}});
  assert.equal((await post('/street/encounter',{zoneId:'highway'})).status,403);
  assert.equal((await post('/street/encounter',{zoneId:'parking',reputation:99999})).status,400);
});
test('street stakes preserve cash reserve and cannot be charged after the wallet changed',async()=>{
  const setup=await streetSetup(100);
  await prisma.user.update({where:{id:1},data:{moneyCents:105000}});
  const result=await post('/races',setup);assert.equal(result.status,400);assert.equal(await wallet(),105000);
  assert.ok((await get('/street/1')).data.zones[0].offer.wagers.every(value=>value<=50));
  assert.equal(await prisma.raceSession.count(),0);
});
test('unstaked street wins award no money and reputation settles once across final-turn retries',async()=>{
  const race=await begin('street',{wager:0});const key=randomUUID();
  const result=await post(`/races/${race.id}/turns`,{version:0,moveId:null},key);
  assert.equal(result.status,200);assert.equal(result.data.race.reward.money,0);assert.equal(await wallet(),10000000);
  const reputation=result.data.race.streetResult.totalReputation;assert.ok(reputation>0);
  const xp=result.data.player.exp;
  const retry=await post(`/races/${race.id}/turns`,{version:0,moveId:null},key);assert.equal(retry.status,200);assert.equal(retry.data.player.exp,xp);
  assert.equal((await post(`/races/${race.id}/turns`,{version:0,moveId:null})).status,409);
  assert.equal((await get('/street/1')).data.zones[0].reputation,reputation);
});
test('a familiar street rival has no remaining rewards or stakes and does not regain participation XP',async()=>{
  const setup=await streetSetup(0);const hub=(await get('/street/1')).data;const rivalId=hub.zones[0].offer.rival.id;
  const row=await prisma.playerProgress.findUnique({where:{userId:1}});const saved=JSON.parse(row.streetState);saved.parking.rivals={[rivalId]:{races:4,wins:4,losses:0,draws:0}};
  await prisma.playerProgress.update({where:{userId:1},data:{streetState:JSON.stringify(saved)}});
  assert.deepEqual((await get('/street/1')).data.zones[0].offer.wagers,[0]);
  const race=(await post('/races',setup)).data.race;
  const result=await post(`/races/${race.id}/turns`,{version:0,moveId:null});assert.equal(result.status,200);
  assert.equal(result.data.race.reward.xp,0);assert.equal(result.data.race.streetResult.reputation,0);
});

async function modernCup(){
  const {CHAMPIONSHIP_CATALOG}=await import('../shared/championshipCatalog.mjs');const spec=CHAMPIONSHIP_CATALOG[0];
  for(const name of new Set(spec.rivals.map(r=>r.carName))){if(!await prisma.car.findFirst({where:{name}})){const{id:_id,...data}=car;await prisma.car.create({data:{...data,name,cv:55}});}}
  await prisma.garage.update({where:{id:garage.id},data:{cv:55}});
  await prisma.championship.update({where:{id:championship.id},data:{name:spec.name,minCv:40,maxCv:85,entryFee:300,rewardMoney:1800,rewardXp:350}});
  for(let ord=2;ord<=3;ord++)await prisma.championshipRace.create({data:{championshipId:championship.id,trackId:track.id,ord,opponentName:'Catalogued driver',opponentCarName:'Seicento Sporting'}});
  const response=await post(`/championships/${championship.id}/enter`,{});assert.equal(response.status,200,JSON.stringify(response.data));return response.data.entry;
}
test('new championships freeze the complete calendar, cars and rewards and score eight entrants',async()=>{
  const entry=await modernCup();assert.equal(entry.format,'grid');assert.equal(entry.standings.length,8);assert.equal(entry.championship.rounds.length,3);
  await prisma.championship.update({where:{id:championship.id},data:{rewardMoney:999999,minCv:9000}});
  await prisma.championshipRace.updateMany({where:{championshipId:championship.id},data:{opponentCarName:'Missing car'}});
  let last;
  for(let round=1;round<=3;round++){
    const race=await begin('championship',{entryId:entry.id});assert.equal(race.opponent.car.name,['Seicento Sporting','Cinquecento Sporting','Seicento Sporting'][round-1]);
    last=await post(`/races/${race.id}/turns`,{version:0,moveId:null});assert.equal(last.status,200,JSON.stringify(last.data));
    assert.equal(last.data.race.championship.classification.length,8);assert.equal(last.data.race.championship.standings.length,8);
    if(round<3)assert.equal(last.data.race.reward.money,0);
  }
  assert.equal(last.data.race.championship.completed,true);assert.ok(last.data.race.reward.money<=1800);assert.equal((await get('/championship-entries/active/1')).data,null);
  const saved=(await get(`/championship-entries/${entry.id}?userId=1`)).data;assert.equal(saved.results.length,3);assert.equal(saved.championship.rewardMoney,1800);
});
test('all-abandoned championships score retirements and cannot manufacture prize money or XP',async()=>{
  const entry=await modernCup();let final;
  for(let round=1;round<=3;round++){const race=await begin('championship',{entryId:entry.id});final=await post(`/races/${race.id}/abandon`,{version:0});const player=final.data.race.championship.classification.find(r=>r.id==='player');assert.equal(player.points,0);assert.equal(player.failure,'abandoned');assert.ok(final.data.race.championship.classification.filter(r=>r.id!=='player').every(r=>r.timeMs>0));}
  assert.equal(final.data.race.reward.money,0);assert.equal(final.data.race.reward.xp,0);assert.equal(await wallet(),9970000);
});
test('new grid final-turn retries cannot score a second round or award a second prize',async()=>{
 const entry=await modernCup();const race=await begin('championship',{entryId:entry.id});const key=randomUUID();const body={version:0,moveId:null};
 const first=await post(`/races/${race.id}/turns`,body,key);assert.equal(first.status,200);
 assert.equal((await post(`/races/${race.id}/turns`,body,key)).status,200);
 assert.equal((await post(`/races/${race.id}/turns`,body)).status,409);
 assert.equal((await get(`/championship-entries/${entry.id}?userId=1`)).data.results.length,1);
});
test('time trials save only server-computed completed records and never pay money or XP',async()=>{
 const race=await begin('track',{timeTrial:true});assert.equal(race.timeTrial,true);assert.equal(race.sandbox,true);assert.equal(race.wager,0);
 const result=await post(`/races/${race.id}/turns`,{version:0,moveId:null,time:1});assert.equal(result.status,200);
 assert.equal(result.data.race.reward.money,0);assert.equal(result.data.race.reward.xp,0);assert.equal(await wallet(),10000000);
 const records=(await get('/time-trials/1')).data;assert.equal(records.length,1);assert.equal(records[0].timeMs,Math.round(result.data.race.playerTime*1000));assert.equal((await get('/time-trials/2')).data.length,0);
 const abandoned=await begin('track',{timeTrial:true});await post(`/races/${abandoned.id}/abandon`,{version:0});assert.deepEqual((await get('/time-trials/1')).data,records);
});
test('time trial mode rejects street routes and cannot be combined with a paid or school session',async()=>{
 assert.equal((await post('/races',{mode:'street',timeTrial:true})).status,400);
 assert.equal((await post('/races',{mode:'track',timeTrial:true,demo:true})).status,400);
 const type=await prisma.trackType.create({data:{name:'Touge',image:''}});await prisma.track.update({where:{id:track.id},data:{typeId:type.id}});
 assert.equal((await post('/races',{mode:'track',timeTrial:true,trackId:track.id})).status,400);
});

test('Car Meet is opt-in, exposes only public game fields and does not alter funds or car stats',async()=>{
 assert.deepEqual((await get('/meet?userId=1')).data.showcases,[]);
 const before=await prisma.garage.findUnique({where:{id:garage.id}}),money=await wallet();
 const shown=await post('/meet/showcase',{garageId:garage.id});assert.equal(shown.status,200);assert.equal(shown.data.meet.myGarageId,garage.id);
 const publicData=(await get('/meet?userId=2')).data;assert.equal(publicData.showcases.length,1);assert.equal(publicData.myGarageId,null);
 const pilot=publicData.showcases[0].pilot;assert.deepEqual(Object.keys(pilot).sort(),['avatar','id','level','name']);
 for(const secret of ['private@example.org','secret','moneyCents','authUserId','usernameKey','password'])assert.ok(!JSON.stringify(publicData).includes(secret));
 assert.equal(await wallet(),money);assert.deepEqual(await prisma.garage.findUnique({where:{id:garage.id}}),before);
});
test('Car Meet rejects foreign cars, missing choices and forged public metadata',async()=>{
 assert.equal((await post('/meet/showcase',{garageId:otherGarage.id})).status,403);
 assert.equal((await post('/meet/showcase',{})).status,400);
 assert.equal((await post('/meet/showcase',{garageId:garage.id,username:'Falso'})).status,400);
 assert.deepEqual((await get('/meet?userId=1')).data.showcases,[]);
});
test('showcase retries return current visibility and withdrawing preserves personal records',async()=>{
 const key=randomUUID();await post('/meet/showcase',{garageId:garage.id},key);
 const race=await begin('track',{timeTrial:true});await post(`/races/${race.id}/turns`,{version:0,moveId:null});
 const privateRecords=(await get('/time-trials/1')).data;await post('/meet/showcase',{garageId:garage.id});
 assert.equal((await get(`/meet/leaderboard?trackId=${track.id}&modelId=${car.id}`)).data.records.length,1);
 await post('/meet/showcase',{garageId:null});
 assert.equal((await post('/meet/showcase',{garageId:garage.id},key)).data.meet.showcases.length,0);
 assert.equal((await get(`/meet/leaderboard?trackId=${track.id}&modelId=${car.id}`)).data.records.length,0);
 assert.deepEqual((await get('/time-trials/1')).data,privateRecords);
});
test('showcase settings are safe to change during a race without overwriting driving progress',async()=>{
 const race=await begin();await prisma.playerProgress.upsert({where:{userId:1},create:{userId:1,streetState:'{"parking":{"reputation":12}}'},update:{streetState:'{"parking":{"reputation":12}}'}});
 assert.equal((await post('/meet/showcase',{garageId:garage.id})).status,409);const{id:_id,...copy}=garage;const second=await prisma.garage.create({data:copy});const displayed=await post('/meet/showcase',{garageId:second.id});assert.equal(displayed.status,200);assert.equal(displayed.data.activeRace.id,race.id);
 assert.equal(JSON.parse((await prisma.playerProgress.findUnique({where:{userId:1}})).streetState).parking.reputation,12);
 assert.equal((await post(`/races/${race.id}/turns`,{version:0,moveId:null})).status,200);
});
test('selling an exhibited car removes its display and shared records without exposing the new owner',async()=>{
 await post('/meet/showcase',{garageId:garage.id});const race=await begin('track',{timeTrial:true});await post(`/races/${race.id}/turns`,{version:0,moveId:null});
 assert.equal((await post('/market/sell',{garageId:garage.id})).status,200);
 assert.equal((await get('/meet?userId=1')).data.showcases.length,0);
 assert.equal((await get(`/meet/leaderboard?trackId=${track.id}&modelId=${car.id}`)).data.records.length,0);
 assert.equal((await get('/time-trials/1')).data.length,1);
});
test('shared records use completed time trials only, one best per visible pilot and model',async()=>{
 await post('/meet/showcase',{garageId:garage.id});
 const one=await begin('track',{timeTrial:true});const first=await post(`/races/${one.id}/turns`,{version:0,moveId:null,timeMs:1});assert.equal(first.status,200);
 const second=await begin('track',{timeTrial:true});const result=await post(`/races/${second.id}/turns`,{version:0,moveId:null});assert.equal(result.status,200);
 const normal=await begin();await post(`/races/${normal.id}/turns`,{version:0,moveId:null});
 const failed=await begin('track',{timeTrial:true});await post(`/races/${failed.id}/abandon`,{version:0});
 await post('/meet/showcase',{garageId:garage.id});const data=(await get(`/meet/leaderboard?trackId=${track.id}&modelId=${car.id}`)).data;
 assert.equal(data.records.length,1);assert.equal(data.records[0].timeMs,Math.round(Math.min(first.data.race.playerTime,result.data.race.playerTime)*1000));assert.equal(data.records[0].position,1);
 assert.equal(data.records[0].configuration.currentFuel,(first.data.race.playerTime<=result.data.race.playerTime?one:second).trialSetup.configuration.currentFuel);
 for(const name of ['rng','moneyCents','password','authUserId','raceId'])assert.ok(!JSON.stringify(data).includes(`"${name}"`));
});
test('leaderboards do not mix track layouts, weather or car models',async()=>{
 await post('/meet/showcase',{garageId:garage.id});const race=await begin('track',{timeTrial:true});await post(`/races/${race.id}/turns`,{version:0,moveId:null});
 await post('/meet/showcase',{garageId:garage.id});const url=`/meet/leaderboard?trackId=${track.id}&modelId=${car.id}`;assert.equal((await get(url)).data.records.length,1);
 const{id:_id,...model}=car;const another=await prisma.car.create({data:{...model,name:'Another model'}});assert.equal((await get(`/meet/leaderboard?trackId=${track.id}&modelId=${another.id}`)).data.records.length,0);
 await prisma.trackMeteo.update({where:{id:track.meteoId},data:{name:'Rainy'}});assert.equal((await get(url)).data.records.length,0);
 await prisma.trackMeteo.update({where:{id:track.meteoId},data:{name:'Dry'}});const build=await prisma.trackBuild.findFirst({where:{trackId:track.id}});await prisma.trackBuild.create({data:{trackId:track.id,sectionId:build.sectionId,level:1,ord:2}});assert.equal((await get(url)).data.records.length,0);
 assert.equal((await get('/time-trials/1')).data.length,1);
});

test('workshop previews are authoritative, reject stale or missing quotes and do not charge for perfect parts',async()=>{
 assert.equal((await post(`/garage/${garage.id}/service`,{serviceType:'tires'})).status,400);
 await prisma.garage.update({where:{id:garage.id},data:{engineHealth:70}});
 const quote=(await get('/workshop/1')).data.cars[0].services.find(s=>s.id==='engine');
 assert.equal((await post(`/garage/${garage.id}/service`,{serviceType:'engine'})).status,409);
 const key=randomUUID();const result=await post(`/garage/${garage.id}/service`,{serviceType:'engine',quoteKey:quote.key,price:0},key);assert.equal(result.status,200);assert.equal(result.data.service.price,quote.price);assert.equal((await prisma.garage.findUnique({where:{id:garage.id}})).engineHealth,80);
 await post(`/garage/${garage.id}/service`,{serviceType:'engine',quoteKey:quote.key,price:0},key);assert.equal(await wallet(),10000000-quote.price*100);
 assert.equal((await post(`/garage/${garage.id}/service`,{serviceType:'engine',quoteKey:quote.key})).status,409);
});
test('recovery fixes a bankrupt broken car, locks sale and cannot be applied twice',async()=>{
 await prisma.user.update({where:{id:1},data:{moneyCents:0}});await prisma.garage.update({where:{id:garage.id},data:{engineHealth:0,tireGrip:20,currentFuel:0}});
 const plan=(await get('/workshop/1')).data.recovery;assert.equal(plan.available,true);assert.ok(plan.advanceCents>0);
 const key=randomUUID();const result=await post('/workshop/recover',{quoteKey:plan.key},key);assert.equal(result.status,200);assert.equal(await wallet(),0);assert.equal(result.data.recoveryReceipt.debtCents,plan.advanceCents);
 const repaired=await prisma.garage.findUnique({where:{id:garage.id}});assert.equal(repaired.engineHealth,60);assert.equal(repaired.tireGrip,60);assert.equal(repaired.currentFuel,8);
 await post('/workshop/recover',{quoteKey:plan.key},key);assert.equal((await get('/workshop/1')).data.recovery.debtCents,plan.advanceCents);
 assert.equal((await post('/workshop/recover',{quoteKey:plan.key})).status,400);
 assert.equal((await post('/market/sell',{garageId:garage.id})).status,400);
});
test('recovery uses an existing ready car instead of granting another advance',async()=>{
 assert.equal((await get('/workshop/1')).data.recovery.available,false);assert.equal((await post('/workshop/recover',{quoteKey:'fake'})).status,400);
 await prisma.garage.update({where:{id:garage.id},data:{engineHealth:0,currentFuel:0}});await prisma.garage.create({data:{userId:1,carId:car.id,cv:car.cv,nm:car.nm,kg:car.kg,...stats}});
 assert.equal((await get('/workshop/1')).data.recovery.available,false);
});
test('a carless bankrupt player can finance a starter, while the normal starting budget cannot request one',async()=>{
 await prisma.car.update({where:{id:car.id},data:{cv:55,kg:735,velMax:153,zeroToHundred:13.5,price:8500}});await prisma.garage.delete({where:{id:garage.id}});await prisma.user.update({where:{id:1},data:{carDrive:0,moneyCents:1000000}});
 assert.equal((await get('/workshop/1')).data.recovery.available,false);
 await prisma.user.update({where:{id:1},data:{moneyCents:0}});const plan=(await get('/workshop/1')).data.recovery;assert.equal(plan.kind,'car');
 const results=await Promise.all([post('/workshop/recover',{quoteKey:plan.key}),post('/workshop/recover',{quoteKey:plan.key})]);assert.deepEqual(results.map(r=>r.status).sort(),[200,400]);
 assert.equal(await prisma.garage.count({where:{userId:1}}),1);assert.equal(await wallet(),0);const user=await prisma.user.findUnique({where:{id:1}});assert.ok(user.carDrive>0);assert.ok((await get('/workshop/1')).data.recovery.lockedCarIds.includes(user.carDrive));
});
test('half of prize money repays the mechanic atomically and remaining debt unlocks after full payment',async()=>{
 await prisma.playerProgress.create({data:{userId:1,recoveryState:JSON.stringify({debtCents:100000,carIds:[garage.id]})}});
 const race=await begin();const key=randomUUID();const first=await post(`/races/${race.id}/turns`,{version:0,moveId:null},key);assert.equal(first.data.race.outcome,'win');assert.equal(first.data.race.reward.money,250);assert.equal(first.data.race.recoveryRepayment.paidCents,25000);assert.equal((await get('/workshop/1')).data.recovery.debtCents,75000);
 await post(`/races/${race.id}/turns`,{version:0,moveId:null},key);assert.equal((await get('/workshop/1')).data.recovery.debtCents,75000);
 assert.equal((await post('/workshop/repay',{amount:750})).status,200);assert.deepEqual((await get('/workshop/1')).data.recovery.lockedCarIds,[]);assert.equal((await post('/market/sell',{garageId:garage.id})).status,200);
});
test('stake refunds are excluded from debt repayment and only net winnings contribute',async()=>{
 await prisma.playerProgress.create({data:{userId:1,recoveryState:JSON.stringify({debtCents:100000,carIds:[garage.id]})}});
 const {withholdReward}=require('../server/workshop');const refund={money:100};await withholdReward(prisma,1,{wager:100},refund);assert.equal(refund.money,100);assert.equal((await get('/workshop/1')).data.recovery.debtCents,100000);
 const race=await begin('street');const result=await post(`/races/${race.id}/turns`,{version:0,moveId:null});assert.equal(result.data.race.outcome,'win');assert.equal(result.data.race.reward.money,150);assert.equal(result.data.race.recoveryRepayment.paidCents,5000);assert.equal(result.data.race.streetResult.netMoney,50);
});
test('recovery and repayment reject stale plans, forged amounts and changes during a race',async()=>{
 await prisma.garage.update({where:{id:garage.id},data:{engineHealth:0,currentFuel:0}});await prisma.user.update({where:{id:1},data:{moneyCents:0}});const plan=(await get('/workshop/1')).data.recovery;
 assert.equal((await post('/workshop/recover',{quoteKey:plan.key,advanceCents:1})).status,400);
 await prisma.user.update({where:{id:1},data:{moneyCents:100}});assert.equal((await post('/workshop/recover',{quoteKey:plan.key})).status,409);
 for(const amount of [-1,0,999999])assert.equal((await post('/workshop/repay',{amount})).status,400);
 await prisma.garage.update({where:{id:garage.id},data:{engineHealth:100,currentFuel:20}});const race=await begin();assert.equal((await post('/workshop/recover',{quoteKey:plan.key})).status,409);await post(`/races/${race.id}/abandon`,{version:0});
});

test('tuning hub verifies ownership, exposes no account data and matches the actual mounted replacement',async()=>{
 await post('/parts/purchase',{partId:part.id});await post(`/garage/${garage.id}/mount`,{partId:part.id});
 const upgrade=await prisma.part.create({data:{...Object.fromEntries(Object.entries(part).filter(([key])=>key!=='id')),level:2,price:300,cvBonus:15.5,nmBonus:13.5,kgBonus:14.5,turnSlowBonus:10.25}});
 const view=await get(`/tuning/1?garageId=${garage.id}`);assert.equal(view.status,200);assert.ok(!JSON.stringify(view.data).includes('private@example.org'));assert.ok(!JSON.stringify(view.data).includes('secret'));assert.equal((await get(`/tuning/1?garageId=${otherGarage.id}`)).status,403);
 const offered=view.data.parts.find(p=>p.id===upgrade.id);assert.equal(offered.preview.before.cv,110);assert.equal(offered.preview.after.cv,116);assert.equal(offered.preview.installed.id,part.id);assert.equal(offered.preview.after.kg,985);
 const key=randomUUID();const buy=await post('/parts/purchase',{partId:upgrade.id,garageId:garage.id,quoteKey:offered.preview.quoteKey},key);assert.equal(buy.status,200);const cash=await wallet();await post('/parts/purchase',{partId:upgrade.id,garageId:garage.id,quoteKey:offered.preview.quoteKey},key);assert.equal(await wallet(),cash);
 const mounted=await post(`/garage/${garage.id}/mount`,{partId:upgrade.id,quoteKey:offered.preview.quoteKey});assert.equal(mounted.status,200,JSON.stringify(mounted.data));const actual=await prisma.garage.findUnique({where:{id:garage.id},include:{car:true,mods:{include:{part:true}}}});const {tuningMetrics}=await import('../shared/tuning.mjs');assert.deepEqual(tuningMetrics(actual),offered.preview.after);assert.equal(await stock(),1);
 const after=(await get('/tuning/1')).data.parts.find(p=>p.id===upgrade.id);assert.equal(after.preview.alreadyMounted,true);assert.equal(after.ownedQuantity,0);
});
test('tuning quotes reject stale conditions, price changes and foreign cars without charging or consuming inventory',async()=>{
 let offered=(await get('/tuning/1')).data.parts.find(p=>p.id===part.id),cash=await wallet();await prisma.part.update({where:{id:part.id},data:{price:101}});
 assert.equal((await post('/parts/purchase',{partId:part.id,garageId:garage.id,quoteKey:offered.preview.quoteKey})).status,409);assert.equal(await wallet(),cash);assert.equal(await stock(),0);
 offered=(await get('/tuning/1')).data.parts.find(p=>p.id===part.id);assert.equal((await post('/parts/purchase',{partId:part.id,garageId:otherGarage.id,quoteKey:offered.preview.quoteKey})).status,403);
 await post('/parts/purchase',{partId:part.id,garageId:garage.id,quoteKey:offered.preview.quoteKey});await prisma.garage.update({where:{id:garage.id},data:{engineHealth:90}});
 assert.equal((await post(`/garage/${garage.id}/mount`,{partId:part.id,quoteKey:offered.preview.quoteKey})).status,409);assert.equal(await stock(),1);
});
test('tuning access warnings use championship limits and all street requirements, and never bypass race gates',async()=>{
 const {CHAMPIONSHIP_CATALOG}=await import('../shared/championshipCatalog.mjs');const cup=CHAMPIONSHIP_CATALOG[0];await prisma.championship.update({where:{id:championship.id},data:{name:cup.name,minCv:40,maxCv:85,minLevel:1,minPerfIndex:0}});await prisma.garage.update({where:{id:garage.id},data:{cv:80}});
 const offered=(await get('/tuning/1')).data.parts.find(p=>p.id===part.id);const gate=offered.preview.championships[0];assert.deepEqual(gate.beforeErrors,[]);assert.match(gate.afterErrors.join(' '),/85 CV/);assert.ok(offered.preview.zones.find(z=>z.id==='industrial').afterErrors.some(reason=>reason.includes('reputazione')));
 await post('/parts/purchase',{partId:part.id});await post(`/garage/${garage.id}/mount`,{partId:part.id,quoteKey:offered.preview.quoteKey});assert.equal((await post(`/championships/${championship.id}/enter`,{})).status,400);
});
test('a carless player can browse and buy inventory without a misleading car preview',async()=>{
 await prisma.user.update({where:{id:1},data:{carDrive:0}});await prisma.garage.delete({where:{id:garage.id}});const view=(await get('/tuning/1')).data;assert.equal(view.garageId,null);assert.equal(view.parts[0].preview,null);assert.equal((await post('/parts/purchase',{partId:part.id})).status,200);
});

async function socialSetup(){
 for(const[userId,id]of [[1,garage.id],[2,otherGarage.id]])await prisma.playerProgress.upsert({where:{userId},create:{userId,showcaseGarageId:id},update:{showcaseGarageId:id}});
 const mine=(await get('/meet/social/1')).data,other=(await get('/meet/social/2')).data;return {mine,other};
}
async function socialInvite(format='model'){
 const{mine,other}=await socialSetup();const sent=await post('/meet/challenge',{peerId:2,garageId:garage.id,quoteKey:mine.cars[0].quoteKey,trackId:track.id,format});assert.equal(sent.status,200,JSON.stringify(sent.data));return {challenge:sent.data.challenge,mine,other};
}
async function socialAccept(){const setup=await socialInvite();const accepted=await post('/meet/challenge/respond',{userId:2,challengeId:setup.challenge.id,action:'accept',garageId:otherGarage.id,quoteKey:setup.other.cars[0].quoteKey});assert.equal(accepted.status,200,JSON.stringify(accepted.data));return accepted.data.challenge;}
async function finishSocial(userId,race){while(race.status==='active'){const response=await post(`/races/${race.id}/turns`,{userId,version:race.version,moveId:null,decision:{pace:'balanced',braking:'optimal',line:'exit',manoeuvre:'hold'}});assert.equal(response.status,200,JSON.stringify(response.data));race=response.data.race;}return race;}
test('meet messages are private, idempotent and read only through the last displayed incoming message',async()=>{
 await socialSetup();const key=randomUUID();const body={peerId:2,text:'Ciao <script>test</script>!'};assert.equal((await post('/meet/message',body,key)).status,200);assert.equal((await post('/meet/message',body,key)).status,200);assert.equal(await prisma.meetMessage.count(),1);
 let hub=(await get('/meet/social/2')).data;assert.equal(hub.unread,1);assert.equal(hub.conversations[0].peer.name,'Test');const thread=(await get('/meet/conversation/1?userId=2')).data;assert.equal(thread.messages[0].text,body.text);assert.ok(!JSON.stringify(hub).includes('secret'));assert.ok(!JSON.stringify(hub).includes('private@example'));
 await post('/meet/message',{peerId:2,text:'Secondo'});assert.equal((await post('/meet/read',{userId:2,peerId:1,throughId:thread.messages[0].id})).status,200);assert.equal((await get('/meet/social/2')).data.unread,1);
 await prisma.user.create({data:{id:3,username:'Third',password:'secret',mail:'',carDrive:0,...pilot}});assert.equal((await get('/meet/conversation/1?userId=3')).data.messages.length,0);assert.equal((await post('/meet/read',{userId:3,peerId:1,throughId:thread.messages[0].id})).status,404);
});
test('meet first contacts require a visible pilot and message text and rate limits are enforced',async()=>{
 assert.equal((await post('/meet/message',{peerId:2,text:'Ciao'})).status,403);await socialSetup();assert.equal((await post('/meet/message',{peerId:1,text:'Ciao'})).status,400);
 for(const text of ['', 'x'.repeat(801),'bad\u0000text'])assert.equal((await post('/meet/message',{peerId:2,text})).status,400);
 for(let i=0;i<10;i++)assert.equal((await post('/meet/message',{peerId:2,text:'messaggio '+i})).status,200);assert.equal((await post('/meet/message',{peerId:2,text:'troppi'})).status,429);assert.equal(await prisma.meetMessage.count(),10);
});
test('meet blocking is reciprocal, survives withdrawing a showcase and allows history and own unblock only',async()=>{
 await socialSetup();await post('/meet/message',{peerId:2,text:'Ciao'});assert.equal((await post('/meet/block',{userId:2,peerId:1,blocked:true})).status,200);
 assert.equal((await post('/meet/message',{peerId:2,text:'No'})).status,403);assert.equal((await post('/meet/message',{userId:2,peerId:1,text:'No'})).status,403);assert.equal((await get('/meet/conversation/1?userId=2')).data.messages.length,1);
 await post('/meet/block',{peerId:2,blocked:false});assert.equal((await post('/meet/message',{peerId:2,text:'No'})).status,403);await post('/meet/showcase',{garageId:null});await post('/meet/block',{userId:2,peerId:1,blocked:false});assert.equal((await post('/meet/message',{peerId:2,text:'Ancora'})).status,200);
});
test('reports reference received messages only and only administrators can view and review them',async()=>{
 await socialSetup();const sent=await post('/meet/message',{peerId:2,text:'Da segnalare'});assert.equal((await post('/meet/report',{peerId:2,messageId:sent.data.message.id,reason:'Test'})).status,403);
 assert.equal((await post('/meet/report',{userId:2,peerId:1,messageId:sent.data.message.id,reason:'Comportamento scorretto'})).status,200);assert.equal((await get('/meet/reports/2')).status,403);await prisma.user.update({where:{id:1},data:{isAdmin:true}});const list=(await get('/meet/reports/1')).data;assert.equal(list[0].message,'Da segnalare');assert.ok(!JSON.stringify(list).includes('secret'));assert.equal((await post('/meet/report/resolve',{reportId:list[0].id})).status,200);assert.equal((await get('/meet/reports/1')).data[0].status,'reviewed');
});
test('challenge contracts require owned quoted cars, consent and compatible models or IP bands',async()=>{
 const{challenge,other}=await socialInvite();assert.equal(challenge.status,'pending');assert.equal((await post('/meet/challenge/start',{challengeId:challenge.id})).status,409);assert.equal((await post('/meet/challenge/respond',{challengeId:challenge.id,action:'accept',garageId:garage.id,quoteKey:other.cars[0].quoteKey})).status,403);
 assert.equal((await post('/meet/challenge/respond',{userId:2,challengeId:challenge.id,action:'accept',garageId:garage.id,quoteKey:other.cars[0].quoteKey})).status,403);
 await prisma.garage.update({where:{id:garage.id},data:{cv:110}});assert.equal((await post('/meet/challenge/respond',{userId:2,challengeId:challenge.id,action:'accept',garageId:otherGarage.id,quoteKey:other.cars[0].quoteKey})).status,409);assert.equal((await post('/meet/challenge/respond',{userId:2,challengeId:challenge.id,action:'decline'})).status,200);
 const setup=await socialInvite('ip');await prisma.garage.update({where:{id:otherGarage.id},data:{cv:800}});const refreshed=(await get('/meet/social/2')).data;assert.equal((await post('/meet/challenge/respond',{userId:2,challengeId:setup.challenge.id,action:'accept',garageId:otherGarage.id,quoteKey:refreshed.cars[0].quoteKey})).status,400);
});
test('meet attempts freeze cars and pilots, complete asynchronously with a ghost and never alter career or personal records',async()=>{
 await prisma.garage.update({where:{id:garage.id},data:{engineHealth:0,tireGrip:20,currentFuel:0}});const challenge=await socialAccept();const initial={users:await prisma.user.findMany(),garages:await prisma.garage.findMany(),development:await prisma.driverDevelopment.findMany(),progress:await prisma.playerProgress.findMany()};
 const key=randomUUID();const first=await post('/meet/challenge/start',{challengeId:challenge.id},key);assert.equal(first.status,200,JSON.stringify(first.data));assert.equal(first.data.race.car.engineHealth,100);assert.equal(first.data.race.car.currentFuel,20);assert.equal(first.data.race.meetGhost,null);assert.equal('rng'in first.data.race,false);assert.equal((await post('/meet/challenge/start',{challengeId:challenge.id},key)).data.race.id,first.data.race.id);assert.equal((await post('/meet/challenge/start',{challengeId:challenge.id})).status,409);
 const done=await finishSocial(1,first.data.race);assert.deepEqual(done.reward,{money:0,xp:0});const second=await post('/meet/challenge/start',{userId:2,challengeId:challenge.id});assert.equal(second.status,200,JSON.stringify(second.data));assert.ok(second.data.race.meetGhost.splits.length);const otherDone=await finishSocial(2,second.data.race);assert.equal(done.playerTime,otherDone.playerTime);
 const hub=(await get('/meet/social/1')).data;assert.equal(hub.challenges[0].status,'completed');assert.equal(hub.challenges[0].draw,true);assert.equal(hub.record.total,1);assert.equal((await get('/time-trials/1')).data.length,0);assert.deepEqual(await prisma.user.findMany(),initial.users);assert.deepEqual(await prisma.garage.findMany(),initial.garages);assert.deepEqual(await prisma.driverDevelopment.findMany(),initial.development);assert.deepEqual(await prisma.playerProgress.findMany(),initial.progress.map(row=>({...row,showcaseGarageId:null})));
});
test('accepted meet preparations remain usable after later tuning or selling and results cannot be forged',async()=>{
 const challenge=await socialAccept();await prisma.garage.update({where:{id:garage.id},data:{cv:900}});await prisma.user.update({where:{id:1},data:{brave:999}});await post('/market/sell',{garageId:garage.id});
 const started=await post('/meet/challenge/start',{challengeId:challenge.id});assert.equal(started.status,200);assert.equal(started.data.race.car.cv,100);assert.equal(started.data.race.pilot.brave,30);assert.equal((await post('/meet/challenge/start',{userId:2,challengeId:challenge.id,timeMs:1})).status,400);assert.equal((await finishSocial(1,started.data.race)).meetResult.status,'finished');
});
test('meet deadlines and retirements settle once, and expired running attempts can be closed',async()=>{
 const challenge=await socialAccept();const first=await post('/meet/challenge/start',{challengeId:challenge.id});const key=randomUUID();const abandoned=await post(`/races/${first.data.race.id}/abandon`,{version:0},key);assert.equal(abandoned.data.race.meetResult.status,'retired');await post(`/races/${first.data.race.id}/abandon`,{version:0},key);assert.equal((await get('/meet/social/1')).data.record.total,0);
 const second=await post('/meet/challenge/start',{userId:2,challengeId:challenge.id});await prisma.meetChallenge.update({where:{id:challenge.id},data:{expiresAt:new Date(Date.now()-1000)}});const raw=await prisma.raceSession.findUnique({where:{id:second.data.race.id}}),state=JSON.parse(raw.state);state.meetChallenge.expiresAt=new Date(Date.now()-1000).toISOString();await prisma.raceSession.update({where:{id:raw.id},data:{state:JSON.stringify(state)}});
 const closed=await post(`/races/${raw.id}/turns`,{userId:2,version:0,moveId:null});assert.equal(closed.status,200);assert.equal(closed.data.activeRace,null);assert.equal(closed.data.race.failure,'expired');assert.equal((await get('/meet/social/1')).data.challenges[0].status,'completed');
});
test('blocking cancels pending and running meet challenges atomically without touching career races',async()=>{
 const challenge=await socialAccept();const started=await post('/meet/challenge/start',{challengeId:challenge.id});const block=await post('/meet/block',{userId:2,peerId:1,blocked:true});assert.equal(block.status,200);assert.equal((await prisma.raceSession.findUnique({where:{id:started.data.race.id}})).status,'abandoned');assert.equal((await get('/meet/social/1')).data.challenges[0].status,'cancelled');assert.equal((await post('/meet/challenge/start',{userId:2,challengeId:challenge.id})).status,409);
});
test('challenge starts are single-use under concurrency and inaccessible to third parties',async()=>{
 const challenge=await socialAccept();await prisma.user.create({data:{id:3,username:'Third',password:'',mail:'',carDrive:0,...pilot}});assert.equal((await post('/meet/challenge/start',{userId:3,challengeId:challenge.id})).status,404);
 const started=await Promise.all([post('/meet/challenge/start',{challengeId:challenge.id}),post('/meet/challenge/start',{challengeId:challenge.id})]);assert.deepEqual(started.map(r=>r.status).sort(),[200,409]);assert.equal(await prisma.raceSession.count({where:{userId:1}}),1);
});

test('meet conversation pagination keeps older messages private and accessible after showcase withdrawal',async()=>{
 await socialSetup();for(let i=0;i<35;i++)await prisma.meetMessage.create({data:{senderId:1,recipientId:2,text:'Test '+i,createdAt:new Date(1700000000000+i*1000)}});await post('/meet/showcase',{garageId:null});
 const first=(await get('/meet/conversation/1?userId=2')).data;assert.equal(first.messages.length,30);assert.equal(first.hasMore,true);const second=(await get(`/meet/conversation/1?userId=2&before=${first.nextBefore}`)).data;assert.equal(second.messages.length,5);assert.equal(second.hasMore,false);assert.equal(new Set([...first.messages,...second.messages].map(m=>m.id)).size,35);assert.equal((await get('/meet/social/2')).data.conversations[0].unread,35);
});
test('expired meet invitations cannot be accepted and completed deadline results survive a later block',async()=>{
 const pending=await socialInvite();await prisma.meetChallenge.update({where:{id:pending.challenge.id},data:{expiresAt:new Date(Date.now()-1000)}});assert.equal((await post('/meet/challenge/respond',{userId:2,challengeId:pending.challenge.id,action:'accept',garageId:otherGarage.id,quoteKey:pending.other.cars[0].quoteKey})).status,409);
 const challenge=await socialAccept();const first=await post('/meet/challenge/start',{challengeId:challenge.id});await finishSocial(1,first.data.race);await prisma.meetChallenge.update({where:{id:challenge.id},data:{expiresAt:new Date(Date.now()-1000)}});let result=(await get('/meet/social/1')).data.challenges.find(c=>c.id===challenge.id);assert.equal(result.winnerId,1);assert.equal(result.status,'completed');await post('/meet/block',{peerId:2,blocked:true});result=(await get('/meet/social/1')).data.challenges.find(c=>c.id===challenge.id);assert.equal(result.winnerId,1);assert.equal(result.status,'completed');
});

test('period alignment is previewable and idempotent and preserves tracks, builds, records and player progress',async()=>{
 await prisma.track.update({where:{id:track.id},data:{name:'Tsukuba · Ibaraki'}});const race=await begin('track',{timeTrial:true});const finished=await post(`/races/${race.id}/turns`,{version:0,moveId:null});assert.equal(finished.status,200);const rows={track:await prisma.track.findUnique({where:{id:track.id}}),builds:await prisma.trackBuild.findMany(),race:await prisma.raceSession.findUnique({where:{id:race.id}}),user:await prisma.user.findUnique({where:{id:1}}),garages:await prisma.garage.findMany()};const {alignPeriodWorld}=require('../server/periodWorld');
 const planned=await prisma.$transaction(tx=>alignPeriodWorld(tx));assert.equal(planned.tracks[0].id,track.id);assert.equal((await prisma.track.findUnique({where:{id:track.id}})).name,'Tsukuba · Ibaraki');const changed=await prisma.$transaction(tx=>alignPeriodWorld(tx,{apply:true}));assert.equal(changed.tracks.length,1);const again=await prisma.$transaction(tx=>alignPeriodWorld(tx,{apply:true}));assert.deepEqual(again,{tracks:[],championships:[]});assert.deepEqual(await prisma.track.findUnique({where:{id:track.id}}),{...rows.track,name:'Pistino di San Rocco · Pavese'});assert.deepEqual(await prisma.trackBuild.findMany(),rows.builds);assert.deepEqual(await prisma.raceSession.findUnique({where:{id:race.id}}),rows.race);assert.deepEqual(await prisma.user.findUnique({where:{id:1}}),rows.user);assert.deepEqual(await prisma.garage.findMany(),rows.garages);const records=(await get('/time-trials/1')).data;assert.equal(records[0].trackName,'Pistino di San Rocco · Pavese');assert.equal(records[0].timeMs,Math.round(finished.data.race.playerTime*1000));
});
test('period alignment refuses ambiguous duplicate labels and rolls back earlier changes',async()=>{
 await prisma.track.update({where:{id:track.id},data:{name:'Tsukuba · Ibaraki'}});const{ id:_id,...data}=track;await prisma.track.create({data:{...data,name:'Pistino di San Rocco · Pavese'}});await prisma.track.create({data:{...data,name:'Mugello · Toscana'}});const before=await prisma.track.findMany();const{alignPeriodWorld}=require('../server/periodWorld');await assert.rejects(prisma.$transaction(tx=>alignPeriodWorld(tx,{apply:true})),/duplicati/);assert.deepEqual(await prisma.track.findMany(),before);
});

test('explicit race-history reset preserves career and financial deduplication, invalidating old race receipts',async()=>{
 const purchaseKey=randomUUID(),purchase=await post('/purchase',{carId:car.id},purchaseKey);assert.equal(purchase.status,200);
 const startedKey=randomUUID(),started=await post('/races',{mode:'track',trackId:track.id},startedKey);assert.equal(started.status,200);
 const beforeUser=await prisma.user.findMany(),beforeGarage=await prisma.garage.findMany();
 await prisma.playerProgress.create({data:{userId:1,streetState:JSON.stringify({parking:{reputation:70,wins:3,rivals:{npc:{wins:3}},offer:{id:'old'}}}),recoveryState:'{"debtCents":500}'}});
 await prisma.driverDevelopment.create({data:{userId:1,lessonPassed:true,techniqueProgress:'{"exit-line":{"passed":true}}'}});const skills=await prisma.driverDevelopment.findMany();
 const{resetRaceHistory}=require('../server/resetRaceHistory');const dry=await prisma.$transaction(tx=>resetRaceHistory(tx));assert.ok(dry.races>0);assert.equal(await prisma.raceSession.count(),dry.races);
 const applied=await prisma.$transaction(tx=>resetRaceHistory(tx,{apply:true}));assert.deepEqual(applied,dry);assert.equal(await prisma.raceSession.count(),0);assert.deepEqual(await prisma.user.findMany(),beforeUser);assert.deepEqual(await prisma.garage.findMany(),beforeGarage);assert.deepEqual(await prisma.driverDevelopment.findMany(),skills);
 const progress=await prisma.playerProgress.findUnique({where:{userId:1}});assert.deepEqual(JSON.parse(progress.streetState),{parking:{reputation:70}});assert.equal(progress.recoveryState,'{"debtCents":500}');
 assert.equal((await post('/races',{mode:'track',trackId:track.id},startedKey)).status,410);
 assert.equal((await post('/purchase',{carId:car.id},purchaseKey)).status,200);assert.deepEqual(await prisma.user.findMany(),beforeUser);assert.deepEqual(await prisma.garage.findMany(),beforeGarage);
 assert.deepEqual(await prisma.$transaction(tx=>resetRaceHistory(tx,{apply:true})),{races:0,championshipEntries:0,meetChallenges:0,operationReceipts:0,streetHistories:0});
});

test('changing avatar is cosmetic, owner-only, idempotent and allowed during a race',async()=>{
 const race=await begin('track'),before=await prisma.user.findUnique({where:{id:1}}),cars=await prisma.garage.findMany(),savedRace=await prisma.raceSession.findUnique({where:{id:race.id}}),key=randomUUID();
 assert.equal((await post('/player/2/avatar',{avatar:'mechanic-woman'})).status,403);
 for(const body of [{avatar:'fake'},{avatar:'blue'},{avatar:'rally-man',isAdmin:true},{avatar:'rally-man',stats:{brave:99}}])assert.equal((await post('/player/1/avatar',body)).status,400);
 const updated=await post('/player/1/avatar',{avatar:'mechanic-woman'},key);assert.equal(updated.status,200);assert.equal(updated.data.player.avatar,'mechanic-woman');
 assert.deepEqual({...await prisma.user.findUnique({where:{id:1}}),avatar:before.avatar},before);assert.deepEqual(await prisma.garage.findMany(),cars);assert.deepEqual(await prisma.raceSession.findUnique({where:{id:race.id}}),savedRace);
 await post('/player/1/avatar',{avatar:'veteran-man'});const retried=await post('/player/1/avatar',{avatar:'mechanic-woman'},key);assert.equal(retried.data.player.avatar,'veteran-man');assert.equal((await prisma.user.findUnique({where:{id:1}})).avatar,'veteran-man');
});
test('avatar does not invalidate a meet preparation or change frozen race contracts',async()=>{
 const {mine}=await socialSetup(),key=mine.cars[0].quoteKey;await post('/player/1/avatar',{avatar:'tuner-woman'});const after=(await get('/meet/social/1')).data;assert.equal(after.cars[0].quoteKey,key);
 const invited=await post('/meet/challenge',{peerId:2,garageId:garage.id,quoteKey:key,trackId:track.id,format:'model'});assert.equal(invited.status,200);const contract=(await prisma.meetChallenge.findUnique({where:{id:invited.data.challenge.id}})).contract;
 await post('/player/1/avatar',{avatar:'rally-man'});assert.equal((await prisma.meetChallenge.findUnique({where:{id:invited.data.challenge.id}})).contract,contract);assert.equal((await get('/meet?userId=2')).data.showcases.find(s=>s.pilot.id===1).pilot.avatar,'rally-man');
});

test('phone notifications are recipient-only, bounded and never mark SMS as read',async()=>{
 await socialSetup();const sent=await post('/meet/message',{peerId:2,text:'Ci vediamo al piazzale.'});assert.equal(sent.status,200);
 const before=await prisma.meetMessage.findMany();assert.deepEqual((await get('/phone/1/notifications')).data,{unread:0,latest:[],friendRequests:[]});const alert=(await get('/phone/2/notifications')).data;assert.equal(alert.unread,1);assert.equal(alert.latest[0].sender.id,1);assert.equal(alert.latest[0].sender.name,'Test');assert.deepEqual(Object.keys(alert.latest[0]).sort(),['createdAt','id','sender']);assert.ok(!JSON.stringify(alert).includes('piazzale'));assert.ok(!JSON.stringify(alert).includes('private@example'));
 const inbox=(await get('/phone/2')).data;assert.equal(inbox.conversations[0].lastMessage.id,sent.data.message.id);assert.deepEqual(await prisma.meetMessage.findMany(),before);
 await prisma.meetMessage.createMany({data:Array.from({length:7},()=>({senderId:1,recipientId:2,text:'Altro SMS'}))});assert.equal((await get('/phone/2/notifications')).data.latest.length,5);
});
test('phone address book preserves opt-in privacy, known conversations and mutual blocking',async()=>{
 await prisma.user.create({data:{id:3,username:'Private stranger',password:'hidden',mail:'hidden@example.invalid',carDrive:0,...pilot}});
 assert.deepEqual((await get('/phone/1')).data.contacts,[]);await socialSetup();assert.deepEqual((await get('/phone/2')).data.contacts.map(p=>p.id),[1]);await post('/meet/message',{peerId:2,text:'Ciao'});
 await post('/meet/showcase',{garageId:null});const phone=(await get('/phone/2')).data;assert.ok(phone.contacts.some(p=>p.id===1));assert.ok(!phone.contacts.some(p=>p.id===3));assert.ok(!JSON.stringify(phone).includes('hidden@example'));
 await post('/meet/block',{userId:2,peerId:1,blocked:true});assert.equal((await get('/phone/1')).data.contacts.find(p=>p.id===2).blocked,true);assert.equal((await get('/phone/2')).data.contacts.find(p=>p.id===1).blockedByMe,true);assert.equal((await post('/meet/message',{peerId:2,text:'Bloccato'})).status,403);assert.equal((await get('/meet/conversation/1?userId=2')).data.messages[0].text,'Ciao');
});
test('opening a displayed SMS only acknowledges incoming messages through its own server cursor',async()=>{
 await socialSetup();const first=(await post('/meet/message',{peerId:2,text:'Prima'})).data.message;await prisma.meetMessage.update({where:{id:first.id},data:{createdAt:new Date(Date.now()-10000)}});const second=(await post('/meet/message',{peerId:2,text:'Dopo'})).data.message;
 await get('/phone/2');assert.equal((await get('/phone/2/notifications')).data.unread,2);assert.equal((await post('/meet/read',{userId:2,peerId:1,throughId:first.id})).status,200);const notifications=(await get('/phone/2/notifications')).data;assert.equal(notifications.unread,1);assert.equal(notifications.latest[0].id,second.id);assert.equal((await prisma.meetMessage.findUnique({where:{id:second.id}})).readAt,null);
});

test('parked car persists across unrelated reads, failed starts, and use of another owned car',async()=>{
 await post('/meet/showcase',{garageId:garage.id});const before=await prisma.playerProgress.findUnique({where:{userId:1}});
 for(const path of ['/state/1','/garage/1','/phone/1','/meet?userId=2'])assert.equal((await get(path)).status,200);
 assert.deepEqual(await prisma.playerProgress.findUnique({where:{userId:1}}),before);
 assert.equal((await post('/races',{mode:'track',trackId:999999})).status,404);assert.equal((await get('/meet?userId=2')).data.myGarageId,null);assert.equal((await get('/meet?userId=1')).data.myGarageId,garage.id);
 const{id:_id,...copy}=garage;const second=await prisma.garage.create({data:copy});
 assert.equal((await request('/player/1/equip',{userId:1,carDrive:second.id},'PUT')).status,200);
 const race=await begin();assert.equal(race.car.id,second.id);assert.equal((await get('/meet?userId=1')).data.myGarageId,garage.id);
});
test('successful driving withdraws the matching parked car atomically, retry cannot repark, finish does not return it',async()=>{
 const displayKey=randomUUID();await post('/meet/showcase',{garageId:garage.id},displayKey);const key=randomUUID();const started=await post('/races',{mode:'track',trackId:track.id},key);assert.equal(started.status,200);
 assert.equal((await get('/meet?userId=1')).data.myGarageId,null);assert.equal((await post('/meet/showcase',{garageId:garage.id})).status,409);
 assert.equal((await post('/meet/showcase',{garageId:garage.id},displayKey)).data.meet.myGarageId,null);
 assert.equal((await post('/races',{mode:'track',trackId:track.id},key)).data.race.id,started.data.race.id);
 await post(`/races/${started.data.race.id}/abandon`,{version:0});assert.equal((await get('/meet?userId=1')).data.myGarageId,null);assert.equal((await post('/meet/showcase',{garageId:garage.id})).data.meet.myGarageId,garage.id);
});
test('school loan car does not withdraw a parked personal car',async()=>{
 await post('/meet/showcase',{garageId:garage.id});await post('/driver/techniques/read',{techniqueId:'progressive-release'});
 const start=await post('/races',{mode:'track',lesson:'braking-basics'});assert.equal(start.status,200,JSON.stringify(start.data));assert.equal((await get('/meet?userId=1')).data.myGarageId,garage.id);
});
const friendship=async(userId,peerId,action,key)=>{const row=await prisma.meetFriendship.findFirst({where:{lowId:Math.min(userId,peerId),highId:Math.max(userId,peerId)}});const requestKey=row&&action!=='request'?`${row.lowId}-${row.highId}-${+new Date(row.createdAt)}`:undefined;return post('/meet/friendship',{userId,peerId,action,...(requestKey?{requestKey}:{})},key);};
async function acceptFriendship(){await socialSetup();assert.equal((await friendship(1,2,'request')).status,200);assert.equal((await friendship(2,1,'accept')).status,200);}
test('friend requests require known pilots, strict fields and explicit recipient consent',async()=>{
 assert.equal((await friendship(1,2,'request')).status,403);await socialSetup();
 for(const body of [{peerId:1,action:'request'},{peerId:2,action:'accept',accepted:true},{peerId:2,action:'fake'},{peerId:2,action:'request',requestedBy:2}])assert.equal((await post('/meet/friendship',body)).status,400);
 const key=randomUUID();assert.equal((await friendship(1,2,'request',key)).status,200);assert.equal((await friendship(1,2,'request',key)).status,200);assert.equal(await prisma.meetFriendship.count(),1);
 assert.equal((await friendship(1,2,'accept')).status,403);assert.equal((await friendship(1,2,'decline')).status,403);assert.equal((await friendship(2,1,'cancel')).status,403);
 assert.equal((await friendship(2,1,'request')).data.friendshipStatus,'pending');assert.equal((await prisma.meetFriendship.findFirst()).status,'pending');
 assert.equal((await friendship(2,1,'accept')).status,200);for(const id of[1,2]){const book=(await get(`/phone/${id}`)).data;assert.equal(book.friendships[0].status,'accepted');assert.match(book.friendships[0].number,/^PT-\d{5}$/);}
});
test('friend request notifications are private, do not become SMS or expose account data, and disappear after response',async()=>{
 await socialSetup();await friendship(1,2,'request');await prisma.user.create({data:{id:3,username:'Third',password:'secret',mail:'hidden@example.invalid',carDrive:0,...pilot}});
 const incoming=(await get('/phone/2/notifications')).data;assert.equal(incoming.friendRequests.length,1);assert.equal(incoming.friendRequests[0].peer.id,1);assert.equal(incoming.unread,0);assert.equal(await prisma.meetMessage.count(),0);
 for(const id of[1,3])assert.deepEqual((await get(`/phone/${id}/notifications`)).data.friendRequests,[]);
 for(const field of['secret','hidden@example','private@example','moneyCents','authUserId'])assert.ok(!JSON.stringify(incoming).includes(field));
 assert.equal((await friendship(3,1,'accept')).status,404);assert.equal((await friendship(2,1,'decline')).status,200);assert.deepEqual((await get('/phone/2/notifications')).data.friendRequests,[]);
 assert.equal((await friendship(1,2,'request')).status,429);
});
test('accepted numbers remain after both leave the piazzale and allow the first SMS without prior messages',async()=>{
 await acceptFriendship();await post('/meet/showcase',{garageId:null});await post('/meet/showcase',{userId:2,garageId:null});
 assert.equal((await get('/meet?userId=1')).data.showcases.length,0);assert.equal((await get('/phone/1')).data.contacts[0].friendship.status,'accepted');
 assert.equal((await get('/meet/social/1')).data.conversations.find(c=>c.peer.id===2).peer.name,'Other');assert.equal((await get('/meet/conversation/2?userId=1')).status,200);assert.equal((await post('/meet/message',{peerId:2,text:'Numero salvato!'})).status,200);
});
test('removal is mutual, preserves SMS and does not restore friendship on old operation retries',async()=>{
 await socialSetup();const requestKey=randomUUID(),acceptKey=randomUUID();await friendship(1,2,'request',requestKey);await friendship(2,1,'accept',acceptKey);await post('/meet/message',{peerId:2,text:'Storico da conservare'});
 assert.equal((await friendship(1,2,'remove')).status,200);for(const id of[1,2])assert.deepEqual((await get(`/phone/${id}`)).data.friendships,[]);
 assert.equal((await friendship(2,1,'accept',acceptKey)).data.friendshipStatus,'removed');assert.equal((await friendship(1,2,'request',requestKey)).data.friendshipStatus,'removed');assert.equal((await prisma.meetFriendship.findFirst()).status,'removed');assert.equal(await prisma.meetMessage.count(),1);assert.equal((await get('/meet/conversation/1?userId=2')).data.messages[0].text,'Storico da conservare');
 assert.equal((await friendship(2,1,'request')).status,429);
});
test('pending requests can be withdrawn; refusal and cancellation have a per-pair cooldown',async()=>{
 await socialSetup();await friendship(1,2,'request');assert.equal((await friendship(1,2,'cancel')).status,200);assert.equal((await friendship(2,1,'accept')).status,409);assert.equal((await friendship(2,1,'request')).status,429);
 await prisma.meetFriendship.updateMany({data:{updatedAt:new Date(Date.now()-86400001)}});assert.equal((await friendship(2,1,'request')).status,200);assert.equal((await friendship(1,2,'accept')).status,200);
});
test('blocking removes accepted or pending friendships, denies requests both ways and unblocking does not restore them',async()=>{
 await acceptFriendship();await post('/meet/message',{peerId:2,text:'Prima del blocco'});await post('/meet/block',{userId:2,peerId:1,blocked:true});assert.equal((await prisma.meetFriendship.findFirst()).status,'removed');
 for(const id of[1,2])assert.deepEqual((await get(`/phone/${id}`)).data.friendships,[]);for(const ids of[[1,2],[2,1]])assert.equal((await friendship(...ids,'request')).status,403);
 await post('/meet/block',{userId:2,peerId:1,blocked:false});assert.equal((await prisma.meetFriendship.findFirst()).status,'removed');assert.equal(await prisma.meetMessage.count(),1);
});
test('concurrent crossing requests create one pending pair and never auto-accept',async()=>{
 await socialSetup();const results=await Promise.all([friendship(1,2,'request'),friendship(2,1,'request')]);assert.ok(results.every(r=>r.status===200));assert.equal(await prisma.meetFriendship.count(),1);assert.equal((await prisma.meetFriendship.findFirst()).status,'pending');
});
test('friendship hourly rate and pending cap are checked server-side without changing career',async()=>{
 await socialSetup();const usersBefore=await prisma.user.findMany();for(let i=3;i<13;i++){await prisma.user.create({data:{id:i,username:'Limit '+i,password:'',mail:'',carDrive:0,...pilot}});await prisma.meetFriendship.create({data:{lowId:1,highId:i,requestedBy:1}});}
 assert.equal((await friendship(1,2,'request')).status,429);assert.equal(await prisma.meetFriendship.count(),10);assert.deepEqual((await prisma.user.findMany({where:{id:{in:[1,2]}}})),usersBefore);
});

test('a stale consent cursor cannot accept a later invitation cycle',async()=>{
 await socialSetup();await friendship(1,2,'request');const old=(await get('/phone/2')).data.friendships[0].key;await friendship(1,2,'cancel');await prisma.meetFriendship.updateMany({data:{updatedAt:new Date(Date.now()-86400001)}});await friendship(1,2,'request');
 assert.equal((await post('/meet/friendship',{userId:2,peerId:1,action:'accept',requestKey:old})).status,409);assert.equal((await prisma.meetFriendship.findFirst()).status,'pending');assert.equal((await friendship(2,1,'accept')).status,200);
});
test('thirty old pending requests still enforce the outstanding cap beyond the hourly window',async()=>{
 await socialSetup();for(let i=3;i<33;i++){await prisma.user.create({data:{id:i,username:'Pending '+i,password:'',mail:'',carDrive:0,...pilot}});await prisma.meetFriendship.create({data:{lowId:1,highId:i,requestedBy:1,createdAt:new Date(Date.now()-7200000)}});}
 assert.equal((await friendship(1,2,'request')).status,429);assert.equal(await prisma.meetFriendship.count(),30);
});

test('a pending number request can be blocked or reported after the sender leaves, without permitting first SMS',async()=>{
 await socialSetup();await friendship(1,2,'request');await post('/meet/showcase',{garageId:null});await post('/meet/showcase',{userId:2,garageId:null});
 assert.equal((await get('/phone/2')).data.contacts[0].canMessage,false);assert.equal((await post('/meet/message',{userId:2,peerId:1,text:'Non ancora amici'})).status,403);
 assert.equal((await post('/meet/report',{userId:2,peerId:1,reason:'Richiesta non gradita'})).status,200);assert.equal((await post('/meet/block',{userId:2,peerId:1,blocked:true})).status,200);assert.deepEqual((await get('/phone/2/notifications')).data.friendRequests,[]);assert.equal((await prisma.meetFriendship.findFirst()).status,'removed');
});
