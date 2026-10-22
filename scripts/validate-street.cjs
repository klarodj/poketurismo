// Integration checks are restricted to a disposable local PostgreSQL copy.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {createRequire}=require('node:module'),requireServer=createRequire(path.resolve(__dirname,'../server/package.json'));
if(!process.env.ACCOUNTS_VALIDATION_ENV_FILE)throw Error('Specificare il file privato del database temporaneo');
const config=requireServer('dotenv').parse(fs.readFileSync(process.env.ACCOUNTS_VALIDATION_ENV_FILE));const url=new URL(config.DATABASE_URL);
if(!url.pathname.endsWith('_validation')||!['127.0.0.1','localhost'].includes(url.hostname))throw Error('Usare esclusivamente un database locale *_validation');
process.env.DATABASE_URL=config.DATABASE_URL;process.env.POKETURISMO_AUTH_ENABLED='0';
const {app,prisma}=require('../server/index');const {seedStreet}=require('./seed-street.cjs');const {STREET_ZONES,STREET_TRACKS}=require('../shared/streetCatalog.mjs');const {PILOT_STATS}=require('../server/raceEngine');
let server,base;
async function request(endpoint,userId,body,key=crypto.randomUUID()){const response=await fetch(base+'/api'+endpoint,{method:body?'POST':'GET',headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify({userId,operationId:key,...body})}:{})});return{status:response.status,data:await response.json()};}
async function main(){
  const old=await prisma.track.findMany({include:{builds:{orderBy:{id:'asc'}}},orderBy:{id:'asc'}});
  const users=await prisma.user.findMany({where:{id:{gt:0}},orderBy:{id:'asc'}});const garages=await prisma.garage.findMany({where:{userId:{gt:0}},orderBy:{id:'asc'}});
  await prisma.$transaction(seedStreet);assert.equal((await prisma.$transaction(seedStreet)).created.length,0);
  for(const track of old)assert.deepEqual(await prisma.track.findUnique({where:{id:track.id},include:{builds:{orderBy:{id:'asc'}}}}),track);
  assert.deepEqual(await prisma.user.findMany({where:{id:{gt:0}},orderBy:{id:'asc'}}),users);assert.deepEqual(await prisma.garage.findMany({where:{userId:{gt:0}},orderBy:{id:'asc'}}),garages);
  assert.equal(await prisma.track.count({where:{name:{in:STREET_TRACKS.map(t=>t.name)}}}),3);
  const user=await prisma.user.create({data:{username:'Street validation '+crypto.randomUUID(),usernameKey:crypto.randomUUID(),password:'',mail:'',moneyCents:1000000,carDrive:0,...Object.fromEntries(PILOT_STATS.map(k=>[k,11]))}});
  const car=await prisma.car.findFirst({where:{name:'Seicento Sporting'}});const fields=['cv','nm','kg','speed','acceleration','revving','transmission','turnSlow','turnFast','brake','traction'];
  const garage=await prisma.garage.create({data:{userId:user.id,carId:car.id,...Object.fromEntries(fields.map(k=>[k,car[k]])),engineHealth:94,tireGrip:88,currentFuel:20}});
  await prisma.user.update({where:{id:user.id},data:{carDrive:garage.id}});
  server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));base='http://127.0.0.1:'+server.address().port;
  assert.equal((await request('/street/'+user.id)).data.zones.filter(z=>z.unlocked).length,1);
  assert.equal((await request('/street/encounter',user.id,{zoneId:'highway'})).status,403);
  let offer=(await request('/street/encounter',user.id,{zoneId:'parking'})).data.street.zones[0].offer;const seen=[offer.rival.id];
  for(let index=1;index<8;index++){offer=(await request('/street/encounter',user.id,{zoneId:'parking',replace:true,offerId:offer.id})).data.street.zones[0].offer;seen.push(offer.rival.id);}
  assert.equal(new Set(seen).size,8);assert.equal((await request('/street/'+user.id)).data.zones[0].offer.id,offer.id);
  const stake=offer.wagers.at(-1);const setup={mode:'street',zoneId:'parking',offerId:offer.id,wager:stake};
  const starts=await Promise.all([request('/races',user.id,setup),request('/races',user.id,setup)]);assert.deepEqual(starts.map(r=>r.status).sort(),[200,409]);let race=starts.find(r=>r.status===200).data.race;
  assert.equal((await prisma.user.findUnique({where:{id:user.id}})).moneyCents,1000000-stake*100);
  assert.equal((await request('/races/'+race.id+'?userId='+user.id)).data.race.id,race.id);
  while(race.status==='active'){
    const key=crypto.randomUUID();const payload={version:race.version,moveId:null,decision:{pace:'balanced',braking:'optimal',line:'exit',manoeuvre:'hold'}};
    const response=await request('/races/'+race.id+'/turns',user.id,payload,key);assert.equal(response.status,200,JSON.stringify(response.data));race=response.data.race;
    if(race.status==='completed'){const retry=await request('/races/'+race.id+'/turns',user.id,payload,key);assert.equal(retry.status,200);assert.equal(retry.data.player.exp,response.data.player.exp);assert.equal(retry.data.race.streetResult.totalReputation,race.streetResult.totalReputation);}
  }
  assert.equal(race.reward.money,race.outcome==='win'?stake*2:race.outcome==='draw'?stake:0);
  assert.equal((await prisma.user.findUnique({where:{id:user.id}})).moneyCents,1000000-stake*100+race.reward.money*100);
  const state=JSON.parse((await prisma.playerProgress.findUnique({where:{userId:user.id}})).streetState);
  for(const zone of STREET_ZONES)state[zone.id]={...state[zone.id],reputation:100};
  await prisma.playerProgress.update({where:{userId:user.id},data:{streetState:JSON.stringify(state)}});
  await prisma.user.update({where:{id:user.id},data:{level:10,exp:9000,...Object.fromEntries(PILOT_STATS.map(k=>[k,50]))}});
  await prisma.driverDevelopment.upsert({where:{userId:user.id},create:{userId:user.id,lessonPassed:true},update:{lessonPassed:true}});
  const advanced=await prisma.car.findFirst({where:{name:'996 GT3'}});await prisma.garage.update({where:{id:garage.id},data:{carId:advanced.id,...Object.fromEntries(fields.map(k=>[k,advanced[k]])),engineHealth:100,tireGrip:100,currentFuel:30}});
  for(const zone of STREET_ZONES){const response=await request('/street/encounter',user.id,{zoneId:zone.id});assert.equal(response.status,200,JSON.stringify(response.data));const encounter=response.data.street.zones.find(z=>z.id===zone.id).offer;assert.ok(encounter.track.builds.length&&encounter.rival.car.id);}
  console.log('PostgreSQL: 5 ritrovi, 40 rivali, 3 nuovi percorsi, rotazione senza ripetizioni, requisiti server, unica partenza concorrente, puntata/risultato idempotenti, ripresa e conservazione dei dati precedenti verificati.');
}
main().catch(error=>{console.error(error.message);process.exitCode=1}).finally(async()=>{await prisma.$disconnect();if(server){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}});
