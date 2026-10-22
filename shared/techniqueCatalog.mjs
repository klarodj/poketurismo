// Server-owned curriculum. Bonuses affect driver execution, never vehicle specifications.
const DIFFICULTIES = [
  { name: 'Base', level: 1, exercises: 4, correct: 3, bonus: [2, 1], xp: 40 },
  { name: 'Intermedia', level: 4, exercises: 5, correct: 4, bonus: [3, 1], xp: 60 },
  { name: 'Avanzata', level: 8, exercises: 6, correct: 5, bonus: [3, 2], xp: 80 },
  { name: 'Esperta', level: 13, exercises: 7, correct: 6, bonus: [4, 2], xp: 100 },
  { name: 'Specialistica', level: 20, exercises: 8, correct: 7, bonus: [4, 3], xp: 120 },
];
// id, name, primary ability, secondary ability, context, teaching focus
const PATHS = [
  { id: 'braking', name: 'Frenata', offset: 0, techniques: [
    ['progressive-release', 'Rilascio progressivo', 'brake', 'clean', { geometry: 'braking' }, 'Rilascia gradualmente il freno per comporre l’ingresso senza chiedere più aderenza alle gomme.'],
    ['braking-reference', 'Riferimenti di staccata', 'brake', 'reflex', { geometry: 'braking', braking: 'optimal' }, 'Scegli un riferimento ripetibile e frena con costanza prima dell’inserimento.'],
    ['downhill-braking', 'Staccata in discesa', 'brake', 'clean', { geometry: 'downhill', braking: 'early' }, 'Anticipa la decelerazione quando la pendenza allunga l’approccio alla curva.'],
    ['late-braking', 'Staccata controllata', 'brake', 'brave', { geometry: 'braking', braking: 'late', weather: 'dry' }, 'Gestisci una staccata tardiva sull’asciutto: il rischio rimane maggiore della frenata al riferimento.'],
    ['trail-braking', 'Ingresso sul freno', 'brake', 'turn', { geometry: 'slowCorner', braking: 'optimal', weather: 'dry' }, 'Coordina decelerazione e inserimento nei tornanti, mantenendo un margine regolare.'],
  ] },
  { id: 'cornering', name: 'Curve e traiettorie', offset: 0, techniques: [
    ['exit-line', 'Uscita preparata', 'turn', 'throttle', { geometry: 'corner', line: 'exit' }, 'Sacrifica una parte della percorrenza per preparare il rilancio.'],
    ['hairpin-line', 'Tornante rotondo', 'turn', 'clean', { geometry: 'slowCorner', line: 'apex' }, 'Mantieni una traiettoria regolare nelle curve strette senza brusche correzioni.'],
    ['linked-corners', 'Curve concatenate', 'turn', 'reflex', { geometry: 'chicane' }, 'Collega due cambi di direzione senza trattarli come curve isolate.'],
    ['fast-apex', 'Appoggio veloce', 'turn', 'brave', { geometry: 'fastCorner', line: 'apex', weather: 'dry' }, 'Cerca la percorrenza nelle curve ampie, entro il limite fisico della vettura.'],
    ['circuit-line', 'Traiettoria da qualifica', 'turn', 'clean', { geometry: 'corner', route: 'circuit', line: 'apex', weather: 'dry' }, 'Ripeti la linea ideale su un circuito noto; non è una tecnica universale per la strada.'],
  ] },
  { id: 'throttle', name: 'Accelerazione e trazione', offset: 0, techniques: [
    ['progressive-throttle', 'Gas progressivo', 'throttle', 'clean', { geometry: 'corner', line: 'exit' }, 'Apri il gas con gradualità nel rilancio, senza trasformarlo in potenza aggiuntiva.'],
    ['straight-pickup', 'Ripresa pulita', 'throttle', 'shift', { geometry: 'straight', pace: 'balanced' }, 'Coordina acceleratore e cambiate durante l’allungo.'],
    ['uphill-pickup', 'Rilancio in salita', 'throttle', 'shift', { geometry: 'uphill' }, 'Mantieni una ripresa ordinata quando la pendenza assorbe accelerazione.'],
    ['wet-exit', 'Trazione sul bagnato', 'throttle', 'reflex', { geometry: 'corner', weather: 'wet', line: 'exit' }, 'Prepara l’uscita con poco grip e riduci le correzioni brusche.'],
    ['corner-launch', 'Rilancio concatenato', 'throttle', 'turn', { geometry: 'chicane', line: 'exit', weather: 'dry' }, 'Coordina cambi di direzione e riapertura del gas nelle varianti.'],
  ] },
  { id: 'gearbox', name: 'Cambio e coordinazione', offset: 1, techniques: [
    ['clean-shift', 'Cambiata precisa', 'shift', 'clean', { geometry: 'straight' }, 'Rendi costanti le cambiate durante l’accelerazione sul rettilineo.'],
    ['braking-downshift', 'Scalata coordinata', 'shift', 'brake', { geometry: 'braking', braking: 'optimal' }, 'Coordina scalata e frenata al riferimento per preparare l’inserimento.'],
    ['heel-toe', 'Punta-tacco', 'shift', 'brake', { geometry: 'slowCorner', braking: 'optimal', weather: 'dry' }, 'Unisci controllo del cambio e frenata nelle curve lente.'],
    ['uphill-shift', 'Cambiata in salita', 'shift', 'throttle', { geometry: 'uphill' }, 'Riduci le esitazioni del cambio quando il tracciato sale.'],
    ['technical-sequence', 'Sequenza di cambiate', 'shift', 'reflex', { geometry: 'chicane', route: 'circuit' }, 'Coordina più cambiate e cambi di direzione in una sequenza tecnica.'],
  ] },
  { id: 'control', name: 'Controllo della vettura', offset: 1, techniques: [
    ['weight-balance', 'Assetto composto', 'acro', 'clean', { geometry: 'corner', pace: 'balanced' }, 'Evita comandi bruschi durante il trasferimento di carico in curva.'],
    ['hairpin-correction', 'Correzione nel tornante', 'acro', 'reflex', { geometry: 'slowCorner' }, 'Recupera una piccola imprecisione senza aggiungere una seconda correzione eccessiva.'],
    ['direction-change', 'Cambio di appoggio', 'acro', 'turn', { geometry: 'chicane' }, 'Accompagna il passaggio da un appoggio all’altro nelle esse.'],
    ['loose-recovery', 'Recupero su fondo mobile', 'acro', 'reflex', { surface: 'loose', geometry: 'corner' }, 'Contieni gli effetti di una correzione sul fondo cedevole, senza annullarne il rischio.'],
    ['fast-recovery', 'Controllo in appoggio', 'acro', 'turn', { geometry: 'fastCorner', weather: 'dry' }, 'Gestisci gli errori di esecuzione nelle curve ampie e veloci.'],
  ] },
  { id: 'awareness', name: 'Lettura e riflessi', offset: 1, techniques: [
    ['road-reading', 'Sguardo lontano', 'reflex', 'clean', { route: 'road', pace: 'balanced' }, 'Leggi la strada prima di arrivare al punto di decisione.'],
    ['blind-approach', 'Approccio a visibilità ridotta', 'reflex', 'brake', { visibility: 'limited', braking: 'early' }, 'Lascia margine quando non puoi leggere con anticipo tutto il settore.'],
    ['night-reading', 'Riferimenti notturni', 'reflex', 'clean', { weather: 'lowVisibility', pace: 'save' }, 'Riduci il ritmo e usa riferimenti stabili nella nebbia o di notte.'],
    ['urban-sequence', 'Lettura del misto urbano', 'reflex', 'turn', { route: 'road', geometry: 'chicane' }, 'Anticipa i cambi di direzione su un percorso stradale tecnico.'],
    ['mountain-reading', 'Anticipo sul passo', 'reflex', 'brake', { route: 'road', geometry: 'downhill' }, 'Leggi pendenza e approccio alla curva prima di impegnare la discesa.'],
  ] },
  { id: 'duels', name: 'Duelli e decisione', offset: 2, techniques: [
    ['patient-chase', 'Inseguimento paziente', 'brave', 'clean', { position: 'behind', pace: 'balanced' }, 'Rimani lucido quando sei dietro: il bonus non cancella il distacco.'],
    ['prepared-pass', 'Sorpasso preparato', 'brave', 'throttle', { manoeuvre: 'prepare' }, 'Prepara il rilancio prima del rettilineo invece di forzare un attacco distante.'],
    ['controlled-pass', 'Attacco con margine', 'brave', 'reflex', { manoeuvre: 'overtake', weather: 'dry' }, 'Scegli un tentativo a contatto quando spazio e visibilità lo consentono.'],
    ['defensive-line', 'Difesa ordinata', 'brave', 'turn', { manoeuvre: 'defend' }, 'Proteggi la posizione con un rivale vicino, accettando il costo della linea difensiva.'],
    ['wet-duel', 'Duello sul bagnato', 'brave', 'clean', { position: 'behind', weather: 'wet', pace: 'balanced' }, 'Gestisci la pressione dietro a un avversario quando il grip è ridotto.'],
  ] },
  { id: 'wet', name: 'Pioggia e bassa aderenza', offset: 2, techniques: [
    ['wet-margin', 'Margine sul bagnato', 'clean', 'brake', { weather: 'wet', geometry: 'braking', braking: 'early' }, 'Anticipa la frenata e conserva margine sull’asfalto bagnato.'],
    ['wet-reference', 'Riferimenti sul bagnato', 'brake', 'reflex', { weather: 'wet', geometry: 'braking', braking: 'optimal' }, 'Scegli una frenata ripetibile in condizioni di pioggia.'],
    ['wet-line', 'Linea sul bagnato', 'turn', 'clean', { weather: 'wet', geometry: 'corner', line: 'exit' }, 'Privilegia un’uscita composta invece della massima percorrenza.'],
    ['snow-control', 'Controllo sulla neve', 'acro', 'throttle', { weather: 'snow', pace: 'save' }, 'Usa comandi progressivi e ritmo prudente: la neve conserva il suo limite di grip.'],
    ['snow-corner', 'Tornante innevato', 'turn', 'brake', { weather: 'snow', geometry: 'slowCorner', braking: 'early' }, 'Prepara la curva stretta con anticipo e affrontala entro il poco grip disponibile.'],
  ] },
  { id: 'surfaces', name: 'Sterrato e percorsi difficili', offset: 2, techniques: [
    ['gravel-margin', 'Fondo letto', 'reflex', 'clean', { surface: 'loose', pace: 'save' }, 'Adatta il ritmo alla terra e alla ghiaia, senza contare sul grip dell’asfalto.'],
    ['gravel-entry', 'Ingresso su sterrato', 'brake', 'turn', { surface: 'loose', geometry: 'corner', braking: 'early' }, 'Prepara la frenata prima di inserire la vettura sul fondo mobile.'],
    ['gravel-exit', 'Rilancio su ghiaia', 'throttle', 'acro', { surface: 'loose', geometry: 'corner', line: 'exit' }, 'Coordina controllo e acceleratore per uscire dalle curve sullo sterrato.'],
    ['mountain-hairpin', 'Tornante di montagna', 'turn', 'brake', { route: 'road', geometry: 'slowCorner' }, 'Costruisci una traiettoria stretta su strada, rispettando spazio e visibilità.'],
    ['gravel-descent', 'Discesa su sterrato', 'acro', 'brake', { surface: 'loose', geometry: 'downhill', route: 'road' }, 'Coordina frenata e controllo in discesa quando anche il fondo è cedevole.'],
  ] },
  { id: 'management', name: 'Costanza e gestione', offset: 0, techniques: [
    ['smooth-driving', 'Guida regolare', 'clean', 'reflex', { pace: 'balanced' }, 'Mantieni comandi regolari con un ritmo pulito. Il beneficio è piccolo ma utilizzabile spesso.'],
    ['measured-throttle', 'Gas misurato', 'throttle', 'shift', { pace: 'save', geometry: 'straight' }, 'Coordina gas e cambio durante gli allunghi a ritmo conservativo.'],
    ['long-run', 'Costanza sul circuito', 'clean', 'shift', { route: 'circuit', pace: 'balanced' }, 'Ripeti un’esecuzione regolare in circuito, senza un bonus alla potenza.'],
    ['road-composure', 'Regolarità stradale', 'clean', 'reflex', { route: 'road', pace: 'save' }, 'Mantieni un’esecuzione composta sui percorsi stradali conservando margine.'],
    ['technical-consistency', 'Costanza nel misto', 'clean', 'turn', { geometry: 'chicane', route: 'circuit', pace: 'balanced' }, 'Collega con costanza una sequenza tecnica; il vantaggio resta limitato alla qualità di esecuzione.'],
  ] },
];
const TECHNIQUES = PATHS.flatMap(path => path.techniques.map(([id, name, primary, secondary, conditions, description], index) => {
  const difficulty = DIFFICULTIES[index];
  // Broad, frequently available contexts get smaller bonuses than specialists.
  const broad = !conditions.geometry && !conditions.weather && !conditions.surface && !conditions.manoeuvre;
  const bonus = [Math.max(1, difficulty.bonus[0] - (broad ? 1 : 0)), difficulty.bonus[1]];
  return Object.freeze({ id, name, primary, secondary, conditions, description, path: path.id, pathName: path.name,
    tier: index + 1, minLevel: difficulty.level + path.offset, difficulty: difficulty.name,
    prerequisite: index ? path.techniques[index - 1][0] : null, exercises: difficulty.exercises, requiredCorrect: difficulty.correct,
    xp: difficulty.xp, bonus: { [primary]: bonus[0], [secondary]: bonus[1] }, costGrip: index < 2 ? 0 : (index - 1) * 0.1,
    lessonId: id === 'progressive-release' ? 'braking-basics' : `course-${id}` });
}));
const TECHNIQUE_BY_ID = Object.fromEntries(TECHNIQUES.map(item => [item.id, item]));
const CONTEXT_NAMES = { braking: 'zone di frenata', corner: 'curve', slowCorner: 'tornanti', fastCorner: 'curve veloci', chicane: 'esse e varianti', straight: 'rettilinei', uphill: 'salita', downhill: 'discesa', wet: 'pioggia', dry: 'asciutto', snow: 'neve', lowVisibility: 'notte o nebbia', loose: 'terra o ghiaia', road: 'strada', circuit: 'circuito', limited: 'visibilità ridotta', behind: 'in recupero', early: 'frenata anticipata', optimal: 'frenata al riferimento', late: 'staccata tardiva', exit: 'uscita privilegiata', apex: 'percorrenza privilegiata', save: 'ritmo conservativo', balanced: 'ritmo pulito', prepare: 'preparazione sorpasso', overtake: 'sorpasso', defend: 'difesa' };
function contextDescription(conditions) { return Object.values(conditions).map(value => CONTEXT_NAMES[value] || value).join(' · '); }
function techniqueMove(technique, practice = 0) {
  const grade = practice >= 60 ? 2 : practice >= 20 ? 1 : 0;
  const bonus = { ...technique.bonus };
  if (grade >= 1) bonus[technique.primary]++;
  if (grade >= 2) bonus[technique.secondary]++;
  return { id: technique.id, name: technique.name, description: technique.description, trigger: 'Context', conditions: technique.conditions,
    bonus, skillBonus: bonus, costGrip: technique.costGrip, costHealth: 0, aggressiveness: 1,
    mastery: ['Appresa', 'Consolidata', 'Padroneggiata'][grade], contextDescription: contextDescription(technique.conditions) };
}
function techniqueRecords(row) { return JSON.parse(row?.techniqueProgress || '{}'); }
function techniquePassed(row, id) { return id === 'progressive-release' ? !!row?.lessonPassed : !!techniqueRecords(row)[id]?.passed; }
function publicCurriculum(row, level) {
  const records = techniqueRecords(row);
  return TECHNIQUES.map(technique => {
    const record = records[technique.id] || {};
    const learned = techniquePassed(row, technique.id), read = technique.id === 'progressive-release' ? !!row?.lessonRead : !!record.read;
    const unlocked = level >= technique.minLevel && (!technique.prerequisite || techniquePassed(row, technique.prerequisite));
    const practice = technique.id === 'progressive-release' ? row?.techniquePractice || 0 : record.practice || 0;
    return { ...technique, contextDescription: contextDescription(technique.conditions), learned, read, unlocked, practice,
      mastery: techniqueMove(technique, practice).mastery, effectiveBonus: techniqueMove(technique, practice).skillBonus };
  });
}
export { PATHS, DIFFICULTIES, TECHNIQUES, TECHNIQUE_BY_ID, contextDescription, techniqueMove, techniqueRecords, techniquePassed, publicCurriculum };
