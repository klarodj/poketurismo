const {performanceIndex}=require('../shared/vehiclePerformance.mjs');
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('./database');
const { PILOT_STATS, fail, positiveId, publicPlayer, restoredHandlingStats, partChanges, checkChampionship, charge, cents } = require('./gameRules');
const { operation, transaction, inventory, addPart, consumePart, garageInclude } = require('./persistence');
const { startRace, turnRace, snapshot, projectRace } = require('./races');
const { readLesson, legacyTrainingUse } = require('./driverDevelopment');
const { readTechnique } = require('./techniqueSchool');
const { newCarPrice, marketAskingPrice, usedRetailPrice, tradeInValue, publicMarketItem } = require('../shared/carEconomy.mjs');
const { trackCatalogInfo } = require('../shared/trackCatalog.mjs');
const { streetHub, encounter } = require('./streetRacing');
const { publicEntry, createContract } = require('./championships');
const { championshipInfo } = require('../shared/championshipCatalog.mjs');
const carMeet = require('./carMeet');
const workshop = require('./workshop');
const carPaint=require('./carPaint');
const racePreparation=require('./racePreparation');
const tuning=require('./tuning');
const meetSocial=require('./meetSocial');
const app = express();
const prisma = new PrismaClient();
const accounts = require('./accounts');
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
    return operation(prisma, accounts.playerId(req, userId), operationId, kind, { ...body, params: req.params }, (tx, id) => action(tx, id, body, req.params), idle);
  }));
}
accounts.install(app, prisma, endpoint);
async function ownGarage(tx, userId, id, include = garageInclude) {
  const garage = await tx.garage.findFirst({ where: { id: positiveId(id), userId }, include });
  if (!garage) fail(403, 'Auto non posseduta');
  return garage;
}
app.get('/api/health', endpoint(async () => { await prisma.$queryRaw`SELECT 1`; return { ok: true, service: 'poketurismo', version: 2 }; }));
app.get('/api/player/:id', endpoint(async req => {
  const user = await prisma.user.findUnique({ where: { id: accounts.playerId(req, req.params.id) } });
  if (!user) fail(404, 'Giocatore inesistente');
  return publicPlayer(user);
}));
app.get('/api/state/:userId', endpoint(req => transaction(prisma, tx => snapshot(tx, accounts.playerId(req, req.params.userId)))));
app.get('/api/inventory/:userId', endpoint(req => inventory(prisma, accounts.playerId(req, req.params.userId))));
app.get('/api/garage/:userId', endpoint(async req => {
  const items = await prisma.garage.findMany({ where: { userId: accounts.playerId(req, req.params.userId) }, include: garageInclude });
  return items.map(item => ({ ...item, ...restoredHandlingStats(item), resaleValue: tradeInValue(item.car, item) }));
}));
app.get('/api/cars', endpoint(async () => (await prisma.car.findMany({ include: { brand: true }, orderBy: { id: 'asc' } })).map(car => ({ ...car, price: newCarPrice(car) }))));
app.get('/api/brands', endpoint(() => prisma.brand.findMany({ orderBy: { name: 'asc' } })));
app.get('/api/tuning/:userId',endpoint(req=>transaction(prisma,tx=>tuning.tuning(tx,accounts.playerId(req,req.params.userId),req.query.garageId))));
app.get('/api/parts', endpoint(() => prisma.part.findMany({ orderBy: { id: 'asc' } })));
app.get('/api/tracks', endpoint(async () => (await prisma.track.findMany({ include: { type: true, surface: true, meteo: true, builds: { include: { section: true }, orderBy: { ord: 'asc' } } }, orderBy: { id: 'asc' } })).map(track => ({ ...track, catalog: trackCatalogInfo(track.name) }))));
app.get('/api/market', endpoint(async () => {
  const cars = await prisma.garage.findMany({ where: { userId: -1 }, include: garageInclude });
  return cars.map(item => ({ ...publicMarketItem(item), ...restoredHandlingStats(item) })).sort((a,b) => a.sellPrice-b.sellPrice || a.id-b.id);
}));
app.get('/api/phone/:userId/notifications',endpoint(req=>transaction(prisma,tx=>require('./phone').notifications(tx,accounts.playerId(req,req.params.userId)))));
app.get('/api/phone/:userId',endpoint(req=>transaction(prisma,tx=>require('./phone').inbox(tx,accounts.playerId(req,req.params.userId)))));
app.get('/api/meet', endpoint(req => transaction(prisma, tx => carMeet.meet(tx, accounts.playerId(req, req.query.userId)))));
app.get('/api/meet/leaderboard', endpoint(req => transaction(prisma, tx => carMeet.leaderboard(tx, req.query))));
app.get('/api/meet/social/:userId',endpoint(req=>transaction(prisma,tx=>meetSocial.hub(tx,accounts.playerId(req,req.params.userId)))));
app.get('/api/meet/conversation/:peerId',endpoint(req=>transaction(prisma,tx=>meetSocial.conversation(tx,accounts.playerId(req,req.query.userId),req.params.peerId,req.query.before))));
app.get('/api/meet/reports/:userId',endpoint(req=>transaction(prisma,tx=>meetSocial.reports(tx,accounts.playerId(req,req.params.userId)))));
mutate('/api/meet/friendship','meet-friendship',require('./friendships').change,'post',false);
mutate('/api/meet/message','meet-message',meetSocial.send,'post',false);
mutate('/api/meet/read','meet-read',meetSocial.read,'post',false);
mutate('/api/meet/block','meet-block',meetSocial.block,'post',false);
mutate('/api/meet/report','meet-report',meetSocial.report,'post',false);
mutate('/api/meet/report/resolve','meet-report-resolve',meetSocial.resolveReport,'post',false);
mutate('/api/meet/challenge','meet-invite',meetSocial.invite,'post',false);
mutate('/api/meet/challenge/respond','meet-respond',meetSocial.respond,'post',false);
mutate('/api/meet/challenge/start','meet-start',meetSocial.start);
mutate('/api/meet/showcase', 'meet-showcase', carMeet.displayCar, 'post', false);
mutate('/api/player/:id/avatar','change-avatar',require('./pilotProfile').changeAvatar,'post',false);
mutate('/api/player/:id/equip', 'equip', async (tx, userId, body, params) => {
  if (positiveId(params.id) !== userId) fail(403, 'Giocatore non corrispondente');
  const car = await ownGarage(tx, userId, body.carDrive);
  await tx.user.update({ where: { id: userId }, data: { carDrive: car.id } });
  return snapshot(tx, userId);
}, 'put');
mutate('/api/purchase', 'purchase-car', async (tx, userId, body) => {
  if (body.marketGarageId !== undefined) {
    const id = positiveId(body.marketGarageId);
    const listing = await tx.garage.findFirst({ where: { id, userId: -1 }, include: garageInclude });
    if (!listing) fail(404, 'Annuncio non più disponibile');
    await charge(tx, userId, marketAskingPrice(listing.car, listing));
    if(body.paintColour!==undefined)fail(400,'Il colore dell’usato è quello dell’annuncio');
    await tx.garage.update({ where: { id }, data: { userId, sellPrice: 0,paintColour:carPaint.paintFor(listing) } });
  } else {
    const carId = positiveId(body.carId);
    const car = await tx.car.findUnique({ where: { id: carId } });
    if (!car) fail(404, 'Auto inesistente');
    const paintColour=carPaint.selectedPaint(body.paintColour,car);
    await charge(tx, userId, newCarPrice(car));
    const stats = Object.fromEntries(['cv', 'nm', 'kg', 'speed', 'acceleration', 'revving', 'transmission', 'turnSlow', 'turnFast', 'brake', 'traction'].map(key => [key, car[key]]));
    await tx.garage.create({ data: { userId, carId, paintColour,...stats } });
  }
  return snapshot(tx, userId);
});
mutate('/api/market/sell', 'sell-car', async (tx, userId, body) => {
  const item = await ownGarage(tx, userId, body.garageId);
  const debt=await workshop.recoveryState(tx,userId);
  if(debt.lockedCarIds.includes(item.id))fail(400,'Salda l’anticipo del meccanico prima di vendere questa auto');
  const sellValue = tradeInValue(item.car, item);
  const askingPrice = usedRetailPrice(item.car, item);
  await tx.user.upsert({ where: { id: -1 }, update: {}, create: { id: -1, username: 'Mercato', password: '', mail: '', carDrive: 0, ...Object.fromEntries(PILOT_STATS.map(key => [key, 0])) } });
  await tx.garage.update({ where: { id: item.id }, data: { userId: -1, sellPrice: askingPrice } });
  const user = await tx.user.findUnique({ where: { id: userId } });
  await tx.user.update({ where: { id: userId }, data: { moneyCents: { increment: cents(sellValue) }, ...(user.carDrive === item.id ? { carDrive: 0 } : {}) } });
  return { ...await snapshot(tx, userId), sellValue };
});
mutate('/api/parts/purchase', 'purchase-part', async (tx, userId, body) => {
  const part = await tx.part.findUnique({ where: { id: positiveId(body.partId) } });
  if (!part) fail(404, 'Ricambio inesistente');
  if(body.quoteKey!==undefined)tuning.validateQuote(await ownGarage(tx,userId,body.garageId),part,body.quoteKey);
  await charge(tx, userId, part.price);
  await addPart(tx, userId, part.id);
  return snapshot(tx, userId);
});
mutate('/api/garage/:garageId/mount', 'mount-part', async (tx, userId, body, params) => {
  const garage = await ownGarage(tx, userId, params.garageId);
  racePreparation.requireRoadTuning(garage);
  const part = await tx.part.findUnique({ where: { id: positiveId(body.partId) } });
  if (!part) fail(404, 'Ricambio inesistente');
  if(body.quoteKey!==undefined)tuning.validateQuote(garage,part,body.quoteKey);
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
  racePreparation.requireRoadTuning(garage);
  const mod = garage.mods.find(mod => mod.id === positiveId(params.modId));
  if (!mod) fail(404, 'Ricambio non montato su questa auto');
  await tx.garage.update({ where: { id: garage.id }, data: restoredHandlingStats(garage) });
  await tx.garage.update({ where: { id: garage.id }, data: partChanges(mod.part, -1) });
  await tx.mod.delete({ where: { id: mod.id } });
  await addPart(tx, userId, mod.partId);
  return snapshot(tx, userId);
}, 'delete');
app.get('/api/workshop/:userId', endpoint(req => transaction(prisma,tx => workshop.workshop(tx,accounts.playerId(req,req.params.userId)))));
mutate('/api/garage/:garageId/service','service',workshop.service);
mutate('/api/garage/:garageId/paint','paint-car',carPaint.repaint);
mutate('/api/garage/:garageId/race-preparation','race-preparation',racePreparation.convert);
mutate('/api/workshop/recover','workshop-recover',workshop.recover);
mutate('/api/workshop/repay','workshop-repay',workshop.repay);
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
mutate('/api/driver/points','allocate-pilot-points',require('./pilotProgression').allocate);
mutate('/api/driver/lesson', 'read-driving-lesson', async (tx, userId, body) => { await readLesson(tx, userId, body); return snapshot(tx, userId); });
mutate('/api/driver/techniques/read', 'read-technique', async (tx, userId, body) => { await readTechnique(tx, userId, body); return snapshot(tx, userId); });
app.get('/api/training-sessions', endpoint(() => prisma.trainingSession.findMany({ where: { category: 'stat' }, include: { track: { include: { type: true, meteo: true } } }, orderBy: { minLevel: 'asc' } })));
mutate('/api/training-sessions/:id/complete', 'training', async (tx, userId, body, params) => {
  const session = await tx.trainingSession.findUnique({ where: { id: positiveId(params.id) } });
  if (!session) fail(404, 'Allenamento inesistente');
  if (session.category === 'move') fail(410, 'Le tecniche si apprendono con lezioni e prove nella scuola guida');
  const user = await tx.user.findUnique({ where: { id: userId } });
  if (user.level < session.minLevel) fail(400, 'Livello insufficiente');
  const factor = session.category === 'stat' ? await legacyTrainingUse(tx, userId, session) : 1;
  const xpReward = Math.floor(session.xpReward * factor);
  const statGain = session.category === 'stat' && session.statGain > 0 ? Math.max(1, Math.floor(session.statGain * factor)) : 0;
  const data = require('./pilotProgression').experienceReward(user,xpReward);
  if (session.category === 'stat') {
    if (!PILOT_STATS.includes(session.targetStat)) fail(400, 'Abilità non valida');
    data[session.targetStat] = Math.min(100,user[session.targetStat]+statGain);
  } else fail(400, 'Tipo allenamento non valido');
  await charge(tx, userId, session.cost);
  await tx.user.update({ where: { id: userId }, data });
  return { ...await snapshot(tx, userId), training: { statGain, xp: xpReward } };
});
const championshipInclude = { championship: { include: { rounds: { include: { track: { include: { type: true, surface: true, meteo: true } } }, orderBy: { ord: 'asc' } } } } };
const serializeEntry = publicEntry;
app.get('/api/championships', endpoint(async () => {const [cups,cars]=await Promise.all([prisma.championship.findMany({include:{rounds:{include:{track:{include:{type:true,surface:true,meteo:true}}},orderBy:{ord:'asc'}}},orderBy:{id:'asc'}}),prisma.car.findMany()]);return cups.filter(cup=>championshipInfo(cup.name)).map(cup=>{const info=championshipInfo(cup.name);return {...cup,format:'grid',rules:{drives:info.drives,engineTypes:info.engineTypes,brands:info.brands},drivers:info.rivals.map(r=>{const car=cars.find(c=>c.name===r.carName);return {...r,performanceIndex:car?performanceIndex({...car,engineHealth:r.engineHealth,tireGrip:r.tireGrip,currentFuel:35,km:0}):null,driverIndex:require('../shared/driverIndex.mjs').driverIndex(Object.fromEntries(PILOT_STATS.map(k=>[k,r.skill])))};})};});}));
app.get('/api/championship-entries/active/:userId', endpoint(async req => serializeEntry(await prisma.championshipEntry.findFirst({ where: { userId: accounts.playerId(req, req.params.userId), status: 'active' }, include: championshipInclude, orderBy: { createdAt: 'desc' } }))));
app.get('/api/championship-entries/history/:userId', endpoint(async req => (await prisma.championshipEntry.findMany({where:{userId:accounts.playerId(req,req.params.userId),status:'completed'},include:championshipInclude,orderBy:{createdAt:'desc'},take:20})).map(serializeEntry)));
app.get('/api/championship-entries/:entryId', endpoint(async req => {
  const entry = await prisma.championshipEntry.findFirst({ where: { id: positiveId(req.params.entryId), userId: accounts.playerId(req, req.query.userId) }, include: championshipInclude });
  if (!entry) fail(404, 'Campionato inesistente');
  return serializeEntry(entry);
}));
mutate('/api/championships/:championshipId/enter', 'enter-championship', async (tx, userId, body, params) => {
  const championship = await tx.championship.findUnique({ where: { id: positiveId(params.championshipId) }, include: { rounds: true } });
  if (!championship || !championship.rounds.length) fail(400, 'Campionato non disponibile');
  const modernCatalogue = await tx.championship.findFirst({ where: { name: 'Coppa Primi Giri' } });
  if (modernCatalogue && !championshipInfo(championship.name)) fail(410, 'Campionato storico: scegli un evento del nuovo calendario');
  if (await tx.championshipEntry.findFirst({ where: { userId, status: 'active' } })) fail(409, 'Completa prima il campionato attivo');
  const user = await tx.user.findUnique({ where: { id: userId } });
  const garage = await ownGarage(tx, userId, user.carDrive);
  checkChampionship(user, { ...garage, ...restoredHandlingStats(garage) }, championship);
  if(garage.racePrepared){for(const round of championship.rounds){const track=await tx.track.findUnique({where:{id:round.trackId},include:{type:true}});const reason=require('../shared/raceEquipment.mjs').raceTrackError(garage,{...track,catalog:trackCatalogInfo(track?.name)},'championship');if(reason)fail(400,reason);}}
  await charge(tx, userId, championship.entryFee);
  const contract = await createContract(tx, user, championship);
  const entry = await tx.championshipEntry.create({ data: { userId, championshipId: championship.id, contract }, include: championshipInclude });
  const state = await snapshot(tx, userId);
  return { ...state, entry: serializeEntry(entry), user: state.player };
});
app.get('/api/races/active/:userId', endpoint(async req => {
  const race = await prisma.raceSession.findFirst({ where: { userId: accounts.playerId(req, req.params.userId), status: 'active' }, orderBy: { createdAt: 'desc' } });
  return race ? projectRace(prisma,race) : null;
}));
app.get('/api/time-trials/:userId', endpoint(async req => {
  const rows=await prisma.raceSession.findMany({where:{userId:accounts.playerId(req,req.params.userId),mode:'track',status:'completed'},orderBy:{createdAt:'desc'}});
  const records=new Map();
  for(const row of rows){const state=JSON.parse(row.state);if(!state.timeTrial||state.failure||state.index!==state.sections.length||!Number.isFinite(state.playerTime))continue;const timeMs=Math.round(state.playerTime*1000);const fuelModelVersion=state.fuelModelVersion||1,key=`${state.trackId}:${fuelModelVersion}`;if(!records.has(key)||records.get(key).timeMs>timeMs)records.set(key,{fuelModelVersion,raceId:row.id,trackId:state.trackId,trackName:require('../shared/periodWorld.mjs').periodTrackName(state.trackName),timeMs,...state.trialSetup});}
  return [...records.values()];
}));
app.get('/api/races/:raceId', endpoint(async req => {
  const userId = accounts.playerId(req, req.query.userId);
  const race = await prisma.raceSession.findFirst({ where: { id: req.params.raceId, userId } });
  if (!race) fail(404, 'Gara inesistente');
  return snapshot(prisma, userId, race);
}));
mutate('/api/races', 'start-race', startRace);
app.get('/api/street/:userId', endpoint(req => transaction(prisma, tx => streetHub(tx, accounts.playerId(req, req.params.userId)))));
mutate('/api/street/encounter', 'street-encounter', encounter);
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
