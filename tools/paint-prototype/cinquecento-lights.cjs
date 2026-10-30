const fs=require('fs'),path=require('path'),assert=require('assert/strict'),{PNG}=require('pngjs'),{renderNative}=require('./pixel-sprite.cjs');
const root=path.resolve(__dirname,'../..'),record=require('./cinquecento-lights-records.json'),dir=path.join(__dirname,'cinquecento-lights');fs.mkdirSync(dir,{recursive:true});
const read=p=>PNG.sync.read(fs.readFileSync(p));
function bounds(p){let x0=p.width,y0=p.height,x1=0,y1=0;for(let y=0;y<p.height;y++)for(let x=0;x<p.width;x++)if(p.data[(y*p.width+x)*4+3]>100){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}return{x0,x1,y0,y1};}
const roadPath=path.join(root,'tools/paint-prototype/pixel-catalog-inputs/cinquecento.png');if(!fs.existsSync(dir+'/road-before.png'))fs.copyFileSync(roadPath,dir+'/road-before.png');const roadOld=read(dir+'/road-before.png'),oldLamp=[];
for(let y=20;y<66;y++)for(let x=260;x<284;x++){let q=(y*320+x)*4;const[r,g,b,a]=roadOld.data.subarray(q,q+4);if(a&&r>g*1.3&&r>b*1.5)oldLamp.push([x,y]);}
const reports=[];
for(const id of ['road','race']){
 const rec=record.records.find(r=>r.id===id),native=id==='road'?roadPath:path.join(root,'public/images/race-cars/cinquecento.png');if(!fs.existsSync(dir+'/'+id+'-before.png'))fs.copyFileSync(native,dir+'/'+id+'-before.png');if(!fs.existsSync(dir+'/'+id+'-generated.png'))fs.copyFileSync(rec.source,dir+'/'+id+'-generated.png');
 const original=read(dir+'/'+id+'-before.png'),generated=read(dir+'/'+id+'-generated.png'),out=read(dir+'/'+id+'-before.png'),a=bounds(original),b=bounds(generated),allowed=new Set();
 const sample=(x,y)=>{const sx=Math.max(0,Math.min(generated.width-1,Math.round(b.x0+(x-a.x0)*(b.x1-b.x0)/(a.x1-a.x0)))),sy=Math.max(0,Math.min(generated.height-1,Math.round(b.y0+(y-a.y0)*(b.y1-b.y0)/(a.y1-a.y0))));return [...generated.data.subarray((sy*generated.width+sx)*4,(sy*generated.width+sx)*4+4)];};
 const lampPoints=id==='road'?oldLamp:[];if(id==='race')for(let y=20;y<66;y++){let edge=319;while(edge>0&&!original.data[(y*320+edge)*4+3])edge--;for(let x=Math.max(260,edge-4);x<=edge;x++){const q=(y*320+x)*4,[r,g,b,al]=original.data.subarray(q,q+4);if(al&&r>g*1.3&&g>55&&b<90)lampPoints.push([x,y]);}}
 for(const [rx,ry]of lampPoints){const x=rx,y=ry,q=(y*320+x)*4;if(!original.data[q+3])continue;allowed.add(q);let c=sample(x,y);if(id==='road'&&(c[1]<=c[0]||c[3]<100))c=[47,138,70,255];if(id==='race'&&(c[3]<100||c[1]>c[0]))c=[200,20,20,255];out.data.set([...c.slice(0,3),original.data[q+3]],q);}
 const box=id==='road'?[273,69,281,76]:[266,66,278,73];for(let y=box[1];y<=box[3];y++)for(let x=box[0];x<=box[2];x++){const q=(y*320+x)*4;if(!original.data[q+3])continue;allowed.add(q);const c=sample(x,y);if(c[3]>100)out.data.set([...c.slice(0,3),original.data[q+3]],q);}
 let changed=0;for(let q=0;q<out.data.length;q+=4){assert.equal(out.data[q+3],original.data[q+3]);if(!out.data.subarray(q,q+4).equals(original.data.subarray(q,q+4))){assert(allowed.has(q));changed++;}}
 fs.writeFileSync(native,PNG.sync.write(out));if(id==='road'){const result=renderNative(out);for(const[name,png]of Object.entries(result.images)){const file=path.join(root,'public/images/pixel-cars/cinquecento',name+'.png'),before=read(file);for(let q=0;q<png.data.length;q+=4)if(!allowed.has(q))assert(png.data.subarray(q,q+4).equals(before.data.subarray(q,q+4)),name+' changed outside lamp');fs.writeFileSync(file,PNG.sync.write(png));}}
 reports.push({id,changedPixels:changed,allowedPixels:allowed.size,alphaIdentical:true,outsideLampIdentical:true});
}
fs.writeFileSync(dir+'/validation.json',JSON.stringify(reports,null,2));console.log(reports);
