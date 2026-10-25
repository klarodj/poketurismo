const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {PNG}=require('pngjs'),{COLOURS,renderColour,verify}=require('./catalog-render.cjs');
const root=path.resolve(__dirname,'../..'),read=file=>PNG.sync.read(fs.readFileSync(path.join(root,file)));
const car=key=>read(`public/images/car/${key}.png`),variant=(key,tint)=>read(`public/images/paint/${key}/${tint}.png`);
const point=(png,x,y)=>[...png.data.subarray((y*png.width+x)*4,(y*png.width+x)*4+4)];
test('all 83 reported models have a new revision and all 200 models offer yellow',()=>{
 const catalog=require('../../public/images/paint/catalog.json'),notes=require('./review3-notes.json');
 assert.equal(catalog.models.length,200);assert.equal(catalog.colours.length,7);assert(COLOURS.some(c=>c.id==='giallo'));
 assert.deepEqual(catalog.models.filter(m=>m.revision===3).map(m=>m.key).sort(),notes.map(m=>m.key).sort());
 for(const model of catalog.models){const original=car(model.key),mask=variant(model.key,'mask');assert.equal(crypto.createHash('sha256').update(fs.readFileSync(path.join(root,'public'+model.source))).digest('hex'),model.originalSha256);for(const tint of COLOURS)verify(original,mask,variant(model.key,tint.id));}
});
test('reported mirror dots and the Seicento headlight halo are paint in every tint',()=>{
 for(const [key,x,y] of [['155',232,43],['saxo',225,46],['punto',231,42],['corrado',268,25],['seicento',168,65]]){
  assert.equal(point(variant(key,'mask'),x,y)[0],255,key);
  for(const tint of ['blu','verde','nero','bianco','argento','giallo'])assert.notDeepEqual(point(variant(key,tint),x,y),point(car(key),x,y),`${key}/${tint}`);
 }
});
test('Visa headlamps, amber indicators, and corrected glass stay original for all seven tints',()=>{
 for(const [key,x,y] of [['visa',145,66],['visa',71,66],['seicento',169,73],['993',142,86],['ax',165,30],['hpe',185,20],['323',260,22],['180sx',270,25]])for(const tint of COLOURS)assert.deepEqual(point(variant(key,tint.id),x,y),point(car(key),x,y),`${key}/${tint.id}`);
});
test('Corvette nose is painted, Alfa bonnet seam and Trueno rubber trim stay dark in all tints',()=>{
 for(const tint of COLOURS){assert.notDeepEqual(point(variant('c5',tint.id),60,89),point(car('c5'),60,89));for(const [key,x,y] of [['33',210,45],['trueno',153,17]])assert(Math.max(...point(variant(key,tint.id),x,y).slice(0,3))<25,`${key}/${tint.id}`);}
});
test('light paint has less single-pixel shading noise on the four reported dark photographs',()=>{
 const profiles=require('./mask-bases-review2/profiles.json');
 for(const key of ['ax','hpe','323','180sx']){
  const source=car(key),mask=read(`tools/paint-prototype/mask-bases-review2/${key}/mask.png`),old=renderColour(source,mask,[237,238,234],profiles.find(r=>r.image===key+'.png').calibration),current=variant(key,'bianco');let before=0,after=0,count=0;
  for(let y=45;y<65;y++)for(let x=90;x<190;x++){const p=(y*source.width+x)*4;if([p-4,p,p+4].every(q=>mask.data[q])){before+=Math.abs(old.data[p]*2-old.data[p-4]-old.data[p+4]);after+=Math.abs(current.data[p]*2-current.data[p-4]-current.data[p+4]);count++;}}
  assert(count>100,key);assert(after<before*.6,key);
 }
});
