import {performance} from './raceEngine.mjs';
import {vehicleModel} from './tacticalRace.mjs';
// A single index for the car actually driven: power/weight, attainable speed and handling.
export function performanceIndex(car){
 if(!car)return 0;
 const base=car.car||car;
 const input={...base,...car,baseCv:car.baseCv??base.cv,baseKg:car.baseKg??base.kg};
 const model=vehicleModel(input,{}),actual=performance(input);
 const handling=['turnSlow','turnFast','brake','traction'].reduce((sum,key)=>sum+actual[key],0)/4;
 return Math.round(15+0.32*model.power/model.mass+0.04*model.topSpeed*3.6+0.15*handling);
}
