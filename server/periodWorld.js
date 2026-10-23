const {WORLD_TRACKS,periodCupName,trackAliases,cupAliases}=require('../shared/periodWorld.mjs');
const {CHAMPIONSHIP_CATALOG}=require('../shared/championshipCatalog.mjs');
async function alignPeriodWorld(tx,{apply=false}={}){
 const tracks=[],championships=[];
 for(const[oldName,newName]of WORLD_TRACKS){const rows=await tx.track.findMany({where:{name:{in:trackAliases(oldName)}}});if(rows.length>1)throw Error(`Nomi tracciato duplicati da verificare: ${newName}`);const row=rows[0];if(row&&row.name!==newName){if(apply)await tx.track.update({where:{id:row.id},data:{name:newName}});tracks.push({id:row.id,before:row.name,after:newName});}}
 for(const spec of CHAMPIONSHIP_CATALOG){const rows=await tx.championship.findMany({where:{name:{in:cupAliases(spec.name)}}});if(rows.length>1)throw Error(`Nomi campionato duplicati da verificare: ${spec.name}`);const row=rows[0];if(row&&(row.name!==spec.name||row.description!==spec.description)){if(apply)await tx.championship.update({where:{id:row.id},data:{name:spec.name,description:spec.description}});championships.push({id:row.id,before:row.name,after:spec.name});}}
 return {tracks,championships};
}
function presentPeriodEntry(entry){if(!entry)return entry;const result={...entry};if(result.championship)result.championship={...result.championship,name:periodCupName(result.championship.name),rounds:result.championship.rounds?.map(round=>({...round,track:round.track?{...round.track,name:require('../shared/periodWorld.mjs').periodTrackName(round.track.name)}:round.track}))};if(Array.isArray(result.results))result.results=result.results.map(round=>({...round,trackName:require('../shared/periodWorld.mjs').periodTrackName(round.trackName)}));return result;}
module.exports={alignPeriodWorld,presentPeriodEntry};
