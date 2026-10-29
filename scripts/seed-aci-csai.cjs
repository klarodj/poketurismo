// Additive only: no cleanup, updates, track rebuilds or changes to existing seasons.
require('../server/node_modules/dotenv').config({path:process.env.ACCOUNTS_ENV_FILE||'/home/klaro/poketurismo-data/accounts/accounts.env',quiet:true});
const {PrismaClient}=require('../server/database'),{seedChampionships}=require('../server/championships'),{CHAMPIONSHIP_CATALOG}=require('../shared/championshipCatalog.mjs');
const prisma=new PrismaClient();
(async()=>{
 const existing=await prisma.championship.findMany({select:{name:true}});
 const pending=CHAMPIONSHIP_CATALOG.filter(c=>c.series==='aci-csai'&&!existing.some(e=>e.name===c.name));
 console.log(JSON.stringify(process.argv.includes('--apply')?await prisma.$transaction(tx=>seedChampionships(tx,{series:'aci-csai',cleanDuplicates:false}),{isolationLevel:'Serializable',timeout:30000}):{pending:pending.map(c=>({name:c.name,rounds:c.tracks.length,minCv:c.minCv,maxCv:c.maxCv,minLevel:c.minLevel,entryFee:c.entryFee,rewardMoney:c.rewardMoney}))},null,2));
})().catch(e=>{console.error(e.message);process.exitCode=1;}).finally(()=>prisma.$disconnect());
