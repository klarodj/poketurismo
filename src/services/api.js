const BASE_URL = 'http://localhost:3001/api';

export const fetchPlayer = async (id = 1) => {
  const res = await fetch(`${BASE_URL}/player/${id}`);
  if (!res.ok) throw new Error('Failed to fetch player');
  return res.json();
};

export const equipCar = async (userId, garageId) => {
  const res = await fetch(`${BASE_URL}/player/${userId}/equip`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ carDrive: garageId })
  });
  if (!res.ok) throw new Error('Failed to equip car');
  return res.json();
};

export const fetchCars = async () => {
  const res = await fetch(`${BASE_URL}/cars`);
  if (!res.ok) throw new Error('Failed to fetch cars');
  return res.json();
};

export const fetchBrands = async () => {
  const res = await fetch(`${BASE_URL}/brands`);
  if (!res.ok) throw new Error('Failed to fetch brands');
  return res.json();
};

export const fetchGarage = async (userId = 1) => {
  const res = await fetch(`${BASE_URL}/garage/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch garage');
  return res.json();
};

export const fetchTracks = async () => {
  const res = await fetch(`${BASE_URL}/tracks`);
  if (!res.ok) throw new Error('Failed to fetch tracks');
  return res.json();
};

export const fetchMarket = async () => {
  const res = await fetch(`${BASE_URL}/market`);
  if (!res.ok) throw new Error('Failed to fetch market');
  return res.json();
};

export const purchaseCar = async (userId, carId, price) => {
  const res = await fetch(`${BASE_URL}/purchase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, carId, price })
  });
  if (!res.ok) throw new Error('Purchase failed');
  return res.json();
};

export const fetchParts = async () => {
  const res = await fetch(`${BASE_URL}/parts`);
  if (!res.ok) throw new Error('Failed to fetch parts');
  return res.json();
};

export const sellCar = async (userId, garageId) => {
  const res = await fetch(`${BASE_URL}/market/sell`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, garageId })
  });
  if (!res.ok) throw new Error('Failed to sell car');
  return res.json();
};

export const unmountPart = async (garageId, modId) => {
  const res = await fetch(`${BASE_URL}/garage/${garageId}/mods/${modId}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Unmount failed');
  return res.json();
};

export const mountPart = async (garageId, partId) => {
  const res = await fetch(`${BASE_URL}/garage/${garageId}/mount`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ partId })
  });
  if (!res.ok) throw new Error('Mount failed');
  return res.json();
};

export const fetchChampionships = async () => {
  const res = await fetch(`${BASE_URL}/championships`);
  if (!res.ok) throw new Error('Failed to fetch championships');
  return res.json();
};

export const fetchTrainingSessions = async () => {
  const res = await fetch(`${BASE_URL}/training-sessions`);
  if (!res.ok) throw new Error('Failed to fetch training sessions');
  return res.json();
};

export const completeTraining = async (sessionId, userId) => {
  const res = await fetch(`${BASE_URL}/training-sessions/${sessionId}/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });
  if (!res.ok) throw new Error('Training completion failed');
  return res.json();
};

