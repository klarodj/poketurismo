// Idempotent compensation for levels earned before stat rewards existed.
const fs=require('node:fs');
const config=require('../server/node_modules/dotenv').parse(fs.readFileSync(process.env.ACCOUNTS_ENV_FILE||'/home/klaro/poketurismo-data/accounts/accounts.env'));
const {PrismaClient}=require('../server/generated/postgres');
const {levelStats}=require('../server/pilotProgression');
const db=new PrismaClient({datasources:{db:{url:config.DATABASE_URL}}});
(async()=>{const report=await db.$transaction(async tx=>{const rows=await tx.user.findMany({where:{id:{gt:0}}}),report=[];for(const u of rows){const key='pilot-level-stats-v1';if(await tx.gameOperation.findUnique({where:{userId_key:{userId:u.id,key}}}))continue;const levels=Math.max(0,u.level-1);report.push({userId:u.id,levels,pointsPerAbility:levels*3});if(process.argv.includes('--apply')){await tx.user.update({where:{id:u.id},data:levelStats(u,levels)});await tx.gameOperation.create({data:{userId:u.id,key,kind:'pilot-level-compensation',fingerprint:'v1',response:JSON.stringify({levels})}});}}return report;});console.log(JSON.stringify({applied:process.argv.includes('--apply'),report}));})().finally(()=>db.$disconnect()).catch(e=>{console.error(e.message);process.exitCode=1});
