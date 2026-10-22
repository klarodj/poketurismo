const path=require('node:path');
const {createRequire}=require('node:module');
const requireServer=createRequire(path.resolve(__dirname,'../server/package.json'));
requireServer('dotenv').config({path:process.env.ACCOUNTS_ENV_FILE||'/home/klaro/poketurismo-data/accounts/accounts.env',quiet:true});
const {PrismaClient}=require('../server/database');
const {applyTracks}=require('../server/trackStock');
const {TRACK_CATALOG}=require('../shared/trackCatalog.mjs');
const prisma=new PrismaClient();
(async()=>console.log(JSON.stringify(process.argv.includes('--apply')?await applyTracks(prisma):TRACK_CATALOG,null,2)))().catch(error=>{console.error(error.message);process.exitCode=1;}).finally(()=>prisma.$disconnect());
