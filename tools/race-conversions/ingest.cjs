const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {PNG}=require('../paint-prototype/node_modules/pngjs');
const root=path.resolve(__dirname,'../..'),[key,source,metadataFile]=process.argv.slice(2);
const catalogue=JSON.parse(fs.readFileSync(__dirname+'/catalogue.json'));
assert(catalogue.models.some(m=>m.key===key),'Unknown model');
const metadata=JSON.parse(fs.readFileSync(metadataFile)),bytes=fs.readFileSync(source),raw=PNG.sync.read(bytes);
let left=raw.width,top=raw.height,right=-1,bottom=-1,transparent=0;
for(let y=0;y<raw.height;y++)for(let x=0;x<raw.width;x++){if(raw.data[(y*raw.width+x)*4+3]>96){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}else transparent++;}
assert(right>left&&bottom>top,'Empty sprite');assert(transparent>raw.width*raw.height*.15,'Background is not transparent');
const scale=Math.min(304/(right-left+1),112/(bottom-top+1)),w=Math.round((right-left+1)*scale),h=Math.round((bottom-top+1)*scale),ox=Math.floor((320-w)/2),oy=122-h;
const image=new PNG({width:320,height:128});
for(let y=0;y<h;y++)for(let x=0;x<w;x++){const sx=Math.min(right,left+Math.floor((x+.5)/scale)),sy=Math.min(bottom,top+Math.floor((y+.5)/scale)),p=(sy*raw.width+sx)*4,q=((y+oy)*320+x+ox)*4;if(raw.data[p+3]>96){raw.data.copy(image.data,q,p,p+4);image.data[q+3]=255;}}
const output=PNG.sync.write(image),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const existing=__dirname+'/records/'+key+'.json',previous=fs.existsSync(existing)?JSON.parse(fs.readFileSync(existing)):null;
const revision=(previous?.revision||0)+1;
const input='tools/race-conversions/inputs/'+key+'.png',destination='public/images/race-cars/'+key+'.png',backup='/home/klaro/.backups/poketurismo/race-conversions-2026-10-27/generated/'+key+'-r'+revision+'.png';
for(const f of [root+'/'+input,root+'/'+destination,backup])fs.mkdirSync(path.dirname(f),{recursive:true});fs.copyFileSync(source,backup);fs.writeFileSync(root+'/'+input,output);fs.writeFileSync(root+'/'+destination,output);
const referenceHashes=Object.fromEntries((metadata.referencedImagePaths||[]).filter(p=>fs.existsSync(p)).map(p=>[p,sha(fs.readFileSync(p))]));
const record={...metadata,key,tool:'image_gen built-in',source,rawArchive:backup,sourceSha256:sha(bytes),input,output:destination,sha256:sha(output),width:320,height:128,revision,referenceHashes,preparation:'Aspect-preserving nearest-neighbour, transparent 320x128, whole car with margin'};
fs.writeFileSync(existing,JSON.stringify(record,null,2)+'\n');console.log(JSON.stringify({key,revision:record.revision,width:320,height:128,bytes:output.length}));
