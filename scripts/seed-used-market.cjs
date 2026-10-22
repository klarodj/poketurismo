// Inspect by default; --apply persists a single idempotent opening stock batch.
const fs=require('node:fs');
const path=require('node:path');
const {createRequire}=require('node:module');
const requireServer=createRequire(path.resolve(__dirname,'../server/package.json'));
requireServer('dotenv').config({path:process.env.ACCOUNTS_ENV_FILE||'/home/klaro/poketurismo-data/accounts/accounts.env',quiet:true});
const {PrismaClient}=require('../server/database');
const {planStock,applyStock}=require('../server/marketStock');
const prisma=new PrismaClient();
(async()=>{const apply=process.argv.includes('--apply');const result=apply?await applyStock(prisma):planStock(await prisma.car.findMany());
const json=JSON.stringify(result,null,2);if(process.env.MARKET_REPORT_FILE)fs.writeFileSync(process.env.MARKET_REPORT_FILE,json,{mode:0o600});
console.log(json);})().catch(error=>{console.error(error.message);process.exitCode=1}).finally(()=>prisma.$disconnect());
