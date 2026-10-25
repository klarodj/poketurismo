// Separate experiment: never overwrite photographic cars or reviewed paint variants.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {PNG}=require('pngjs'),{COLOURS,hsv}=require('./catalog-render.cjs');
const root=path.resolve(__dirname,'../..'),sources=require('./pixel-trial-sources.json');
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const parse=hex=>[0,2,4].map(i=>parseInt(hex.slice(i,i+2),16));
const detailPalette=['080c10','14191e','222a30','343e47','4d5962','6b7880','8c989c','afb9bc','d5d9d5','f2efe0','233545','324d62','486a82','64879e','8ea9bb','b6c9d0','2a2522','695839','a4834e','d7b875','ffc66d','e98b23','a94b13','5e1d16','a83020','e24a2b','072349','155191','4c8bc0'].map(parse);
const ramp=rgb=>[.23,.42,.6,.78,1].map(f=>rgb.map(v=>Math.round(v*f))).concat([rgb.map(v=>Math.round(v*.65+255*.35))]);
const materialPalette=ramp([47,138,70]);
const nearest=(rgb,palette)=>palette.reduce((best,c,i)=>{const distance=c.reduce((sum,v,k)=>sum+(v-rgb[k])**2,0);return distance<best.distance?{i,distance}:best;},{i:0,distance:Infinity}).i;
const catalog={version:1,width:320,height:128,colours:COLOURS,models:[]},report=[];
for(const model of sources.models){
 const originalPath=path.join(root,model.reference),originalHash=sha(fs.readFileSync(originalPath));
 const input=fs.readFileSync(path.join(root,model.input)),raw=PNG.sync.read(input);let minX=raw.width,minY=raw.height,maxX=0,maxY=0;
 for(let y=0;y<raw.height;y++)for(let x=0;x<raw.width;x++)if(raw.data[(y*raw.width+x)*4+3]>96){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
 const scale=Math.min(304/(maxX-minX+1),112/(maxY-minY+1)),width=Math.round((maxX-minX+1)*scale),height=Math.round((maxY-minY+1)*scale),left=Math.floor((320-width)/2),top=122-height;
 const base=new PNG({width:320,height:128}),body=new PNG({width:320,height:128}),details=new PNG({width:320,height:128}),index=new PNG({width:320,height:128});let bodyPixels=0,detailPixels=0;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const sx=Math.min(maxX,minX+Math.floor((x+.5)/scale)),sy=Math.min(maxY,minY+Math.floor((y+.5)/scale)),p=(sy*raw.width+sx)*4,q=((top+y)*320+left+x)*4,rgb=[...raw.data.subarray(p,p+3)],alpha=raw.data[p+3];if(!alpha)continue;
  const c=hsv(...rgb),isPaint=c.h>=76&&c.h<=166&&c.s>.14&&rgb[1]>=rgb[0]+2&&rgb[1]>=rgb[2]+2;
  if(isPaint){const level=[.13,.24,.38,.53,.68].filter(t=>c.v>t).length;index.data.set([level+1,level+1,level+1,alpha],q);body.data.set([...materialPalette[level],alpha],q);base.data.set([...materialPalette[level],alpha],q);bodyPixels++;}
  else{const colour=detailPalette[nearest(rgb,detailPalette)];details.data.set([...colour,alpha],q);base.data.set([...colour,alpha],q);detailPixels++;}
 }
 assert(bodyPixels>3000&&detailPixels>1000,model.key);const directory=path.join(root,model.output);fs.mkdirSync(directory,{recursive:true});
 for(const [name,png] of Object.entries({base,body,details,index}))fs.writeFileSync(path.join(directory,name+'.png'),PNG.sync.write(png));
 const images={};let protectedPixels=0;
 for(const colour of COLOURS){const png=new PNG({width:320,height:128});details.data.copy(png.data);const palette=ramp(colour.rgb);
  for(let p=0;p<index.data.length;p+=4)if(index.data[p])png.data.set([...palette[index.data[p]-1],index.data[p+3]],p);
  for(let p=0;p<png.data.length;p+=4){assert.equal(png.data[p+3],base.data[p+3]);if(!index.data[p]){assert(png.data.subarray(p,p+4).equals(details.data.subarray(p,p+4)));protectedPixels++;}}
  fs.writeFileSync(path.join(directory,colour.id+'.png'),PNG.sync.write(png));images[colour.id]=`/images/pixel-cars/${model.key}/${colour.id}.png`;
 }
 assert.equal(sha(fs.readFileSync(originalPath)),originalHash);
 catalog.models.push({key:model.key,name:model.model,original:'/'+model.reference.replace('public/',''),legacyPaint:`/images/paint/${model.key}/`,images,body:`/images/pixel-cars/${model.key}/body.png`,details:`/images/pixel-cars/${model.key}/details.png`,sources:model.sources});
 report.push({key:model.key,inputSha256:sha(input),originalSha256:originalHash,nativeSize:[320,128],bodyPixels,detailPixels,protectedPixels,variants:7,alphaIdentical:true,detailsIdentical:true});
}
fs.mkdirSync(path.join(root,'public/images/pixel-cars'),{recursive:true});fs.writeFileSync(path.join(root,'public/images/pixel-cars/catalog.json'),JSON.stringify(catalog,null,2)+'\n');fs.writeFileSync(path.join(__dirname,'pixel-trial-validation.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
