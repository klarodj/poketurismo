// Explicit one-off test-history reset. Account, wallet, garage and learned skills stay intact.
const raceKinds=new Set(['start-race','race-turn','abandon-race','enter-championship','meet-invite','meet-respond','meet-start','street-encounter']);
const {STREET_ZONES}=require('../shared/streetCatalog.mjs');
function cleanedStreetState(raw){const state=JSON.parse(raw||'{}');for(const zone of STREET_ZONES)if(state[zone.id])state[zone.id]={reputation:state[zone.id].reputation||0};return JSON.stringify(state);}
async function resetRaceHistory(tx,{apply=false}={}){
 const plan={races:await tx.raceSession.count(),championshipEntries:await tx.championshipEntry.count(),meetChallenges:await tx.meetChallenge.count(),operationReceipts:0,streetHistories:0};
 for(const operation of await tx.gameOperation.findMany()){const receipt=JSON.parse(operation.response);if(receipt.raceHistoryReset)continue;if(raceKinds.has(operation.kind)||receipt.race||receipt.entry){plan.operationReceipts++;if(apply)await tx.gameOperation.update({where:{userId_key:{userId:operation.userId,key:operation.key}},data:{response:JSON.stringify({raceHistoryReset:true})}});}}
 for(const row of await tx.playerProgress.findMany()){const clean=cleanedStreetState(row.streetState);if(clean!==row.streetState){plan.streetHistories++;if(apply)await tx.playerProgress.update({where:{userId:row.userId},data:{streetState:clean}});}}
 if(apply){await tx.meetChallenge.deleteMany();await tx.raceSession.deleteMany();await tx.championshipEntry.deleteMany();}
 return plan;
}
module.exports={resetRaceHistory,cleanedStreetState};
