const {createHash}=require('node:crypto');
const {replacePart,tuningMetrics,tuningAdvice}=require('../shared/tuning.mjs');
const {championshipInfo,championshipCarErrors}=require('../shared/championshipCatalog.mjs');
const {STREET_ZONES,streetAccessReasons}=require('../shared/streetCatalog.mjs');
const {positiveId,fail}=require('./gameRules');
const {garageInclude,canonical}=require('./persistence');
function quoteKey(garage,part){return createHash('sha256').update(JSON.stringify(canonical([{...garage,mods:garage.mods.slice().sort((a,b)=>a.id-b.id)},part]))).digest('hex');}
function validateQuote(garage,part,key){if(key!==quoteKey(garage,part))fail(409,'Preparazione o prezzo cambiati: aggiorna il confronto prima di confermare');}
function preview(garage,part,ctx){
 const change=replacePart(garage,part),before=tuningMetrics(change.before),after=tuningMetrics(change.after);
 return {before,after,installed:change.installed?{id:change.installed.id,name:change.installed.name,level:change.installed.level,description:change.installed.description}:null,
 alreadyMounted:change.alreadyMounted,quoteKey:quoteKey(garage,part),advice:tuningAdvice(change.before,change.after),
 championships:ctx.championships.map(cup=>({id:cup.id,name:cup.name,active:ctx.entry?.championshipId===cup.id,
 beforeErrors:championshipCarErrors(change.before,cup),afterErrors:championshipCarErrors(change.after,cup),
 pilotErrors:[ctx.user.level<cup.minLevel?`Livello pilota ${cup.minLevel}`:null,...['brave','clean','reflex','shift'].map(stat=>ctx.user[stat]<cup[`min${stat[0].toUpperCase()}${stat.slice(1)}`]?'Abilità pilota insufficienti':null)].filter(Boolean)})),
 zones:STREET_ZONES.map(zone=>({id:zone.id,name:zone.name,minPerformance:zone.minPerformance,beforeErrors:streetAccessReasons(zone,{...ctx,garage:change.before}),afterErrors:streetAccessReasons(zone,{...ctx,garage:change.after})}))};
}
async function tuning(tx,userId,garageId){
 const [user,cars,parts,owned,championships,progress,growth,entry]=await Promise.all([
 tx.user.findUnique({where:{id:userId}}),tx.garage.findMany({where:{userId},include:garageInclude,orderBy:{id:'asc'}}),tx.part.findMany({orderBy:{id:'asc'}}),tx.inventoryPart.findMany({where:{userId,quantity:{gt:0}}}),tx.championship.findMany(),tx.playerProgress.findUnique({where:{userId}}),tx.driverDevelopment.findUnique({where:{userId}}),tx.championshipEntry.findFirst({where:{userId,status:'active'}})]);
 if(!user)fail(404,'Giocatore inesistente');
 const garage=garageId===undefined?cars.find(car=>car.id===user.carDrive)||cars[0]:cars.find(car=>car.id===positiveId(garageId));if(garageId!==undefined&&!garage)fail(403,'Auto non posseduta');
 const ctx={user,state:JSON.parse(progress?.streetState||'{}'),growth,entry,championships:championships.filter(cup=>championshipInfo(cup.name))};
 return {cars:cars.map(car=>({id:car.id,name:`${car.car.brand?.name||''} ${car.car.name}`.trim(),equipped:car.id===user.carDrive})),garageId:garage?.id||null,
 condition:garage?{engineHealth:garage.engineHealth,tireGrip:garage.tireGrip,currentFuel:garage.currentFuel,km:garage.km,serviceKm:garage.serviceKm,fuelType:garage.fuelType}:null,
 parts:parts.map(part=>({...part,ownedQuantity:owned.find(item=>item.partId===part.id)?.quantity||0,preview:garage?preview(garage,part,ctx):null}))};
}
module.exports={tuning,quoteKey,validateQuote,preview};
