const {createHash}=require('node:crypto');
const {racePreparationPreview,prepareRaceCar}=require('../shared/racePreparation.mjs');
const {fail,positiveId,charge,restoredHandlingStats}=require('./gameRules');
const {canonical,garageInclude}=require('./persistence');
function quote(garage){garage={...garage,...restoredHandlingStats(garage),mods:garage.mods.slice().sort((a,b)=>a.id-b.id)};const info=racePreparationPreview(garage);return {...info,key:createHash('sha256').update(JSON.stringify(canonical([garage,info]))).digest('hex')};}
async function convert(tx,userId,body,params){
 if(Object.keys(body).some(k=>!['quoteKey','confirmPermanent','confirmTrackOnly'].includes(k))||body.confirmPermanent!==true||body.confirmTrackOnly!==true)fail(400,'Conferma la trasformazione definitiva e l’utilizzo esclusivo in pista');
 const garage=await tx.garage.findFirst({where:{id:positiveId(params.garageId),userId},include:garageInclude});if(!garage)fail(403,'Puoi preparare soltanto una tua auto');
 if(garage.racePrepared)fail(409,'Questa auto è già da gara: la trasformazione è definitiva');
 const current=quote(garage);if(!current.available)fail(400,'Preparazione non disponibile');if(!current.enabled)fail(400,'Installa tutti i 16 componenti tuning di livello 3 prima di procedere');
 if(body.quoteKey!==current.key)fail(409,'Preparazione o preventivo cambiati: aggiorna l’officina');
 await charge(tx,userId,current.price);const after=prepareRaceCar(garage);await tx.garage.update({where:{id:garage.id},data:{racePrepared:true,kg:after.kg}});
 return {...await require('./races').snapshot(tx,userId),racePreparationReceipt:{garageId:garage.id,price:current.price,name:current.name}};
}
function requireRoadTuning(garage){if(garage.racePrepared)fail(400,'Allestimento da gara definitivo: i componenti di livello 3 non sono smontabili o sostituibili');}
module.exports={quote,convert,requireRoadTuning};
