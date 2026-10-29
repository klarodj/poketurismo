const {createHash}=require('node:crypto');
const {maintenanceQuotes,essentialRepair}=require('../shared/maintenance.mjs');
const {marketTier,newCarPrice,marketAskingPrice}=require('../shared/carEconomy.mjs');
const {performanceIndex}=require('../shared/vehiclePerformance.mjs');
const {fail,positiveId,cents,charge,restoredHandlingStats}=require('./gameRules');
const {garageInclude}=require('./persistence');
const {CAR_STATS}=require('./raceEngine');
const {paintQuote,paintFor}=require('./carPaint');
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const parse=row=>JSON.parse(row?.recoveryState||'{}');
async function recoveryState(tx,userId){const state=parse(await tx.playerProgress.findUnique({where:{userId}}));return {debtCents:state.debtCents||0,lockedCarIds:(state.debtCents||0)>0?(state.carIds||[]):[]};}
async function saveDebt(tx,userId,state){await tx.playerProgress.upsert({where:{userId},create:{userId,recoveryState:JSON.stringify(state)},update:{recoveryState:JSON.stringify(state)}});}
function ready(car){return car.engineHealth>=50&&car.tireGrip>=50&&car.currentFuel>=5;}
async function recoveryPlan(tx,user,garages){
 const debt=await recoveryState(tx,user.id);
 if(garages.some(ready))return {available:false,reason:'Hai già una vettura pronta: equipaggiala dal garage.',...debt};
 let plan;
 if(garages.length){const candidates=garages.map(garage=>({...essentialRepair(garage),garage})).sort((a,b)=>a.price-b.price||a.garage.id-b.garage.id);const chosen=candidates[0];plan={kind:'repair',garageId:chosen.garage.id,carId:chosen.garage.carId,name:`${chosen.garage.car.brand?.name||''} ${chosen.garage.car.name}`.trim(),costCents:cents(chosen.price),changes:chosen.changes};}
 else{
  const models=await tx.car.findMany({include:{brand:true}});const starters=models.filter(car=>marketTier(car).id==='starter').sort((a,b)=>newCarPrice(a)-newCarPrice(b)||a.cv-b.cv||a.id-b.id);
  if(!starters.length)return {available:false,reason:'Nessuna vettura da ripartenza disponibile.',...debt};
  const market=await tx.garage.findMany({where:{userId:-1},include:garageInclude});const cheapest=Math.min(newCarPrice(starters[0]),...market.map(item=>marketAskingPrice(item.car,item)));
  if(user.moneyCents>=cents(cheapest))return {available:false,reason:'Puoi già acquistare una vettura: visita usato o concessionario.',...debt};
  const car=starters[0];plan={kind:'car',carId:car.id,name:`${car.brand?.name||''} ${car.name}`.trim(),costCents:cents(newCarPrice(car)+12),changes:{engineHealth:85,tireGrip:80,currentFuel:8,fuelType:'Normale',km:0,serviceKm:0}};
 }
 const contributionCents=user.moneyCents>=plan.costCents?plan.costCents:Math.min(plan.costCents,Math.max(0,user.moneyCents-30000));
 const advanceCents=plan.costCents-contributionCents;
 return {...plan,...debt,available:true,contributionCents,advanceCents,key:hash([plan,user.moneyCents,debt,garages.map(g=>[g.id,g.engineHealth,g.tireGrip,g.currentFuel,g.km,g.serviceKm,g.cv,g.kg])])};
}
async function workshop(tx,userId){
 const user=await tx.user.findUnique({where:{id:userId}});if(!user)fail(404,'Giocatore inesistente');
 const cars=(await tx.garage.findMany({where:{userId},include:garageInclude,orderBy:{id:'asc'}})).map(car=>({...car,...restoredHandlingStats(car)}));
 return {cars:cars.map(car=>({id:car.id,image:car.car.image,paintColour:paintFor(car),racePrepared:car.racePrepared,racePreparation:require('./racePreparation').quote(car),paint:paintQuote(car),name:`${car.car.brand?.name||''} ${car.car.name}`.trim(),engineHealth:car.engineHealth,tireGrip:car.tireGrip,km:car.km,serviceKm:car.serviceKm,currentFuel:car.currentFuel,performanceIndex:performanceIndex(car),services:maintenanceQuotes(car).map(service=>({...service,key:hash([car,service])}))})),recovery:await recoveryPlan(tx,user,cars)};
}
async function service(tx,userId,body,params){
 const item=await tx.garage.findFirst({where:{id:positiveId(params.garageId),userId},include:garageInclude});if(!item)fail(403,'Auto non posseduta');const car={...item,...restoredHandlingStats(item)};
 const quote=maintenanceQuotes(car).find(service=>service.id===body.serviceType);if(!quote)fail(400,'Servizio non valido');if(!quote.enabled)fail(400,quote.reason);
 if(body.quoteKey!==hash([car,quote]))fail(409,'Preventivo cambiato: aggiorna l’officina prima di confermare');
 await charge(tx,userId,quote.price);await tx.garage.update({where:{id:car.id},data:quote.changes});
 return {...await require('./races').snapshot(tx,userId),service:{name:quote.name,garageId:car.id,price:quote.price,after:quote.after}};
}
async function recover(tx,userId,body){
 if(Object.keys(body).some(key=>key!=='quoteKey'))fail(400,'Il piano di ripartenza è stabilito dall’officina');
 const info=await workshop(tx,userId),plan=info.recovery;if(!plan.available)fail(400,plan.reason);if(body.quoteKey!==plan.key)fail(409,'Piano cambiato: aggiorna il preventivo');
 if(plan.contributionCents)await charge(tx,userId,plan.contributionCents/100);
 let garageId=plan.garageId;
 if(plan.kind==='repair')await tx.garage.update({where:{id:garageId},data:plan.changes});
 else{const car=await tx.car.findUnique({where:{id:plan.carId}});const created=await tx.garage.create({data:{userId,carId:car.id,paintColour:paintFor(car),cv:car.cv,nm:car.nm,kg:car.kg,...Object.fromEntries(CAR_STATS.map(key=>[key,car[key]])),...plan.changes}});garageId=created.id;}
 const total=plan.debtCents+plan.advanceCents;const carIds=[...new Set([...plan.lockedCarIds,...(plan.advanceCents>0?[garageId]:[])])];await saveDebt(tx,userId,{debtCents:total,carIds:total?carIds:[]});
 await tx.user.update({where:{id:userId},data:{carDrive:garageId}});
 return {...await require('./races').snapshot(tx,userId),recoveryReceipt:{name:plan.name,garageId,paidCents:plan.contributionCents,advancedCents:plan.advanceCents,debtCents:total}};
}
async function repay(tx,userId,body){
 if(Object.keys(body).some(key=>key!=='amount')||typeof body.amount!=='number'||!Number.isFinite(body.amount)||body.amount<=0)fail(400,'Importo di rimborso non valido');
 const amount=cents(body.amount),state=await recoveryState(tx,userId);if(amount<=0||amount>state.debtCents)fail(400,'Importo superiore all’anticipo residuo');await charge(tx,userId,amount/100);const remaining=state.debtCents-amount;await saveDebt(tx,userId,{debtCents:remaining,carIds:remaining?state.lockedCarIds:[]});
 return {...await require('./races').snapshot(tx,userId),repaid:{amountCents:amount,debtCents:remaining}};
}
async function withholdReward(tx,userId,state,reward){
 const debt=await recoveryState(tx,userId);if(!debt.debtCents||reward.money<=0)return;
 const gross=cents(reward.money),stakeRefund=Math.min(gross,cents(state.wager||0));const payment=Math.min(debt.debtCents,Math.floor((gross-stakeRefund)/2));if(payment<=0)return;
 const remaining=debt.debtCents-payment;await saveDebt(tx,userId,{debtCents:remaining,carIds:remaining?debt.lockedCarIds:[]});reward.money=(gross-payment)/100;state.recoveryRepayment={paidCents:payment,debtCents:remaining,grossPrizeCents:gross};if(state.streetResult)state.streetResult.netMoney-=payment/100;
}
module.exports={workshop,service,recover,repay,recoveryState,withholdReward};
