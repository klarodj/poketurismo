const {createHash}=require('node:crypto');
const {CAR_PAINTS,REPAINT_PRICE,validPaint,paintFor,seededPaint}=require('../shared/carPaint.mjs');
const {fail,positiveId,charge}=require('./gameRules');
function selectedPaint(value,car){if(value===undefined)return paintFor(car);if(!validPaint(value))fail(400,'Colore non disponibile');return value;}
function paintQuote(garage){return {price:REPAINT_PRICE,colours:CAR_PAINTS,paintColour:paintFor(garage),key:createHash('sha256').update(JSON.stringify([garage.id,garage.carId,paintFor(garage),REPAINT_PRICE])).digest('hex')};}
async function repaint(tx,userId,body,params){
 if(Object.keys(body).some(k=>!['paintColour','quoteKey'].includes(k)))fail(400,'Preventivo di verniciatura non valido');
 const car=await tx.garage.findFirst({where:{id:positiveId(params.garageId),userId},include:{car:true}});if(!car)fail(403,'Puoi verniciare soltanto una tua auto');
 const colour=selectedPaint(body.paintColour,car);if(colour===paintFor(car))fail(400,'L’auto ha già questo colore');
 if(body.quoteKey!==paintQuote(car).key)fail(409,'Colore o preventivo cambiato: aggiorna il carroziere');
 await charge(tx,userId,REPAINT_PRICE);await tx.garage.update({where:{id:car.id},data:{paintColour:colour}});
 return {...await require('./races').snapshot(tx,userId),paintReceipt:{garageId:car.id,paintColour:colour,price:REPAINT_PRICE}};
}
module.exports={selectedPaint,paintQuote,repaint,paintFor,seededPaint};
