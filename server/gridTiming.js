const {createHash}=require('node:crypto');
const {gridTiming}=require('../shared/gridTiming.mjs');
const cache=new Map();
function references(contract,state){
 const key=createHash('sha256').update(JSON.stringify([contract.drivers,state.gridSeed,state.sections,state.environment,state.incidentPlan,state.fuelModelVersion||1,state.distanceKm])).digest('hex');
 if(cache.has(key)){const value=cache.get(key);cache.delete(key);cache.set(key,value);return value;}
 const rows=contract.drivers.map((driver,index)=>require('./championships').simulateDriver(driver,state,(state.gridSeed+index*7919)>>>0,true));
 cache.set(key,rows);if(cache.size>64)cache.delete(cache.keys().next().value);return rows;
}
function project(contract,state){
 const sector=Math.min(state.index,state.sections.length),options={sector,totalSectors:state.sections.length,featuredId:state.gridTacticsVersion===1?state.tacticalRivalId:state.gridOpponentId,finished:!!state.finished};
 if(state.championship?.format==='grid'&&state.championship.classification)return gridTiming(state.championship.classification,options);
 if(state.gridTacticsVersion===1)return gridTiming(require('../shared/gridRace.mjs').gridRows(state),options);
 if(!contract?.drivers?.length)return null;
 const rows=references(contract,state).map(reference=>{
  const driver=contract.drivers.find(d=>d.id===reference.id);
  if(reference.id===state.gridOpponentId)return{id:reference.id,name:reference.name,carName:reference.carName,timeMs:Math.round(state.opponentTime*1000),failure:state.opponentFailure||null};
  const checkpoint=reference.checkpoints[Math.min(sector,reference.checkpoints.length)-1];
  return{id:reference.id,name:reference.name,carName:driver.car.name,timeMs:checkpoint?.timeMs||0,failure:checkpoint?.failure||null};
 });
 rows.unshift({id:'player',name:contract.playerName,carName:state.car.name,timeMs:Math.round(state.playerTime*1000),failure:state.failure||null});
 return gridTiming(rows,options);
}
async function read(tx,userId,state){
 if(!state.gridOpponentId)return null;
 if(state.gridTacticsVersion===1||state.championship?.format==='grid'&&state.championship.classification)return project(null,state);
 const entry=await tx.championshipEntry.findFirst({where:{id:state.entryId,userId},select:{contract:true}});
 if(!entry)return null;
 return project(JSON.parse(entry.contract||'{}'),state);
}
module.exports={references,project,read};
