const {trackAliases}=require('../shared/periodWorld.mjs');
const path=require('node:path');const{createRequire}=require('node:module');const requireServer=createRequire(path.resolve(__dirname,'../server/package.json'));
requireServer('dotenv').config({path:process.env.ACCOUNTS_ENV_FILE||'/home/klaro/poketurismo-data/accounts/accounts.env',quiet:true});
const{PrismaClient}=require('../server/database');const{STREET_TRACKS,STREET_ZONES}=require('../shared/streetCatalog.mjs');const prisma=new PrismaClient();
async function seedStreet(tx){const [types,surfaces,weather,sections,cars,tracks]=await Promise.all([tx.trackType.findMany(),tx.trackSurface.findMany(),tx.trackMeteo.findMany(),tx.trackSection.findMany(),tx.car.findMany(),tx.track.findMany()]);
 const required=(items,name)=>{const item=items.find(row=>row.name===name||(items===tracks&&trackAliases(name).includes(row.name)));if(!item)throw Error(`Riferimento mancante: ${name}`);return item.id;};
 for(const zone of STREET_ZONES){for(const rival of zone.rivals)required(cars,rival.carName);for(const name of zone.tracks.filter(name=>!STREET_TRACKS.some(t=>t.name===name)))required(tracks,name);}
 const created=[];for(const track of STREET_TRACKS){if(tracks.some(t=>trackAliases(track.name).includes(t.name)))continue;for(const id of track.sections)if(!sections.some(s=>s.id===id))throw Error(`Settore mancante: ${id}`);created.push(await tx.track.create({data:{name:track.name,typeId:required(types,track.type),surfaceId:required(surfaces,'tarmac'),meteoId:required(weather,track.weather),lenght:track.distanceM,elevation:track.elevation,builds:{create:track.sections.map((sectionId,i)=>({sectionId,ord:i+1,level:track.difficulty}))}}}));}return{created:created.map(t=>t.name),zones:STREET_ZONES.length,rivals:STREET_ZONES.reduce((n,z)=>n+z.rivals.length,0)};
}
if(require.main===module)(async()=>console.log(JSON.stringify(process.argv.includes('--apply')?await prisma.$transaction(seedStreet,{isolationLevel:'Serializable',timeout:30000}):{tracks:STREET_TRACKS,zones:STREET_ZONES},null,2)))().catch(error=>{console.error(error.message);process.exitCode=1;}).finally(()=>prisma.$disconnect());
module.exports={seedStreet};
