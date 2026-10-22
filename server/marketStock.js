const { CAR_STATS, PILOT_STATS } = require('./raceEngine');
const { marketTier, newCarPrice, usedRetailPrice } = require('../shared/carEconomy.mjs');
const STOCK_KEY = 'used-market-opening-v1';
const TARGETS = [8,6,6,5,4,3];
function planStock(cars) {
  const updated=cars.map(car=>({...car,price:newCarPrice(car)}));
  const groups=Array.from({length:6},()=>[]);
  for(const car of updated){const tier=marketTier(car);const index=['starter','compact','sport','gt','performance','super'].indexOf(tier.id);groups[index].push(car);}
  const listings=[];
  for(let tier=0;tier<groups.length;tier++) {
    const available=groups[tier].sort((a,b)=>a.price-b.price||a.id-b.id);
    if(!available.length) continue;
    for(let index=0;index<TARGETS[tier];index++) {
      // Spread the selection through the tier. The starter pool gets a few condition variants.
      const pos=tier===0?index%available.length:Math.round(index*(available.length-1)/Math.max(1,TARGETS[tier]-1));
      const car=available[pos];
      const km= tier===0?45000+index*11000:25000+((index*41+tier*23)%150)*1000;
      const engineHealth=tier===0?94-index%4*2:95-((index+tier)%6)*3;
      const tireGrip=tier===0?88-index%4*3:90-((index*2+tier)%7)*4;
      const data={userId:-1,carId:car.id,cv:car.cv,nm:car.nm,kg:car.kg,...Object.fromEntries(CAR_STATS.map(key=>[key,car[key]])),
        km,engineHealth,tireGrip,serviceKm:Math.max(0,km-3000-index*700),currentFuel:10+index%4*2,fuelType:'Normale'};
      const sellPrice=usedRetailPrice(car,data);
      listings.push({data:{...data,sellPrice},car,tier:marketTier(car).name});
    }
  }
  return {prices:updated.map(car=>({id:car.id,oldPrice:cars.find(item=>item.id===car.id).price,price:car.price})),listings};
}
async function applyStock(prisma) {
  return prisma.$transaction(async tx=>{
    await tx.user.upsert({where:{id:-1},create:{id:-1,username:'Mercato',password:'',mail:'',carDrive:0,...Object.fromEntries(PILOT_STATS.map(key=>[key,0]))},update:{}});
    const existing=await tx.gameOperation.findUnique({where:{userId_key:{userId:-1,key:STOCK_KEY}}});
    if(existing) return {applied:false,reason:'Il lotto iniziale è già stato generato; gli annunci acquistati non vengono ricreati.'};
    const cars=await tx.car.findMany();const plan=planStock(cars);
    for(const price of plan.prices)if(price.price!==price.oldPrice)await tx.car.update({where:{id:price.id},data:{price:price.price}});
    const ids=[];for(const item of plan.listings)ids.push((await tx.garage.create({data:item.data})).id);
    const report={applied:true,revisedNewPrices:plan.prices.filter(item=>item.price!==item.oldPrice).length,listings:plan.listings.map((item,index)=>({id:ids[index],carId:item.car.id,name:item.car.name,tier:item.tier,price:item.data.sellPrice,km:item.data.km,engineHealth:item.data.engineHealth,tireGrip:item.data.tireGrip}))};
    await tx.gameOperation.create({data:{userId:-1,key:STOCK_KEY,kind:'seed-used-market',fingerprint:STOCK_KEY,response:JSON.stringify(report)}});
    return report;
  },{isolationLevel:'Serializable',timeout:30000,maxWait:10000});
}
module.exports={STOCK_KEY,planStock,applyStock};
