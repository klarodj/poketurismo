// A presentation summary of the same diminishing-return skill curve used by tacticalRace.
const STATS=['brave','clean','reflex','shift','acro','turn','brake','throttle'];
export function driverIndex(pilot){if(!pilot||STATS.some(k=>!Number.isFinite(pilot[k])))return null;return Math.round(STATS.reduce((n,k)=>{const v=Math.max(0,Math.min(100,pilot[k]));return n+135*v/(v+35);},0)/STATS.length);}
export function referenceAssessment(ratio){if(!Number.isFinite(ratio)||ratio<=0)return 'Valutazione non disponibile';return ratio>1.05?'Sei favorito':ratio>1.02?'Sei leggermente favorito':ratio<.95?'Rivale favorito':ratio<.98?'Rivale leggermente favorito':'Sfida equilibrata';}
export function indexAdvantage(player,rival,subject){if(player==null||rival==null)return `${subject}: confronto non disponibile`;const d=player-rival;return Math.abs(d)<=2?`${subject}: valori vicini`:`${subject}: ${d>0?'sei superiore':'rivale superiore'}`;}
