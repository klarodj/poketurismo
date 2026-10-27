const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict'),{PNG}=require('pngjs');
const {renderNative}=require('./pixel-sprite.cjs'),{COLOURS}=require('./catalog-render.cjs');
const root=path.resolve(__dirname,'../..'),file=path.join(__dirname,'pixel-catalog-sources.json'),sources=JSON.parse(fs.readFileSync(file)),approved=require('./pixel-approved-hashes.json'),references=require('./pixel-catalog-references.json'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const save=(file,bytes)=>{if(!fs.existsSync(file)||!fs.readFileSync(file).equals(bytes))fs.writeFileSync(file,bytes);};
const catalog={version:2,reviewBatch:sources.reviewBatch,width:320,height:128,colours:COLOURS,models:[]},report=[],missing=[];
for(let model of sources.models){
 const record=root+'/.preview/pixel-generated/'+model.key+'.json';if(fs.existsSync(record))model={...model,...JSON.parse(fs.readFileSync(record))};
 const at=sources.models.findIndex(m=>m.key===model.key);sources.models[at]=model;
 if(!['generated','approved-trial'].includes(model.status)||!fs.existsSync(path.join(root,model.input))){missing.push(model.key);continue;}
 const folder=path.join(root,model.output),originalBytes=fs.readFileSync(path.join(root,model.reference)),inputBytes=fs.readFileSync(path.join(root,model.input));let metrics;
 if(model.status==='approved-trial'){
  for(const [relative,hash]of Object.entries(approved).filter(([f])=>f.startsWith(model.output)))assert.equal(sha(fs.readFileSync(path.join(root,relative))),hash,relative);
  metrics=require('./pixel-trial-validation.json').find(r=>r.key===model.key);
 }else{
  const result=renderNative(PNG.sync.read(inputBytes));fs.mkdirSync(folder,{recursive:true});for(const [name,image]of Object.entries(result.images))save(path.join(folder,name+'.png'),PNG.sync.write(image));metrics={bodyPixels:result.bodyPixels,detailPixels:result.detailPixels,protectedPixels:result.protectedPixels};
 }
 const base=PNG.sync.read(fs.readFileSync(folder+'/base.png')),details=PNG.sync.read(fs.readFileSync(folder+'/details.png')),index=PNG.sync.read(fs.readFileSync(folder+'/index.png'));
 for(const tint of COLOURS){const png=PNG.sync.read(fs.readFileSync(folder+'/'+tint.id+'.png'));assert.equal(png.width,320);assert.equal(png.height,128);for(let p=0;p<png.data.length;p+=4){assert.equal(png.data[p+3],base.data[p+3]);if(!index.data[p])assert(png.data.subarray(p,p+4).equals(details.data.subarray(p,p+4)));}}
 const original=PNG.sync.read(originalBytes);catalog.models.push({id:model.id,key:model.key,name:model.name,brand:model.brand,year:model.year,width:320,height:128,originalWidth:original.width,originalHeight:original.height,source:'/'+model.reference.replace('public/',''),originalSha256:sha(originalBytes),legacyPaint:`/images/paint/${model.key}/`,images:Object.fromEntries(COLOURS.map(c=>[c.id,`/images/pixel-cars/${model.key}/${c.id}.png`])),mask:`/images/pixel-cars/${model.key}/body.png`,details:`/images/pixel-cars/${model.key}/details.png`,sources:[...new Set([...(model.sources||[]),...(references[model.key]||[])])],revision:model.revision||1,...(model.reviewBatch?{reviewBatch:model.reviewBatch}:{}),approved:model.status==='approved-trial'});
 report.push({key:model.key,inputSha256:sha(inputBytes),originalSha256:sha(originalBytes),nativeSize:[320,128],...metrics,variants:COLOURS.length,alphaIdentical:true,detailsIdentical:true});
}
const summary={models:catalog.models.length,expected:200,variants:catalog.models.length*COLOURS.length,missing,checks:report};
fs.writeFileSync(root+'/public/images/pixel-cars/catalog.json',JSON.stringify(catalog,null,2)+'\n');fs.writeFileSync(file,JSON.stringify(sources,null,2)+'\n');fs.writeFileSync(__dirname+'/pixel-catalog-validation.json',JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify({models:summary.models,expected:200,variants:summary.variants,missing:missing.length}));
if(missing.length&&!process.argv.includes('--partial'))process.exitCode=1;
