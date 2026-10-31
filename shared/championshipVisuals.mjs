import {periodCupName} from './periodWorld.mjs';
export const AUTODROME_IMAGES={events:'/images/world/events/club-events.png',northern:'/images/world/sections/autodrome-cups-v2.png','aci-csai':'/images/world/sections/autodrome-aci-v2.png',single:'/images/world/sections/autodrome-race-v2.png',times:'/images/world/places/cronometraggio.png'};
const covers={
 'Coppa Primi Giri':'primi-giri',
 'Trofeo Aspirato · Club':'aspirato',
 'Trofeo GT 280 · Nord Italia':'gt-280',
 'Coppa Italiane · Passione':'italiane',
 'Trofeo Trazione Posteriore':'posteriore',
 'Coppa Gran Turismo · Club del Nord':'gt-club',
 'Coppa Piccole Turismo · ACI CSAI':'aci-piccole',
 'Trofeo Turismo 1600 · ACI CSAI':'aci-1600',
 'Coppa Superproduzione 2000 · ACI CSAI':'aci-2000',
 'Trofeo Superturismo · ACI CSAI':'aci-superturismo',
 'Coppa Gran Turismo · ACI CSAI':'aci-gt',
};
export function championshipCover(name){const id=covers[periodCupName(name)];return id?`/images/world/championships/${id}.png`:null;}
