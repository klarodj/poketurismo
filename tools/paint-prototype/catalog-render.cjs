const {PNG}=require('pngjs');
const COLOURS=[{id:'rosso',name:'Rosso pastello',rgb:[195,27,32]},{id:'blu',name:'Blu scuro',rgb:[28,60,148]},{id:'verde',name:'Verde bottiglia',rgb:[27,82,54]},{id:'nero',name:'Nero',rgb:[29,32,36]},{id:'bianco',name:'Bianco',rgb:[237,238,234]},{id:'argento',name:'Grigio argento',rgb:[159,168,178]},{id:'giallo',name:'Giallo pastello',rgb:[242,198,27]}];
function hsv(r,g,b){r/=255;g/=255;b/=255;const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=0;if(d){h=max===r?((g-b)/d)%6:max===g?(b-r)/d+2:(r-g)/d+4;h*=60;if(h<0)h+=360;}return{h,s:max?d/max:0,v:max};}
const hueDistance=(a,b)=>Math.min(Math.abs(a-b),360-Math.abs(a-b));
const quantile=(values,q)=>{const list=values.slice().sort((a,b)=>a-b);return list[Math.min(list.length-1,Math.floor(q*(list.length-1)))]||.5;};
function prepareMask(source,draft){
 const {width,height,data}=source,n=width*height,raw=new Uint8Array(n),hist=Array(36).fill(0);let white=0,overlap=0,visible=0,saturated=0;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){const p=(y*width+x)*4;if(data[p+3]>100)visible++;const dx=Math.min(draft.width-1,Math.floor((x+.5)*draft.width/width)),dy=Math.min(draft.height-1,Math.floor((y+.5)*draft.height/height));const mark=draft.data[(dy*draft.width+dx)*4]>155;if(!mark)continue;raw[y*width+x]=1;white++;if(data[p+3]>100){overlap++;const c=hsv(data[p],data[p+1],data[p+2]);if(c.s>.27&&c.v>.14){hist[Math.floor(c.h/10)%36]++;saturated++;}}}
 let peak=0;for(let i=0;i<36;i++){const weight=hist[(i+35)%36]+hist[i]+hist[(i+1)%36];if(weight>hist[(peak+35)%36]+hist[peak]+hist[(peak+1)%36])peak=i;}
 const hue=peak*10+5,peakCount=hist[(peak+35)%36]+hist[peak]+hist[(peak+1)%36];
 const chromatic=saturated/Math.max(1,overlap)>.29&&peakCount/Math.max(1,overlap)>.22;
 const mask=new PNG({width,height});let selected=0;const values=[],saturations=[];
 function isWhite(x,y){return x>=0&&y>=0&&x<width&&y<height&&raw[y*width+x];}
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const p=(y*width+x)*4,c=hsv(data[p],data[p+1],data[p+2]);let region=isWhite(x,y);
  if(!region&&chromatic&&c.s>.22&&hueDistance(c.h,hue)<38){for(let dy=-2;dy<=2&&!region;dy++)for(let dx=-2;dx<=2;dx++)if(isWhite(x+dx,y+dy)){region=true;break;}}
  const interior=isWhite(x-2,y)&&isWhite(x+2,y)&&isWhite(x,y-2)&&isWhite(x,y+2);
  const colourMatch=!(chromatic&&c.s<.09&&c.v>.72&&!interior);
  const paint=region&&data[p+3]>0&&(c.v>.035||interior)&&colourMatch;
  const v=paint?255:0;mask.data.set([v,v,v,255],p);if(paint){selected++;values.push(c.v);saturations.push(c.s);}
 }
 const calibration={chromatic,hue,baseValue:Math.max(.12,quantile(values,.78)),baseSaturation:quantile(saturations,.65),medianValue:quantile(values,.5),darkPaint:quantile(values,.5)<.33};
 const notes=[];if(overlap/Math.max(white,1)<.9)notes.push('Controllare il bordo della carrozzeria.');if(selected/Math.max(visible,1)<.2)notes.push('Controllare la copertura delle zone in ombra.');if(selected/Math.max(visible,1)>.82)notes.push('Controllare vetri, fari e finiture.');
 return{mask,calibration,metrics:{selectedPixels:selected,visiblePixels:visible,coverage:Math.round(selected/Math.max(1,visible)*1000)/10,maskOverlap:Math.round(overlap/Math.max(1,white)*1000)/10},notes};
}
function renderColour(source,mask,rgb,calibration,outline=null){
 const out=new PNG({width:source.width,height:source.height});source.data.copy(out.data);
 for(let p=0;p<source.data.length;p+=4){if(!mask.data[p])continue;if(outline?.data[p]){const value=14+Math.round(Math.max(source.data[p],source.data[p+1],source.data[p+2])/255*7);out.data[p]=value;out.data[p+1]=value;out.data[p+2]=value+1;continue;}const c=hsv(source.data[p],source.data[p+1],source.data[p+2]);let shade,specular;
 if(calibration.shadeSmoothing){const i=p/4,x=i%source.width,y=Math.floor(i/source.width),values=[];for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const xx=x+dx,yy=y+dy,q=(yy*source.width+xx)*4;if(xx>=0&&yy>=0&&xx<source.width&&yy<source.height&&mask.data[q]&&!outline?.data[q])values.push(Math.max(source.data[q],source.data[q+1],source.data[q+2])/255);}values.sort((a,b)=>a-b);if(values.length>=4)c.v=c.v*.35+values[Math.floor(values.length/2)]*.65;}
 if(calibration.chromatic){shade=Math.pow(Math.min(1,c.v/Math.max(.12,calibration.baseValue)),calibration.shadeExponent||1.2);specular=Math.pow(1-c.s,2.7)*c.v;}
 else{const base=calibration.baseValue;shade=Math.pow(Math.min(1,c.v/base),.9);specular=c.v>base?Math.min(.7,(c.v-base)/Math.max(.1,1-base))*.65:0;}
 if(calibration.darkPaint){const floor=calibration.darkPaintFloor??.38;shade=floor+(1-floor)*Math.pow(Math.min(1,c.v/calibration.baseValue),.7);}
 specular*=calibration.specularScale??1;
 for(let k=0;k<3;k++)out.data[p+k]=Math.round(Math.min(255,rgb[k]*shade*(1-specular)+255*specular));
 }return out;
}
function verify(source,mask,out){if(source.width!==out.width||source.height!==out.height)throw Error('Dimensions changed');let changed=0;for(let p=0;p<source.data.length;p+=4){if(source.data[p+3]!==out.data[p+3])throw Error('Transparency changed');if(!mask.data[p]&&!source.data.subarray(p,p+4).equals(out.data.subarray(p,p+4)))throw Error('Pixel outside paint mask changed');if(!source.data.subarray(p,p+3).equals(out.data.subarray(p,p+3)))changed++;}return changed;}
module.exports={COLOURS,hsv,prepareMask,renderColour,verify};
