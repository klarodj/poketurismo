import { createLessonState, LESSON } from './driverDevelopment.mjs';
import { contextDescription } from './techniqueCatalog.mjs';
const PACE = { balanced: 'ritmo pulito', save: 'ritmo conservativo', attack: 'attacco' };
const BRAKING = { early: 'frenata anticipata', optimal: 'frenata al riferimento', late: 'staccata tardiva' };
const LINE = { exit: 'uscita privilegiata', apex: 'percorrenza privilegiata', defend: 'interno protetto' };
const MANOEUVRE = { prepare: 'prepara il sorpasso', overtake: 'tenta il sorpasso', defend: 'difendi la posizione', hold: 'mantieni il ritmo' };
function lessonText(technique) {
  if (technique.id === 'progressive-release') return LESSON;
  return { title: technique.name, paragraphs: [technique.description,
    `Contesto utile: ${contextDescription(technique.conditions)}. Fuori da questo contesto la tecnica non è selezionabile.`,
    'Il beneficio riguarda le abilità del pilota durante il settore: non aggiunge potenza, grip o statistiche permanenti alla vettura. Puoi attivare una sola tecnica per settore, tra le quattro equipaggiate.',
    `Nella prova segui le consegne dell’istruttore: servono ${technique.requiredCorrect} esercizi corretti su ${technique.exercises}. Conta la scelta effettivamente eseguita, non la vittoria o gli errori casuali. La vettura è in prestito e la prova non costa denaro.`,
    `La prima promozione insegna la tecnica e assegna ${technique.xp} XP. Le ripetizioni non danno XP o denaro: una prova superata può aggiungere un punto di pratica, fino al limite di 60.`],
    reward: `Prima promozione: tecnica ${technique.name} e ${technique.xp} XP.` };
}
function createTechniqueLesson(technique, pilot, seed) {
  const state = createLessonState(pilot, seed);
  if (technique.id === 'progressive-release') return state;
  const c = technique.conditions;
  const straight = c.geometry === 'straight' || !!c.manoeuvre;
  const route = c.route || 'circuit';
  const weather = { wet: 'Pioggia', snow: 'Neve', lowVisibility: 'Nebbia', dry: 'Asciutto' }[c.weather] || 'Asciutto';
  state.lesson = technique.lessonId; state.courseTechniqueId = technique.id; state.trainingDuel = technique.path === 'duels';
  state.trackName = `Scuola guida · ${technique.name}`;
  state.routeProfile = { kind: route, format: 'exercise', traffic: 'none' };
  state.environment = { weather, surface: c.surface === 'loose' ? 'Sterrato' : 'Asfalto' };
  state.sections = Array.from({ length: technique.exercises }, (_, index) => {
    const radius = c.geometry === 'slowCorner' ? 22 : c.geometry === 'fastCorner' ? 140 : [38, 65, 24, 90][index % 4];
    const grade = c.geometry === 'uphill' ? 0.06 : c.geometry === 'downhill' ? -0.06 : 0;
    const segments = straight ? [{ lengthM: 350, radiusM: 0, widthM: 12, grade }]
      : c.geometry === 'chicane' ? [{ lengthM: 90, radiusM: 30, widthM: 12, grade }, { lengthM: 110, radiusM: 45, widthM: 12, grade }]
      : [{ lengthM: 220, radiusM: 0, widthM: 12, grade }, { lengthM: 100, radiusM: radius, widthM: 12, grade }];
    const pace = c.pace || (index % 2 ? 'save' : 'balanced');
    const braking = straight ? 'optimal' : c.braking || (index % 2 ? 'early' : 'optimal');
    const line = straight ? 'exit' : c.line || (index % 3 === 1 ? 'apex' : 'exit');
    const manoeuvre = c.manoeuvre === 'prepare' && index === technique.exercises - 1 ? 'hold' : c.manoeuvre || 'hold';
    const goal = { pace, braking, line, manoeuvre };
    const description = [PACE[pace], ...(!straight ? [BRAKING[braking], LINE[line]] : []), MANOEUVRE[manoeuvre]].join(' · ');
    return { id: `${technique.id}-${index}`, name: `Esercizio ${index + 1} · ${technique.name}`, type: straight ? 'Rettilineo' : c.geometry === 'chicane' ? 'Chicane' : 'Tornante', segments,
      visibilityM: c.visibility === 'limited' ? 100 : route === 'road' ? 160 : 1000,
      geometrySource: 'authored', goal, instruction: description[0].toUpperCase() + description.slice(1) + '.',
      scenarioGap: manoeuvre === 'defend' ? 0.4 : c.position === 'behind' || state.trainingDuel ? -0.4 : 0 };
  });
  state.distanceKm = state.sections.flatMap(section => section.segments).reduce((sum, segment) => sum + segment.lengthM, 0) / 1000;
  state.gapSeconds = state.sections[0].scenarioGap;
  return state;
}
function techniqueLessonFeedback(state, index = state.logs.length - 1) {
  const goal = state.sections[index]?.goal, decision = state.logs[index]?.decision;
  if (!goal || !decision) return null;
  const correct = Object.entries(goal).every(([key, value]) => decision[key] === value);
  return { correct, message: correct ? 'Esercizio centrato: scelte coerenti con la consegna.' : `Da riprovare: ${state.sections[index].instruction}` };
}
export { lessonText, createTechniqueLesson, techniqueLessonFeedback };
