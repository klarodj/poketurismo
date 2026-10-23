const {createHash}=require('node:crypto');
const {fail,positiveId,restoredHandlingStats}=require('./gameRules');
const {garageInclude}=require('./persistence');
const {performanceIndex}=require('../shared/vehiclePerformance.mjs');
const {buildTacticalTrack}=require('../shared/trackGeometry.mjs');
const {routeProfileFor}=require('../shared/raceContext.mjs');
const {marketTier}=require('../shared/carEconomy.mjs');
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const pilot=user=>({id:user.id,name:user.username,level:user.level,avatar:user.avatar||null});
function publicShowcase(user,item){
 const garage={...item,...restoredHandlingStats(item)};
 return {pilot:pilot(user),car:{id:garage.id,modelId:garage.carId,name:garage.car.name,brand:garage.car.brand?.name||'',image:garage.car.image,year:garage.car.year,cv:garage.cv,nm:garage.nm,kg:garage.kg,driveType:garage.car.driveType,engineType:garage.car.engineType,km:garage.km,engineHealth:garage.engineHealth,tireGrip:garage.tireGrip,performanceIndex:performanceIndex(garage),tier:marketTier(garage.car,garage).name,
 parts:garage.mods.map(mod=>({id:mod.part.id,name:mod.part.name,description:mod.part.description,category:mod.part.category,level:mod.part.level}))}};
}
async function visibleParticipants(tx){
 const users=await tx.user.findMany({where:{id:{gt:0},progress:{showcaseGarageId:{not:null}}},select:{id:true,username:true,level:true,avatar:true,progress:{select:{showcaseGarageId:true}}},orderBy:{id:'asc'}});
 const garages=await tx.garage.findMany({where:{id:{in:users.map(u=>u.progress.showcaseGarageId)}},include:garageInclude});
 return users.flatMap(user=>{const garage=garages.find(g=>g.id===user.progress.showcaseGarageId&&g.userId===user.id);return garage?[{user,garage}]:[];});
}
async function meet(tx,userId){
 const participants=await visibleParticipants(tx);
 return {showcases:participants.map(({user,garage})=>publicShowcase(user,garage)),myGarageId:participants.find(p=>p.user.id===userId)?.garage.id||null};
}
async function withdrawForDrive(tx,userId,garageId){
 if(garageId>0)await tx.playerProgress.updateMany({where:{userId,showcaseGarageId:garageId},data:{showcaseGarageId:null}});
}
async function displayCar(tx,userId,body){
 if(Object.keys(body).some(key=>key!=='garageId')||body.garageId===undefined)fail(400,'Scegli una tua vettura oppure ritira l’esposizione');
 const garageId=body.garageId===null?null:positiveId(body.garageId);
 if(garageId!==null&&!await tx.garage.findFirst({where:{id:garageId,userId}}))fail(403,'Puoi esporre soltanto una tua auto');
 if(garageId!==null&&await tx.raceSession.findFirst({where:{userId,garageId,status:'active'}}))fail(409,'Questa auto è in gara: riportala al piazzale dopo aver concluso');
 await tx.playerProgress.upsert({where:{userId},create:{userId,showcaseGarageId:garageId},update:{showcaseGarageId:garageId}});
 return {...await require('./races').snapshot(tx,userId),meet:await meet(tx,userId)};
}
function layoutKey(sections,environment){return hash([environment?.weather?.toLowerCase(),environment?.surface?.toLowerCase(),sections.map(section=>[section.layoutVersion||1,section.riskExposure??1,(section.segments||[]).map(segment=>[segment.lengthM,segment.radiusM,segment.widthM,segment.grade||0])])]);}
function trialConfiguration(garage){
 const stats=Object.fromEntries(['cv','nm','kg','speed','acceleration','revving','transmission','turnSlow','turnFast','brake','traction'].map(key=>[key,garage[key]]));
 return {modelId:garage.carId,setupKey:hash(stats),engineHealth:garage.engineHealth,tireGrip:garage.tireGrip,currentFuel:garage.currentFuel,fuelType:garage.fuelType,parts:garage.mods.map(mod=>({name:mod.part.name,level:mod.part.level}))};
}
function projectTime(row,user,cars,currentLayout,modelId,fuelModelVersion=2){
 let state;try{state=JSON.parse(row.state);}catch{return null;}
 if((state.fuelModelVersion||1)!==fuelModelVersion)return null;
 if(row.mode!=='track'||row.status!=='completed'||!state.timeTrial||state.rulesVersion!==3||state.failure||!Array.isArray(state.sections)||!state.sections.length||state.index!==state.sections.length||!Number.isFinite(state.playerTime)||state.playerTime<=0||layoutKey(state.sections,state.environment)!==currentLayout)return null;
 const snapshot=state.car;
 const model=state.trialSetup?.configuration?.modelId?cars.find(car=>car.id===state.trialSetup.configuration.modelId):cars.find(car=>car.name===snapshot?.name&&car.brand?.name===snapshot?.brand);
 if(!model||model.id!==modelId)return null;
 const saved=state.trialSetup?.configuration;
 const configuration=saved?{setupKey:saved.setupKey,engineHealth:saved.engineHealth,tireGrip:saved.tireGrip,currentFuel:saved.currentFuel,fuelType:saved.fuelType,parts:(saved.parts||[]).map(part=>({name:part.name,level:part.level}))}:null;
 return {pilot:pilot(user),timeMs:Math.round(state.playerTime*1000),date:new Date(row.createdAt).toISOString(),car:{modelId:model.id,name:snapshot.name,brand:snapshot.brand,image:snapshot.image,cv:snapshot.cv,kg:snapshot.kg,performanceIndex:state.trialSetup?.performanceIndex??null},configuration};
}
async function leaderboard(tx,query){
 if(Object.keys(query).some(key=>!['trackId','modelId','setupKey','fuelVersion'].includes(key)))fail(400,'Filtri classifica non validi');
 const trackId=positiveId(query.trackId),modelId=positiveId(query.modelId);const fuelModelVersion=query.fuelVersion===undefined?2:Number(query.fuelVersion);if(![1,2].includes(fuelModelVersion))fail(400,'Regolamento consumi non valido');
 if(query.setupKey!==undefined&&!/^[a-f0-9]{64}$/.test(query.setupKey))fail(400,'Configurazione non valida');
 const [track,model,participants]=await Promise.all([tx.track.findUnique({where:{id:trackId},include:{type:true,meteo:true,surface:true,builds:{include:{section:true},orderBy:{ord:'asc'}}}}),tx.car.findUnique({where:{id:modelId},include:{brand:true}}),visibleParticipants(tx)]);
 if(!track||!model)fail(404,'Circuito o modello inesistente');
 if(track.type.name!=='Track'&&track.type.name!=='Circuit')fail(400,'Scegli un circuito');
 const distanceKm=track.lenght>=100?track.lenght/1000:track.lenght;
 const sections=buildTacticalTrack(track.builds.map(b=>b.section),distanceKm,routeProfileFor('track'));
 const signature=layoutKey(sections,{weather:track.meteo.name,surface:track.surface.name});
 const rows=await tx.raceSession.findMany({where:{userId:{in:participants.map(p=>p.user.id)},mode:'track',status:'completed'},orderBy:{createdAt:'asc'}});
 const best=new Map();
 for(const row of rows){const user=participants.find(p=>p.user.id===row.userId)?.user;if(!user)continue;
  let state;try{state=JSON.parse(row.state);}catch{continue;}if(state.trackId!==trackId)continue;
  const record=projectTime(row,user,[model],signature,modelId,fuelModelVersion);if(!record||query.setupKey&&record.configuration?.setupKey!==query.setupKey)continue;
  const previous=best.get(user.id);if(!previous||record.timeMs<previous.timeMs)best.set(user.id,record);
 }
 const records=[...best.values()].sort((a,b)=>a.timeMs-b.timeMs||a.pilot.id-b.pilot.id);
 return {fuelModelVersion,track:{id:track.id,name:track.name,distanceKm,weather:track.meteo.name},model:{id:model.id,name:model.name,brand:model.brand?.name||''},records:records.slice(0,50).map(record=>({...record,position:records.findIndex(r=>r.timeMs===record.timeMs)+1,gapMs:record.timeMs-records[0].timeMs})),total:records.length};
}
module.exports={withdrawForDrive,meet,displayCar,leaderboard,layoutKey,trialConfiguration,projectTime};
