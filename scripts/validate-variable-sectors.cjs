const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{createRequire}=require('node:module'),serverRequire=createRequire(path.resolve(__dirname,'../server/package.json'));
if(!process.env.ACCOUNTS_VALIDATION_ENV_FILE)throw Error('File del database locale di collaudo richiesto');
const env=serverRequire('dotenv').parse(fs.readFileSync(process.env.ACCOUNTS_VALIDATION_ENV_FILE)),url=new URL(env.DATABASE_URL);if(!['127.0.0.1','localhost'].includes(url.hostname)||!url.pathname.endsWith('_validation'))throw Error('Solo un database locale *_validation');process.env.DATABASE_URL=env.DATABASE_URL;
const{PrismaClient}=require('../server/database'),{Client}=serverRequire('pg'),{resetRaceHistory,cleanedStreetState}=require('../server/resetRaceHistory'),{buildTacticalTrack}=require('../shared/trackGeometry.mjs');const prisma=new PrismaClient();
const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'&&!(x instanceof Date)?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
const order=rows=>rows.map(canonical).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));
async function capture(){const pg=new Client({connectionString:env.DATABASE_URL});await pg.connect();try{const data={};for(const{table_name:name}of(await pg.query("SELECT table_name FROM information_schema.tables WHERE table_schema='game' AND table_type='BASE TABLE' ORDER BY table_name")).rows)data[name]=(await pg.query('SELECT * FROM game."'+name+'"')).rows;return JSON.parse(JSON.stringify(data));}finally{await pg.end();}}
(async()=>{
 const stats=Object.fromEntries(['brave','clean','reflex','acro','turn','brake','throttle','shift'].map(key=>[key,30]));
 const actor=await prisma.user.create({data:{username:'Luca_16v_QA',password:'qa-only',mail:'',moneyCents:1500000,level:10,carDrive:0,...stats}}),peer=await prisma.user.create({data:{username:'Beppe_Rallye_QA',password:'qa-only',mail:'',moneyCents:1000000,level:10,carDrive:0,...stats}});
 const car=await prisma.car.findFirst({where:{name:'Rx-7 FD'}});assert.ok(car);
 const garage=await prisma.garage.create({data:{userId:actor.id,carId:car.id,cv:car.cv,nm:car.nm,kg:car.kg,...Object.fromEntries(['speed','acceleration','revving','transmission','turnSlow','turnFast','brake','traction'].map(key=>[key,car[key]]))}});await prisma.user.update({where:{id:actor.id},data:{carDrive:garage.id}});
 await prisma.driverDevelopment.create({data:{userId:actor.id,lessonPassed:true,techniqueProgress:'{"exit-line":{"passed":true,"practice":10}}'}});
 await prisma.playerProgress.create({data:{userId:actor.id,streetState:JSON.stringify({parking:{reputation:100,wins:5,rivals:{old:{races:6,wins:5}},offer:{id:'old'}},industrial:{reputation:100},coast:{reputation:100}}),recoveryState:'{"debtCents":0}'}});
 const cup=await prisma.championship.findFirst();assert.ok(cup);const entry=await prisma.championshipEntry.create({data:{userId:actor.id,championshipId:cup.id}});
 const race=await prisma.raceSession.create({data:{userId:actor.id,garageId:garage.id,mode:'track',seed:1,state:'{"oldTestRecord":true}',status:'completed'}});
 await prisma.meetChallenge.create({data:{senderId:actor.id,recipientId:peer.id,contract:'{}',expiresAt:new Date(Date.now()+3600000),senderRaceId:race.id}});
 await prisma.meetMessage.create({data:{senderId:actor.id,recipientId:peer.id,text:'Ci vediamo al piazzale dopo il collaudo.'}});
 await prisma.gameOperation.create({data:{userId:actor.id,key:'qa-reset-race',kind:'start-race',fingerprint:'qa',response:JSON.stringify({race:{id:race.id}})}});await prisma.gameOperation.create({data:{userId:actor.id,key:'qa-reset-purchase',kind:'purchase-car',fingerprint:'qa',response:'{"success":true}'}});
 const before=await capture(),dry=await prisma.$transaction(tx=>resetRaceHistory(tx));assert.deepEqual(await capture(),before);
 const applied=await prisma.$transaction(tx=>resetRaceHistory(tx,{apply:true}),{isolationLevel:'Serializable',timeout:30000});assert.deepEqual(applied,dry);const after=await capture();
 for(const table of Object.keys(before)){
  if(['RaceSession','ChampionshipEntry','MeetChallenge'].includes(table)){assert.equal(after[table].length,0);continue;}
  if(table==='PlayerProgress'){assert.deepEqual(order(after[table]),order(before[table].map(row=>({...row,streetState:cleanedStreetState(row.streetState)}))));continue;}
  if(table==='GameOperation'){assert.equal(after[table].length,before[table].length);for(const row of after[table]){const old=before[table].find(r=>r.userId===row.userId&&r.key===row.key);assert.deepEqual({...row,response:old.response},old);if(row.response!==old.response)assert.deepEqual(JSON.parse(row.response),{raceHistoryReset:true});}continue;}
  assert.deepEqual(order(after[table]),order(before[table]),table+' unchanged');
 }
 assert.equal((await prisma.gameOperation.findUnique({where:{userId_key:{userId:actor.id,key:'qa-reset-purchase'}}})).response,'{"success":true}');
 assert.deepEqual(await prisma.$transaction(tx=>resetRaceHistory(tx,{apply:true})),{races:0,championshipEntries:0,meetChallenges:0,operationReceipts:0,streetHistories:0});
 const tracks=await prisma.track.findMany({include:{builds:{include:{section:true},orderBy:{ord:'asc'}}}});const counts=tracks.map(t=>({name:t.name,km:t.lenght>=100?t.lenght/1000:t.lenght,sectors:buildTacticalTrack(t.builds.map(b=>b.section),t.lenght>=100?t.lenght/1000:t.lenght).length}));assert.ok(new Set(counts.map(t=>t.sectors)).size>=8);
 const report={userId:actor.id,peerId:peer.id,garageId:garage.id,reset:applied,counts,careerAndMessagesPreserved:true};fs.writeFileSync('/tmp/poketurismo-sectors-validation-ready.json',JSON.stringify(report,null,2),{mode:0o600});console.log(JSON.stringify({reset:applied,tracks:counts.length,counts:[...new Set(counts.map(t=>t.sectors))].sort((a,b)=>a-b),careerAndMessagesPreserved:true}));
})().catch(error=>{console.error(error.message);process.exitCode=1;}).finally(()=>prisma.$disconnect());
