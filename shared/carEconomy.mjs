// Game economy, not real-world car valuations. Wear cannot make a performance car a starter.
const INITIAL_MONEY_CENTS = 1_000_000;
const MARKET_TIERS = [
  { id: 'starter', name: 'Primi passi', maxCv: 85, maxCvPerTon: 110, minAcceleration: 10.5, maxSpeed: 175, newFloor: 8000, usedFloor: 3800 },
  { id: 'compact', name: 'Compatte sportive', maxCv: 120, maxCvPerTon: 150, minAcceleration: 8.5, maxSpeed: 200, newFloor: 15000, usedFloor: 11000 },
  { id: 'sport', name: 'Sportive', maxCv: 180, maxCvPerTon: 180, minAcceleration: 7.5, maxSpeed: 225, newFloor: 24000, usedFloor: 16000 },
  { id: 'gt', name: 'Gran turismo', maxCv: 250, maxCvPerTon: 220, minAcceleration: 6.2, maxSpeed: 250, newFloor: 42000, usedFloor: 26000 },
  { id: 'performance', name: 'Alte prestazioni', maxCv: 400, maxCvPerTon: 300, minAcceleration: 4.5, maxSpeed: 285, newFloor: 70000, usedFloor: 44000 },
  { id: 'super', name: 'Supercar', maxCv: Infinity, maxCvPerTon: Infinity, minAcceleration: 0, maxSpeed: Infinity, newFloor: 120000, usedFloor: 75000 },
];
const clamp = (n, min, max) => Math.max(min, Math.min(max, Number(n) || 0));
const roundUp = (n, step = 50) => Math.ceil(n / step) * step;
function marketTier(car, garage) {
  const cv = garage?.cv ?? car.cv, kg = garage?.kg ?? car.kg;
  if (![cv,kg,car.zeroToHundred,car.velMax].every(Number.isFinite) || cv<=0 || kg<400 || car.zeroToHundred<=0 || car.velMax<=0) return MARKET_TIERS.at(-1);
  return MARKET_TIERS.find(tier => cv<=tier.maxCv && cv*1000/kg<=tier.maxCvPerTon && car.zeroToHundred>=tier.minAcceleration && car.velMax<=tier.maxSpeed) || MARKET_TIERS.at(-1);
}
function newCarPrice(car) { return Math.max(marketTier(car).newFloor, roundUp(Math.max(0, Number(car.price)||0), 100)); }
function usedRetailPrice(car, garage) {
  const tier=marketTier(car,garage);
  const condition=0.7*clamp(garage.engineHealth,0,100)/100+0.3*clamp(garage.tireGrip,0,100)/100;
  const mileage=clamp(1-Math.max(0,garage.km||0)/600000,0.62,1);
  const upgrades=(garage.mods||[]).reduce((sum,mod)=>sum+Math.max(0,mod.part?.price||0)*0.25,0);
  const reference=Math.max(newCarPrice(car)*0.72,tier.usedFloor*1.15);
  const value=tier.usedFloor+(reference-tier.usedFloor)*condition*mileage+Math.min(upgrades,newCarPrice(car)*0.3);
  return Math.max(tier.usedFloor,roundUp(value));
}
function marketAskingPrice(car, garage) {
  return Math.max(marketTier(car,garage).usedFloor, Number(garage.sellPrice)||0);
}
function tradeInValue(car, garage) {
  // A cheap upgrade crossing a tier must not turn unlimited new-car purchases into cash.
  const stockValue=usedRetailPrice(car,{...garage,cv:car.cv,kg:car.kg,mods:[]});
  const upgrades=(garage.mods||[]).reduce((sum,mod)=>sum+Math.max(0,mod.part?.price||0)*0.25,0);
  const payout=Math.min(usedRetailPrice(car,garage)*0.72,stockValue*0.72+Math.min(upgrades,newCarPrice(car)*0.3));
  return Math.floor(payout/50)*50;
}
function publicMarketItem(garage) {
  const tier=marketTier(garage.car,garage);
  return {...garage,sellPrice:marketAskingPrice(garage.car,garage),marketTier:{id:tier.id,name:tier.name},starterFriendly:tier.id==='starter'};
}
export { INITIAL_MONEY_CENTS, MARKET_TIERS, marketTier, newCarPrice, usedRetailPrice, marketAskingPrice, tradeInValue, publicMarketItem };
