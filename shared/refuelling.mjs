export const TANK_CAPACITY=45;
export const REFUEL_PRICES={Normale:1.5,Premium:2.5};
export function refuelQuote(car,requested,fuelType){
 if(!car||!Object.hasOwn(REFUEL_PRICES,fuelType)||!Number.isFinite(requested)||requested<=0||requested>TANK_CAPACITY)return null;
 const capacity=Math.max(0,Math.round((TANK_CAPACITY-car.currentFuel)*100)/100),liters=Math.min(Math.round(requested*100)/100,capacity),unitPrice=REFUEL_PRICES[fuelType];
 return {liters,capacity,unitPrice,cost:Math.round(liters*unitPrice*100)/100,after:Math.round((car.currentFuel+liters)*100)/100};
}
