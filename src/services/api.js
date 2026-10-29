import useRequestStore from '../store/requestStore.js';
const isFunnel = window.location.hostname.includes('ts.net');
const BASE_URL = import.meta.env?.VITE_API_BASE_URL || (isFunnel ? '/api' : `http://${window.location.hostname}:3001/api`);
let snapshotHandler = () => {};
export const setSnapshotHandler = handler => { snapshotHandler = handler; };
const inFlight = new Map();
let storageKey = 'poketurismo-pending-operations-v2';
let contextVersion = 0;
let tokenProvider = null;
export function configureIdentity(subject, getToken) {
  contextVersion++;
  tokenProvider = subject && subject !== 'legacy' ? getToken : null;
  inFlight.clear();
  storageKey = 'poketurismo-pending-operations-v3:' + (subject || 'signed-out');
  try { pendingKeys = JSON.parse(sessionStorage.getItem(storageKey) || '{}'); } catch { pendingKeys = {}; }
  if (!pendingKeys || typeof pendingKeys !== 'object' || Array.isArray(pendingKeys)) pendingKeys = {};
  useRequestStore.setState({ pending: 0, error: '', retry: null });
}
function accountChanged() { const error = new Error('Account cambiato: risposta precedente ignorata'); error.status = 499; return error; }
let pendingKeys;
try { pendingKeys = JSON.parse(sessionStorage.getItem(storageKey) || '{}'); if (!pendingKeys || typeof pendingKeys !== 'object' || Array.isArray(pendingKeys)) pendingKeys = {}; } catch { pendingKeys = {}; }
function savePending() { try { sessionStorage.setItem(storageKey, JSON.stringify(pendingKeys)); } catch { /* Requests remain safe during this session. */ } }
async function request(path, method = 'GET', body) {
  const version = contextVersion;
  const headers = body ? { 'Content-Type': 'application/json' } : {};
  if (tokenProvider) { const token = await tokenProvider(); if (token) headers.Authorization = 'Bearer ' + token; }
  if (version !== contextVersion) throw accountChanged();
  const response = await fetch(`${BASE_URL}${path}`, { method, headers, ...(body ? { body: JSON.stringify(body) } : {}) });
  const data = await response.json();
  if (version !== contextVersion) throw accountChanged();
  if (!response.ok) { const error = new Error(data.error || 'Operazione non riuscita'); error.status = response.status; throw error; }
  return data;
}
export const newOperationId = (provider = crypto) => typeof provider.randomUUID === 'function' ? provider.randomUUID() : Array.from(provider.getRandomValues(new Uint8Array(24)), byte => byte.toString(16).padStart(2, '0')).join('');
export function action(path, body, method = 'POST') {
  const version = contextVersion;
  const fingerprint = JSON.stringify({ path, method, body });
  if (inFlight.has(fingerprint)) return inFlight.get(fingerprint);
  pendingKeys[fingerprint] ||= newOperationId();
  savePending();
  const payload = { ...body, operationId: pendingKeys[fingerprint] };
  useRequestStore.setState(state => ({ pending: state.pending + 1, error: '', retry: null }));
  const promise = request(path, method, payload).then(data => {
    if (version !== contextVersion) throw accountChanged();
    delete pendingKeys[fingerprint]; savePending(); snapshotHandler(data); return data;
  }).catch(error => {
    if (version !== contextVersion || error.status === 499) throw error;
    if (error.status && error.status < 500) { delete pendingKeys[fingerprint]; savePending(); }
    useRequestStore.setState({ error: error.message, retry: !error.status || error.status >= 500 ? () => action(path, body, method).catch(() => {}) : null });
    throw error;
  }).finally(() => {
    if (version !== contextVersion) return;
    inFlight.delete(fingerprint);
    useRequestStore.setState(state => ({ pending: Math.max(0, state.pending - 1) }));
  });
  inFlight.set(fingerprint, promise);
  return promise;
}
export const fetchState = (id = 1) => request(`/state/${id}`);
export const fetchPlayer = (id = 1) => request(`/player/${id}`);
export const fetchGarage = (id = 1) => request(`/garage/${id}`);
export const fetchInventory = (id = 1) => request(`/inventory/${id}`);
export const fetchCars = () => request('/cars');
export const fetchBrands = () => request('/brands');
export const fetchMarket = () => request('/market');
export const fetchMeet = userId => request(`/meet?userId=${userId}`);
export const displayMeetCar = (userId, garageId) => action('/meet/showcase', { userId, garageId });
export const fetchMeetLeaderboard = (trackId, modelId, setupKey, fuelVersion=3) => request(`/meet/leaderboard?trackId=${trackId}&modelId=${modelId}&fuelVersion=${fuelVersion}${setupKey ? `&setupKey=${setupKey}` : ''}`);
export const fetchParts = () => request('/parts');
export const fetchTuning = (userId,garageId) => request(`/tuning/${userId}${garageId?`?garageId=${garageId}`:''}`);
export const fetchTimeTrials = userId => request(`/time-trials/${userId}`);
export const fetchTracks = () => request('/tracks');
export const fetchStreetHub = userId => request(`/street/${userId}`);
export const findStreetOpponent = (userId, setup) => action('/street/encounter', { userId, ...setup });
export const fetchChampionships = () => request('/championships');
export const fetchTrainingSessions = () => request('/training-sessions');
export const fetchActiveChampionshipEntry = id => request(`/championship-entries/active/${id}`);
export const fetchChampionshipHistory = id => request(`/championship-entries/history/${id}`);
export const fetchChampionshipEntry = (id, userId) => request(`/championship-entries/${id}?userId=${userId}`);
export const equipCar = (userId, carDrive) => action(`/player/${userId}/equip`, { userId, carDrive }, 'PUT');
export const purchaseCar = (userId, carId, marketGarageId,paintColour) => action('/purchase', { userId, ...(marketGarageId ? { marketGarageId } : { carId,...(paintColour?{paintColour}:{}) }) });
export const sellCar = (userId, garageId) => action('/market/sell', { userId, garageId });
export const purchasePart = (userId, partId, preparation) => action('/parts/purchase', { userId, partId, ...preparation });
export const mountPart = (garageId, partId, userId, quoteKey) => action(`/garage/${garageId}/mount`, { userId, partId, ...(quoteKey ? {quoteKey}: {}) });
export const unmountPart = (garageId, modId, userId) => action(`/garage/${garageId}/mods/${modId}`, { userId }, 'DELETE');
export const fetchWorkshop = userId => request(`/workshop/${userId}`);
export const recoverAtWorkshop = (userId, quoteKey) => action('/workshop/recover', {userId,quoteKey});
export const repayWorkshop = (userId, amount) => action('/workshop/repay', {userId,amount});
export const performCarService = (garageId, userId, serviceType, quoteKey) => action(`/garage/${garageId}/service`, { userId, serviceType, quoteKey });
export const refuelCar = (garageId, userId, liters, fuelType) => action(`/garage/${garageId}/refuel`, { userId, liters, fuelType });
export const equipMoves = (userId, moveIds) => action(`/player/${userId}/moves`, { userId, moveIds }, 'PUT');
export const enterChampionship = (championshipId, userId) => action(`/championships/${championshipId}/enter`, { userId });
export const completeTraining = (id, userId) => action(`/training-sessions/${id}/complete`, { userId });
export const fetchActiveRace = userId => request(`/races/active/${userId}`);
export const fetchRace = (id, userId) => request(`/races/${id}?userId=${userId}`);
export const startRace = (userId, setup) => action('/races', { userId, ...setup });
export const playRaceTurn = (id, userId, version, moveId, decision) => action(`/races/${id}/turns`, { userId, version, moveId, ...(decision ? { decision } : {}) });
export const abandonRace = (id, userId, version) => action(`/races/${id}/abandon`, { userId, version });
export const fetchTrackSections = () => request('/track-sections');
export const fetchCustomOpponents = () => request('/dev/opponents').catch(error => { if (error.status === 403) return []; throw error; });
export const fetchCustomTracks = () => request('/dev/tracks').catch(error => { if (error.status === 403) return []; throw error; });
export const createCustomOpponent = body => request('/dev/opponents', 'POST', body);
export const createCustomTrack = body => request('/dev/tracks', 'POST', body);

export const readDrivingLesson = userId => action('/driver/lesson', { userId });

export const fetchAuthConfig = () => request('/auth/config');
export const fetchAccount = () => request('/account/me');
export const createPilot = body => request('/account/pilot', 'POST', body);

export const readTechniqueLesson = (userId, techniqueId) => action('/driver/techniques/read', { userId, techniqueId });

export const fetchMeetSocial=userId=>request(`/meet/social/${userId}`);
export const fetchMeetConversation=(userId,peerId,before)=>request(`/meet/conversation/${peerId}?userId=${userId}${before?`&before=${encodeURIComponent(before)}`:''}`);
export const sendMeetMessage=(userId,peerId,text)=>action('/meet/message',{userId,peerId,text});
export const readMeetMessages=(userId,peerId,throughId)=>action('/meet/read',{userId,peerId,throughId});
export const blockMeetPilot=(userId,peerId,blocked)=>action('/meet/block',{userId,peerId,blocked});
export const reportMeetPilot=(userId,peerId,reason,messageId)=>action('/meet/report',{userId,peerId,reason,...(messageId?{messageId}:{})});
export const inviteMeetChallenge=(userId,setup)=>action('/meet/challenge',{userId,...setup});
export const respondMeetChallenge=(userId,setup)=>action('/meet/challenge/respond',{userId,...setup});
export const startMeetChallenge=(userId,challengeId)=>action('/meet/challenge/start',{userId,challengeId});
export const fetchMeetReports=userId=>request(`/meet/reports/${userId}`);
export const resolveMeetReport=(userId,reportId)=>action('/meet/report/resolve',{userId,reportId});

export const changePilotAvatar=(userId,avatar)=>action(`/player/${userId}/avatar`,{userId,avatar});

export const fetchPhoneNotifications=userId=>request(`/phone/${userId}/notifications`);
export const fetchPhoneInbox=userId=>request(`/phone/${userId}`);

export const changeFriendship=(userId,peerId,choice,requestKey)=>action('/meet/friendship',{userId,peerId,action:choice,...(requestKey?{requestKey}:{})});

export const repaintCar=(garageId,userId,paintColour,quoteKey)=>action(`/garage/${garageId}/paint`,{userId,paintColour,quoteKey});

export const prepareCarForRace=(garageId,userId,quoteKey)=>action(`/garage/${garageId}/race-preparation`,{userId,quoteKey,confirmPermanent:true,confirmTrackOnly:true});

export const allocatePilotPoints=(userId,allocations)=>action('/driver/points',{userId,allocations});
