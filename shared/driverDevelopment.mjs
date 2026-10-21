import { sectionFeatures } from './raceContext.mjs';
const LESSON_ID = 'braking-basics';
const TECHNIQUE_ID = 'progressive-release';
const PRACTICE_CAP = 120;
const TECHNIQUE_CAP = 60;
const BRAKING_NAMES = { early: 'Frenata con margine', optimal: 'Frenata al riferimento', late: 'Staccata tardiva' };
const PRACTICE_FIELDS = { early: 'earlyPractice', optimal: 'referencePractice', late: 'latePractice' };
const LESSON = {
  id: LESSON_ID, title: 'Frenare con criterio',
  description: 'Impara a scegliere il margine e a preparare l’uscita. L’auto scuola è in prestito: la tua vettura non consuma carburante e non si usura.',
  paragraphs: [
    'Anticipare la frenata lascia un margine per stabilizzare la vettura. È utile con poco grip o quando vuoi privilegiare la sicurezza, ma può costare tempo.',
    'Frenare al riferimento è il punto di partenza per una guida costante. Con la pratica diventi più preciso e riduci gli errori.',
    'Ritardare la staccata può aiutare un attacco. Richiede precisione: anche un esperto può compromettere l’uscita, soprattutto sul bagnato.',
    'Nella prova scegli il tipo di frenata indicato e un ritmo pulito o conservativo. Servono almeno tre esercizi corretti, comprendendo tutti e tre i tipi di frenata. Gli errori casuali non ti fanno perdere l’esame.'
  ],
  reward: 'Prima promozione: +40 XP, pratica iniziale e tecnica Rilascio progressivo. Ripetere la prova non assegna altri premi.'
};
const LESSON_SECTIONS = [
  { name: 'Avvicinamento con margine', segments: [{ lengthM: 250, radiusM: 0, widthM: 12 }], braking: 'early', instruction: 'L’istruttore chiede un approccio stabile: anticipa la staccata con ritmo pulito o conservativo.' },
  { name: 'Tornante al riferimento', segments: [{ lengthM: 90, radiusM: 22, widthM: 9 }], braking: 'optimal', instruction: 'Ora cerca costanza: frena al riferimento, senza attaccare.' },
  { name: 'Staccata controllata', segments: [{ lengthM: 300, radiusM: 0, widthM: 12 }], braking: 'late', instruction: 'Su questo approccio asciutto prova una staccata tardiva. Mantieni ritmo pulito o conservativo per isolare la frenata.' },
  { name: 'Ritrovare il rilancio', segments: [{ lengthM: 100, radiusM: 28, widthM: 9 }, { lengthM: 120, radiusM: 0, widthM: 12 }], braking: 'optimal', instruction: 'Torna al riferimento e privilegia l’uscita. Evita l’attacco: l’obiettivo è guidare con precisione.' }
].map((section, index) => ({ ...section, id: `lesson-${index}`, type: section.segments.some(segment => segment.radiusM) ? 'Tornante' : 'Rettilineo', geometrySource: 'authored', visibilityM: 1000 }));
function fundamentals(row) {
  return Object.fromEntries(Object.entries(PRACTICE_FIELDS).map(([key, field]) => [key, Math.min(PRACTICE_CAP, Math.max(0, row?.[field] || 0))]));
}
function brakingFamiliarity(pilot, decision) {
  return Math.min(1, Math.max(0, pilot.fundamentals?.[decision.braking] || 0) / PRACTICE_CAP);
}
function learnedTechnique(points = 0) {
  const grade = points >= TECHNIQUE_CAP ? 2 : points >= 20 ? 1 : 0;
  return { id: TECHNIQUE_ID, name: 'Rilascio progressivo', description: 'Moduli il rilascio del freno per comporre l’ingresso. Migliora precisione e pulizia nelle zone di frenata, senza aumentare l’aderenza.',
    trigger: 'Braking-Zone', bonus: { brake: 2 + grade, clean: 1 + grade }, skillBonus: { brake: 2 + grade, clean: 1 + grade },
    costGrip: 0.2, costHealth: 0, aggressiveness: 1.05, mastery: ['Appresa', 'Consolidata', 'Padroneggiata'][grade] };
}
function lessonFeedback(state, index = state.logs.length - 1) {
  const log = state.logs[index], goal = LESSON_SECTIONS[index];
  if (!log || !goal) return null;
  const correct = log.decision?.braking === goal.braking && ['save', 'balanced'].includes(log.decision.pace) && (index !== 3 || log.decision.line === 'exit');
  return { correct, braking: goal.braking, message: correct ? 'Esercizio centrato: hai scelto il margine richiesto.' : `Da riprovare: serviva ${BRAKING_NAMES[goal.braking].toLowerCase()}, con ritmo pulito o conservativo${index === 3 ? ' e uscita privilegiata' : ''}.` };
}
function practiceFromRace(state) {
  const gains = { early: 0, optimal: 0, late: 0 };
  let technique = 0;
  for (let index = 0; index < state.logs.length; index++) {
    const log = state.logs[index], section = state.sections[index];
    if (!sectionFeatures(section, state.sections[index + 1], state.routeProfile).hasBrakingZone || !log.decision || log.playerSeconds === undefined) continue;
    const key = log.decision.braking;
    if (!Object.hasOwn(gains, key)) continue;
    // Even an error teaches a little; clean execution adds one point.
    gains[key] = Math.min(6, gains[key] + (log.mistakeSeconds > 0 ? 1 : 2));
    if (log.moveId === TECHNIQUE_ID) technique = Math.min(6, technique + (log.mistakeSeconds > 0 ? 1 : 2));
  }
  return { gains, technique };
}
function publicDevelopment(row) {
  const practice = fundamentals(row);
  return { fundamentals: practice, cap: PRACTICE_CAP, techniquePractice: row?.techniquePractice || 0, techniqueCap: TECHNIQUE_CAP,
    lessonRead: row?.lessonRead || false, lessonPassed: row?.lessonPassed || false,
    technique: row?.lessonPassed ? learnedTechnique(row.techniquePractice) : null, lesson: LESSON,
    trainingCourses: JSON.parse(row?.trainingCourses || '{}') };
}
function createLessonState(pilot, seed) {
  const car = { name: 'Compatta Scuola', brand: 'Scuola guida', image: '106.png', cv: 120, baseCv: 120, kg: 1100, baseKg: 1100, velMax: 180, zeroToHundred: 10, brake: 65, turnSlow: 65, turnFast: 60, driveType: 'FF', currentFuel: 20, tireGrip: 100, engineHealth: 100, km: 0, serviceKm: 0, fuelType: 'Normale' };
  return { rulesVersion: 3, developmentVersion: 1, lesson: LESSON_ID, trackName: 'Scuola guida · Fondamentali della frenata', trackId: null,
    sections: structuredClone(LESSON_SECTIONS), geometrySource: 'authored', routeProfile: { kind: 'circuit', format: 'exercise', traffic: 'none' },
    environment: { weather: 'Asciutto', surface: 'Asfalto' }, distanceKm: LESSON_SECTIONS.flatMap(section => section.segments).reduce((sum, segment) => sum + segment.lengthM, 0) / 1000,
    car, pilot, opponent: { name: 'Istruttore · riferimento didattico', car: structuredClone(car), pilot: Object.fromEntries(Object.keys(pilot).filter(key => key !== 'fundamentals').map(key => [key, 30])) },
    index: 0, logs: [], moves: [], gap: 0, gapSeconds: 0, playerTime: 0, opponentTime: 0, playerSpeed: 0, opponentSpeed: 0, rng: seed, finished: false, sandbox: true, wager: 0, incidentPlan: null, incidentCue: null };
}
// Kept separate from the lesson: normal Circuito Scuola sessions still use its own geometry.
export { LESSON_ID, TECHNIQUE_ID, PRACTICE_CAP, TECHNIQUE_CAP, BRAKING_NAMES, PRACTICE_FIELDS, LESSON, LESSON_SECTIONS, fundamentals, brakingFamiliarity, learnedTechnique, lessonFeedback, practiceFromRace, publicDevelopment, createLessonState };
