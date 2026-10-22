// Destructive integration exercise ONLY for disposable local databases named *_validation.
// Creates synthetic verified users and buys one part. Never sends email or touches the live game.
const assert=require('node:assert/strict'),fs=require('fs'),crypto=require('crypto');
const root=require('node:path').resolve(__dirname,'..');
if (!process.env.ACCOUNTS_VALIDATION_ENV_FILE) throw new Error('Specificare ACCOUNTS_VALIDATION_ENV_FILE per un database temporaneo');
const c=require(root+'/server/node_modules/dotenv').parse(fs.readFileSync(process.env.ACCOUNTS_VALIDATION_ENV_FILE));
for (const key of ['DATABASE_URL','ADMIN_DATABASE_URL']) { const u=new URL(c[key]); if (!u.pathname.endsWith('_validation') || !['127.0.0.1','localhost'].includes(u.hostname)) throw new Error('Usare esclusivamente un database locale con nome terminante in _validation'); }
Object.assign(process.env,{DATABASE_URL:c.DATABASE_URL,POKETURISMO_AUTH_ENABLED:'1',AUTH_INTERNAL_URL:c.AUTH_INTERNAL_URL,SUPABASE_ANON_KEY:c.SUPABASE_ANON_KEY,LEGACY_OWNER_EMAIL:''});
const {app,prisma}=require(root+'/server/index.js');const {Client}=require(root+'/server/node_modules/pg');
const tag=crypto.randomBytes(4).toString('hex'); let server,base;const ids=[];
async function auth(path,body,token=c.SUPABASE_SERVICE_KEY){const r=await fetch(c.AUTH_INTERNAL_URL+path,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body)});const data=await r.json();assert.ok(r.ok,'Auth '+path+' failed: '+r.status);return data;}
async function api(path,token,body){const r=await fetch(base+'/api'+path,{method:body?'POST':'GET',headers:{...(token?{Authorization:'Bearer '+token}:{}),'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});return {status:r.status,data:await r.json()};}
async function main(){
server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));base='http://127.0.0.1:'+server.address().port;
const fresh=process.env.ACCOUNTS_FRESH_START==='1';
const historical=await prisma.user.findUnique({where:{id:1}});
if(fresh) assert.equal(historical,null,'Il reset deve lasciare zero piloti');
else assert.equal(historical?.authUserId,null,'Importare una copia fresca del salvataggio storico non ancora collegato');
process.env.ADMIN_EMAILS=`validate-${tag}-1@example.invalid`;
const before=await prisma.user.count();
const tokens=[];for(let i=0;i<2;i++){const email=`validate-${tag}-${i}@example.invalid`,password=crypto.randomBytes(24).toString('hex');const user=await auth('/admin/users',{email,password,email_confirm:true});ids.push(user.id);tokens.push(await auth('/token?grant_type=password',{email,password},c.SUPABASE_ANON_KEY));}
assert.equal((await api('/state/1')).status,401);assert.equal((await api('/account/me',tokens[0].access_token)).data.player,null);assert.equal((await api('/state/1',tokens[0].access_token)).status,428);
const config=(await api('/auth/config')).data;const pilot={nickname:'Test '+tag,avatar:'blue',stats:config.profiles.balanced};
assert.equal((await api('/account/pilot',tokens[0].access_token,{...pilot,moneyCents:999999})).status,400);
const responses=await Promise.all(Array.from({length:6},()=>api('/account/pilot',tokens[0].access_token,pilot)));
assert.ok(responses.every(r=>r.status===200),JSON.stringify(responses.map(r=>r.status)));assert.equal(responses.filter(r=>r.data.created).length,1);const player=responses[0].data.player;assert.equal(player.moneyCents,1_000_000);assert.equal(player.carDrive,0);assert.equal(player.level,1);assert.equal(await prisma.garage.count({where:{userId:player.id}}),0);assert.equal(await prisma.user.count(),before+1);
assert.equal((await api('/account/pilot',tokens[1].access_token,pilot)).status,409);const other=await api('/account/pilot',tokens[1].access_token,{...pilot,nickname:'Other '+tag});assert.equal(other.status,200);
assert.equal((await api('/state/'+player.id,tokens[1].access_token)).status,403);assert.equal((await api('/purchase',tokens[1].access_token,{userId:player.id,carId:1,operationId:'validate-forged-id'})).status,403);assert.equal((await api('/dev/opponents',tokens[0].access_token)).status,403);
const state=await api('/state/'+player.id,tokens[0].access_token);assert.equal(state.status,200);assert.equal(state.data.garage.length,0);
const part=await prisma.part.findFirst({where:{price:{gt:0,lt:1000}},orderBy:{price:'asc'}});assert.ok(part);const operationId='validate_'+tag;const buys=await Promise.all(Array.from({length:5},()=>api('/parts/purchase',tokens[0].access_token,{partId:part.id,operationId})));assert.ok(buys.every(r=>r.status===200));assert.equal((await prisma.user.findUnique({where:{id:player.id}})).moneyCents,1_000_000-Math.round(part.price*100));assert.equal((await prisma.inventoryPart.findUnique({where:{userId_partId:{userId:player.id,partId:part.id}}})).quantity,1);
if(historical) {
assert.deepEqual(await prisma.user.findUnique({where:{id:1}}),historical);
const ownerEmail=`owner-${tag}@example.invalid`,ownerPassword=crypto.randomBytes(24).toString('hex');
await auth('/admin/users',{email:ownerEmail,password:ownerPassword,email_confirm:true});
const owner=await auth('/token?grant_type=password',{email:ownerEmail,password:ownerPassword},c.SUPABASE_ANON_KEY);
process.env.LEGACY_OWNER_EMAIL=ownerEmail;
const claimed=await api('/account/me',owner.access_token);assert.equal(claimed.status,200);assert.equal(claimed.data.player.id,1);assert.equal(claimed.data.player.moneyCents,historical.moneyCents);assert.equal(claimed.data.player.isAdmin,true);
assert.equal((await api('/dev/opponents',owner.access_token)).status,200);
assert.equal((await api('/state/1',tokens[0].access_token)).status,403);
} else {
assert.equal(other.data.player.isAdmin,true);
assert.equal((await api('/dev/opponents',tokens[1].access_token)).status,200);
}
const pg=new Client({connectionString:c.DATABASE_URL});await pg.connect();await assert.rejects(pg.query('SELECT id FROM auth.users'),e=>e.code==='42501');await assert.rejects(pg.query('UPDATE game."User" SET "moneyCents"=-1 WHERE id=$1',[player.id]),e=>e.code==='23514');await pg.end();
const generated=await auth('/admin/generate_link',{type:'magiclink',email:`validate-${tag}-0@example.invalid`});assert.ok(generated.email_otp);const otp=await auth('/verify',{type:'email',email:`validate-${tag}-0@example.invalid`,token:generated.email_otp},c.SUPABASE_ANON_KEY);assert.equal(otp.user.id,ids[0]);
console.log('Real PostgreSQL + GoTrue: verified identity, parallel pilot creation, no car, budget once, nickname conflict, save isolation, explicit historical owner, admin denial, concurrent idempotent purchases, schema privileges and OTP verification PASS. No email sent.');
}
main().catch(e=>{console.error(e.message);process.exitCode=1}).finally(async()=>{await prisma.$disconnect();if(server){server.closeAllConnections();await new Promise(r=>server.close(r))}});
