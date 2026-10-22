// Opt-in integration exercise; refuses real databases and writes only to *_validation.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {createRequire}=require('node:module'),requireServer=createRequire(path.resolve(__dirname,'../server/package.json'));
if(!process.env.ACCOUNTS_VALIDATION_ENV_FILE)throw new Error('Specificare il file privato del database temporaneo');
const config=requireServer('dotenv').parse(fs.readFileSync(process.env.ACCOUNTS_VALIDATION_ENV_FILE));const url=new URL(config.DATABASE_URL);
if(!url.pathname.endsWith('_validation')||!['127.0.0.1','localhost'].includes(url.hostname))throw new Error('Usare esclusivamente un database locale *_validation');
process.env.DATABASE_URL=config.DATABASE_URL;process.env.POKETURISMO_AUTH_ENABLED='0';
const {app,prisma}=require('../server/index');const {applyStock}=require('../server/marketStock');const {marketTier,newCarPrice}=require('../shared/carEconomy.mjs');
let server,base;
async function request(endpoint,userId,body){const response=await fetch(base+'/api'+endpoint,{method:body?'POST':'GET',headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify({userId,operationId:crypto.randomUUID(),...body})}:{})});return{status:response.status,data:await response.json()};}
async function main(){
  const before=await prisma.user.findMany({where:{id:{gt:0}}}),owned=await prisma.garage.findMany({where:{userId:{gt:0}}});
  const report=await applyStock(prisma);assert.equal(report.applied,true);assert.equal(report.listings.length,32);
  assert.equal((await applyStock(prisma)).applied,false);assert.equal(await prisma.garage.count({where:{userId:-1}}),32);
  assert.deepEqual(await prisma.user.findMany({where:{id:{gt:0}}}),before);assert.deepEqual(await prisma.garage.findMany({where:{userId:{gt:0}}}),owned);
  for(const car of await prisma.car.findMany())if(newCarPrice(car)<=10000)assert.equal(marketTier(car).id,'starter');
  const users=[];for(let i=0;i<2;i++)users.push(await prisma.user.create({data:{username:'Market validation '+crypto.randomUUID(),usernameKey:crypto.randomUUID(),password:'',mail:'',moneyCents:1000000,carDrive:0,...Object.fromEntries(['brave','clean','reflex','shift','acro','turn','brake','throttle'].map(k=>[k,11]))}}));
  server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));base='http://127.0.0.1:'+server.address().port;
  const market=(await request('/market')).data,affordable=market.filter(item=>item.sellPrice<=10000);assert.equal(affordable.length,8);
  for(const item of affordable){assert.equal(item.marketTier.id,'starter');assert.ok(10000-item.sellPrice>=1500);assert.ok(item.currentFuel>0);}
  const offer=affordable[0],results=await Promise.all(users.map(user=>request('/purchase',user.id,{marketGarageId:offer.id,price:1})));
  assert.deepEqual(results.map(item=>item.status).sort(),[200,404]);const winner=users[results.findIndex(item=>item.status===200)],loser=users[results.findIndex(item=>item.status===404)];
  assert.equal((await prisma.user.findUnique({where:{id:winner.id}})).moneyCents,1000000-offer.sellPrice*100);
  assert.equal((await prisma.user.findUnique({where:{id:loser.id}})).moneyCents,1000000);
  const sporty=market.find(item=>!item.starterFriendly);assert.equal((await request('/purchase',loser.id,{marketGarageId:sporty.id,price:1})).status,400);
  const markerCount=await prisma.garage.count({where:{userId:-1}});assert.equal((await applyStock(prisma)).applied,false);assert.equal(await prisma.garage.count({where:{userId:-1}}),markerCount);assert.equal((await prisma.garage.findUnique({where:{id:offer.id}})).userId,winner.id);
  await prisma.user.update({where:{id:winner.id},data:{carDrive:offer.id}});
  const championship=await prisma.championship.findFirst({where:{minLevel:1,maxCv:{lte:85}}});assert.ok(championship);
  assert.equal((await request(`/championships/${championship.id}/enter`,winner.id,{})).status,200);
  const state=(await request('/state/'+winner.id)).data,quote=state.garage.find(item=>item.id===offer.id).resaleValue;
  const sold=await request('/market/sell',winner.id,{garageId:offer.id});assert.equal(sold.status,200);assert.equal(sold.data.sellValue,quote);
  const resale=(await request('/market')).data.find(item=>item.id===offer.id);assert.ok(resale.sellPrice>quote);
  console.log('PostgreSQL: 32 annunci, 8 auto da ingresso, prezzi del nuovo protetti, acquisto concorrente unico, budget insufficiente per sportive, primo campionato accessibile, stock non duplicato e giocatori esistenti conservati.');
}
main().catch(error=>{console.error(error.message);process.exitCode=1}).finally(async()=>{await prisma.$disconnect();if(server){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}});
