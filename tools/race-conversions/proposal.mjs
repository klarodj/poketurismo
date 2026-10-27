// Experimental preview only. Not imported by game, purchase endpoints or race contracts.
import {newCarPrice} from '../../shared/carEconomy.mjs';
import {tuningMetrics} from '../../shared/tuning.mjs';

export const PROPOSAL_VERSION = 1;
export const PROFILES = Object.freeze({
  club: {name:'Preparazione di club',weightRate:.09,maxKg:145,turnSlow:6,turnFast:6,brake:9,dragPenalty:.005,costFactor:1},
  cup: {name:'Monomarca',weightRate:.10,maxKg:150,turnSlow:7,turnFast:7,brake:10,dragPenalty:.005,costFactor:1.05},
  rally: {name:'Rally su asfalto',weightRate:.09,maxKg:155,turnSlow:8,turnFast:6,brake:10,dragPenalty:.01,costFactor:1.1},
  touring: {name:'Turismo',weightRate:.12,maxKg:180,turnSlow:7,turnFast:9,brake:11,dragPenalty:.012,costFactor:1.2},
  gt: {name:'Gran Turismo',weightRate:.07,maxKg:110,turnSlow:6,turnFast:8,brake:9,dragPenalty:.015,costFactor:1.35},
});
const roundPrice = value => Math.ceil(value / 500) * 500;
export function proposalPrice(stock,profile='club') {
  const p=PROFILES[profile];if(!p)throw Error('Profilo sconosciuto');
  return roundPrice(Math.max(25000,(15000+newCarPrice(stock)*.55)*p.costFactor));
}
export function proposalConversion(garage,profile='club') {
  const p=PROFILES[profile];if(!p)throw Error('Profilo sconosciuto');
  const stock=garage.car||garage;
  if(!Number.isFinite(stock.kg)||!Number.isFinite(garage.kg))throw Error('Peso non valido');
  const before={...garage,car:stock};
  const after={...before,mods:[...(garage.mods||[])]};
  if(garage.raceConversion)return {before,after,alreadyConverted:true,price:0};
  const saving=Math.min(p.maxKg,Math.round(stock.kg*p.weightRate));
  after.kg=Math.min(garage.kg,stock.kg-saving);
  // A prepared chassis supplies a minimum setup, never an additive bonus on top of the best parts.
  for(const key of ['turnSlow','turnFast','brake'])after[key]=Math.max(garage[key],Math.min(96,stock[key]+p[key]));
  // A small wing/appendage drag cost; the engine and attainable power remain exactly the same.
  after.velMax=(garage.velMax??stock.velMax)*(1-p.dragPenalty);
  after.raceConversion={version:PROPOSAL_VERSION,profile};
  return {before,after,alreadyConverted:false,price:proposalPrice(stock,profile)};
}
export function proposalMetrics(garage,profile='club') {
  const result=proposalConversion(garage,profile);
  return {...result,beforeMetrics:tuningMetrics(result.before),afterMetrics:tuningMetrics(result.after)};
}
