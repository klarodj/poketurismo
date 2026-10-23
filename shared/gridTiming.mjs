import {gridClassification} from './championshipCatalog.mjs';
// Timing at the same sector line for all entrants, never physical track distance.
export function gridTiming(rows,{sector,totalSectors,featuredId,finished=false}){
 const started=sector>0||finished;
 const sorted=finished&&rows.every(row=>Number.isInteger(row.position))?rows.map(row=>({...row})):started?gridClassification(rows):rows.map(row=>({...row,position:null}));
 const runners=sorted.filter(row=>!row.failure),leader=runners[0],player=sorted.find(row=>row.id==='player');
 const playerIndex=runners.findIndex(row=>row.id==='player');
 const neighbor=row=>row?{id:row.id,name:row.name,carName:row.carName,position:row.position,gapMs:Math.abs(row.timeMs-player.timeMs),tied:row.position===player.position}:null;
 const ahead=started&&playerIndex>0?neighbor(runners[playerIndex-1]):null;
 const behind=started&&playerIndex>=0?neighbor(runners[playerIndex+1]):null;
 return {sector,totalSectors,total:sorted.length,started,finished,position:started?player?.position??null:null,playerRetired:!!player?.failure,
 leaderGapMs:started&&player&&!player.failure&&leader?Math.max(0,player.timeMs-leader.timeMs):null,ahead,behind,featuredId,
 rows:sorted.map(row=>{const index=runners.findIndex(r=>r.id===row.id);return{id:row.id,name:row.name,carName:row.carName,timeMs:started?row.timeMs:null,position:row.position,failure:row.failure||null,player:row.id==='player',featured:row.id===featuredId,
 leaderGapMs:started&&!row.failure&&leader?Math.max(0,row.timeMs-leader.timeMs):null,intervalMs:started&&!row.failure&&index>0?Math.max(0,row.timeMs-runners[index-1].timeMs):null};})};
}
export function gridCheckpoint(timing){const{rows:_rows,...summary}=timing;return summary;}
