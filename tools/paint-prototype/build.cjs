// Offline, deterministic recolouring of the original sprite using a reviewed mask.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const {PNG} = require('pngjs');
const root = path.resolve(__dirname, '../..');
const sourcePath = path.join(root, 'public/images/car/seicento.png');
const sourceBytes = fs.readFileSync(sourcePath);
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const sourceHash = hash(sourceBytes);
const source = PNG.sync.read(sourceBytes);
const draft = PNG.sync.read(fs.readFileSync(path.join(__dirname, 'seicento-mask-draft.png')));
const protectedRegions=JSON.parse(fs.readFileSync(path.join(__dirname,'seicento-protected-regions.json'),'utf8'));
function inside(x,y,polygon){let result=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const [xi,yi]=polygon[i],[xj,yj]=polygon[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))result=!result;}return result;}
const output = path.join(root, 'public/images/paint/seicento');
fs.mkdirSync(output, {recursive:true});
function hsv(r, g, b) {
 r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;
 let h=0;if(d){h=max===r?((g-b)/d)%6:max===g?(b-r)/d+2:(r-g)/d+4;h*=60;if(h<0)h+=360;}
 return {h,s:max?d/max:0,v:max};
}
function draftSelected(x,y) {
 if(x<0||y<0||x>=source.width||y>=source.height)return false;
 const dx=Math.min(draft.width-1,Math.floor((x+.5)*draft.width/source.width));
 const dy=Math.min(draft.height-1,Math.floor((y+.5)*draft.height/source.height));
 return draft.data[(dy*draft.width+dx)*4]>160;
}
const mask=new PNG({width:source.width,height:source.height});let selected=0;
for(let y=0;y<source.height;y++)for(let x=0;x<source.width;x++){
 const p=(y*source.width+x)*4,[r,g,b,a]=source.data.subarray(p,p+4),{h,s,v}=hsv(r,g,b);
 let near=false;for(let dy=-6;dy<=6&&!near;dy++)for(let dx=-6;dx<=6;dx++)if(draftSelected(x+dx,y+dy)){near=true;break;}
 // Yellow paint only. Original lights, wheels, glass and trim are protected.
 const protectedDetail=protectedRegions.some(region=>inside(x+.5,y+.5,region.polygon)&&(region.name!=='Stemma anteriore'||v<.6));
 const paint=a>0&&h>=28&&h<=84&&s>=.14&&v>=.05&&r>b+6&&g>b+5&&near&&!protectedDetail;
 const value=paint?255:0;if(paint)selected++;mask.data.set([value,value,value,255],p);
}
fs.writeFileSync(path.join(output,'mask.png'),PNG.sync.write(mask));
const colours=[
 {id:'rosso',name:'Rosso pastello',rgb:[195,27,32]},
 {id:'blu',name:'Blu scuro',rgb:[28,60,148]},
 {id:'verde',name:'Verde bottiglia',rgb:[27,82,54]},
 {id:'nero',name:'Nero',rgb:[29,32,36]},
 {id:'bianco',name:'Bianco',rgb:[237,238,234]},
 {id:'argento',name:'Grigio argento',rgb:[159,168,178]},
];
const report={source:'public/images/car/seicento.png',sourceSha256:sourceHash,width:source.width,height:source.height,selectedPixels:selected,variants:[]};
for(const colour of colours){
 const png=new PNG({width:source.width,height:source.height});source.data.copy(png.data);let changed=0;
 for(let p=0;p<source.data.length;p+=4){
  if(!mask.data[p])continue;
  const {s,v}=hsv(...source.data.subarray(p,p+3));
  const shade=Math.pow(Math.min(1,v/.96),1.25),specular=Math.pow(1-s,2.7)*v;
  for(let k=0;k<3;k++)png.data[p+k]=Math.round(Math.min(255,colour.rgb[k]*shade*(1-specular)+255*specular));
 }
 for(let p=0;p<source.data.length;p+=4){
  assert.equal(png.data[p+3],source.data[p+3],'Alpha must remain identical');
  if(!mask.data[p])assert(source.data.subarray(p,p+4).equals(png.data.subarray(p,p+4)),'Pixels outside the mask must remain identical');
  if(!source.data.subarray(p,p+3).equals(png.data.subarray(p,p+3)))changed++;
 }
 const file=colour.id+'.png';fs.writeFileSync(path.join(output,file),PNG.sync.write(png));report.variants.push({id:colour.id,file,changedPixels:changed,alphaIdentical:true,outsideMaskIdentical:true});
}
assert.equal(hash(fs.readFileSync(sourcePath)),sourceHash,'Never overwrite original');
fs.writeFileSync(path.join(output,'catalog.json'),JSON.stringify({model:'Fiat Seicento Sporting',prototype:true,proposedPrice:2500,source:report.source,sourceSha256:sourceHash,mask:'mask.png',colours},null,2)+'\n');
fs.writeFileSync(path.join(__dirname,'validation.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({selectedPixels:selected,variants:colours.length,sourceUnchanged:true,alphaIdentical:true,outsideMaskIdentical:true}));
