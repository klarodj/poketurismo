// Presentation only: the physics engine continues to use litres per 100 km.
export const kmPerLiter = litresPer100Km => Number.isFinite(litresPer100Km)&&litresPer100Km>0 ? 100/litresPer100Km : null;
export const efficiencyLabel = value => value==null||!Number.isFinite(value)?'—':value.toLocaleString('it-IT',{minimumFractionDigits:1,maximumFractionDigits:1});
export function experienceProgress(exp){
 const parsed=Number(exp),total=Number.isFinite(parsed)?Math.max(0,Math.floor(parsed)):0,level=Math.floor(total/1000)+1,current=total%1000;
 return{level,current,required:1000,remaining:1000-current,nextLevel:level+1,total};
}
