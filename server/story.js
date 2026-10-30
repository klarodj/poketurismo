const { INTRO_MISSION, STORY_VERSION, STORY_CHARACTERS, storyCharacter } = require('../shared/storyCatalog.mjs');
const { fail } = require('./gameRules');
const { randomUUID } = require('node:crypto');
const OFFER_ID = 'club-first-finish-v1-offer';
async function load(tx, userId) {
  const row = await tx.playerProgress.findUnique({ where: { userId } });
  let value;
  try { value = JSON.parse(row?.narrativeState || '{}'); } catch { fail(409, 'Incarichi non leggibili: contatta l’amministratore senza azzerare i progressi'); }
  if (!value || typeof value !== 'object' || Array.isArray(value) || value.version && value.version !== STORY_VERSION) fail(409, 'Aggiorna il gioco per leggere gli incarichi');
  return { ...value, version: STORY_VERSION, missions: value.missions || {}, messages: value.messages || {}, known: value.known || [] };
}
async function save(tx, userId, value) {
  const narrativeState = JSON.stringify(value);
  await tx.playerProgress.upsert({ where: { userId }, create: { userId, narrativeState }, update: { narrativeState } });
}
function messageList(value) {
  return [{ id: OFFER_ID, senderId: INTRO_MISSION.senderId, missionId: INTRO_MISSION.id, text: INTRO_MISSION.offer, createdAt: null, readAt: value.offerReadAt || null }, ...Object.values(value.messages), ...(value.campaign?require('./clubStory').invitation(value):[])];
}
async function summary(tx, userId) {
  const value = await load(tx, userId);
  const unread = messageList(value).filter(message => !message.readAt);
  return { unread: unread.length, latest: unread.slice(-5).reverse().map(({ id, senderId, createdAt }) => ({ id, senderId, createdAt, name: storyCharacter(senderId).shortName })) };
}
async function hub(tx, userId) {
  const value = await load(tx, userId), record = value.missions[INTRO_MISSION.id], reputation=await require('./clubReputation').read(tx,userId,value);
  return { version: STORY_VERSION, reputation, characters: STORY_CHARACTERS.map(character => ({ ...Object.fromEntries(Object.entries(character).filter(([key]) => !['chapters', 'voice'].includes(key))), known: value.known.includes(character.id) })),
    missions: [{ id: INTRO_MISSION.id, version: record?.version || INTRO_MISSION.version, senderId: INTRO_MISSION.senderId, title: INTRO_MISSION.title, objective: INTRO_MISSION.objective, destination: INTRO_MISSION.destination, destinationLabel: INTRO_MISSION.destinationLabel, rewardMoney: record?.rewardMoney ?? INTRO_MISSION.rewardMoney, rewardXp: 0, status: record?.status || 'available', completedAt: record?.completedAt || null }, ...require('./clubStory').publicEpisodes(value),...reputation.invites.filter(e=>e.unlocked)],
    messages: messageList(value).reverse(), unread: messageList(value).filter(message => !message.readAt).length };
}
function addMessage(value, id, text) {
  if (!value.messages[id]) value.messages[id] = { id, senderId: INTRO_MISSION.senderId, missionId: INTRO_MISSION.id, text, createdAt: new Date().toISOString(), readAt: null };
}
async function respond(tx, userId, body) {
  if(require('./clubStory').clubEpisode(body.missionId)){const value=await load(tx,userId);await require('./clubStory').respond(tx,userId,body,value,save);return {story:await hub(tx,userId)};}
  if (body.missionId !== INTRO_MISSION.id || !['accept', 'pause', 'resume'].includes(body.choice)) fail(400, 'Risposta all’incarico non valida');
  const value = await load(tx, userId), previous = value.missions[INTRO_MISSION.id];
  if (previous?.status === 'completed') fail(409, 'Incarico già concluso: il bonus è unico');
  if (body.choice === 'pause') {
    if (!previous || !['accepted', 'in-progress'].includes(previous.status)) fail(409, 'Puoi mettere in pausa solo un incarico accettato');
    previous.status = 'paused';
    addMessage(value, `${INTRO_MISSION.id}-paused`, INTRO_MISSION.paused);
  } else {
    if (body.choice === 'accept' && previous || body.choice === 'resume' && previous?.status !== 'paused') fail(409, 'Incarico già aggiornato: ricarica il telefono');
    value.missions[INTRO_MISSION.id] = { ...previous, version: INTRO_MISSION.version, rewardMoney: previous?.rewardMoney ?? INTRO_MISSION.rewardMoney, status: 'accepted', attempt: randomUUID(), raceId: null };
    if (!value.known.includes(INTRO_MISSION.senderId)) value.known.push(INTRO_MISSION.senderId);
    addMessage(value, `${INTRO_MISSION.id}-accepted`, INTRO_MISSION.accepted);
  }
  await save(tx, userId, value);
  return { story: await hub(tx, userId) };
}
async function read(tx, userId, body) {
  const value = await load(tx, userId), message = messageList(value).find(item => item.id === body.messageId);
  if (!message) fail(404, 'SMS del club inesistente');
  if (!message.readAt) {
    if (message.id === OFFER_ID) value.offerReadAt = new Date().toISOString();
    else if(message.id.endsWith('-v1-offer')){value.campaign.readOffers||={};value.campaign.readOffers[message.missionId]=new Date().toISOString();}
    else value.messages[message.id].readAt = new Date().toISOString();
    await save(tx, userId, value);
  }
  return { story: await hub(tx, userId) };
}
function eligibleRace(mode, state) {
  return mode === 'track' && state.clubRewardVersion === 1 && !state.lesson && !state.sandbox && !state.demo && !state.timeTrial && !state.meetTrial && !state.entryId;
}
async function bindRace(tx, userId, mode, state, raceId) {
  if (!eligibleRace(mode, state)) return;
  const value = await load(tx, userId), mission = value.missions[INTRO_MISSION.id];
  if (!mission || !['accepted', 'in-progress'].includes(mission.status)) return;
  mission.status = 'in-progress'; mission.raceId = raceId;
  state.storyObjective = { id: INTRO_MISSION.id, version: mission.version, attempt: mission.attempt };
  await save(tx, userId, value);
}
// Called only by the authoritative final turn, in its serializable transaction.
// No API accepts client-supplied objective events, race results or reward amounts.
async function settleRace(tx, userId, race, state) {
  if (!eligibleRace(race.mode, state) || !state.storyObjective || !state.finished || state.failure || state.index !== state.sections.length) return null;
  const value = await load(tx, userId), mission = value.missions[INTRO_MISSION.id], objective = state.storyObjective;
  if (!mission || mission.status !== 'in-progress' || mission.raceId !== race.id || objective.id !== INTRO_MISSION.id || objective.version !== mission.version || objective.attempt !== mission.attempt) return null;
  mission.status = 'completed'; mission.completedAt = new Date().toISOString();
  addMessage(value, `${INTRO_MISSION.id}-completed`, INTRO_MISSION.completed);
  await save(tx, userId, value);
  return { id: INTRO_MISSION.id, title: INTRO_MISSION.title, money: mission.rewardMoney, xp: 0 };
}
module.exports = { load,save,hub, summary, respond, read, bindRace, settleRace };
