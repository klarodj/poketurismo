export function formatRaceTime(seconds) {
  const milliseconds = Math.round(Math.max(0, seconds || 0) * 1000);
  return `${Math.floor(milliseconds / 60000)}:${String(Math.floor(milliseconds / 1000) % 60).padStart(2, '0')}.${String(milliseconds % 1000).padStart(3, '0')}`;
}

export function conditionLabel(value){return ({sunny:'Sereno',rainy:'Pioggia',snowy:'Neve',foggy:'Nebbia',night:'Notte',dry:'Asciutto',wet:'Bagnato',asphalt:'Asfalto',tarmac:'Asfalto',gravel:'Sterrato',dirt:'Sterrato'})[value?.toLowerCase()]||value;}

// Training/solo sessions carry an internal reference car, not an actual opponent.
export function isSoloRace(race){return !!(race.timeTrial||race.meetTrial||race.soloDrive||race.lesson&&!race.trainingDuel||race.gridTacticsVersion===1&&!race.tacticalRivalId);}
// Ghost splits are milliseconds. Compare only completed, matching checkpoints.
export function ghostCheckpoint(race){
 const splits=race.meetGhost?.splits;
 if(!race.meetTrial||!Array.isArray(splits)||race.index<1||race.index>splits.length||!Number.isFinite(race.playerTime))return null;
 const completed=splits.slice(0,race.index);
 return completed.every(t=>Number.isFinite(t)&&t>=0)?completed.reduce((sum,t)=>sum+t,0)-Math.round(race.playerTime*1000):null;
}
