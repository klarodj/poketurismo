import {advanceTacticalRace,DEFAULT_DECISION} from './tacticalRace.mjs';
// Private, compact progress for each entrant. No future sector is simulated in a live projection.
export function gridRows(state){return [{id:'player',name:state.gridPlayerName,carName:state.car.name,timeMs:Math.round(state.playerTime*1000),failure:state.failure||null},...state.gridRunners.map(r=>({id:r.id,name:r.name,carName:r.car.name,timeMs:Math.round(r.time*1000),failure:r.failure||null}))];}
export function closestRival(state){
 const active=state.gridRunners.filter(r=>!r.failure),playerMs=Math.round(state.playerTime*1000);
 const distance=r=>Math.abs(Math.round(r.time*1000)-playerMs);
 // Exact equal gaps retain the current rival; initial ties use the frozen contract order.
 return active.reduce((best,r)=>!best||distance(r)<distance(best)||distance(r)===distance(best)&&r.id===state.tacticalRivalId?r:best,null);
}
export function bindRival(state){
 const previous=state.tacticalRivalId,rival=closestRival(state);
 state.tacticalRivalId=rival?.id||null;state.tacticalRivalChanged=previous!==undefined&&previous!==state.tacticalRivalId;
 state.soloDrive=!rival;
 if(state.tacticalRivalChanged)state.prepared=false;
 if(!rival){state.opponentFailure='retired';return state;}
 state.gridOpponentId=rival.id;
 state.opponent={name:rival.name,car:structuredClone(rival.car),pilot:structuredClone(rival.pilot)};
 state.opponentTime=rival.time;state.opponentSpeed=rival.speed;state.opponentRng=rival.rng;state.opponentPrepared=rival.prepared;state.opponentFailure=null;
 state.gapSeconds=Number((rival.time-state.playerTime).toFixed(3));state.gap=Math.round(state.gapSeconds*1000);
 return state;
}
export function initializeGrid(state,contract){
 state.gridTacticsVersion=1;state.actorRngVersion=1;state.gridPlayerName=contract.playerName;
 state.tacticalRivalId=state.gridOpponentId;
 state.gridRunners=contract.drivers.map((d,i)=>({id:d.id,name:d.name,car:structuredClone(d.car),pilot:structuredClone(d.pilot),time:0,speed:0,rng:(state.gridSeed+i*7919)>>>0,index:0,prepared:false,incidentOccurred:false,failure:null,finished:false}));
 return bindRival(state);
}
function advanceRunner(state,runner){
 if(runner.finished)return runner;
 const solo={rulesVersion:3,fuelModelVersion:state.fuelModelVersion,actorRngVersion:1,soloDrive:true,timeTrial:true,routeProfile:state.routeProfile,incidentPlan:state.incidentPlan,incidentOccurred:runner.incidentOccurred,sections:state.sections,environment:state.environment,distanceKm:state.distanceKm,
 car:runner.car,pilot:runner.pilot,opponent:{car:structuredClone(runner.car),pilot:runner.pilot},moves:[],index:runner.index,gap:0,gapSeconds:0,playerTime:runner.time,opponentTime:runner.time,playerSpeed:runner.speed,opponentSpeed:runner.speed,prepared:runner.prepared,logs:[],rng:runner.rng,opponentRng:runner.rng,finished:false};
 const advanced=advanceTacticalRace(solo,null,DEFAULT_DECISION);
 return {...runner,car:advanced.car,time:advanced.playerTime,speed:advanced.playerSpeed,rng:advanced.rng,index:advanced.index,prepared:advanced.prepared,incidentOccurred:!!advanced.incidentOccurred,failure:advanced.failure||null,finished:advanced.finished};
}
export function finishGrid(state){
 state.gridRunners=state.gridRunners.map(runner=>{let r=runner;while(!r.finished)r=advanceRunner(state,r);return r;});return state;
}
export function advanceGridRace(input,moveId,decision){
 const rivalId=input.tacticalRivalId;
 const state=advanceTacticalRace(input,moveId,decision),log=state.logs.at(-1);
 if(rivalId){const rival=input.gridRunners.find(r=>r.id===rivalId);log.tacticalRival={id:rival.id,name:rival.name,gapSeconds:input.gapSeconds};}
 else log.tacticalRival=null;
 state.gridRunners=state.gridRunners.map(r=>{
  if(r.id!==rivalId)return advanceRunner(state,r);
  // Insufficient player fuel means the duel sector did not run; finish this entrant independently at settlement.
  if(log.opponentSeconds===undefined)return r;
  return {...r,car:structuredClone(state.opponent.car),time:state.opponentTime,speed:state.opponentSpeed,rng:state.opponentRng,index:state.index,prepared:!!state.opponentPrepared,incidentOccurred:!!state.incidentOccurred,failure:state.opponentFailure||null,finished:!!state.opponentFailure||state.index===state.sections.length};
 });
 return state.finished?finishGrid(state):bindRival(state);
}
