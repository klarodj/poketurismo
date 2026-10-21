const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();
const { SERVICE_PRICES, PILOT_STATS, fail, positiveId, publicPlayer, restoredHandlingStats, partChanges, checkChampionship, charge, cents } = require('./gameRules');
const { operation, transaction, inventory, addPart, consumePart, garageInclude } = require('./persistence');
const { startRace, turnRace, snapshot, presentRace } = require('./races');
const { readLesson, legacyTrainingUse } = require('./driverDevelopment');
const { BASE_MOVES, trainingMove } = require('./raceEngine');
const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json({ limit: '100kb' }));
const endpoint = handler => async (req, res) => {
  try { res.json(await handler(req)); }
  catch (error) {
    const conflict = ['P2034', 'P1008', 'P2028', 'P2002'].includes(error.code);
    res.status(error.status || (conflict ? 409 : 500)).json({ error: error.status ? error.message : conflict ? 'Operazione concorrente: riprova con lo stesso identificativo' : 'Operazione non riuscita. Riprova.' });
    if (!error.status && !conflict) console.error(error);
  }
};
function mutate(path, kind, action, method = 'post', idle = true) {
  app[method](path, endpoint(req => {
    const { operationId, userId, ...body } = req.body;
    return operation(prisma, userId, operationId, kind, { ...body, params: req.params }, (tx, id) => action(tx, id, body, req.params), idle);
  }));
}
async function ownGarage(tx, userId, id, include = garageInclude) {
  const garage = await tx.garage.findFirst({ where: { id: positiveId(id), userId }, include });
  if (!garage) fail(403, 'Auto non posseduta');
  return garage;
}
app.get('/api/health', endpoint(async () => { await prisma.$queryRaw`SELECT 1`; return { ok: true, service: 'poketurismo', version: 2 }; }));
app.get('/api/player/:id', endpoint(async req => {
  const user = await prisma.user.findUnique({ where: { id: positiveId(req.params.id) } });
  if (!user) fail(404, 'Giocatore inesistente');
  return publicPlayer(user);
}));
app.get('/api/state/:userId', endpoint(req => transaction(prisma, tx => snapshot(tx, positiveId(req.params.userId)))));
app.get('/api/inventory/:userId', endpoint(req => inventory(prisma, positiveId(req.params.userId))));
app.get('/api/garage/:userId', endpoint(async req => {
  const items = await prisma.garage.findMany({ where: { userId: positiveId(req.params.userId) }, include: garageInclude });
  return items.map(item => ({ ...item, ...restoredHandlingStats(item) }));
}));
app.get('/api/cars', endpoint(() => prisma.car.findMany({ include: { brand: true }, orderBy: { id: 'asc' } })));
app.get('/api/brands', endpoint(() => prisma.brand.findMany({ orderBy: { name: 'asc' } })));
app.get('/api/parts', endpoint(() => prisma.part.findMany({ orderBy: { id: 'asc' } })));
app.get('/api/tracks', endpoint(() => prisma.track.findMany({ include: { type: true, surface: true, meteo: true, builds: { include: { section: true }, orderBy: { ord: 'asc' } } }, orderBy: { id: 'asc' } })));
app.get('/api/market', endpoint(async () => {
  const cars = await prisma.garage.findMany({ where: { userId: -1 }, include: garageInclude });
  return cars.map(item => ({ ...item, ...restoredHandlingStats(item) }));
}));
mutate('/api/player/:id/equip', 'equip', async (tx, userId, body, params) => {
  if (positiveId(params.id) !== userId) fail(403, 'Giocatore non corrispondente');
  const car = await ownGarage(tx, userId, body.carDrive);
  await tx.user.update({ where: { id: userId }, data: { carDrive: car.id } });
  return snapshot(tx, userId);
}, 'put');
mutate('/api/purchase', 'purchase-car', async (tx, userId, body) => {
  if (body.marketGarageId !== undefined) {
    const id = positiveId(body.marketGarageId);
    const listing = await tx.garage.findFirst({ where: { id, userId: -1 } });
    if (!listing) fail(404, 'Annuncio non più disponibile');
    await charge(tx, userId, listing.sellPrice);
    await tx.garage.update({ where: { id }, data: { userId, sellPrice: 0 } });
  } else {
    const carId = positiveId(body.carId);
    const car = await tx.car.findUnique({ where: { id: carId } });
    if (!car) fail(404, 'Auto inesistente');
    await charge(tx, userId, car.price);
    const stats = Object.fromEntries(['cv', 'nm', 'kg', 'speed', 'acceleration', 'revving', 'transmission', 'turnSlow', 'turnFast', 'brake', 'traction'].map(key => [key, car[key]]));
    await tx.garage.create({ data: { userId, carId, ...stats } });
  }
  return snapshot(tx, userId);
});
mutate('/api/market/sell', 'sell-car', async (tx, userId, body) => {
  const item = await ownGarage(tx, userId, body.garageId);
  const sellValue = Math.max(0, Math.floor(item.cv * 10));
  await tx.user.upsert({ where: { id: -1 }, update: {}, create: { id: -1, username: 'Mercato', password: '', mail: '', carDrive: 0, ...Object.fromEntries(PILOT_STATS.map(key => [key, 0])) } });
  await tx.garage.update({ where: { id: item.id }, data: { userId: -1, sellPrice: sellValue } });
  const user = await tx.user.findUnique({ where: { id: userId } });
  await tx.user.update({ where: { id: userId }, data: { moneyCents: { increment: cents(sellValue) }, ...(user.carDrive === item.id ? { carDrive: 0 } : {}) } });
  return { ...await snapshot(tx, userId), sellValue };
});
mutate('/api/parts/purchase', 'purchase-part', async (tx, userId, body) => {
  const part = await tx.part.findUnique({ where: { id: positiveId(body.partId) } });
  if (!part) fail(404, 'Ricambio inesistente');
  await charge(tx, userId, part.price);
  await addPart(tx, userId, part.id);
  return snapshot(tx, userId);
});
mutate('/api/garage/:garageId/mount', 'mount-part', async (tx, userId, body, params) => {
  const garage = await ownGarage(tx, userId, params.garageId);
  const part = await tx.part.findUnique({ where: { id: positiveId(body.partId) } });
  if (!part) fail(404, 'Ricambio inesistente');
  const conflict = garage.mods.find(mod => mod.part.name === part.name);
  if (conflict?.partId === part.id) fail(400, 'Ricambio già montato');
  await consumePart(tx, userId, part.id);
  await tx.garage.update({ where: { id: garage.id }, data: restoredHandlingStats(garage) });
  if (conflict) {
    await tx.garage.update({ where: { id: garage.id }, data: partChanges(conflict.part, -1) });
    await tx.mod.delete({ where: { id: conflict.id } });
    await addPart(tx, userId, conflict.partId);
  }
  await tx.garage.update({ where: { id: garage.id }, data: partChanges(part) });
  await tx.mod.create({ data: { garageId: garage.id, partId: part.id, speedValue: part.speedBonus, accelValue: part.accelBonus, revvValue: part.revvBonus, transValue: part.transBonus, turnSlowValue: part.turnSlowBonus, turnFastValue: part.turnFastBonus, brakeValue: part.brakeBonus, tractValue: part.tractBonus, cvValue: part.cvBonus, nmValue: part.nmBonus, kgValue: part.kgBonus } });
  return snapshot(tx, userId);
});
mutate('/api/garage/:garageId/mods/:modId', 'unmount-part', async (tx, userId, body, params) => {
  const garage = await ownGarage(tx, userId, params.garageId);
  const mod = garage.mods.find(mod => mod.id === positiveId(params.modId));
  if (!mod) fail(404, 'Ricambio non montato su questa auto');
  await tx.garage.update({ where: { id: garage.id }, data: restoredHandlingStats(garage) });
  await tx.garage.update({ where: { id: garage.id }, data: partChanges(mod.part, -1) });
  await tx.mod.delete({ where: { id: mod.id } });
  await addPart(tx, userId, mod.partId);
  return snapshot(tx, userId);
}, 'delete');
mutate('/api/garage/:garageId/service', 'service', async (tx, userId, body, params) => {
  const garage = await ownGarage(tx, userId, params.garageId);
  if (!Object.hasOwn(SERVICE_PRICES, body.serviceType)) fail(400, 'Servizio non valido');
  if (body.serviceType === 'engine' && garage.engineHealth <= 0) fail(400, 'Il motore richiede una revisione completa');
  await charge(tx, userId, SERVICE_PRICES[body.serviceType]);
  const data = {};
  if (body.serviceType !== 'tires') { data.engineHealth = 100; data.serviceKm = garage.km; }
  if (body.serviceType === 'tires' || body.serviceType === 'full') data.tireGrip = 100;
  await tx.garage.update({ where: { id: garage.id }, data });
  return snapshot(tx, userId);
});
mutate('/api/garage/:garageId/refuel', 'refuel', async (tx, userId, body, params) => {
  const garage = await ownGarage(tx, userId, params.garageId);
  if (!['Normale', 'Premium'].includes(body.fuelType) || typeof body.liters !== 'number' || !Number.isFinite(body.liters) || body.liters <= 0 || body.liters > 45) fail(400, 'Rifornimento non valido');
  const liters = Math.min(Math.round(body.liters * 100) / 100, Math.round((45 - garage.currentFuel) * 100) / 100);
  if (liters <= 0) fail(400, 'Serbatoio già pieno');
  const price = cents(liters * (body.fuelType === 'Premium' ? 2.5 : 1.5)) / 100;
  await charge(tx, userId, price);
  const fuelType = body.fuelType;
  await tx.garage.update({ where: { id: garage.id }, data: { currentFuel: Math.round((garage.currentFuel + liters) * 100) / 100, fuelType } });
  return { ...await snapshot(tx, userId), liters, cost: price };
});
mutate('/api/player/:id/moves', 'equip-moves', async (tx, userId, body, params) => {
  if (positiveId(params.id) !== userId) fail(403, 'Giocatore non corrispondente');
  const inv = await inventory(tx, userId);
  if (!Array.isArray(body.moveIds) || body.moveIds.length > 4 || new Set(body.moveIds).size !== body.moveIds.length || !body.moveIds.every(id => inv.moves.some(move => move.id === id))) fail(400, 'Equipaggia fino a quattro mosse conosciute');
  await tx.playerProgress.upsert({ where: { userId }, create: { userId, equippedMoves: JSON.stringify(body.moveIds) }, update: { equippedMoves: JSON.stringify(body.moveIds) } });
  return snapshot(tx, userId);
}, 'put');
mutate('/api/driver/lesson', 'read-driving-lesson', async (tx, userId, body) => { await readLesson(tx, userId, body); return snapshot(tx, userId); });
app.get('/api/training-sessions', endpoint(() => prisma.trainingSession.findMany({ include: { track: { include: { type: true, meteo: true } } }, orderBy: { minLevel: 'asc' } })));
mutate('/api/training-sessions/:id/complete', 'training', async (tx, userId, body, params) => {
  const session = await tx.trainingSession.findUnique({ where: { id: positiveId(params.id) } });
  if (!session) fail(404, 'Allenamento inesistente');
  const user = await tx.user.findUnique({ where: { id: userId } });
  if (user.level < session.minLevel) fail(400, 'Livello insufficiente');
  const factor = session.category === 'stat' ? await legacyTrainingUse(tx, userId, session) : 1;
  const xpReward = Math.floor(session.xpReward * factor);
  const statGain = session.category === 'stat' && session.statGain > 0 ? Math.max(1, Math.floor(session.statGain * factor)) : 0;
  const data = { exp: { increment: xpReward }, level: Math.floor((user.exp + xpReward) / 1000) + 1 };
  if (session.category === 'stat') {
    if (!PILOT_STATS.includes(session.targetStat)) fail(400, 'Abilità non valida');
    data[session.targetStat] = { increment: statGain };
  } else if (session.category === 'move') {
    const progress = await tx.playerProgress.upsert({ where: { userId }, create: { userId }, update: {} });
    const learned = JSON.parse(progress.learnedMoves);
    if (learned.includes(session.id) || BASE_MOVES.some(move => move.name === session.targetMove)) fail(409, 'Mossa già conosciuta');
    const equipped = JSON.parse(progress.equippedMoves);
    if (equipped.length < 4) equipped.push(trainingMove(session).id);
    await tx.playerProgress.update({ where: { userId }, data: { learnedMoves: JSON.stringify([...learned, session.id]), equippedMoves: JSON.stringify(equipped) } });
  } else fail(400, 'Tipo allenamento non valido');
  await charge(tx, userId, session.cost);
  await tx.user.update({ where: { id: userId }, data });
  return { ...await snapshot(tx, userId), training: { statGain, xp: xpReward } };
});
const championshipInclude = { championship: { include: { rounds: { include: { track: { include: { type: true, surface: true, meteo: true } } }, orderBy: { ord: 'asc' } } } } };
const serializeEntry = entry => entry ? { ...entry, results: JSON.parse(entry.results) } : null;
app.get('/api/championships', endpoint(() => prisma.championship.findMany({ include: { rounds: { include: { track: { include: { type: true, surface: true, meteo: true } } }, orderBy: { ord: 'asc' } } }, orderBy: { id: 'asc' } })));
app.get('/api/championship-entries/active/:userId', endpoint(async req => serializeEntry(await prisma.championshipEntry.findFirst({ where: { userId: positiveId(req.params.userId), status: 'active' }, include: championshipInclude, orderBy: { createdAt: 'desc' } }))));
app.get('/api/championship-entries/:entryId', endpoint(async req => {
  const entry = await prisma.championshipEntry.findFirst({ where: { id: positiveId(req.params.entryId), userId: positiveId(req.query.userId) }, include: championshipInclude });
  if (!entry) fail(404, 'Campionato inesistente');
  return serializeEntry(entry);
}));
mutate('/api/championships/:championshipId/enter', 'enter-championship', async (tx, userId, body, params) => {
  const championship = await tx.championship.findUnique({ where: { id: positiveId(params.championshipId) }, include: { rounds: true } });
  if (!championship || !championship.rounds.length) fail(400, 'Campionato non disponibile');
  if (await tx.championshipEntry.findFirst({ where: { userId, status: 'active' } })) fail(409, 'Completa prima il campionato attivo');
  const user = await tx.user.findUnique({ where: { id: userId } });
  const garage = await ownGarage(tx, userId, user.carDrive);
  checkChampionship(user, { ...garage, ...restoredHandlingStats(garage) }, championship);
  await charge(tx, userId, championship.entryFee);
  const entry = await tx.championshipEntry.create({ data: { userId, championshipId: championship.id }, include: championshipInclude });
  const state = await snapshot(tx, userId);
  return { ...state, entry: serializeEntry(entry), user: state.player };
});
app.get('/api/races/active/:userId', endpoint(async req => {
  const race = await prisma.raceSession.findFirst({ where: { userId: positiveId(req.params.userId), status: 'active' }, orderBy: { createdAt: 'desc' } });
  return race ? presentRace(race) : null;
}));
app.get('/api/races/:raceId', endpoint(async req => {
  const userId = positiveId(req.query.userId);
  const race = await prisma.raceSession.findFirst({ where: { id: req.params.raceId, userId } });
  if (!race) fail(404, 'Gara inesistente');
  return snapshot(prisma, userId, race);
}));
mutate('/api/races', 'start-race', startRace);
mutate('/api/races/:raceId/turns', 'race-turn', (tx, userId, body, params) => turnRace(tx, userId, body, params.raceId), 'post', false);
mutate('/api/races/:raceId/abandon', 'abandon-race', (tx, userId, body, params) => turnRace(tx, userId, body, params.raceId, true), 'post', false);
// Legacy write endpoints must never accept client-computed wear, winners or rewards.
app.post('/api/garage/:garageId/stats', endpoint(() => fail(410, 'Usa i turni della gara per salvare le condizioni della vettura')));
app.post('/api/championship-entries/:entryId/results', endpoint(() => fail(410, 'I risultati sono calcolati dal server durante la gara')));
app.get('/api/track-sections', endpoint(() => prisma.trackSection.findMany()));
app.get('/api/dev/opponents', endpoint(() => prisma.customOpponent.findMany({ include: { car: { include: { brand: true } } } })));
app.get('/api/dev/tracks', endpoint(() => prisma.customTrack.findMany({ include: { sections: { include: { section: true }, orderBy: { ord: 'asc' } } } })));
app.post('/api/dev/opponents', endpoint(async req => {
  const data = req.body;
  if (typeof data.name !== 'string' || !data.name.trim() || data.name.length > 100) fail(400, 'Nome non valido');
  const stats = Object.fromEntries(['level', ...PILOT_STATS].map(key => {
    const value = Number(data[key]);
    if (!Number.isSafeInteger(value) || value < 0 || value > 1000) fail(400, 'Statistiche non valide');
    return [key, value];
  }));
  const opponent = await prisma.customOpponent.create({ data: { name: data.name, carId: positiveId(data.carId), ...stats } });
  return { success: true, opponent };
}));
app.post('/api/dev/tracks', endpoint(async req => {
  const { name, sections } = req.body;
  if (typeof name !== 'string' || !name.trim() || name.length > 100 || !Array.isArray(sections) || !sections.length || sections.length > 200) fail(400, 'Tracciato non valido');
  const track = await prisma.customTrack.create({ data: { name, sections: { create: sections.map((id, i) => ({ sectionId: positiveId(id), ord: i + 1 })) } }, include: { sections: { include: { section: true }, orderBy: { ord: 'asc' } } } });
  return { success: true, track };
}));
if (process.env.NODE_ENV === 'production') {
  const path = require('node:path');
  const dist = path.join(__dirname, '..', 'dist');
  app.use('/api', (req, res) => res.status(404).json({ error: 'API inesistente' }));
  app.use(express.static(dist));
  app.get('/{*path}', (req, res) => res.sendFile(path.join(dist, 'index.html')));
}
if (require.main === module) {
  const port = Number(process.env.PORT ?? 3001);
  const server = app.listen(port, process.env.HOST || '0.0.0.0', async error => {
    if (error) { console.error(`Impossibile avviare il backend sulla porta ${port}: ${error.message}`); process.exitCode = 1; return; }
    try {
      await prisma.$queryRaw`SELECT 1`;
      const actualPort = server.address().port;
      if (process.env.POKETURISMO_READY_FILE) {
        const fs = require('node:fs');
        const file = process.env.POKETURISMO_READY_FILE;
        fs.writeFileSync(`${file}.tmp`, JSON.stringify({ pid: process.pid, port: actualPort }));
        fs.renameSync(`${file}.tmp`, file);
      }
      console.log(`PokeTurismo Backend pronto sulla porta ${actualPort}`);
    } catch (error) {
      console.error(`Backend non pronto: ${error.message}`);
      server.close();
      await prisma.$disconnect();
      process.exitCode = 1;
    }
  });
}

module.exports = { app, prisma };
