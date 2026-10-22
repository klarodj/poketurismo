const {championshipCarErrors}=require('../shared/championshipCatalog.mjs');
const PILOT_STATS = ['brave', 'clean', 'reflex', 'shift', 'acro', 'turn', 'brake', 'throttle'];
const {partStatDeltas,restoredTuningStats}=require('../shared/tuning.mjs');
function fail(status, message) { const error = new Error(message); error.status = status; throw error; }
function positiveId(value) {
  if (!['string', 'number'].includes(typeof value) || value === '') fail(400, 'ID non valido');
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) fail(400, 'ID non valido');
  return id;
}
const restoredHandlingStats=restoredTuningStats;
function publicPlayer(user) {
  if (!user) return user;
  const result = { ...user };
  delete result.password;
  delete result.mail;
  delete result.authUserId;
  delete result.usernameKey;
  result.money = user.moneyCents / 100;
  return result;
}
function partChanges(part, direction = 1) {
  return Object.fromEntries(Object.entries(partStatDeltas(part,direction)).map(([stat,value])=>[stat,{increment:value}]));
}
function checkChampionship(user, car, championship, legacy = false) {
  if (!car || car.userId !== user.id) fail(400, 'Equipaggia una tua auto');
  const errors=legacy ? [car.cv<championship.minCv||car.cv>championship.maxCv?'Potenza auto non ammessa':null, championship.allowedDrive!=='any'&&car.car.driveType!==championship.allowedDrive?'Trazione non ammessa':null, ['speed','acceleration','revving','transmission','turnSlow','turnFast','brake','traction'].reduce((sum,key)=>sum+car[key],0)/8<championship.minPerfIndex?'Indice prestazioni insufficiente':null].filter(Boolean) : championshipCarErrors(car,championship);
  if(errors.length)fail(400,errors.join(' · '));
  if (user.level < championship.minLevel) fail(400, 'Livello insufficiente');
  for (const stat of ['brave', 'clean', 'reflex', 'shift']) {
    if (user[stat] < championship[`min${stat[0].toUpperCase()}${stat.slice(1)}`]) fail(400, 'Abilità pilota insufficienti');
  }
}
function cents(euros) {
  const amount = Math.round(euros * 100);
  if (!Number.isSafeInteger(amount) || amount < 0) fail(400, "Importo non valido");
  return amount;
}
async function charge(tx, userId, price) {
  if (!Number.isFinite(price) || price < 0) fail(400, 'Prezzo non valido');
  const user = await tx.user.updateMany({
    where: { id: userId, moneyCents: { gte: cents(price) } }, data: { moneyCents: { decrement: cents(price) } }
  });
  if (user.count !== 1) fail(400, 'Giocatore inesistente o fondi insufficienti');
}
module.exports = { PILOT_STATS, fail, positiveId, publicPlayer, restoredHandlingStats, partChanges, checkChampionship, charge, cents };
