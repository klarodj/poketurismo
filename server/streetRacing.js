const {randomInt,randomUUID,createHash}=require('node:crypto');
const {STREET_ZONES,STREET_STYLES,streetPerformance,streetPilot,streetReward,repeatFactor,streetAccessReasons:access}=require('../shared/streetCatalog.mjs');
const {buildTacticalTrack}=require('../shared/trackGeometry.mjs');
const {routeProfileFor}=require('../shared/raceContext.mjs');
const {simulateBlock,DEFAULT_DECISION}=require('../shared/tacticalRace.mjs');
const {PILOT_STATS}=require('./raceEngine');
const {fundamentals}=require('../shared/driverDevelopment.mjs');
const {fail,restoredHandlingStats}=require('./gameRules');
const {garageInclude}=require('./persistence');
const trackInclude={builds:{include:{section:true},orderBy:{ord:'asc'}},meteo:true,surface:true};
function parseProgress(row){return JSON.parse(row?.streetState||'{}');}
function carFingerprint(car){return createHash('sha256').update(JSON.stringify([car.id,car.carId,car.cv,car.nm,car.kg,car.engineHealth,car.tireGrip,car.currentFuel,car.km,car.serviceKm,car.fuelType,...['speed','acceleration','revving','transmission','turnSlow','turnFast','brake','traction'].map(key=>car[key])])).digest('hex');}
async function context(tx,userId){
  const [user,progress,growth,cars]=await Promise.all([tx.user.findUnique({where:{id:userId}}),tx.playerProgress.findUnique({where:{userId}}),tx.driverDevelopment.findUnique({where:{userId}}),tx.car.findMany({include:{brand:true},orderBy:{id:'asc'}})]);
  if(!user)fail(404,'Giocatore inesistente');
  let garage=await tx.garage.findFirst({where:{id:user.carDrive,userId},include:garageInclude});
  if(garage)garage={...garage,...restoredHandlingStats(garage)};
  return {user,progress,growth,cars,garage,state:parseProgress(progress)};
}
function findCar(ctx,rival){return ctx.cars.find(car=>car.name===rival.carName);}
function rivalCar(car,rival){return {...car,engineHealth:rival.engineHealth,tireGrip:rival.tireGrip,currentFuel:20,fuelType:'Normale',km:0,serviceKm:0};}
function estimate(car,pilot,sections,environment){let time=0,speed=0;for(let index=0;index<sections.length;index++){const result=simulateBlock(car,pilot,null,DEFAULT_DECISION,sections[index],sections[index+1],speed,environment);time+=result.time;speed=result.exitSpeed;}return time;}
async function describeOffer(tx,ctx,zone,offer){
  const rival=zone.rivals.find(item=>item.id===offer.rivalId),car=rival&&findCar(ctx,rival);
  if(!car||!ctx.garage||offer.carFingerprint!==carFingerprint(ctx.garage))return null;
  const track=await tx.track.findUnique({where:{id:offer.trackId},include:trackInclude});
  if(!track||!zone.tracks.includes(track.name)||!track.builds.length)return null;
  const distanceKm=track.lenght>=100?track.lenght/1000:track.lenght;
  const sections=buildTacticalTrack(track.builds.map(build=>build.section),distanceKm,routeProfileFor('street'));
  const environment={weather:track.meteo.name,surface:track.surface.name,routeKind:'road'};
  const pilot={...Object.fromEntries(PILOT_STATS.map(key=>[key,ctx.user[key]])),fundamentals:fundamentals(ctx.growth)};
  const playerTime=estimate(ctx.garage,pilot,sections,environment);
  const opponentTime=estimate(rivalCar(car,rival),streetPilot(rival),sections,environment);
  const ratio=opponentTime/playerTime;
  const easy=ratio>1.25;
  const races=ctx.state[zone.id]?.rivals?.[rival.id]?.races||0;
  const wins=ctx.state[zone.id]?.rivals?.[rival.id]?.wins||0;
  const bankroll=Math.max(0,Math.min(Math.floor(ctx.user.moneyCents/100*0.15),Math.floor(ctx.user.moneyCents/100)-1000));
  const maximum=Math.min(bankroll,Math.floor(zone.maxWager*(easy?0.25:1)*repeatFactor(wins)));
  const wagers=[...new Set([0,...[Math.floor(maximum/4),Math.floor(maximum/2),maximum].filter(value=>value>0)])];
  return {id:offer.id,zoneId:zone.id,rival:{id:rival.id,name:rival.name,style:STREET_STYLES[rival.style],skill:rival.skill,car:{id:car.id,name:car.name,brand:car.brand?.name||'',image:car.image,engineHealth:rival.engineHealth,tireGrip:rival.tireGrip,cv:car.cv,kg:car.kg,performance:streetPerformance(rivalCar(car,rival))}},
    track:{id:track.id,name:track.name,distanceKm,weather:track.meteo.name,surface:track.surface.name,builds:track.builds},
    challenge:ratio>1.1?'Sei favorito':ratio<0.9?'Avversario impegnativo':'Sfida equilibrata',easy,races,rewardFactor:repeatFactor(wins)*(easy?0.2:1),wagers,maxWager:maximum,
    record:ctx.state[zone.id]?.rivals?.[rival.id]||{races:0,wins:0,losses:0,draws:0},
    winXp:streetReward({outcome:'win',completed:true,races,wins,easy}).xp,winReputation:streetReward({outcome:'win',completed:true,races,wins,easy}).reputation};
}
async function streetHub(tx,userId){
  const ctx=await context(tx,userId);
  const zones=[];
  for(const zone of STREET_ZONES){const reasons=access(zone,ctx);const saved=ctx.state[zone.id]||{};zones.push({id:zone.id,name:zone.name,description:zone.description,minLevel:zone.minLevel,minPerformance:zone.minPerformance,maxWager:zone.maxWager,unlocked:!reasons.length,reasons,reputation:saved.reputation||0,wins:saved.wins||0,losses:saved.losses||0,draws:saved.draws||0,rivalCount:zone.rivals.filter(r=>findCar(ctx,r)).length,offer:!reasons.length&&saved.offer?await describeOffer(tx,ctx,zone,saved.offer):null});}
  return {zones,performance:ctx.garage?streetPerformance(ctx.garage):null};
}
async function encounter(tx,userId,body){
  if(Object.keys(body).some(key=>!['zoneId','replace','offerId'].includes(key)))fail(400,'Richiesta incontro non valida');
  const ctx=await context(tx,userId);const zone=STREET_ZONES.find(item=>item.id===body.zoneId);
  if(!zone)fail(404,'Ritrovo inesistente');
  const reasons=access(zone,ctx);if(reasons.length)fail(403,reasons.join(' · '));
  const saved=ctx.state[zone.id]||{};
  const current=saved.offer&&await describeOffer(tx,ctx,zone,saved.offer);
  if(current&&!body.replace)return {street:await streetHub(tx,userId)};
  if(current&&body.offerId!==current.id)fail(409,'L’incontro è cambiato: aggiorna il ritrovo');
  const available=zone.rivals.filter(r=>findCar(ctx,r)).map(r=>r.id);
  if(!available.length)fail(409,'Nessun rivale disponibile nel catalogo');
  let deck=(saved.deck||[]).filter(id=>available.includes(id));
  if(!deck.length){deck=available.slice();for(let index=deck.length-1;index>0;index--){const target=randomInt(index+1);[deck[index],deck[target]]=[deck[target],deck[index]];}if(deck.length>1&&deck[0]===saved.lastRival)[deck[0],deck[1]]=[deck[1],deck[0]];}
  const tracks=await tx.track.findMany({where:{name:{in:zone.tracks}},include:trackInclude});
  if(!tracks.length)fail(409,'Percorsi del ritrovo non disponibili');
  const rivalId=deck.shift();const track=tracks[randomInt(tracks.length)];
  ctx.state[zone.id]={...saved,deck,lastRival:rivalId,offer:{id:randomUUID(),rivalId,trackId:track.id,carFingerprint:carFingerprint(ctx.garage)}};
  await tx.playerProgress.upsert({where:{userId},create:{userId,streetState:JSON.stringify(ctx.state)},update:{streetState:JSON.stringify(ctx.state)}});
  return {street:await streetHub(tx,userId)};
}
async function acceptEncounter(tx,userId,body){
  if(Object.keys(body).some(key=>!['mode','zoneId','offerId','wager'].includes(key)))fail(400,'La sfida del ritrovo non accetta tracciati o avversari dal browser');
  const ctx=await context(tx,userId);const zone=STREET_ZONES.find(item=>item.id===body.zoneId);
  if(!zone)fail(400,'Scegli un ritrovo e incontra un rivale prima di partire');
  const reasons=access(zone,ctx);if(reasons.length)fail(403,reasons.join(' · '));
  const saved=ctx.state[zone.id]||{};const offer=saved.offer&&await describeOffer(tx,ctx,zone,saved.offer);
  if(!offer||offer.id!==body.offerId)fail(409,'Incontro non più valido: cerca un avversario con l’auto attuale');
  if(!Number.isSafeInteger(body.wager)||!offer.wagers.includes(body.wager))fail(400,'Puntata non accettata dal rivale');
  // Preserve repair/fuel reserves even in advanced zones; the cap is recalculated at acceptance.
  if(body.wager>0&&body.wager>Math.min(Math.floor(ctx.user.moneyCents/100*0.15),Math.max(0,Math.floor(ctx.user.moneyCents/100)-1000)))fail(400,'La puntata supera il limite del 15% del saldo o la riserva di €1.000');
  const rival=zone.rivals.find(item=>item.id===saved.offer.rivalId);
  const track=await tx.track.findUnique({where:{id:saved.offer.trackId},include:trackInclude});
  const street={zoneId:zone.id,zoneName:zone.name,rivalId:rival.id,offerId:offer.id,easy:offer.easy,racesBefore:offer.races,style:rival.style};
  delete saved.offer;ctx.state[zone.id]=saved;
  await tx.playerProgress.update({where:{userId},data:{streetState:JSON.stringify(ctx.state)}});
  return {track,opponentCar:findCar(ctx,rival),opponentPilot:streetPilot(rival),opponentName:rival.name,opponentCondition:{engineHealth:rival.engineHealth,tireGrip:rival.tireGrip},wager:body.wager,street};
}
async function settleStreet(tx,userId,state){
  const row=await tx.playerProgress.findUnique({where:{userId}});const saved=parseProgress(row);const zone=saved[state.street.zoneId]||{};const rivals=zone.rivals||{};const rival=rivals[state.street.rivalId]||{races:0,wins:0,losses:0,draws:0};
  const result=streetReward({outcome:state.outcome,failure:state.failure,completed:state.index===state.sections.length,races:rival.races,wins:rival.wins,easy:state.street.easy,wager:state.wager});
  const outcome=state.outcome==='win'?'wins':state.outcome==='draw'?'draws':'losses';
  rivals[state.street.rivalId]={...rival,races:rival.races+1,[outcome]:(rival[outcome]||0)+1};
  saved[state.street.zoneId]={...zone,reputation:(zone.reputation||0)+result.reputation,rivals,[outcome]:(zone[outcome]||0)+1};
  await tx.playerProgress.update({where:{userId},data:{streetState:JSON.stringify(saved)}});
  state.streetResult={reputation:result.reputation,totalReputation:saved[state.street.zoneId].reputation,factor:result.factor,netMoney:result.money-state.wager,record:rivals[state.street.rivalId]};
  return {money:result.money,xp:result.xp};
}
module.exports={streetHub,encounter,acceptEncounter,settleStreet};
