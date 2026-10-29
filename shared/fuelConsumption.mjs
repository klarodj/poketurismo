// Warm-engine game estimates, not a homologated road or dynamometer cycle.
export const FUEL_MODEL_VERSION = 3;
export const FUEL_DISTANCE_SCALE = 4;
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const positive=(value,fallback)=>Number.isFinite(Number(value))&&Number(value)>0?Number(value):fallback;
export function consumptionEstimate(input={}){
 const base=input.car||{},cv=positive(input.cv,positive(base.cv,100));
 const baseCv=positive(input.baseCv,positive(base.cv,cv));
 const cc=positive(input.cc,positive(base.cc,clamp(baseCv/0.065,800,8000)));
 const kg=positive(input.kg,positive(base.kg,1000));
 const engineType=input.engineType||base.engineType||'NA';
 const tuningRatio=Math.max(1,cv/baseCv),enrichment=1+Math.min(0.5,(tuningRatio-1)*0.2);
 const mixed=(3.6+1.4*cc/1000+0.015*cv+0.001*clamp(kg-900,-400,2500))*enrichment;
 const boost=/turbo/i.test(engineType)?1.08:/volumetr|supercharg|compress/i.test(engineType)?1.06:1;
 const balanced=mixed*1.45*boost;
 return {cc,cv,baseCv,tuningRatio,mixed,balanced,save:balanced*0.78,attack:balanced*1.3};
}
export function sectorFuel(car,section,decision={},move=null,version=FUEL_MODEL_VERSION){
 const segments=section.segments||[],km=segments.reduce((sum,s)=>sum+Math.max(0,Number(s.lengthM)||0),0)/1000;
 const aggression=decision.pace==='save'?0.78:decision.pace==='attack'?1.3:1;
 const technique=move?.aggressiveness?Math.min(1.3,1+(move.aggressiveness-1)*0.1):1;
 if(version!==2&&version!==3)return Math.max(section.layoutVersion===2?0:0.01,car.cv*0.0002*km*aggression*technique);
 const loadedKm=segments.reduce((sum,s)=>sum+Math.max(0,Number(s.lengthM)||0)/1000*clamp(1+(Number(s.grade)||0)*3,0.75,1.5),0);
 return consumptionEstimate(car).balanced/100*loadedKm*aggression*technique*(version===3?FUEL_DISTANCE_SCALE:1);
}
