const { createHash } = require('node:crypto');
const { fail, positiveId } = require('./gameRules');
const { trainingMove } = require('./raceEngine');
const { learnedTechnique } = require('../shared/driverDevelopment.mjs');
const { TECHNIQUES, techniqueRecords, techniqueMove } = require('../shared/techniqueCatalog.mjs');
const garageInclude = { car: { include: { brand: true } }, mods: { include: { part: true } } };
function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  return value;
}
async function transaction(prisma, action) {
  for (let attempt = 0; ; attempt++) {
    try { return await prisma.$transaction(action, { maxWait: 10000, timeout: 15000, isolationLevel: 'Serializable' }); }
    catch (error) {
      if (attempt >= 3 || !['P2034', 'P1008', 'P2028', 'P2002'].includes(error.code)) throw error;
      await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 30));
    }
  }
}
async function operation(prisma, userId, key, kind, payload, action, idle = true) {
  userId = positiveId(userId);
  if (typeof key !== 'string' || !/^[a-zA-Z0-9_-]{8,100}$/.test(key)) fail(400, 'Identificativo operazione mancante o non valido');
  const fingerprint = createHash('sha256').update(JSON.stringify(canonical(payload))).digest('hex');
  return transaction(prisma, async tx => {
    const existing = await tx.gameOperation.findUnique({ where: { userId_key: { userId, key } } });
    if (existing) {
      if (existing.kind !== kind || existing.fingerprint !== fingerprint) fail(409, 'Identificativo già usato per un’altra operazione');
      const saved = JSON.parse(existing.response);
      if(saved.raceHistoryReset)fail(410,'Lo storico gare di test è stato azzerato. Ricarica la pagina e avvia una nuova gara.');
      // Return current checkpoints on a retry, rather than rolling the UI back to an old balance.
      const { snapshot } = require('./races');
      const race = saved.race ? await tx.raceSession.findUnique({ where: { id: saved.race.id } }) : null;
      const fresh = await snapshot(tx, userId, race);
      let friendship;
      if(saved.friendshipStatus!==undefined){const ids=require('./friendships').pair(userId,positiveId(payload.peerId));friendship=await tx.meetFriendship.findUnique({where:{lowId_highId:ids}});}
      let entry;
      if (saved.entry) {
        entry = await tx.championshipEntry.findUnique({ where: { id: saved.entry.id }, include: { championship: { include: { rounds: { include: { track: { include: { type: true, surface: true, meteo: true } } }, orderBy: { ord: 'asc' } } } } } });
        if (entry) entry = require('./championships').publicEntry(entry);
      }
      return { ...saved, ...fresh, ...(saved.story ? {story:await require('./story').hub(tx,userId)} : {}), ...(saved.friendshipStatus!==undefined?{friendshipStatus:friendship?.status||'removed'}:{}), ...(saved.meet ? { meet: await require('./carMeet').meet(tx, userId) } : {}), ...(saved.street ? { street: await require('./streetRacing').streetHub(tx, userId) } : {}), ...(saved.user ? { user: fresh.player } : {}), ...(entry ? { entry } : {}) };
    }
    if (!await tx.user.findUnique({ where: { id: userId } })) fail(404, 'Giocatore inesistente');
    if (idle) await assertIdle(tx, userId);
    const result = await action(tx, userId);
    // Cache references and operation-specific receipts, not a growing copy of every race log.
    const receipt = { ...result };
    for (const field of ['player', 'garage', 'inventory', 'activeRace', 'development']) delete receipt[field];
    if (result.story) receipt.story = true;
    if (result.race) receipt.race = { id: result.race.id };
    if (result.entry) receipt.entry = { id: result.entry.id };
    if (result.user) receipt.user = true;
    await tx.gameOperation.create({ data: { userId, key, kind, fingerprint, response: JSON.stringify(receipt) } });
    return result;
  });
}
async function assertIdle(tx, userId) {
  const race = await tx.raceSession.findFirst({ where: { userId, status: 'active' } });
  if (race) fail(409, 'Hai una gara in corso: riprendila o abbandonala prima di modificare il pilota o le auto');
}
async function inventory(tx, userId) {
  const progress = await tx.playerProgress.findUnique({ where: { userId } });
  const sessions = await tx.trainingSession.findMany({ where: { id: { in: JSON.parse(progress?.learnedMoves || '[]') } } });
  const development = await tx.driverDevelopment.findUnique({ where: { userId } });
  const records = techniqueRecords(development);
  const moves = [...sessions.map(trainingMove), ...(development?.lessonPassed ? [learnedTechnique(development.techniquePractice)] : []),
    ...TECHNIQUES.filter(item => item.id !== 'progressive-release' && records[item.id]?.passed).map(item => techniqueMove(item, records[item.id].practice))];
  const items = await tx.inventoryPart.findMany({ where: { userId, quantity: { gt: 0 } }, include: { part: true }, orderBy: { partId: 'asc' } });
  return { moves, equippedMoves: JSON.parse(progress?.equippedMoves || '[]').filter(id => moves.some(move => move.id === id)),
    parts: items.flatMap(item => Array.from({ length: item.quantity }, (_, index) => ({ ...item.part, instanceId: `${item.partId}-${index}` }))) };
}
async function addPart(tx, userId, partId) {
  return tx.inventoryPart.upsert({ where: { userId_partId: { userId, partId } }, create: { userId, partId, quantity: 1 }, update: { quantity: { increment: 1 } } });
}
async function consumePart(tx, userId, partId) {
  const result = await tx.inventoryPart.updateMany({ where: { userId, partId, quantity: { gt: 0 } }, data: { quantity: { decrement: 1 } } });
  if (result.count !== 1) fail(400, 'Ricambio non presente nel tuo inventario');
}
module.exports = { canonical, operation, transaction, assertIdle, inventory, addPart, consumePart, garageInclude };
