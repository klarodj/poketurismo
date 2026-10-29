const { fail } = require('./gameRules');
const { publicCurriculum, settleTechniqueCourse, practiceTechniques } = require('./techniqueSchool');
const { PRACTICE_FIELDS, PRACTICE_CAP, TECHNIQUE_CAP, TECHNIQUE_ID, LESSON_ID, publicDevelopment, lessonFeedback, practiceFromRace } = require('../shared/driverDevelopment.mjs');
async function development(tx, userId) {
  const row = await tx.driverDevelopment.findUnique({ where: { userId } });
  const user = await tx.user.findUnique({ where: { id: userId } });
  return { ...publicDevelopment(row), pilotPoints: require('../shared/pilotPoints.mjs').pilotPoints(user,row), targetedTraining: require('../shared/targetedTraining.mjs').trainingList(row,user.level), statPractice: require('../shared/targetedTraining.mjs').trainingRecord(row).practice, curriculum: publicCurriculum(row, user.level) };
}
async function readLesson(tx, userId, body) {
  if (Object.keys(body).length) fail(400, 'La lezione non accetta statistiche o progressi dal browser');
  await tx.driverDevelopment.upsert({ where: { userId }, create: { userId, lessonRead: true }, update: { lessonRead: true } });
}
async function settleDevelopment(tx, userId, state) {
  const summary = { gains: { early: 0, optimal: 0, late: 0 }, techniqueGain: 0, xp: 0, message: '' };
  state.developmentSummary = summary;
  if (state.developmentVersion !== 1 || state.rulesVersion !== 3 || state.failure || state.index !== state.sections.length) {
    summary.message = 'Nessun progresso assegnato: completa una gara o una prova valida.';
    return summary;
  }
  const row = await tx.driverDevelopment.upsert({ where: { userId }, create: { userId }, update: {} });
  if(state.targetedCourseId){await require('./targetedTraining').settle(tx,userId,state,row,summary);return summary;}
  if (state.courseTechniqueId) return settleTechniqueCourse(tx, userId, state, row, summary);
  if (state.lesson === LESSON_ID) {
    const exercises = state.logs.map((_, index) => lessonFeedback(state, index));
    const correct = exercises.filter(exercise => exercise.correct);
    const passed = correct.length >= 3 && new Set(correct.map(exercise => exercise.braking)).size === 3;
    summary.lesson = { passed, correct: correct.length, total: exercises.length };
    state.outcome = passed ? 'win' : 'loss';
    if (!passed) { summary.message = 'Prova da ripetere: controlla i consigli dell’istruttore. Nessun costo sulla tua vettura.'; return summary; }
    if (row.lessonPassed) { summary.message = 'Prova superata di nuovo. La prima promozione è già stata premiata.'; return summary; }
    if (!row.lessonRead) fail(409, 'Leggi la lezione prima della prova');
    const data = { lessonPassed: true };
    for (const [key, field] of Object.entries(PRACTICE_FIELDS)) { summary.gains[key] = Math.min(4, PRACTICE_CAP - row[field]); data[field] = row[field] + summary.gains[key]; }
    await tx.driverDevelopment.update({ where: { userId }, data });
    const progress = await tx.playerProgress.upsert({ where: { userId }, create: { userId }, update: {} });
    const equipped = JSON.parse(progress.equippedMoves);
    if (equipped.length < 4 && !equipped.includes(TECHNIQUE_ID)) await tx.playerProgress.update({ where: { userId }, data: { equippedMoves: JSON.stringify([...equipped, TECHNIQUE_ID]) } });
    summary.xp = 40; summary.unlockedTechnique = TECHNIQUE_ID;
    summary.message = 'Promosso! Hai appreso Rilascio progressivo. Puoi equipaggiarlo dal profilo pilota e consolidarlo nelle gare.';
    return summary;
  }
  if (state.sandbox && !state.demo) { summary.message = 'Le gare personalizzate non assegnano progressi permanenti.'; return summary; }
  const routes = JSON.parse(row.routePractice);
  // Same route across modes: switching track/street does not reset familiarity.
  const route = state.demo ? 'demo' : `track-${state.trackId}`;
  const stored = routes[route];
  const seen = typeof stored === 'number' ? { early: stored, optimal: stored, late: stored, technique: stored } : stored || {};
  const candidate = practiceFromRace(state);
  const factors = [];
  const data = {};
  for (const [key, field] of Object.entries(PRACTICE_FIELDS)) {
    const repeats = seen[key] || 0, factor = [1, 0.5, 0.25, 0][Math.min(3, repeats)];
    summary.gains[key] = Math.min(PRACTICE_CAP - row[field], Math.floor(candidate.gains[key] * factor));
    data[field] = row[field] + summary.gains[key];
    if (candidate.gains[key] > 0) { seen[key] = Math.min(3, repeats + 1); factors.push(factor); }
  }
  const techniqueRepeats = seen.technique || 0;
  const techniqueFactor = [1, 0.5, 0.25, 0][Math.min(3, techniqueRepeats)];
  summary.techniqueGain = row.lessonPassed ? Math.min(TECHNIQUE_CAP - row.techniquePractice, Math.floor(candidate.technique * techniqueFactor)) : 0;
  data.techniquePractice = row.techniquePractice + summary.techniqueGain;
  if (row.lessonPassed && candidate.technique > 0) { seen.technique = Math.min(3, techniqueRepeats + 1); factors.push(techniqueFactor); }
  // A pure straight consumes no allowance. Each fundamental and technique has its own repetition budget.
  if (factors.length) routes[route] = seen;
  data.routePractice = JSON.stringify(routes);
  await tx.driverDevelopment.update({ where: { userId }, data });
  summary.message = !factors.length ? 'Nessuna zona di frenata utile: questo percorso non ha assegnato pratica specifica.'
    : factors.every(factor => factor === 0) ? 'Hai assimilato queste scelte su questo percorso: varia frenata o tracciato per nuova pratica.'
    : factors.some(factor => factor < 1) ? 'Scelte già esercitate su questo percorso: pratica ridotta. Variare i tracciati aiuta a crescere.'
    : 'Hai fatto pratica nelle zone di frenata realmente affrontate.';
  summary.techniqueGains = await practiceTechniques(tx, userId, row, state);
  if (Object.values(summary.techniqueGains).some(gain => gain > 0)) summary.message += ' Hai consolidato le tecniche effettivamente usate.';
  await require('./targetedTraining').settle(tx,userId,state,await tx.driverDevelopment.findUnique({where:{userId}}),summary);
  const lateErrors = state.logs.filter(log => log.decision?.braking === 'late' && ((log.mistakeSeconds || 0) > 0 || (log.explanations || []).some(text => text.startsWith('Staccata tardiva:')))).length;
  if (lateErrors) summary.advice = 'Le staccate tardive hanno compromesso alcuni ingressi: confrontale con la frenata al riferimento.';
  return summary;
}
async function legacyTrainingUse(tx, userId, session) {
  const row = await tx.driverDevelopment.upsert({ where: { userId }, create: { userId }, update: {} });
  const courses = JSON.parse(row.trainingCourses), count = courses[session.id] || 0;
  if (count >= 3) fail(409, 'Corso già assimilato: scegli un altro allenamento o fai pratica in gara');
  courses[session.id] = count + 1;
  await tx.driverDevelopment.update({ where: { userId }, data: { trainingCourses: JSON.stringify(courses) } });
  return [1, 0.5, 0.25][count];
}
module.exports = { development, readLesson, settleDevelopment, legacyTrainingUse };
