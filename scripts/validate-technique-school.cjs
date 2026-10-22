// Real database exercise. It refuses every database except a disposable local *_validation.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const requireServer = createRequire(path.resolve(__dirname,'../server/package.json'));
if (!process.env.ACCOUNTS_VALIDATION_ENV_FILE) throw new Error('Specificare il file privato del database temporaneo');
const config = requireServer('dotenv').parse(fs.readFileSync(process.env.ACCOUNTS_VALIDATION_ENV_FILE));
const database = new URL(config.DATABASE_URL);
if (!database.pathname.endsWith('_validation') || !['127.0.0.1','localhost'].includes(database.hostname)) throw new Error('Usare esclusivamente un database locale *_validation');
process.env.DATABASE_URL=config.DATABASE_URL; process.env.POKETURISMO_AUTH_ENABLED='0';
const { app, prisma } = require('../server/index');
const { TECHNIQUES } = require('../shared/techniqueCatalog.mjs');
const { LESSON_SECTIONS } = require('../shared/driverDevelopment.mjs');
let server,base,userId;
async function request(endpoint, body, key=crypto.randomUUID()) {
  const response=await fetch(base+'/api'+endpoint,{method:body?'POST':'GET',headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify({userId,operationId:key,...body})}:{})});
  const data=await response.json();assert.equal(response.status,200,JSON.stringify(data));return data;
}
async function main() {
  const pilot=await prisma.user.create({data:{username:'Validation '+crypto.randomBytes(5).toString('hex'),usernameKey:crypto.randomUUID(),password:'',mail:'',level:99,exp:98000,moneyCents:1000000,carDrive:0,...Object.fromEntries(['brave','clean','reflex','shift','acro','turn','brake','throttle'].map(key=>[key,30])),progress:{create:{equippedMoves:'[]'}},development:{create:{}}}});
  userId=pilot.id;server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));base='http://127.0.0.1:'+server.address().port;
  const initial=await request('/state/'+userId);assert.deepEqual(initial.inventory.moves,[]);assert.deepEqual(initial.inventory.equippedMoves,[]);
  let expectedXp=98000;
  for(const technique of TECHNIQUES) {
    await request('/driver/techniques/read',{techniqueId:technique.id});
    let current=(await request('/races',{mode:'track',lesson:technique.lessonId})).race;
    while(current.status==='active') {
      const decision=current.sections[current.index].goal||{pace:'balanced',braking:LESSON_SECTIONS[current.index].braking,line:'exit'};
      const body={version:current.version,moveId:null,decision};
      if(current.index===current.sections.length-1) {
        const key=crypto.randomUUID(),[a,b]=await Promise.all([request(`/races/${current.id}/turns`,body,key),request(`/races/${current.id}/turns`,body,key)]);
        assert.equal(a.race.developmentSummary.lesson.passed,true,technique.id);assert.equal(a.race.reward.xp,technique.xp);assert.equal(b.race.reward.xp,technique.xp);current=a.race;
      } else current=(await request(`/races/${current.id}/turns`,body)).race;
    }
    expectedXp+=technique.xp;
    assert.equal((await prisma.user.findUnique({where:{id:userId}})).exp,expectedXp,technique.id+' duplicate reward');
  }
  const state=await request('/state/'+userId);
  assert.equal(state.inventory.moves.length,50);assert.equal(state.inventory.equippedMoves.length,4);assert.equal(state.garage.length,0);assert.equal(state.player.moneyCents,1000000);
  assert.equal(state.development.curriculum.filter(item=>item.learned).length,50);
  console.log('PostgreSQL: tutte le 50 prove superate, reward finali concorrenti assegnati una sola volta, zero tecniche gratuite, limite 4 equipaggiate, soldi e garage invariati.');
}
main().catch(error=>{console.error(error.message);process.exitCode=1}).finally(async()=>{await prisma.$disconnect();if(server){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}});
