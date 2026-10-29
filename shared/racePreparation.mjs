import {RACE_PREPARATIONS} from './racePreparationCatalog.mjs';
import {newCarPrice} from './carEconomy.mjs';
import {raceRequirements} from './raceEquipment.mjs';
import {tuningMetrics} from './tuning.mjs';
export const RACE_PROFILES=Object.freeze({club:{name:'Club',weightRate:.12,maxKg:160,cost:1},cup:{name:'Monomarca',weightRate:.13,maxKg:170,cost:1.05},rally:{name:'Rally asfalto',weightRate:.12,maxKg:180,cost:1.1},touring:{name:'Turismo',weightRate:.14,maxKg:220,cost:1.2},gt:{name:'Gran Turismo',weightRate:.10,maxKg:200,cost:1.35}});
export function raceSpecification(car){return RACE_PREPARATIONS[car?.car?.image||car?.image]||null;}
export function racePreparationPrice(stock,profile='club'){return Math.ceil(Math.max(35000,(25000+newCarPrice(stock)*.6)*RACE_PROFILES[profile].cost)/1000)*1000;}
export function prepareRaceCar(garage){const stock=garage.car||garage,spec=raceSpecification(garage);if(!spec)throw Error('Preparazione non disponibile per questo modello');if(garage.racePrepared)return {...garage};const profile=RACE_PROFILES[spec.profile];const kg=Math.max(Math.ceil(stock.kg*.74),garage.kg-Math.min(profile.maxKg,Math.round(stock.kg*profile.weightRate)));return {...garage,kg,racePrepared:true};}
export function racePreparationPreview(garage){const spec=raceSpecification(garage),requirements=raceRequirements(garage),missing=requirements.filter(r=>r.installed!==3);const before=tuningMetrics(garage);return {available:Boolean(spec),converted:Boolean(garage.racePrepared),enabled:Boolean(spec)&&!garage.racePrepared&&!missing.length,requirements,profile:spec?RACE_PROFILES[spec.profile].name:null,name:spec?.name||'',price:spec?racePreparationPrice(garage.car||garage,spec.profile):0,before,after:spec?tuningMetrics(prepareRaceCar(garage)):before};}
