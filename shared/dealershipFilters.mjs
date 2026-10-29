import {championshipCarErrors} from './championshipCatalog.mjs';
import {performanceIndex} from './vehiclePerformance.mjs';
export const DEALER_FILTERS={maxPrice:'',cvMin:'',cvMax:'',drive:'',engine:'',minIP:''};
export function stockVehicle(car){return {...car,baseCv:car.cv,baseKg:car.kg,currentFuel:20,fuelType:'Normale',engineHealth:100,tireGrip:100,km:0,serviceKm:0};}
export function dealershipMatches(car,{brand='',budget=false,money=0,search='',filters=DEALER_FILTERS,cup=null}={}){
 const c=stockVehicle(car),contains=`${car.brand?.name||''} ${car.name}`.toLocaleLowerCase('it-IT').includes(search.trim().toLocaleLowerCase('it-IT'));
 if(!contains||brand&&car.brandId!==Number(brand)||budget&&car.price>money)return false;
 const number=(key,fallback)=>filters[key]===''||filters[key]===undefined?fallback:Number(filters[key]);
 return car.price<=number('maxPrice',Infinity)&&car.cv>=number('cvMin',0)&&car.cv<=number('cvMax',Infinity)&&(!filters.drive||car.driveType===filters.drive)&&(!filters.engine||car.engineType===filters.engine)&&performanceIndex(c)>=number('minIP',0)&&(!cup||championshipCarErrors(c,cup).length===0);
}
