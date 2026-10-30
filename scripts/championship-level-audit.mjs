// Offline, read-only audit of catalog IG against legal starting profiles and level budgets.
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {CHAMPIONSHIP_CATALOG} from '../shared/championshipCatalog.mjs';
import {driverIndex} from '../shared/driverIndex.mjs';
import {POINTS_PER_LEVEL,PILOT_POINT_STATS,allocatePilotPoints} from '../shared/pilotPoints.mjs';
const require=createRequire(import.meta.url);
const profiles=require('../server/accounts').config().profiles;
function extremum(base,level,maximize){
 const stats={...base},allocations=Object.fromEntries(PILOT_POINT_STATS.map(k=>[k,0]));
 const budget=Math.min(POINTS_PER_LEVEL*(level-1),PILOT_POINT_STATS.reduce((n,k)=>n+100-stats[k],0)),cap=2*(level-1);
 // IG is the sum of identical concave skill curves: balance for the maximum,
 // concentrate on the highest eligible stat for the minimum. No copied IG formula.
 for(let point=0;point<budget;point++){
  const eligible=PILOT_POINT_STATS.filter(k=>allocations[k]<cap&&stats[k]<100);
  const key=eligible.reduce((best,k)=>!best||(maximize?stats[k]<stats[best]:stats[k]>stats[best])?k:best,null);
  if(!key)throw Error('Budget non distribuibile');
  stats[key]++;allocations[key]++;
 }
 const validated=budget?{...base,...allocatePilotPoints({...base,level},null,allocations).stats}:base;
 return {ig:driverIndex(validated),allocations};
}
export function entryLevelIG(level){
 if(!Number.isSafeInteger(level)||level<1||level>1000)throw Error('Livello non valido');
 const byProfile=Object.fromEntries(Object.entries(profiles).map(([name,base])=>[name,{min:extremum(base,level,false),max:extremum(base,level,true)}]));
 return {min:Math.min(...Object.values(byProfile).map(p=>p.min.ig)),max:Math.max(...Object.values(byProfile).map(p=>p.max.ig)),byProfile};
}
export function championshipLevelAudit(cups=CHAMPIONSHIP_CATALOG){
 return cups.map(cup=>{const player=entryLevelIG(cup.minLevel),indices=cup.rivals.map(r=>driverIndex(Object.fromEntries(PILOT_POINT_STATS.map(k=>[k,r.skill])))),mean=Math.round(indices.reduce((n,v)=>n+v,0)/indices.length),gap=mean-player.min;return {name:cup.name,minLevel:cup.minLevel,playerIG:[player.min,player.max],rivalMeanIG:mean,rivalIG:[Math.min(...indices),Math.max(...indices)],gapFromLowestPlayer:gap,aligned:gap>=-2&&gap<=2};});
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const report=championshipLevelAudit();console.log(JSON.stringify({reference:'Quattro profili iniziali, punti livello distribuiti legalmente, nessun allenamento; media arrotondata come nella UI',report},null,2));if(report.some(c=>!c.aligned))process.exitCode=1;
}
