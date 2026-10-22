const { randomInt } = require('node:crypto');
const { fail, positiveId, restoredHandlingStats, checkChampionship, charge, cents, publicPlayer } = require('./gameRules');
const { inventory, garageInclude } = require('./persistence');
const { tradeInValue } = require('../shared/carEconomy.mjs');
const { CAR_STATS, PILOT_STATS, advanceRace, performance } = require('./raceEngine');
const { DEMO_TRACK, buildTacticalTrack } = require('../shared/trackGeometry.mjs');
const { DECISION_OPTIONS, decisionPreview } = require('../shared/tacticalRace.mjs');
const { routeProfileFor, incidentPlan, incidentCue } = require('../shared/raceContext.mjs');
const { development, settleDevelopment } = require('./driverDevelopment');
const { fundamentals, lessonFeedback } = require('../shared/driverDevelopment.mjs');
const { requireTrial } = require('./techniqueSchool');
const { createTechniqueLesson, techniqueLessonFeedback } = require('../shared/techniqueLessons.mjs');
const { trackCatalogInfo } = require('../shared/trackCatalog.mjs');
const { acceptEncounter, settleStreet } = require('./streetRacing');
const includeChampionship = { championship: { include: { rounds: { orderBy: { ord: 'asc' } } } } };
function presentRace(row) {
  const state = JSON.parse(row.state);
  delete state.rng;
  delete state.incidentPlan;
  return { ...state, ...(state.rulesVersion === 3 ? { decisionOptions: DECISION_OPTIONS, preview: decisionPreview(state), nextSectionName: state.sections[state.index + 1]?.name || null } : {}), id: row.id, mode: row.mode, status: row.status, version: row.version };
}
async function snapshot(tx, userId, race) {
  const user = await tx.user.findUnique({ where: { id: userId } });
  if (!user) fail(404, 'Giocatore inesistente');
  const cars = await tx.garage.findMany({ where: { userId }, include: garageInclude, orderBy: { id: 'asc' } });
  const active = await tx.raceSession.findFirst({ where: { userId, status: 'active' }, select: { id: true, mode: true } });
  return { success: true, activeRace: active, ...(race ? { race: presentRace(race) } : {}), player: publicPlayer(user),
    development: await development(tx, userId), garage: cars.map(car => ({ ...car, ...restoredHandlingStats(car), resaleValue: tradeInValue(car.car, car) })), inventory: await inventory(tx, userId) };
}
function carSnapshot(garage) {
  return { ...Object.fromEntries([...CAR_STATS, 'cv', 'nm', 'kg', 'km', 'engineHealth', 'tireGrip', 'serviceKm', 'currentFuel', 'fuelType'].map(key => [key, garage[key]])),
    baseCv: garage.car.cv, baseKg: garage.car.kg, velMax: garage.car.velMax, zeroToHundred: garage.car.zeroToHundred, driveType: garage.car.driveType,
    id: garage.id, name: garage.car.name, brand: garage.car.brand?.name || '', image: garage.car.image };
}
async function startRace(tx, userId, body) {
  const mode = body.mode;
  if (!['street', 'track', 'championship'].includes(mode)) fail(400, 'Modalità gara non valida');
  const user = await tx.user.findUnique({ where: { id: userId } });
  const growth = await tx.driverDevelopment.findUnique({ where: { userId } });
  const pilot = { ...Object.fromEntries(PILOT_STATS.map(key => [key, user[key]])), fundamentals: fundamentals(growth) };
  if (body.lesson !== undefined) {
    if (mode !== 'track' || typeof body.lesson !== 'string' || Object.keys(body).some(key => !['mode', 'lesson'].includes(key))) fail(400, 'Prova didattica non valida');
    const technique = requireTrial(growth, user.level, body.lesson);
    const seed = randomInt(1, 2147483647);
    const state = createTechniqueLesson(technique, pilot, seed);
    const race = await tx.raceSession.create({ data: { userId, garageId: 0, mode: 'track', seed, state: JSON.stringify(state) } });
    return snapshot(tx, userId, race);
  }
  let garage = await tx.garage.findFirst({ where: { id: user.carDrive, userId }, include: garageInclude });
  if (!garage) fail(400, 'Equipaggia prima una tua auto');
  garage = { ...garage, ...restoredHandlingStats(garage) };
  if (garage.engineHealth <= 0) fail(400, 'Ripara il motore prima di gareggiare');
  if (garage.currentFuel <= 0) fail(400, 'Fai rifornimento prima di gareggiare');
  const streetMatch = mode === 'street' && body.customTrackId === undefined && body.opponentId === undefined ? await acceptEncounter(tx, userId, body) : null;
  if (mode === 'street' && !streetMatch && (body.zoneId !== undefined || body.wager !== undefined || body.offerId !== undefined)) fail(400, 'Le prove personalizzate non accettano scommesse o incontri');
  let entry, round, trackId = body.trackId === undefined ? null : positiveId(body.trackId);
  if (mode === 'championship') {
    entry = await tx.championshipEntry.findFirst({ where: { id: positiveId(body.entryId), userId, status: 'active' }, include: includeChampionship });
    if (!entry) fail(404, 'Campionato attivo non trovato');
    checkChampionship(user, garage, entry.championship);
    round = entry.championship.rounds.find(round => round.ord === entry.currentRound);
    if (!round) fail(400, 'Calendario non valido');
    trackId = round.trackId;
  }
  // A championship already scored with the old rules finishes under those rules.
  const rulesVersion = entry && JSON.parse(entry.results).some(result => result.gapMs === undefined) ? 2 : 3;
  const demo = body.demo === true && mode === 'track';
  let track;
  if (streetMatch) {
    track = streetMatch.track;
    trackId = track.id;
  } else if (demo) {
    track = { name: DEMO_TRACK.name, lenght: DEMO_TRACK.distanceKm * 1000, builds: DEMO_TRACK.sections.map(section => ({ section })) };
    trackId = null;
  } else if (mode === 'street' && body.customTrackId !== undefined) {
    const custom = await tx.customTrack.findUnique({ where: { id: positiveId(body.customTrackId) }, include: { sections: { include: { section: true }, orderBy: { ord: 'asc' } } } });
    if (!custom) fail(404, 'Tracciato personalizzato inesistente');
    track = { name: custom.name, lenght: custom.sections.length * 1000, builds: custom.sections };
  } else if (trackId) {
    track = await tx.track.findUnique({ where: { id: trackId }, include: { builds: { include: { section: true }, orderBy: { ord: 'asc' } }, meteo: true, surface: true } });
    if (!track) fail(404, 'Tracciato inesistente');
  } else {
    const all = (await tx.track.findMany({ include: { builds: { include: { section: true }, orderBy: { ord: 'asc' } }, meteo: true, surface: true }, orderBy: { id: 'asc' } })).filter(track => {
      const catalog = trackCatalogInfo(track.name);
      return !catalog || catalog.format === (mode === 'street' ? 'point-to-point' : 'circuit');
    });
    if (!all.length) fail(400, 'Nessun tracciato disponibile');
    track = all[mode === 'street' ? randomInt(all.length) : 0];
    trackId = track.id;
  }
  const sections = track.builds.map(build => build.section);
  if (!sections.length || sections.length > 200) fail(400, 'Il tracciato deve avere da 1 a 200 settori');
  for (const section of demo ? [] : sections) {
    const carKeys = [section.carStat, section.carTech].map(key => key === 'braking' ? 'brake' : key);
    if (!carKeys.every(key => CAR_STATS.includes(key)) || ![section.driverStat, section.driverTech].every(key => PILOT_STATS.includes(key))) fail(400, 'Il tracciato contiene statistiche non riconosciute');
  }
  let opponentCar, opponentPilot, opponentName, sandbox = demo;
  if (streetMatch) {
    ({ opponentCar, opponentPilot, opponentName } = streetMatch);
  } else if (mode === 'street' && body.opponentId !== undefined) {
    const opponent = await tx.customOpponent.findUnique({ where: { id: positiveId(body.opponentId) }, include: { car: { include: { brand: true } } } });
    if (!opponent) fail(404, 'Avversario personalizzato inesistente');
    opponentCar = opponent.car;
    opponentPilot = Object.fromEntries(PILOT_STATS.map(key => [key, opponent[key]]));
    opponentName = opponent.name;
    sandbox = true;
  } else {
    const allCars = await tx.car.findMany({ include: { brand: true }, orderBy: { id: 'asc' } });
    if (!allCars.length) fail(400, 'Catalogo auto vuoto');
    // Similar matchmaking selects a real catalogue car. Its stats never scale with the player.
    const index = car => (car.cv / Math.max(400, car.kg)) * 1000;
    const demoPresets = { matched: { ratio: 1, skill: 30 }, rookie: { ratio: 1.25, skill: 5 }, trained: { ratio: 1.25, skill: 40 }, superior: { ratio: 2, skill: 40 } };
    if (demo && !Object.hasOwn(demoPresets, body.demoPreset || 'matched')) fail(400, 'Scenario di prova non valido');
    const preset = demo ? demoPresets[body.demoPreset || 'matched'] : null;
    const sorted = allCars.slice().sort((a, b) => Math.abs(index(a) - index(garage) * (preset?.ratio || 1)) - Math.abs(index(b) - index(garage) * (preset?.ratio || 1)));
    opponentCar = demo ? sorted[0] : round ? allCars.find(car => car.name.toLowerCase() === round.opponentCarName.toLowerCase()) || sorted[Math.min(allCars.length - 1, Math.max(0, Math.round(round.opponentDifficulty * 2) - 1))]
      : body.opponentKind === 'random' ? allCars[randomInt(allCars.length)] : sorted[randomInt(Math.min(3, sorted.length))];
    const difficulty = round?.opponentDifficulty || 1;
    opponentPilot = Object.fromEntries(PILOT_STATS.map(key => [key, Math.max(1, Math.round(preset?.skill || (rulesVersion === 2 ? 12 : 24) * difficulty))]));
    if (demo && preset.ratio > 1 && index(opponentCar) < index(garage) * 1.1) fail(400, 'Nel catalogo non c’è una vettura abbastanza superiore: prova lo scenario equivalente o un’auto meno potente');
    opponentName = demo ? preset.skill === 5 ? 'Principiante · auto più potente' : preset.ratio >= 2 ? 'Pilota preparato · auto superiore' : preset.ratio > 1 ? 'Pilota preparato · auto più potente' : 'Pilota equivalente' : round?.opponentName || 'Pilota rivale';
  }
  if (mode === 'street' && body.customTrackId !== undefined) sandbox = true;
  if (streetMatch && streetMatch.wager > 0) await charge(tx, userId, streetMatch.wager);
  const inv = await inventory(tx, userId);
  const seed = randomInt(1, 2147483647);
  const distanceKm = demo ? DEMO_TRACK.distanceKm : Math.max(1, Number(track.lenght || sections.length) / (Number(track.lenght) >= 100 ? 1000 : 1));
  const routeProfile = routeProfileFor(mode, track.name);
  const plan = incidentPlan(seed, rulesVersion === 3 ? Math.min(8, sections.length) : 0, routeProfile);
  const raceSections = rulesVersion === 3 ? demo ? structuredClone(DEMO_TRACK.sections) : buildTacticalTrack(sections, distanceKm, routeProfile) : sections;
  const state = {
    rulesVersion, developmentVersion: 1, demo, routeProfile, trackMap: demo ? DEMO_TRACK.mapPaths : null, incidentPlan: plan, incidentCue: incidentCue(plan, 0), trackName: track.name, trackId, sections: raceSections, geometrySource: demo ? 'authored' : 'inferred', environment: { weather: track.meteo?.name || 'Asciutto', surface: track.surface?.name || 'Asfalto' },
    distanceKm, playerTime: 0, opponentTime: 0, gapSeconds: 0, playerSpeed: 0, opponentSpeed: 0,
    car: carSnapshot(garage), pilot,
    opponent: { name: opponentName, car: { ...opponentCar, name: opponentCar.name, engineHealth: 100, tireGrip: 100, km: 0, serviceKm: 0, currentFuel: 20, fuelType: 'Normale', ...(streetMatch?.opponentCondition || {}) }, pilot: opponentPilot },
    moves: inv.moves.filter(move => inv.equippedMoves.includes(move.id)), index: 0, gap: 0, logs: [], rng: seed,
    finished: false, sandbox, entryId: entry?.id || null, round: round?.ord || null,
    wager: streetMatch?.wager || 0,
    ...(streetMatch ? { street: streetMatch.street } : {})
  };
  const race = await tx.raceSession.create({ data: { userId, garageId: garage.id, mode, seed, state: JSON.stringify(state) } });
  return snapshot(tx, userId, race);
}
async function settleChampionship(tx, userId, state) {
  const entry = await tx.championshipEntry.findFirst({ where: { id: state.entryId, userId, status: 'active', currentRound: state.round }, include: includeChampionship });
  if (!entry) fail(409, 'Il round non è più attivo');
  const win = state.outcome === 'win', draw = state.outcome === 'draw';
  const points = entry.playerPoints + (win ? 3 : draw ? 1 : 0);
  const opponentPoints = entry.opponentPoints + (win ? 0 : draw ? 1 : 3);
  const gapDifference = entry.gapDifference + (state.failure ? -Math.max(state.rulesVersion === 3 ? 30000 : 1, Math.abs(state.gap)) : state.gap);
  const final = state.round === entry.championship.rounds.length;
  const champion = points > opponentPoints || (points === opponentPoints && gapDifference >= 0);
  const round = entry.championship.rounds.find(round => round.ord === state.round);
  const results = [...JSON.parse(entry.results), { round: state.round, trackId: state.trackId, trackName: state.trackName, opponentName: round.opponentName, gap: state.gap, ...(state.rulesVersion === 3 ? { gapMs: state.gap, gapSeconds: state.gapSeconds } : {}), outcome: state.outcome, playerPoints: win ? 3 : draw ? 1 : 0, opponentPoints: win ? 0 : draw ? 1 : 3 }];
  await tx.championshipEntry.update({ where: { id: entry.id }, data: { currentRound: final ? state.round : state.round + 1, playerPoints: points, opponentPoints, gapDifference, results: JSON.stringify(results), status: final ? 'completed' : 'active' } });
  state.championship = { completed: final, champion: final ? champion : null, playerPoints: points, opponentPoints, nextRound: final ? null : state.round + 1 };
  return { money: final ? champion ? entry.championship.rewardMoney : Math.floor(entry.championship.rewardMoney * 0.25) : 0,
    xp: final ? champion ? entry.championship.rewardXp : Math.floor(entry.championship.rewardXp * 0.5) : 0 };
}
async function turnRace(tx, userId, body, raceId, abandon = false) {
  const race = await tx.raceSession.findFirst({ where: { id: raceId, userId } });
  if (!race) fail(404, 'Gara inesistente');
  if (race.status !== 'active') fail(409, 'Gara già conclusa');
  if (!Number.isSafeInteger(body.version) || race.version !== body.version) fail(409, 'Il settore è già stato giocato. Ricarica la gara.');
  let state = JSON.parse(race.state);
  if (abandon) { state.finished = true; state.outcome = 'loss'; state.failure = 'abandoned'; }
  else {
    if (body.moveId !== null && typeof body.moveId !== 'string') fail(400, 'Scegli una mossa o la guida normale');
    try { state = advanceRace(state, body.moveId, body.decision); } catch (error) { fail(400, error.message); }
  }
  if (state.lesson) {
    if (!abandon) state.logs.at(-1).instructor = state.courseTechniqueId ? techniqueLessonFeedback(state) : lessonFeedback(state);
    if (state.courseTechniqueId && !state.finished) state.gapSeconds = state.sections[state.index].scenarioGap;
  } else {
    const garage = await tx.garage.findFirst({ where: { id: race.garageId, userId } });
    if (!garage) fail(409, 'La vettura della gara non è più disponibile');
    await tx.garage.update({ where: { id: garage.id }, data: { km: Math.round(state.car.km), currentFuel: state.car.currentFuel, tireGrip: state.car.tireGrip, engineHealth: state.car.engineHealth } });
  }
  if (state.finished) {
    let reward = { money: 0, xp: 0 };
    if (state.street) reward = await settleStreet(tx, userId, state);
    else if (race.mode === 'championship') reward = await settleChampionship(tx, userId, state);
    else if (!state.sandbox && state.outcome === 'win') reward = race.mode === 'street' ? { money: 1500, xp: 150 } : { money: 500, xp: 100 };
    else if (!state.sandbox && race.mode === 'street' && state.outcome === 'draw') reward = { money: 500, xp: 50 };
    const growth = await settleDevelopment(tx, userId, state);
    // Participation XP is smaller than a win and excludes sandboxes, failures and incomplete races.
    if (!state.street && state.developmentVersion === 1 && !state.sandbox && !state.failure && state.index === state.sections.length && reward.xp === 0) reward.xp = 20;
    reward.xp += growth.xp;
    const user = await tx.user.findUnique({ where: { id: userId } });
    await tx.user.update({ where: { id: userId }, data: { moneyCents: { increment: cents(reward.money) }, exp: { increment: reward.xp }, level: Math.floor((user.exp + reward.xp) / 1000) + 1 } });
    state.reward = reward;
  }
  const updated = await tx.raceSession.updateMany({ where: { id: race.id, version: body.version, status: 'active' }, data: { version: { increment: 1 }, state: JSON.stringify(state), status: state.finished ? abandon ? 'abandoned' : 'completed' : 'active' } });
  if (updated.count !== 1) fail(409, 'Settore già registrato');
  return snapshot(tx, userId, await tx.raceSession.findUnique({ where: { id: race.id } }));
}
module.exports = { presentRace, snapshot, startRace, turnRace, performance };
