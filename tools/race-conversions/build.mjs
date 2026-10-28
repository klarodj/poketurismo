import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {proposalMetrics} from './proposal.mjs';
const dir=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(dir,'../..');
const catalogue=JSON.parse(fs.readFileSync(dir+'/catalogue.json'));
const roadCatalogue=JSON.parse(fs.readFileSync(root+'/public/images/pixel-cars/catalog.json'));
const out={version:1,previewOnly:true,periodCutoff:2002,decisions:catalogue.decisions,models:[]};
for(const model of catalogue.models){
 const {stock}=model,garage={...stock,car:stock,mods:[],engineHealth:100,tireGrip:100,currentFuel:20,fuelType:'Normale',km:0,serviceKm:0};
 const proposal=proposalMetrics(garage,model.profile),file=dir+'/records/'+model.key+'.json',art=fs.existsSync(file)?JSON.parse(fs.readFileSync(file)):null;
 if(art){const input=fs.readFileSync(path.join(root,art.input)),output=path.join(root,art.output);fs.mkdirSync(path.dirname(output),{recursive:true});if(!fs.existsSync(output)||!fs.readFileSync(output).equals(input))fs.writeFileSync(output,input);}
 const allowed=['cv','nm','kg','performanceIndex','grip','brakingMs2','topSpeedKmh'];const metric=value=>Object.fromEntries(allowed.map(k=>[k,value[k]]));
 const stockSources=(roadCatalogue.models.find(m=>m.key===model.key)?.sources||[]).map(url=>({title:'Fotografie e identità del modello stradale',url}));
 const imageReferences=(art?.referenceSources||model.imageReferences||[]).filter(r=>r.url||r.page).map(r=>({title:r.title||'Fotografia di riferimento della preparazione',url:r.url,page:r.page}));
 out.models.push({id:model.id,key:model.key,name:model.name,brand:model.brand,year:model.year,classification:model.classification,profile:model.profile,reference:model.candidate,referenceYear:model.referenceYear,livery:model.liveryDirection,bodywork:model.bodywork,notes:model.notes||'',researchStatus:model.researchStatus,sources:[...(model.historicalSources||[]),...stockSources],imageReferences,stockImage:'/images/pixel-cars/'+model.key+'/rosso.png',image:art?'/images/race-cars/'+model.key+'.png?rev='+art.revision:null,artRevision:art?.revision||0,width:320,height:128,price:proposal.price,before:metric(proposal.beforeMetrics),after:metric(proposal.afterMetrics)});
}
out.ready=out.models.filter(m=>m.image).length;fs.mkdirSync(root+'/public/previews/race-cars',{recursive:true});fs.writeFileSync(root+'/public/previews/race-cars/catalog.json',JSON.stringify(out,null,2)+'\n');console.log(JSON.stringify({models:out.models.length,ready:out.ready,previewOnly:true}));
