const {PNG}=require('pngjs');
const {hsv}=require('./catalog-render.cjs');
const {seams,smooth,special}=require('./review3-rules.cjs');
const inside=(x,y,polygon)=>{let yes=false;for(let i=0,j=polygon.length-1;i<polygon.length;j=i++){const [a,b]=polygon[i],[c,d]=polygon[j];if((b>y)!==(d>y)&&x<(c-a)*(y-b)/(d-b)+a)yes=!yes;}return yes;};
const hueDistance=(a,b)=>Math.min(Math.abs(a-b),360-Math.abs(a-b));
const segmentDistance=(x,y,[ax,ay],[bx,by])=>{const length=(bx-ax)**2+(by-ay)**2,t=length?Math.max(0,Math.min(1,((x-ax)*(bx-ax)+(y-ay)*(by-ay))/length)):0;return Math.hypot(x-ax-t*(bx-ax),y-ay-t*(by-ay));};
function repairReviewed(source,baseline,oldOutline,profile,key,note){
 const {width:w,height:h,data}=source,n=w*h,base=new Uint8Array(n),paint=new Uint8Array(n),line=new Uint8Array(n),bottom=new Int16Array(w).fill(-1),rules=special[key]||{};
 let ymin=h,ymax=0;for(let i=0;i<n;i++){base[i]=paint[i]=baseline.data[i*4]?1:0;line[i]=oldOutline?.data[i*4]?1:0;if(data[i*4+3]>100){ymin=Math.min(ymin,Math.floor(i/w));ymax=Math.max(ymax,Math.floor(i/w));}if(base[i])bottom[i%w]=Math.floor(i/w);}
 const at=(arr,x,y)=>x>=0&&y>=0&&x<w&&y<h?arr[y*w+x]:0;
 const near=(x,y,r)=>{for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++)if(dx*dx+dy*dy<=r*r&&at(base,x+dx,y+dy))return true;return false;};
 const protectedAt=(x,y)=>rules.protectPolygons?.some(poly=>inside(x+.5,y+.5,poly));
 const keptDetail=(x,y)=>rules.protectedRects?.some(([x1,y1,x2,y2])=>x>=x1&&x<=x2&&y>=y1&&y<=y2);
 const lower=/basso|basse|bassi|minigonn|passaruota|paraurti|bordi del colore originale|bordi bianchi/.test(note.toLowerCase());
 const chromatic=profile.chromatic||rules.hueRepair||key==='seicento',hue=rules.hue??profile.hue;
 let added=0,removed=0,newSeams=0;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const i=y*w+x,p=i*4;if(!data[p+3])continue;
  if(protectedAt(x,y)){if(paint[i])removed++;paint[i]=line[i]=0;continue;}
  if(keptDetail(x,y))continue;
  const c=hsv(data[p],data[p+1],data[p+2]);
  const spot=rules.spots?.some(([cx,cy,r])=>(x-cx)**2+(y-cy)**2<=r*r);
  const manual=rules.paintPolygons?.some(poly=>inside(x+.5,y+.5,poly));
  const colourMatch=chromatic&&c.s>.13&&c.v>.055&&hueDistance(c.h,hue)<46;
  if(!base[i]&&((spot&&colourMatch&&near(x,y,10))||manual))paint[i]=1;
  if(lower&&!base[i]&&y>ymin+(ymax-ymin)*.43){
   if(colourMatch&&(rules.archRepair||y<=bottom[x]+6)&&near(x,y,9))paint[i]=1;
   // Neutral lower edges: follow the existing body silhouette, not wheel interiors.
   else if(!chromatic&&c.v>.19&&c.s<.43&&bottom[x]>=0&&y>=bottom[x]-2&&y<=bottom[x]+2&&near(x,y,3))paint[i]=1;
  }
  if(seams.has(key)&&!base[i]&&c.v>.19&&c.s<.45){
   let opposed=false;
   for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]]){
    const side=(sign)=>[1,2].some(d=>at(base,x+dx*d*sign,y+dy*d*sign));
    if(side(1)&&side(-1)){opposed=true;break;}
   }
   if(opposed){paint[i]=1;line[i]=1;}
  }
  if(rules.seamPaths&&c.v>.12&&rules.seamPaths.some(points=>points.some((point,j)=>j&&segmentDistance(x+.5,y+.5,points[j-1],point)<1.15))){
   const boundary=!base[i]||[[0,1],[0,-1],[1,0],[-1,0]].some(([dx,dy])=>!at(base,x+dx,y+dy));
   if(boundary||key==='trueno'){paint[i]=line[i]=1;}
  }
  if(rules.trimPolygons?.some(poly=>inside(x+.5,y+.5,poly))){paint[i]=line[i]=1;}
  // Repair isolated pinholes in the paint selection, while keeping glass/lights excluded.
  if(smooth.has(key)&&!base[i]){
   let neighbours=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if((dx||dy)&&at(base,x+dx,y+dy))neighbours++;
   if(neighbours>=7)paint[i]=1;
  }
 }
 // Recolour the pale antialias beside a seam without thickening the black line.
 const seamSeeds=new Uint8Array(line);
 if(seams.has(key))for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){
  const i=y*w+x,p=i*4;if(protectedAt(x,y)||keptDetail(x,y)||!data[p+3])continue;
  if(!base[i]&&hsv(data[p],data[p+1],data[p+2]).s<.45&&[[0,1],[0,-1],[1,0],[-1,0]].some(([dx,dy])=>at(seamSeeds,x+dx,y+dy))&&near(x,y,2))paint[i]=1;
 }
 const mask=new PNG({width:w,height:h}),outline=new PNG({width:w,height:h});
 for(let i=0;i<n;i++){const p=i*4;mask.data.set([paint[i]*255,paint[i]*255,paint[i]*255,255],p);outline.data.set([line[i]*255,line[i]*255,line[i]*255,255],p);added+=paint[i]&&!base[i]?1:0;newSeams+=line[i]&&!oldOutline?.data[p]?1:0;}
 return{mask,outline,profile:{...profile,...(smooth.has(key)?{shadeSmoothing:1,darkPaintFloor:.64,specularScale:.25}:{} )},report:{revision:3,added,removed,newSeams,smoothing:smooth.has(key)}};
}
module.exports={repairReviewed,inside};
