const { fail } = require('./gameRules');
const { TECHNIQUES, TECHNIQUE_BY_ID, techniqueRecords, techniquePassed, publicCurriculum } = require('../shared/techniqueCatalog.mjs');
const { techniqueLessonFeedback } = require('../shared/techniqueLessons.mjs');
const { tacticalMovePlayable } = require('../shared/raceContext.mjs');
function requireCourse(row, level, technique) {
  if (!technique) fail(404, 'Tecnica non trovata');
  if (level < technique.minLevel) fail(403, `Serve il livello ${technique.minLevel}`);
  if (technique.prerequisite && !techniquePassed(row, technique.prerequisite)) fail(403, `Completa prima ${TECHNIQUE_BY_ID[technique.prerequisite].name}`);
}
async function readTechnique(tx, userId, body) {
  if (Object.keys(body).length !== 1 || typeof body.techniqueId !== 'string') fail(400, 'Scegli una tecnica senza inviare progressi');
  const technique = TECHNIQUE_BY_ID[body.techniqueId];
  const user = await tx.user.findUnique({ where: { id: userId } });
  const row = await tx.driverDevelopment.upsert({ where: { userId }, create: { userId }, update: {} });
  requireCourse(row, user.level, technique);
  if (technique.id === 'progressive-release') {
    await tx.driverDevelopment.update({ where: { userId }, data: { lessonRead: true } }); return;
  }
  const records = techniqueRecords(row);
  records[technique.id] = { ...records[technique.id], read: true };
  await tx.driverDevelopment.update({ where: { userId }, data: { techniqueProgress: JSON.stringify(records) } });
}
function requireTrial(row, level, lessonId) {
  const technique = TECHNIQUES.find(item => item.lessonId === lessonId);
  requireCourse(row, level, technique);
  const read = technique.id === 'progressive-release' ? row?.lessonRead : techniqueRecords(row)[technique.id]?.read;
  if (!read) fail(409, 'Leggi prima la lezione nella scuola guida');
  return technique;
}
async function settleTechniqueCourse(tx, userId, state, row, summary) {
  const technique = TECHNIQUE_BY_ID[state.courseTechniqueId];
  const user = await tx.user.findUnique({ where: { id: userId } });
  requireCourse(row, user.level, technique);
  const records = techniqueRecords(row), record = records[technique.id] || {};
  if (!record.read) fail(409, 'Leggi prima la lezione');
  const results = state.logs.map((_, index) => techniqueLessonFeedback(state, index));
  const correct = results.filter(item => item?.correct).length;
  const passed = results.length === technique.exercises && correct >= technique.requiredCorrect;
  summary.lesson = { passed, correct, total: technique.exercises }; state.outcome = passed ? 'win' : 'loss';
  if (!passed) { summary.message = `Prova da ripetere: ${correct}/${technique.exercises} esercizi corretti, ne servono ${technique.requiredCorrect}. Nessun costo sulla tua auto.`; return summary; }
  if (record.passed) {
    const gain = Math.min(1, 60 - (record.practice || 0));
    record.practice = (record.practice || 0) + gain;
    summary.techniqueGains = { [technique.id]: gain };
    summary.message = `Prova superata: +${gain} pratica di ${technique.name}. Nessun altro premio in XP o denaro.`;
  } else {
    record.passed = true; record.practice = 0;
    summary.xp = technique.xp; summary.unlockedTechnique = technique.id;
    summary.message = `Promosso! Hai appreso ${technique.name}. +${technique.xp} XP.`;
    const progress = await tx.playerProgress.upsert({ where: { userId }, create: { userId, equippedMoves: '[]' }, update: {} });
    const equipped = JSON.parse(progress.equippedMoves);
    if (equipped.length < 4 && !equipped.includes(technique.id)) await tx.playerProgress.update({ where: { userId }, data: { equippedMoves: JSON.stringify([...equipped, technique.id]) } });
  }
  record.bestScore = Math.max(record.bestScore || 0, correct); records[technique.id] = record;
  await tx.driverDevelopment.update({ where: { userId }, data: { techniqueProgress: JSON.stringify(records) } });
  return summary;
}
async function practiceTechniques(tx, userId, row, state) {
  const records = techniqueRecords(row), candidates = {};
  for (let index = 0; index < state.logs.length; index++) {
    const log = state.logs[index], technique = TECHNIQUE_BY_ID[log.moveId];
    if (!technique || technique.id === 'progressive-release' || !records[technique.id]?.passed || log.playerSeconds === undefined) continue;
    const move = state.moves.find(item => item.id === technique.id);
    if (!move || !tacticalMovePlayable(move, state.sections[index], state.sections[index + 1], log.contextGapSeconds, state, log.decision)) continue;
    candidates[technique.id] = Math.min(6, (candidates[technique.id] || 0) + (log.mistakeSeconds > 0 ? 1 : 2));
  }
  const gains = {};
  for (const [id, amount] of Object.entries(candidates)) {
    const record = records[id], route = state.demo ? 'demo' : `track-${state.trackId}`;
    const routes = record.routes || {}, uses = routes[route] || 0;
    gains[id] = Math.min(60 - (record.practice || 0), Math.max(1, Math.floor(amount * [1, 0.5, 0.25][Math.min(2, uses)])));
    record.practice = (record.practice || 0) + gains[id]; routes[route] = Math.min(3, uses + 1); record.routes = routes;
  }
  if (Object.keys(gains).length) await tx.driverDevelopment.update({ where: { userId }, data: { techniqueProgress: JSON.stringify(records) } });
  return gains;
}
module.exports = { readTechnique, requireTrial, settleTechniqueCourse, practiceTechniques, publicCurriculum };
