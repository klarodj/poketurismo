const {performanceIndex}=require('../shared/vehiclePerformance.mjs');
const {driverIndex}=require('../shared/driverIndex.mjs');
const {cupAliases}=require('../shared/periodWorld.mjs');
const {CHAMPIONSHIP_CATALOG,championshipInfo,gridClassification,gridStandings}=require('../shared/championshipCatalog.mjs');
const {PILOT_STATS}=require('./raceEngine');
const {advanceTacticalRace,DEFAULT_DECISION}=require('../shared/tacticalRace.mjs');
const {incidentCue,routeProfileFor}=require('../shared/raceContext.mjs');
const {fail}=require('./gameRules');
const {seededPaint}=require('./carPaint');
const trackInclude={type:true,surface:true,meteo:true,builds:{include:{section:true},orderBy:{ord:'asc'}}};
function readContract(entry){return JSON.parse(entry.contract||'{}');}
function publicEntry(entry){if(!entry)return null;const contract=readContract(entry);const results=typeof entry.results==='string'?JSON.parse(entry.results):entry.results;const {contract:_,...safe}=entry;return require('./periodWorld').presentPeriodEntry({...safe,results,...(contract.version===1?{championship:contract.championship,format:'grid',participants:contract.drivers.map(d=>({id:d.id,name:d.name,carName:d.car.name,performanceIndex:performanceIndex(d.car),driverIndex:driverIndex(d.pilot)})),standings:gridStandings(results,[{id:'player',name:contract.playerName},...contract.drivers.map(d=>({id:d.id,name:d.name,carName:d.car.name}))])}:{format:'duel'})});}
async function createContract(tx,user,championship){
 const spec=championshipInfo(championship.name);if(!spec)return '{}';
 const cars=await tx.car.findMany({include:{brand:true}});
 const drivers=spec.rivals.map(rival=>{const car=cars.find(car=>car.name===rival.carName);if(!car)fail(409,`Auto avversaria mancante: ${rival.carName}`);return {id:rival.id,name:rival.name,car:{...car,paintColour:seededPaint('cup:'+championship.id+':'+rival.id),engineHealth:rival.engineHealth,tireGrip:rival.tireGrip,km:0,serviceKm:0,currentFuel:35,fuelType:'Normale'},pilot:Object.fromEntries(PILOT_STATS.map(key=>[key,rival.skill]))};});
 const rounds=[];for(const round of championship.rounds.slice().sort((a,b)=>a.ord-b.ord)){const track=await tx.track.findUnique({where:{id:round.trackId},include:trackInclude});if(!track?.builds.length)fail(409,'Calendario incompleto');rounds.push({...round,track});}
 return JSON.stringify({version:1,fuelModelVersion:2,playerName:user.username,championship:{...championship,rules:{drives:spec.drives,engineTypes:spec.engineTypes,brands:spec.brands},rounds},drivers});
}
function gridOpponent(entry,round){const contract=readContract(entry);if(contract.version!==1)return null;const driver=contract.drivers[(round.ord-1)%contract.drivers.length];return {driver,track:round.track,contract};}
function simulateDriver(driver,state,seed,trace=false){const checkpoints=[];let race={rulesVersion:3,fuelModelVersion:state.fuelModelVersion||1,timeTrial:true,routeProfile:routeProfileFor('track'),incidentPlan:state.incidentPlan,incidentCue:incidentCue(state.incidentPlan,0),sections:structuredClone(state.sections),environment:state.environment,distanceKm:state.distanceKm,car:structuredClone(driver.car),pilot:driver.pilot,opponent:{car:structuredClone(driver.car),pilot:driver.pilot},moves:[],index:0,gap:0,gapSeconds:0,playerTime:0,opponentTime:0,playerSpeed:0,opponentSpeed:0,logs:[],rng:seed,finished:false};while(!race.finished){race=advanceTacticalRace(race,null,DEFAULT_DECISION);if(trace)checkpoints.push({sector:race.index,timeMs:Math.round(race.playerTime*1000),failure:race.failure||null});}return {...(trace?{checkpoints}:{}),id:driver.id,name:driver.name,carName:driver.car.name,timeMs:Math.round(race.playerTime*1000),failure:race.failure||null};}
async function settleGrid(tx,userId,state,entry){
 const contract=readContract(entry);const old=JSON.parse(entry.results);if(old.some(result=>result.round===state.round))fail(409,'Round già registrato');
 const rows=require('./gridTiming').references(contract,state).map(row=>({id:row.id,name:row.name,carName:row.carName,timeMs:row.timeMs,failure:row.failure}));
 // The featured rival uses its actual duel time, including incidents and manoeuvres.
 const featured=rows.find(row=>row.id===state.gridOpponentId);if(featured&&(state.index===state.sections.length||state.opponentFailure)){featured.timeMs=Math.round(state.opponentTime*1000);featured.failure=state.opponentFailure||null;}
 rows.push({id:'player',name:contract.playerName,carName:state.car.name,timeMs:Math.round(state.playerTime*1000),failure:state.failure||null});
 const classification=gridClassification(rows);const player=classification.find(row=>row.id==='player');
 const results=[...old,{round:state.round,trackId:state.trackId,trackName:state.trackName,classification,completed:!state.failure&&state.index===state.sections.length,position:player.position,outcome:state.failure?'loss':player.position===1?'win':'loss',gapMs:state.gap,playerPoints:player.points}];
 const standings=gridStandings(results,[{id:'player',name:contract.playerName},...contract.drivers.map(d=>({id:d.id,name:d.name,carName:d.car.name}))]);
 const final=state.round===contract.championship.rounds.length;const position=standings.findIndex(row=>row.id==='player')+1;
 await tx.championshipEntry.update({where:{id:entry.id},data:{currentRound:final?state.round:state.round+1,playerPoints:standings.find(row=>row.id==='player').points,results:JSON.stringify(results),status:final?'completed':'active'}});
 state.championship={format:'grid',completed:final,champion:final?position===1:null,position:player.position,championshipPosition:position,classification,standings,nextRound:final?null:state.round+1};
 const moneyFactors=[1,0.6,0.35,0.15,0.15,0.15,0.15,0.15];const xpFactors=[1,0.75,0.5,0.25,0.25,0.25,0.25,0.25];
 const pay=final&&results.some(row=>row.completed);
 return {money:pay?Math.floor(contract.championship.rewardMoney*moneyFactors[position-1]):0,xp:pay?Math.floor(contract.championship.rewardXp*xpFactors[position-1]):0};
}
async function seedChampionships(tx){
 const tracks=await tx.track.findMany();const cars=await tx.car.findMany();const created=[];
 for(const cup of CHAMPIONSHIP_CATALOG){if(await tx.championship.findFirst({where:{name:{in:cupAliases(cup.name)}}}))continue;
  for(const rival of cup.rivals)if(!cars.some(car=>car.name===rival.carName))throw Error(`Auto mancante: ${rival.carName}`);
  const rounds=cup.tracks.map((name,index)=>{const track=tracks.find(t=>t.name===name);if(!track)throw Error(`Circuito mancante: ${name}`);const rival=cup.rivals[index%7];return {trackId:track.id,ord:index+1,opponentName:rival.name,opponentCarName:rival.carName,opponentDifficulty:rival.skill/24};});
  const {tracks:_,rivals:__,engineTypes:___,brands:____,drives:_____,...data}=cup;
  const row=await tx.championship.create({data:{...data,rounds:{create:rounds}}});created.push(row.name);
 }
 const removed=[];const deferred=[];
 // Only exact duplicate (position, section, difficulty) records; preserve active legacy calendars.
 for(const track of tracks){const builds=await tx.trackBuild.findMany({where:{trackId:track.id},orderBy:{id:'asc'}});const seen=new Set(),duplicates=[];for(const build of builds){const key=`${build.ord}:${build.sectionId}:${build.level}`;if(seen.has(key))duplicates.push(build.id);else seen.add(key);}if(!duplicates.length)continue;
  const active=await tx.championshipEntry.findFirst({where:{status:'active',championship:{rounds:{some:{trackId:track.id}}}}});if(active){deferred.push(track.id);continue;}
  await tx.trackBuild.deleteMany({where:{id:{in:duplicates}}});removed.push({trackId:track.id,count:duplicates.length});
 }
 return {created,removed,deferred};
}
module.exports={publicEntry,readContract,createContract,gridOpponent,settleGrid,seedChampionships,simulateDriver};
