const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{createRequire}=require('node:module');
const requireServer=createRequire(path.resolve(__dirname,'../server/package.json'));
if(!process.env.ACCOUNTS_VALIDATION_ENV_FILE)throw Error('File privato di collaudo richiesto');
const config=requireServer('dotenv').parse(fs.readFileSync(process.env.ACCOUNTS_VALIDATION_ENV_FILE)),url=new URL(config.DATABASE_URL);
if(!url.pathname.endsWith('_validation')||!['localhost','127.0.0.1'].includes(url.hostname))throw Error('Usare soltanto database locali *_validation');
process.env.DATABASE_URL=config.DATABASE_URL;process.env.POKETURISMO_AUTH_ENABLED='0';
const {app,prisma}=require('../server/index');const{seedChampionships}=require('../server/championships');const{CHAMPIONSHIP_CATALOG,championshipCarErrors}=require('../shared/championshipCatalog.mjs');const{PILOT_STATS}=require('../server/raceEngine');
let server,base;
async function request(endpoint,userId,body,key=crypto.randomUUID()){const response=await fetch(base+'/api'+endpoint,{method:body?'POST':'GET',headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify({userId,operationId:key,...body})}:{})});return{status:response.status,data:await response.json()};}
async function main(){
 const users=await prisma.user.findMany({orderBy:{id:'asc'}}),garages=await prisma.garage.findMany({orderBy:{id:'asc'}}),entries=await prisma.championshipEntry.findMany({orderBy:{id:'asc'}});
 const old=await prisma.championship.findMany({include:{rounds:true},orderBy:{id:'asc'}});
 const legacyTrack=await prisma.track.findFirst({where:{name:'test track'}});
 // An active legacy entry protects every track in its unchanged calendar from cleanup.
 let protection;
 if(legacyTrack&&old.length){const real=users.find(u=>u.id>0);if(real&&!entries.some(e=>e.userId===real.id&&e.status==='active'))protection=await prisma.championshipEntry.create({data:{userId:real.id,championshipId:old[0].id}});}
 const first=await prisma.$transaction(tx=>seedChampionships(tx,{series:'northern'}),{timeout:30000});assert.equal(first.created.length,6);
 if(protection){assert.ok(first.deferred.includes(legacyTrack.id));await prisma.championshipEntry.delete({where:{id:protection.id}});}
 const second=await prisma.$transaction(tx=>seedChampionships(tx,{series:'northern'}),{timeout:30000});assert.equal(second.created.length,0);
 assert.equal((await prisma.$transaction(tx=>seedChampionships(tx,{series:'northern'}),{timeout:30000})).removed.length,0);
 assert.deepEqual(await prisma.user.findMany({orderBy:{id:'asc'}}),users);assert.deepEqual(await prisma.garage.findMany({orderBy:{id:'asc'}}),garages);assert.deepEqual(await prisma.championshipEntry.findMany({orderBy:{id:'asc'}}),entries);
 for(const cup of old)assert.deepEqual(await prisma.championship.findUnique({where:{id:cup.id},include:{rounds:true}}),cup);
 const cars=await prisma.car.findMany({include:{brand:true}});
 for(const spec of CHAMPIONSHIP_CATALOG.filter(c=>!c.racePrepared))for(const rival of spec.rivals){const car=cars.find(c=>c.name===rival.carName);assert.ok(car);assert.deepEqual(championshipCarErrors({...car,engineHealth:rival.engineHealth,tireGrip:rival.tireGrip,currentFuel:35},spec),[],`${spec.name}: ${rival.carName}`);}
 server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));base='http://127.0.0.1:'+server.address().port;
 const listed=(await request('/championships')).data.filter(c=>c.series!=='aci-csai');assert.equal(listed.length,6);assert.equal(new Set(listed.flatMap(c=>c.rounds.map(r=>r.trackId))).size,10);
 const fields=['cv','nm','kg','speed','acceleration','revving','transmission','turnSlow','turnFast','brake','traction'];
 for(const spec of CHAMPIONSHIP_CATALOG.filter(c=>!c.racePrepared)){const cup=listed.find(c=>c.name===spec.name);const user=await prisma.user.create({data:{username:'Grid validation '+crypto.randomUUID(),usernameKey:crypto.randomUUID(),password:'',mail:'',moneyCents:5000000,carDrive:0,level:10,exp:9000,...Object.fromEntries(PILOT_STATS.map(key=>[key,30]))}});const car=cars.find(c=>c.name===spec.rivals[3].carName);const garage=await prisma.garage.create({data:{userId:user.id,carId:car.id,...Object.fromEntries(fields.map(k=>[k,car[k]])),engineHealth:100,tireGrip:100,currentFuel:35}});await prisma.user.update({where:{id:user.id},data:{carDrive:garage.id}});
  const key=crypto.randomUUID();const joined=await request(`/championships/${cup.id}/enter`,user.id,{},key);assert.equal(joined.status,200,JSON.stringify(joined.data));assert.equal((await request(`/championships/${cup.id}/enter`,user.id,{},key)).status,200);const entry=joined.data.entry;assert.equal(entry.standings.length,8);
  let totalMoney=0;
  for(let round=1;round<=cup.rounds.length;round++){
   await prisma.garage.update({where:{id:garage.id},data:{engineHealth:100,tireGrip:100,currentFuel:35}});
   const started=await request('/races',user.id,{mode:'championship',entryId:entry.id});assert.equal(started.status,200,JSON.stringify(started.data));let race=started.data.race;
   assert.equal(race.opponent.car.name,spec.rivals[(round-1)%7].carName);
   while(race.status==='active'){const turnKey=crypto.randomUUID(),body={version:race.version,moveId:null,decision:{pace:'balanced',braking:'optimal',line:'exit',manoeuvre:'hold'}};const result=await request(`/races/${race.id}/turns`,user.id,body,turnKey);assert.equal(result.status,200,JSON.stringify(result.data));race=result.data.race;if(race.status!=='active'){assert.equal(race.championship.classification.length,8);const retry=await request(`/races/${race.id}/turns`,user.id,body,turnKey);assert.equal(retry.data.player.moneyCents,result.data.player.moneyCents);assert.equal(retry.data.player.exp,result.data.player.exp);totalMoney+=race.reward.money;}}
   const checkpoint=(await request(`/championship-entries/${entry.id}?userId=${user.id}`)).data;assert.equal(checkpoint.results.length,round);if(round<cup.rounds.length)assert.equal(totalMoney,0);
  }
  assert.equal((await request('/championship-entries/active/'+user.id)).data,null);
  assert.equal((await prisma.user.findUnique({where:{id:user.id}})).moneyCents,5000000-cup.entryFee*100+totalMoney*100);
 }
 const user=await prisma.user.findFirst({where:{username:{startsWith:'Grid validation'}}});const track=await prisma.track.findFirst({where:{name:'Pistino di San Rocco · Pavese'}});let trial=(await request('/races',user.id,{mode:'track',trackId:track.id,timeTrial:true})).data.race;while(trial.status==='active'){const response=await request(`/races/${trial.id}/turns`,user.id,{version:trial.version,moveId:null,decision:{pace:'balanced',braking:'optimal',line:'exit',manoeuvre:'hold'}});assert.equal(response.status,200);trial=response.data.race;}assert.equal(trial.reward.money,0);assert.equal(trial.reward.xp,0);assert.equal((await request('/time-trials/'+user.id)).data.length,1);
 console.log('PostgreSQL: sei campionati, 23 round su dieci circuiti, 42 auto verificate, classifiche a otto, contratti e addebiti idempotenti, premi finali unici, record personali e compatibilità dei calendari storici verificati.');
}
main().catch(error=>{console.error(error.message);process.exitCode=1}).finally(async()=>{await prisma.$disconnect();if(server){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}});
