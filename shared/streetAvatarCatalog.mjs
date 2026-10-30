// Cosmetic identities only: fixed across encounters, saves and catalogue reordering.
export const STREET_AVATARS = Object.freeze([
  {
    "id": "barista-man",
    "label": "Il barista",
    "gender": "uomo"
  },
  {
    "id": "elettricista-man",
    "label": "L’elettricista",
    "gender": "uomo"
  },
  {
    "id": "rappresentante-man",
    "label": "Il rappresentante",
    "gender": "uomo"
  },
  {
    "id": "itis-man",
    "label": "Lo studente dell’ITIS",
    "gender": "uomo"
  },
  {
    "id": "portiere-notte-man",
    "label": "Il portiere di notte",
    "gender": "uomo"
  },
  {
    "id": "corriere-man",
    "label": "Il corriere",
    "gender": "uomo"
  },
  {
    "id": "dj-man",
    "label": "Il disc jockey",
    "gender": "uomo"
  },
  {
    "id": "ciclista-man",
    "label": "Il ciclista urbano",
    "gender": "uomo"
  },
  {
    "id": "alpinista-man",
    "label": "L’escursionista",
    "gender": "uomo"
  },
  {
    "id": "papa-kart-man",
    "label": "Il papà del kartodromo",
    "gender": "uomo"
  },
  {
    "id": "camionista-man",
    "label": "Il camionista",
    "gender": "uomo"
  },
  {
    "id": "collezionista-man",
    "label": "Il collezionista",
    "gender": "uomo"
  },
  {
    "id": "ferroviere-man",
    "label": "Il ferroviere",
    "gender": "uomo"
  },
  {
    "id": "benzinaio-man",
    "label": "Il benzinaio",
    "gender": "uomo"
  },
  {
    "id": "saldatore-man",
    "label": "Il saldatore",
    "gender": "uomo"
  },
  {
    "id": "turnista-woman",
    "label": "La turnista",
    "gender": "donna"
  },
  {
    "id": "informatica-woman",
    "label": "L’informatica",
    "gender": "donna"
  },
  {
    "id": "itis-woman",
    "label": "La studentessa dell’ITIS",
    "gender": "donna"
  },
  {
    "id": "soccorritrice-woman",
    "label": "La volontaria del soccorso",
    "gender": "donna"
  },
  {
    "id": "tassista-woman",
    "label": "La tassista",
    "gender": "donna"
  },
  {
    "id": "commessa-woman",
    "label": "La commessa",
    "gender": "donna"
  },
  {
    "id": "skater-woman",
    "label": "La skater",
    "gender": "donna"
  },
  {
    "id": "fotografa-woman",
    "label": "La fotografa dei rally",
    "gender": "donna"
  },
  {
    "id": "universitaria-woman",
    "label": "La ricercatrice",
    "gender": "donna"
  },
  {
    "id": "tecnica-diesel-woman",
    "label": "La tecnica diesel",
    "gender": "donna"
  },
  {
    "id": "restauratrice-woman",
    "label": "La restauratrice",
    "gender": "donna"
  },
  {
    "id": "studentessa-arte-woman",
    "label": "La studentessa d’arte",
    "gender": "donna"
  },
  {
    "id": "commissaria-woman",
    "label": "La commissaria di percorso",
    "gender": "donna"
  },
  {
    "id": "architetta-woman",
    "label": "L’architetta",
    "gender": "donna"
  },
  {
    "id": "cuoca-woman",
    "label": "La cuoca del bar",
    "gender": "donna"
  }
]);
const assignments = Object.freeze({
  "parking-1": "barista-man",
  "parking-2": "itis-woman",
  "parking-3": "itis-man",
  "parking-4": "dj-man",
  "parking-5": "corriere-man",
  "parking-6": "commessa-woman",
  "parking-7": "elettricista-man",
  "parking-8": "skater-woman",
  "industrial-1": "elettricista-man",
  "industrial-2": "turnista-woman",
  "industrial-3": "saldatore-man",
  "industrial-4": "tecnica-diesel-woman",
  "industrial-5": "ciclista-man",
  "industrial-6": "benzinaio-man",
  "industrial-7": "restauratrice-woman",
  "industrial-8": "ferroviere-man",
  "coast-1": "fotografa-woman",
  "coast-2": "camionista-man",
  "coast-3": "informatica-woman",
  "coast-4": "papa-kart-man",
  "coast-5": "soccorritrice-woman",
  "coast-6": "collezionista-man",
  "coast-7": "universitaria-woman",
  "coast-8": "alpinista-man",
  "mountain-1": "portiere-notte-man",
  "mountain-2": "rappresentante-man",
  "mountain-3": "tassista-woman",
  "mountain-4": "rappresentante-man",
  "mountain-5": "commissaria-woman",
  "mountain-6": "saldatore-man",
  "mountain-7": "studentessa-arte-woman",
  "mountain-8": "architetta-woman",
  "highway-1": "dj-man",
  "highway-2": "corriere-man",
  "highway-3": "cuoca-woman",
  "highway-4": "itis-man",
  "highway-5": "portiere-notte-man",
  "highway-6": "informatica-woman",
  "highway-7": "collezionista-man",
  "highway-8": "fotografa-woman"
});
export function streetRivalAvatar(rivalId){ return Object.hasOwn(assignments,rivalId) ? assignments[rivalId] : null; }
export function streetAvatar(id){ return STREET_AVATARS.find(avatar=>avatar.id===id) || null; }
