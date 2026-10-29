const {createHash}=require('node:crypto');
const {CAR_STATS,PILOT_STATS}=require('./raceEngine');
const {marketTier,usedRetailPrice,newCarPrice}=require('../shared/carEconomy.mjs');
const {seededPaint}=require('./carPaint');
const {canonical,transaction}=require('./persistence');
const STATE_KEY='used-market-daily-v1',PLAYER_KIND='market-player-listing';
const TIERS=['starter','compact','sport','gt','performance','super'],TARGETS=[8,6,6,5,4,3];
const dayFormat=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'});
function marketDay(now=new Date()){return dayFormat.format(now);}
function hash(value){return createHash('sha256').update(value).digest().readUInt32LE(0);}
function planDailyStock(cars,day,previousModels=[]){
 const listings=[];
 for(let tier=0;tier<TIERS.length;tier++){
  const pool=cars.filter(c=>marketTier(c).id===TIERS[tier]).sort((a,b)=>Number(previousModels.includes(a.id))-Number(previousModels.includes(b.id))||hash(day+':model:'+a.id)-hash(day+':model:'+b.id)||a.id-b.id);
  if(!pool.length)continue;
  for(let i=0;i<TARGETS[tier];i++){
   const cheap=pool.filter(c=>newCarPrice(c)<=12000),car=(tier===0&&i<2&&cheap.length?cheap:pool)[i%(tier===0&&i<2&&cheap.length?cheap.length:pool.length)],seed=hash(`${day}:${tier}:${i}:${car.id}`),starter=tier===0;
   const km=starter?35000+seed%100*1000:20000+seed%165*1000,engineHealth=starter?88+seed%8:77+seed%21,tireGrip=starter?79+(seed>>>5)%14:66+(seed>>>5)%30;
   const data={userId:-1,carId:car.id,paintColour:seededPaint(`daily:${day}:${tier}:${i}:${car.id}`),...Object.fromEntries([...CAR_STATS,'cv','nm','kg'].map(k=>[k,car[k]])),km,engineHealth,tireGrip,serviceKm:Math.max(0,km-2000-seed%4000),currentFuel:10+seed%7,fuelType:'Normale'};
   // All non-starters retain the same protected floor as the regular market.
   data.sellPrice=usedRetailPrice({...car,price:newCarPrice(car)},data);listings.push(data);
  }
 }
 return listings;
}
async function markPlayerListing(tx,id){await tx.gameOperation.upsert({where:{userId_key:{userId:-1,key:`market-player-${id}`}},create:{userId:-1,key:`market-player-${id}`,kind:PLAYER_KIND,fingerprint:String(id),response:JSON.stringify({garageId:id})},update:{response:JSON.stringify({garageId:id})}});}
async function playerListingIds(tx){return new Set((await tx.gameOperation.findMany({where:{userId:-1,kind:PLAYER_KIND},select:{response:true}})).map(row=>JSON.parse(row.response).garageId));}
function identifyLegacySales(sales,garages){
 const fingerprints=new Map();for(const {id}of garages)for(const garageId of [id,String(id)])fingerprints.set(createHash('sha256').update(JSON.stringify(canonical({garageId,params:{}}))).digest('hex'),id);
 const protectedIds=new Set();let uncertain=false;for(const sale of sales){const id=fingerprints.get(sale.fingerprint);if(id!==undefined)protectedIds.add(id);else uncertain=true;}return {protectedIds:[...protectedIds],uncertain};
}
async function legacyExpiryIds(tx){
 const opening=await tx.gameOperation.findUnique({where:{userId_key:{userId:-1,key:'used-market-opening-v1'}}});
 if(!opening)return [];
 const ids=(JSON.parse(opening.response).listings||[]).map(row=>row.id),sales=await tx.gameOperation.findMany({where:{kind:'sell-car',userId:{gt:0}},select:{fingerprint:true}});
 const all=await tx.garage.findMany({select:{id:true}}),{protectedIds,uncertain}=identifyLegacySales(sales,all);
 for(const id of protectedIds)await markPlayerListing(tx,id);
 // If a historical sale cannot be identified, retain the old lot rather than risk a player's listing.
 return uncertain?[]:ids;
}
async function ensureDailyMarket(tx,now=new Date()){
 const day=marketDay(now),row=await tx.gameOperation.findUnique({where:{userId_key:{userId:-1,key:STATE_KEY}}}),previous=row?JSON.parse(row.response):null;
 if(previous?.day>=day)return previous;
 await tx.user.upsert({where:{id:-1},create:{id:-1,username:'Mercato',password:'',mail:'',carDrive:0,...Object.fromEntries(PILOT_STATS.map(k=>[k,0]))},update:{}});
 const expired=previous?.listingIds||await legacyExpiryIds(tx),protectedIds=await playerListingIds(tx);
 const candidates=await tx.garage.findMany({where:{id:{in:expired},userId:-1},include:{mods:true}});
 const removeIds=candidates.filter(r=>!protectedIds.has(r.id)&&!r.mods.length).map(r=>r.id);
 if(removeIds.length)await tx.garage.deleteMany({where:{id:{in:removeIds},userId:-1}});
 const cars=await tx.car.findMany(),plan=planDailyStock(cars,day,previous?.modelIds||[]),listingIds=[];
 for(const data of plan)listingIds.push((await tx.garage.create({data})).id);
 const state={day,listingIds,modelIds:plan.map(r=>r.carId)};
 await tx.gameOperation.upsert({where:{userId_key:{userId:-1,key:STATE_KEY}},create:{userId:-1,key:STATE_KEY,kind:'daily-market',fingerprint:'v1',response:JSON.stringify(state)},update:{response:JSON.stringify(state)}});
 return state;
}
function startDailyMarketClock(prisma){const timer=setInterval(()=>transaction(prisma,tx=>ensureDailyMarket(tx)).catch(error=>console.error('Aggiornamento usati rinviato:',error.code||'errore')),60000);timer.unref();return timer;}
module.exports={identifyLegacySales,STATE_KEY,PLAYER_KIND,marketDay,planDailyStock,ensureDailyMarket,markPlayerListing,playerListingIds,startDailyMarketClock};
