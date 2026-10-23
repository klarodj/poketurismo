export const CHALLENGE_STATUSES={pending:'Invito in attesa',accepted:'Sfida attiva',completed:'Sfida conclusa',declined:'Invito rifiutato',cancelled:'Sfida annullata',expired:'Invito scaduto'};
export function challengeCarAllowed(challenge,car){return !!car&&(challenge.format==='model'?car.modelId===challenge.modelId:car.performanceIndex>=challenge.minIP&&car.performanceIndex<=challenge.maxIP);}
export function challengeContacts(contacts,ownerId){return contacts.filter(c=>c.id!==ownerId&&!c.blocked&&c.canMessage!==false);}
