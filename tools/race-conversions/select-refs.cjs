const fs=require('node:fs');
const c=JSON.parse(fs.readFileSync(__dirname+'/catalogue.json'));
const excluded=/die.?cast|scale (?:model|replica)|miniature|1\s*:\s*(?:18|24|43|64|87)|\b1\/(?:18|24|43|64|87)\b|resin (?:car|model)|assetto corsa|forza |gran turismo (?:sport|[2-7])|playstation|screenshot|3d (?:model|render)|digital render|\bAI.generated\b|plastic model|model kit|slot.car|Trading Paints|Need for Speed|NFS |VirtualModels|Behance|PNGEgg|Modelmatic|BRM Autobianchi|Minichamps|Laudoracing|Kyosho|Norev|Autoart|Solido|Ebbro|Trofeu|Hasegawa|Fujimi|Scalextric|Spark Models|digital artwork|illustration|rendering|computer-generated|oil painting|acrylic painting/i;
const badHost=/pinterest|ebay\.|amazon\.|aliexpress|diecast|modelcar|hobbysearch|catawiki|miniaturas|miniatures|gtplanet|modland|sketchfab|cgtrader|turbosquid|racedepartment|overtake\.gg|tradingpaints|virtualmodels|behance|pngegg|modelmatic|alfista-shop/i;
const jobs=[];
for(const m of c.models){const p=__dirname+'/research/'+m.key+'.json';if(!fs.existsSync(p))continue;const r=JSON.parse(fs.readFileSync(p));
 const images=r.images.filter(i=>!excluded.test(i.title+' '+i.description)&&!badHost.test(i.page+' '+i.url)).map(i=>{
  let score=0;const text=(i.title+' '+i.description).toLowerCase();if(/race|racing|rally|competition|motorsport|dtm|wrc|group|gruppo|kit.car|cup|jgtc|btcc|gr.a/.test(text))score+=4;
  for(const word of m.candidate.toLowerCase().split(/[^a-z0-9]+/).filter(w=>w.length>2))if(text.includes(word))score++;
  if(/press\.|media\.|museum|collection|flickr|wikimedia|racingcars|racecarsdirect|motorsport|fia\.com/.test(i.page))score+=3;
  for(const cue of [/race car|racing car|rally car|competition car/,/livery/,/sponsor|decals/,/numbered|number [0-9]|number [‘\"#]?[0-9]|bearing.*number/,/roll.cage/,/wide.*arch|flared.*arch|front splitter/])if(cue.test(text))score+=6;if(/rear|back view|back end|from behind/.test(text))score+=.2;if(/road car|stock|factory.stock|unmodified|challenge stradale/.test(text))score-=8;
  return {...i,score};}).sort((a,b)=>b.score-a.score);
 const seen=new Set();const chosen=images.filter(i=>{const u=i.url.split('?')[0];if(seen.has(u))return false;seen.add(u);return true;}).slice(0,5);
 jobs.push({key:m.key,candidate:m.candidate,classification:m.classification,images:chosen});
}
fs.writeFileSync('.preview/reference-jobs.json',JSON.stringify(jobs,null,2));
console.log(JSON.stringify({models:jobs.length,withRealPhotoCandidates:jobs.filter(j=>j.images.length).length,needMorePhotos:jobs.filter(j=>!j.images.length).map(j=>j.key)}));
