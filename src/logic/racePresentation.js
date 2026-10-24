export function formatRaceTime(seconds) {
  const milliseconds = Math.round(Math.max(0, seconds || 0) * 1000);
  return `${Math.floor(milliseconds / 60000)}:${String(Math.floor(milliseconds / 1000) % 60).padStart(2, '0')}.${String(milliseconds % 1000).padStart(3, '0')}`;
}

export function conditionLabel(value){return ({sunny:'Sereno',rainy:'Pioggia',snowy:'Neve',foggy:'Nebbia',night:'Notte',dry:'Asciutto',wet:'Bagnato',asphalt:'Asfalto',tarmac:'Asfalto',gravel:'Sterrato',dirt:'Sterrato'})[value?.toLowerCase()]||value;}
