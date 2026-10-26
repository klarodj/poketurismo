const {PNG}=require('pngjs'),{COLOURS,hsv}=require('./catalog-render.cjs'),assert=require('node:assert/strict');
const parse=hex=>[0,2,4].map(i=>parseInt(hex.slice(i,i+2),16));
const DETAIL_PALETTE=['080c10','14191e','222a30','343e47','4d5962','6b7880','8c989c','afb9bc','d5d9d5','f2efe0','233545','324d62','486a82','64879e','8ea9bb','b6c9d0','2a2522','695839','a4834e','d7b875','ffc66d','e98b23','a94b13','5e1d16','a83020','e24a2b','072349','155191','4c8bc0'].map(parse);
const ramp=rgb=>[.23,.42,.6,.78,1].map(f=>rgb.map(v=>Math.round(v*f))).concat([rgb.map(v=>Math.round(v*.65+255*.35))]);
const nearest=rgb=>DETAIL_PALETTE.reduce((best,c,i)=>{const distance=c.reduce((sum,v,k)=>sum+(v-rgb[k])**2,0);return distance<best.distance?{i,distance}:best;},{i:0,distance:Infinity}).i;
function prepareNative(raw){
 let minX=raw.width,minY=raw.height,maxX=0,maxY=0;for(let y=0;y<raw.height;y++)for(let x=0;x<raw.width;x++)if(raw.data[(y*raw.width+x)*4+3]>96){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
 assert(minX<maxX&&minY<maxY,'Empty sprite');const scale=Math.min(304/(maxX-minX+1),112/(maxY-minY+1)),width=Math.round((maxX-minX+1)*scale),height=Math.round((maxY-minY+1)*scale),left=Math.floor((320-width)/2),top=122-height,native=new PNG({width:320,height:128});
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const sx=Math.min(maxX,minX+Math.floor((x+.5)/scale)),sy=Math.min(maxY,minY+Math.floor((y+.5)/scale)),p=(sy*raw.width+sx)*4,q=((top+y)*320+left+x)*4;raw.data.copy(native.data,q,p,p+4);}
 return native;
}
function renderNative(native){
 assert.equal(native.width,320);assert.equal(native.height,128);const base=new PNG({width:320,height:128}),body=new PNG({width:320,height:128}),details=new PNG({width:320,height:128}),index=new PNG({width:320,height:128}),materialPalette=ramp([47,138,70]);let bodyPixels=0,detailPixels=0;
 for(let p=0;p<native.data.length;p+=4){const rgb=[...native.data.subarray(p,p+3)],alpha=native.data[p+3];if(!alpha)continue;const c=hsv(...rgb),paint=c.h>=76&&c.h<=166&&c.s>.14&&rgb[1]>=rgb[0]+2&&rgb[1]>=rgb[2]+2;
  if(paint){const level=[.13,.24,.38,.53,.68].filter(t=>c.v>t).length;index.data.set([level+1,level+1,level+1,alpha],p);body.data.set([...materialPalette[level],alpha],p);base.data.set([...materialPalette[level],alpha],p);bodyPixels++;}
  else{const colour=DETAIL_PALETTE[nearest(rgb)];details.data.set([...colour,alpha],p);base.data.set([...colour,alpha],p);detailPixels++;}
 }
 assert(bodyPixels>1500&&detailPixels>800,'Insufficient body/details');const images={base,body,details,index};let protectedPixels=0;
 for(const colour of COLOURS){const png=new PNG({width:320,height:128});details.data.copy(png.data);const palette=ramp(colour.rgb);for(let p=0;p<index.data.length;p+=4)if(index.data[p])png.data.set([...palette[index.data[p]-1],index.data[p+3]],p);for(let p=0;p<png.data.length;p+=4){assert.equal(png.data[p+3],base.data[p+3]);if(!index.data[p]){assert(png.data.subarray(p,p+4).equals(details.data.subarray(p,p+4)));protectedPixels++;}}images[colour.id]=png;}
 return {images,bodyPixels,detailPixels,protectedPixels};
}
module.exports={prepareNative,renderNative};
