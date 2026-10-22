const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{createRequire}=require('node:module');const requireServer=createRequire(path.resolve(__dirname,'../server/package.json'));
if(!process.env.ACCOUNTS_VALIDATION_ENV_FILE)throw Error('File privato del database di collaudo richiesto');const env=requireServer('dotenv').parse(fs.readFileSync(process.env.ACCOUNTS_VALIDATION_ENV_FILE)),url=new URL(env.DATABASE_URL);
if(!['127.0.0.1','localhost'].includes(url.hostname)||!url.pathname.endsWith('_validation'))throw Error('Usare soltanto un database locale *_validation');process.env.DATABASE_URL=env.DATABASE_URL;process.env.POKETURISMO_AUTH_ENABLED='0';
const {app,prisma}=require('../server/index');const{PILOT_STATS}=require('../server/raceEngine');let server,base;
async function request(endpoint,userId,body,key=crypto.randomUUID()){const response=await fetch(base+'/api'+endpoint,{method:body?'POST':'GET',headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify({userId,operationId:key,...body})}:{})});return{status:response.status,data:await response.json()};}
async function main(){
 const before={};for(const model of ['user','garage','playerProgress','raceSession','championshipEntry'])before[model]=await prisma[model].findMany();
 const car=await prisma.car.findFirst({where:{name:'Seicento Sporting'}}),other=await prisma.car.findFirst({where:{name:'Micra Super S'}}),track=await prisma.track.findFirst({where:{name:'Tsukuba · Ibaraki'}});assert.ok(car&&other&&track);
 const fields=['cv','nm','kg','speed','acceleration','revving','transmission','turnSlow','turnFast','brake','traction'];const people=[];
 for(let i=0;i<2;i++){const user=await prisma.user.create({data:{username:'Meet validation '+crypto.randomUUID(),usernameKey:crypto.randomUUID(),password:'private-password',mail:'private@example.invalid',moneyCents:1000000,carDrive:0,...Object.fromEntries(PILOT_STATS.map(key=>[key,11+i]))}});const garage=await prisma.garage.create({data:{userId:user.id,carId:car.id,...Object.fromEntries(fields.map(key=>[key,car[key]])),engineHealth:94,tireGrip:88,currentFuel:20}});await prisma.user.update({where:{id:user.id},data:{carDrive:garage.id}});people.push({user,garage});}
 server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));base='http://127.0.0.1:'+server.address().port;
 const a=people[0],b=people[1];assert.equal((await request('/meet?userId='+a.user.id)).data.myGarageId,null);
 assert.equal((await request('/meet/showcase',a.user.id,{garageId:b.garage.id})).status,403);
 const key=crypto.randomUUID();assert.equal((await request('/meet/showcase',a.user.id,{garageId:a.garage.id},key)).status,200);assert.equal((await request('/meet/showcase',a.user.id,{garageId:a.garage.id},key)).status,200);
 for(const person of people){const started=await request('/races',person.user.id,{mode:'track',timeTrial:true,trackId:track.id});assert.equal(started.status,200,JSON.stringify(started.data));let race=started.data.race;
  // Changing display while driving must leave the ongoing race intact.
  const displayed=await request('/meet/showcase',person.user.id,{garageId:person.garage.id});assert.equal(displayed.status,200);assert.equal(displayed.data.activeRace.id,race.id);
  while(race.status==='active'){const result=await request(`/races/${race.id}/turns`,person.user.id,{version:race.version,moveId:null,decision:{pace:'balanced',braking:'optimal',line:'exit',manoeuvre:'hold'}});assert.equal(result.status,200,JSON.stringify(result.data));race=result.data.race;}
  assert.equal(race.reward.money,0);assert.equal(race.reward.xp,0);
 }
 const boardUrl=`/meet/leaderboard?trackId=${track.id}&modelId=${car.id}`;let board=(await request(boardUrl)).data;assert.equal(board.records.filter(record=>people.some(p=>p.user.id===record.pilot.id)).length,2);
 assert.ok(board.records.every(record=>record.configuration&&record.car.modelId===car.id));assert.ok(board.records[0].timeMs<=board.records[1].timeMs);
 for(const secret of ['private-password','private@example.invalid','moneyCents','authUserId','password','rng'])assert.ok(!JSON.stringify(board).includes(secret));
 assert.equal((await request(`/meet/leaderboard?trackId=${track.id}&modelId=${other.id}`)).data.records.length,0);
 await request('/meet/showcase',a.user.id,{garageId:null});assert.ok(!(await request(boardUrl)).data.records.some(r=>r.pilot.id===a.user.id));assert.equal((await request('/time-trials/'+a.user.id)).data.length,1);
 assert.equal((await request('/meet/showcase',a.user.id,{garageId:a.garage.id},key)).data.meet.myGarageId,null);
 await request('/market/sell',b.user.id,{garageId:b.garage.id});assert.ok(!(await request('/meet?userId='+b.user.id)).data.showcases.some(s=>s.pilot.id===b.user.id));assert.ok(!(await request(boardUrl)).data.records.some(r=>r.pilot.id===b.user.id));
 for(const [model,rows]of Object.entries(before)){const all=await prisma[model].findMany();for(const old of rows){const current=all.find(row=>model==='playerProgress'?row.userId===old.userId:row.id===old.id);assert.deepEqual(current,old,model+' precedente invariato');}}
 console.log('PostgreSQL: due giocatori, esposizione volontaria, proprietà verificata, cambio durante gara, tempi dello stesso modello/circuito, ritiro e vendita, record privati conservati e campi personali esclusi. Dati precedenti invariati.');
}
main().catch(error=>{console.error(error.message);process.exitCode=1}).finally(async()=>{await prisma.$disconnect();if(server){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}});
