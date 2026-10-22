const path=require('node:path'),{createRequire}=require('node:module');const requireServer=createRequire(path.resolve(__dirname,'../server/package.json'));
requireServer('dotenv').config({path:process.env.ACCOUNTS_ENV_FILE||'/home/klaro/poketurismo-data/accounts/accounts.env',quiet:true});
const{PrismaClient}=require('../server/database');const{seedChampionships}=require('../server/championships');const{CHAMPIONSHIP_CATALOG}=require('../shared/championshipCatalog.mjs');const prisma=new PrismaClient();
(async()=>console.log(JSON.stringify(process.argv.includes('--apply')?await prisma.$transaction(seedChampionships,{isolationLevel:'Serializable',timeout:30000}):CHAMPIONSHIP_CATALOG,null,2)))().catch(e=>{console.error(e.message);process.exitCode=1}).finally(()=>prisma.$disconnect());
