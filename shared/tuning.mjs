import {performanceIndex} from './vehiclePerformance.mjs';
import {performance} from './raceEngine.mjs';
import {vehicleModel} from './tacticalRace.mjs';
export const PART_STAT_BONUSES={
 cv:['cvBonus',true],nm:['nmBonus',true],kg:['kgBonus',true,-1],
 speed:['speedBonus'],acceleration:['accelBonus'],revving:['revvBonus'],transmission:['transBonus'],
 turnSlow:['turnSlowBonus'],turnFast:['turnFastBonus'],brake:['brakeBonus'],traction:['tractBonus']
};
export function partStatDeltas(part,direction=1){
 return Object.fromEntries(Object.entries(PART_STAT_BONUSES).map(([stat,[bonus,integer,sign=1]])=>[stat,(integer?Math.round(part[bonus]):part[bonus])*sign*direction]));
}
export function restoredTuningStats(garage){
 return Object.fromEntries([['revving','revvBonus'],['transmission','transBonus'],['turnSlow','turnSlowBonus'],['turnFast','turnFastBonus']].map(([stat,bonus])=>[stat,garage.car[stat]+garage.mods.reduce((sum,mod)=>sum+mod.part[bonus],0)]));
}
export function replacePart(garage,part){
 const before={...garage,...restoredTuningStats(garage)};
 const installed=garage.mods.find(mod=>mod.part.name===part.name);
 const next={...before};
 if(installed?.partId===part.id)return {before,after:before,installed:installed.part,alreadyMounted:true};
 for(const[stat,value]of Object.entries(partStatDeltas(part)))next[stat]+=value;
 if(installed)for(const[stat,value]of Object.entries(partStatDeltas(installed.part,-1)))next[stat]+=value;
 next.mods=[...garage.mods.filter(mod=>mod!==installed),{partId:part.id,part}];
 return {before,after:next,installed:installed?.part||null,alreadyMounted:false};
}
export function tuningMetrics(garage){
 const base=garage.car||garage,input={...base,...garage,baseCv:base.cv,baseKg:base.kg};
 const model=vehicleModel(input),stats=performance(input);
 const round=n=>Number(n.toFixed(3));
 return {cv:garage.cv,nm:garage.nm,kg:garage.kg,performanceIndex:performanceIndex(garage),
 ...Object.fromEntries(Object.keys(PART_STAT_BONUSES).filter(key=>!['cv','nm','kg'].includes(key)).map(key=>[key,round(stats[key])])),
 topSpeedKmh:round(model.topSpeed*3.6),powerKw:round(model.power/1000),grip:round(model.mu),brakingMs2:round(model.brake),powerToWeight:round(model.power/model.mass)};
}
export function tuningAdvice(beforeCar,afterCar){
 const a=tuningMetrics(beforeCar),b=tuningMetrics(afterCar),tips=[];
 if(b.powerToWeight>a.powerToWeight+0.0001)tips.push('Rapporto potenza/peso migliore: utile nei rilanci e in accelerazione.');
 if(b.topSpeedKmh>a.topSpeedKmh+0.001)tips.push('Più allungo potenziale sui rettilinei; serve spazio per sfruttarlo.');
 if(b.grip>a.grip+0.0001)tips.push('Più aderenza in curva: utile sui percorsi tecnici. Su bagnato e sterrato resta il limite del fondo.');
 if(b.brakingMs2>a.brakingMs2+0.0001)tips.push('Frenata più efficace: utile nelle staccate e nei tratti con molte curve.');
 const physicalKeys=['powerToWeight','topSpeedKmh','grip','brakingMs2'];
 const decreases=physicalKeys.some(key=>b[key]<a[key]-0.0001);
 if(decreases)tips.push('Questa sostituzione peggiora almeno una prestazione: confronta tutti i valori prima di montare.');
 if(!tips.length)tips.push('Nessun beneficio di gara misurabile con questa sostituzione nelle condizioni attuali.');
 return tips;
}
