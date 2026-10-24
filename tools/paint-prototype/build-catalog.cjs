const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');const {PNG}=require('pngjs');const {COLOURS,prepareMask,renderColour,verify}=require('./catalog-render.cjs');
const root=path.resolve(__dirname,'../..');const input=path.join(root,'.preview/mask-inputs');const models=JSON.parse(fs.readFileSync(path.join(__dirname,'models.json')));const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const previousSources=fs.existsSync(path.join(__dirname,'catalog-mask-sources.json'))?JSON.parse(fs.readFileSync(path.join(__dirname,'catalog-mask-sources.json'))):[];
const output=path.join(root,'public/images/paint');fs.mkdirSync(output,{recursive:true});const catalog={version:2,proposedPrice:2500,colours:COLOURS,models:[]},sources=[],report=[];let missing=0;
for(const model of models){
 const key=model.image.replace(/\.png$/,'');assert(/^[A-Za-z0-9_-]+$/.test(key));const bytes=fs.readFileSync(path.join(root,'public/images/car',model.image)),source=PNG.sync.read(bytes);const folder=path.join(output,key);let mask,calibration,metrics,notes=[];
 if(key==='seicento'){
  mask=PNG.sync.read(fs.readFileSync(path.join(folder,'mask.png')));metrics={selectedPixels:JSON.parse(fs.readFileSync(path.join(__dirname,'validation.json'))).selectedPixels};
  for(const colour of COLOURS){const png=PNG.sync.read(fs.readFileSync(path.join(folder,colour.id+'.png')));report.push({key,colour:colour.id,changed:verify(source,mask,png),approved:true});}
 }else{
  const recordFile=path.join(input,'generated',key+'.json');const previous=previousSources.find(r=>r.image===model.image);const record=fs.existsSync(recordFile)?{...previous,...JSON.parse(fs.readFileSync(recordFile))}:previous;if(!record||record.status!=='generated'){missing++;continue;}
  const prepared=(!process.argv.includes('--prepare')&&record.calibration&&fs.existsSync(path.join(folder,'mask.png')))?{mask:PNG.sync.read(fs.readFileSync(path.join(folder,'mask.png'))),calibration:record.calibration,metrics:record.metrics,notes:record.notes||[]}:prepareMask(source,PNG.sync.read(fs.readFileSync(record.source)));({mask,calibration,metrics,notes}=prepared);assert(metrics.selectedPixels>0,`Empty mask ${key}`);fs.mkdirSync(folder,{recursive:true});fs.writeFileSync(path.join(folder,'mask.png'),PNG.sync.write(mask));
  for(const colour of COLOURS){const png=renderColour(source,mask,colour.rgb,calibration),changed=verify(source,mask,png);fs.writeFileSync(path.join(folder,colour.id+'.png'),PNG.sync.write(png));report.push({key,colour:colour.id,changed,alphaIdentical:true,outsideMaskIdentical:true});}
  sources.push({...record,nativeMask:`public/images/paint/${key}/mask.png`,sourceSha256:sha(bytes),calibration,metrics,notes});
 }
 const entry={...model,key,source:`/images/car/${model.image}`,originalSha256:sha(bytes),mask:`/images/paint/${key}/mask.png`,images:Object.fromEntries(COLOURS.map(c=>[c.id,`/images/paint/${key}/${c.id}.png`])),approved:key==='seicento',metrics,reviewHints:notes};catalog.models.push(entry);assert.equal(sha(fs.readFileSync(path.join(root,'public/images/car',model.image))),entry.originalSha256);
}
fs.writeFileSync(path.join(output,'catalog.json'),JSON.stringify(catalog,null,2)+'\n');fs.writeFileSync(path.join(__dirname,'catalog-mask-sources.json'),JSON.stringify(sources,null,2)+'\n');fs.writeFileSync(path.join(__dirname,'catalog-validation.json'),JSON.stringify({models:catalog.models.length,variants:report.length,missing,sourceImagesUnchanged:true,checks:report},null,2)+'\n');console.log(JSON.stringify({models:catalog.models.length,variants:report.length,missing,reviewHints:catalog.models.filter(m=>m.reviewHints.length).map(m=>m.key)}));
if(missing&&!process.argv.includes('--partial'))process.exitCode=1;
