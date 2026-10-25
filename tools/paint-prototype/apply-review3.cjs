// Explicit, idempotent revision from the frozen previous masks, never cumulative dilation.
const fs=require('node:fs'),path=require('node:path'),{PNG}=require('pngjs');
const {repairReviewed}=require('./review3-repair.cjs');
const root=path.resolve(__dirname,'../..'),entries=require('./review3-notes.json');
const records=require('./catalog-mask-sources.json'),base=path.join(__dirname,'mask-bases-review2');fs.mkdirSync(base,{recursive:true});
const read=file=>fs.existsSync(file)?PNG.sync.read(fs.readFileSync(file)):null;
if(!fs.existsSync(base+'/profiles.json'))fs.writeFileSync(base+'/profiles.json',JSON.stringify(records,null,2)+'\n');
const profiles=JSON.parse(fs.readFileSync(base+'/profiles.json'));const report=[];
for(const item of entries){
 const key=item.key,folder=root+'/public/images/paint/'+key;fs.mkdirSync(base+'/'+key,{recursive:true});
 if(!fs.existsSync(base+'/'+key+'/mask.png')){fs.copyFileSync(folder+'/mask.png',base+'/'+key+'/mask.png');if(fs.existsSync(folder+'/outline.png'))fs.copyFileSync(folder+'/outline.png',base+'/'+key+'/outline.png');}
 const original=read(root+'/public/images/car/'+key+'.png');
 const record=records.find(r=>r.image===key+'.png');const profile=key==='seicento'?{chromatic:true,hue:49,baseValue:.96,baseSaturation:.7,medianValue:.8,darkPaint:false,shadeExponent:1.25}:profiles.find(r=>r.image===key+'.png').calibration;
 const repaired=repairReviewed(original,read(base+'/'+key+'/mask.png'),read(base+'/'+key+'/outline.png'),profile,key,item.note);
 fs.writeFileSync(folder+'/mask.png',PNG.sync.write(repaired.mask));fs.writeFileSync(folder+'/outline.png',PNG.sync.write(repaired.outline));
 const data={calibration:repaired.profile,manualRepair:repaired.report};
 if(record)Object.assign(record,data);else fs.writeFileSync(__dirname+'/seicento-profile.json',JSON.stringify(data,null,2)+'\n');
 report.push({key,...repaired.report});
}
fs.writeFileSync(__dirname+'/catalog-mask-sources.json',JSON.stringify(records,null,2)+'\n');fs.writeFileSync(__dirname+'/review3-report.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
