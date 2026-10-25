// Revisions of existing native masks only. No redraw, resampling or source edits.
const {PNG}=require('pngjs');const {hsv}=require('./catalog-render.cjs');
const hueDistance=(a,b)=>Math.min(Math.abs(a-b),360-Math.abs(a-b));
// These silver photographs have dark reflections that lower their median value.
const LIGHT_SILVER=new Set(['850','barchetta','206','gt1','clio','yaris','speed12']);
function groups(profile,key){return {red:profile.chromatic&&hueDistance(profile.hue,0)<32,light:LIGHT_SILVER.has(key)||(profile.medianValue>.55&&profile.baseValue>.7&&profile.baseSaturation<.36)};}
function repairEdges(source,baseline,profile,key){
 const {width:w,height:h,data}=source,n=w*h,paint=new Uint8Array(n),opaque=new Uint8Array(n),bounds=[w,h,0,0];
 const kind=groups(profile,key);for(let i=0;i<n;i++){paint[i]=baseline.data[i*4]>0?1:0;opaque[i]=data[i*4+3]>0?1:0;if(data[i*4+3]>80){const x=i%w,y=Math.floor(i/w);bounds[0]=Math.min(bounds[0],x);bounds[1]=Math.min(bounds[1],y);bounds[2]=Math.max(bounds[2],x);bounds[3]=Math.max(bounds[3],y);}}
 const inBounds=(x,y)=>x>=0&&y>=0&&x<w&&y<h;
 const at=(array,x,y)=>inBounds(x,y)?array[y*w+x]:0;
 const final=new Uint8Array(paint),seams=new Uint8Array(n);let redAdded=0;
 if(kind.red){
  const lower=new Int16Array(w).fill(-1),wheel=new Uint8Array(w);for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(paint[y*w+x])lower[x]=y;for(let x=0;x<w;x++){if(lower[x]<0)continue;let flank=-1;for(let dx=-22;dx<=22;dx++)if(x+dx>=0&&x+dx<w)flank=Math.max(flank,lower[x+dx]);if(flank-lower[x]>7)wheel[x]=1;}
  for(let y=bounds[1];y<=bounds[3];y++)for(let x=bounds[0];x<=bounds[2];x++){
   const i=y*w+x,p=i*4;if(paint[i]||!opaque[i])continue;
   // Restrict the repair to lower bodywork. Keep the rear light cluster intact.
   const fy=(y-bounds[1])/Math.max(1,bounds[3]-bounds[1]),fx=(x-bounds[0])/Math.max(1,bounds[2]-bounds[0]);
   if(fy<.43||(fx>.86&&fy<.70)||(wheel[x]&&y>lower[x]+3))continue;
   const c=hsv(data[p],data[p+1],data[p+2]);if(c.s<.2||c.v<.07||hueDistance(c.h,profile.hue)>(fy>.72?42:30))continue;
   const radius=fy>.72?6:3;let near=false;for(let dy=-radius;dy<=radius&&!near;dy++)for(let dx=-radius;dx<=radius;dx++)if(dx*dx+dy*dy<=radius*radius+1&&at(paint,x+dx,y+dy)){near=true;break;}
   if(near){final[i]=1;redAdded++;}
  }
 }
 let seamCount=0,seamComponents=0;
 if(kind.light){
  // Closing fills thin cracks; it leaves the large holes for glass/lights/wheels.
  const dilated=new Uint8Array(n),closed=new Uint8Array(n),candidate=new Uint8Array(n),bottom=new Int16Array(w).fill(-1),arch=new Uint8Array(w);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(paint[y*w+x])bottom[x]=y;
  for(let x=0;x<w;x++){if(bottom[x]<0)continue;let flank=-1;for(let dx=-22;dx<=22;dx++)if(x+dx>=0&&x+dx<w)flank=Math.max(flank,bottom[x+dx]);if(flank-bottom[x]>7)arch[x]=1;}
  for(let y=2;y<h-2;y++)for(let x=2;x<w-2;x++){let yes=false;for(let dy=-2;dy<=2&&!yes;dy++)for(let dx=-2;dx<=2;dx++)if(at(paint,x+dx,y+dy)){yes=true;break;}dilated[y*w+x]=yes?1:0;}
  for(let y=3;y<h-3;y++)for(let x=3;x<w-3;x++){let yes=true;for(let dy=-2;dy<=2&&yes;dy++)for(let dx=-2;dx<=2;dx++)if(!at(dilated,x+dx,y+dy)){yes=false;break;}closed[y*w+x]=yes?1:0;}
  for(let y=2;y<h-2;y++)for(let x=2;x<w-2;x++){
   const i=y*w+x,p=i*4;if(data[p+3]<180)continue;
   const c=hsv(data[p],data[p+1],data[p+2]);if(c.s>.3||c.v<.2)continue;
   if(!paint[i]&&closed[i]){
    // Narrow excluded channels between two painted panels.
    let opposed=false;for(const [dx,dy] of [[1,0],[0,1],[1,1],[1,-1]])if((at(paint,x+dx,y+dy)||at(paint,x+dx*2,y+dy*2)||at(paint,x+dx*3,y+dy*3))&&(at(paint,x-dx,y-dy)||at(paint,x-dx*2,y-dy*2)||at(paint,x-dx*3,y-dy*3))){opposed=true;break;}
    if(opposed)candidate[i]=1;
   }else if(!paint[i]&&c.v>.45&&(y-bounds[1])/Math.max(1,bounds[3]-bounds[1])>.6&&!(arch[x]&&y>=bottom[x])){
    let near=false;for(let dy=-4;dy<=4&&!near;dy++)for(let dx=-4;dx<=4;dx++)if(at(paint,x+dx,y+dy)){near=true;break;}if(near)candidate[i]=1;
   }else if(paint[i]&&c.v>Math.max(.58,profile.baseValue-.04)){
    // A one-pixel bright ridge on the paint-mask boundary is not a broad reflection.
    let boundary=false;const values=[];
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const xx=x+dx,yy=y+dy;if(!at(paint,xx,yy)){boundary=true;continue;}const q=(yy*w+xx)*4;if(data[q+3]>180)values.push(Math.max(data[q],data[q+1],data[q+2])/255);}
    values.sort((a,b)=>a-b);const body=values[Math.floor(values.length*.35)];
    if(boundary&&values.length>=3&&c.v-body>.018)candidate[i]=1;
   }
  }
  const visited=new Uint8Array(n);
  for(let start=0;start<n;start++){
   if(!candidate[start]||visited[start])continue;const component=[],queue=[start];visited[start]=1;let xmin=w,ymin=h,xmax=0,ymax=0;
   for(let q=0;q<queue.length;q++){const i=queue[q],x=i%w,y=Math.floor(i/w);component.push(i);xmin=Math.min(xmin,x);xmax=Math.max(xmax,x);ymin=Math.min(ymin,y);ymax=Math.max(ymax,y);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy,j=yy*w+xx;if(inBounds(xx,yy)&&candidate[j]&&!visited[j]){visited[j]=1;queue.push(j);}}}
   const bw=xmax-xmin+1,bh=ymax-ymin+1,long=Math.max(bw,bh),short=Math.min(bw,bh),fx=((xmin+xmax)/2-bounds[0])/Math.max(1,bounds[2]-bounds[0]),fy=((ymin+ymax)/2-bounds[1])/Math.max(1,bounds[3]-bounds[1]);
   // Badges/handles are small; short horizontal slits at the front are lamps.
   if(component.length<7||long<10||long/short<2)continue;
   const lampLike=(fx<.48||fx>.85)&&fy>.34&&fy<.95&&bh<(bounds[3]-bounds[1])*.16&&bw<(bounds[2]-bounds[0])*.22;
   const wheelLike=fy>.65&&bw>=8&&bh>=8&&bw<(bounds[2]-bounds[0])*.15&&bh/bw>1.2;
   if(lampLike||wheelLike)continue;
   for(const i of component){final[i]=1;seams[i]=1;seamCount++;}seamComponents++;
  }
 }
 const mask=new PNG({width:w,height:h}),outline=new PNG({width:w,height:h});let selected=0;
 for(let i=0;i<n;i++){const p=i*4,v=final[i]?255:0,s=seams[i]?255:0;mask.data.set([v,v,v,255],p);outline.data.set([s,s,s,255],p);selected+=!!final[i];}
 return{mask,outline,changed:redAdded>0||seamCount>0,report:{version:2,...kind,redAdded,seamPixels:seamCount,seamComponents,selectedPixels:selected}};
}
module.exports={groups,repairEdges};
