const {trackAliases}=require('../shared/periodWorld.mjs');
const { TRACK_CATALOG } = require('../shared/trackCatalog.mjs');
async function applyTracks(prisma) {
  return prisma.$transaction(async tx => {
    const [types, surfaces, weather, sections] = await Promise.all([tx.trackType.findMany(), tx.trackSurface.findMany(), tx.trackMeteo.findMany(), tx.trackSection.findMany()]);
    const required = (items, name) => { const item=items.find(row=>row.name===name); if(!item) throw new Error(`Riferimento tracciato mancante: ${name}`); return item.id; };
    const ids=new Set(sections.map(section=>section.id));
    const created=[]; const existing=[];
    for(const entry of TRACK_CATALOG) {
      if(entry.sections.some(id=>!ids.has(id))) throw new Error(`Settore mancante: ${entry.name}`);
      const found=await tx.track.findFirst({where:{name:{in:trackAliases(entry.name)}}});
      if(found) {existing.push(found.id);continue;}
      const row=await tx.track.create({data:{name:entry.name,typeId:required(types,entry.type),surfaceId:required(surfaces,'tarmac'),meteoId:required(weather,entry.weather),lenght:entry.distanceM,elevation:entry.elevation,
        builds:{create:entry.sections.map((sectionId,index)=>({sectionId,ord:index+1,level:entry.difficulty}))}}});
      created.push({id:row.id,name:row.name});
    }
    return {created,existing};
  },{isolationLevel:'Serializable',timeout:30000});
}
module.exports={applyTracks};
