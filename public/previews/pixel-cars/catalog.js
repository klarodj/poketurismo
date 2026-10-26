const $=id=>document.getElementById(id);
const STORAGE='poketurismo-pixel-review-v1';
const labels={pending:'Da valutare',approved:'Va bene',fix:'Da correggere'};
let catalog,models=[],filtered=[],active,colour='rosso',reviews={},zoom=false;
const params=new URLSearchParams(location.search);
try{const saved=JSON.parse(localStorage.getItem(STORAGE)||'{}');if(saved&&typeof saved==='object'&&!Array.isArray(saved))reviews=saved;}catch{/* Browsing works without saved notes. */}
const stale=model=>reviews[model.key]&&(reviews[model.key].revision||1)<(model.revision||1);
const status=model=>stale(model)&&reviews[model.key].status==='approved'?'pending':['pending','approved','fix'].includes(reviews[model.key]?.status)?reviews[model.key].status:model.approved?'approved':'pending';
const versioned=(url,model)=>(model.revision||1)>1?`${url}?rev=${model.revision}`:url;
const original=model=>$('legacy-paint').checked?`${model.legacyPaint}${colour}.png?rev=3`:model.source;
const image=(model,tint)=>tint==='originale'?original(model):versioned(model.images[tint],model);
const colourName=id=>id==='originale'?'Colore originale':catalog.colours.find(c=>c.id===id)?.name||id;
function announce(text){$('notice').textContent=text;}
function shareURL(model=active,tint=colour){const url=new URL(location.pathname,location.origin);url.searchParams.set('auto',model.key);url.searchParams.set('colore',tint);return url.href;}
function updateURL(){history.replaceState(null,'',shareURL());}
function stats(){const counts={pending:0,approved:0,fix:0};for(const model of models)counts[status(model)]++;$('progress').textContent=`${models.length} modelli · ${counts.pending} da valutare · ${counts.approved} approvati · ${counts.fix} da correggere`;}
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(reviews));$('saved').textContent='Valutazione salvata su questo browser.';}catch{$('saved').textContent='Il browser non salva le note: usa «Esporta correzioni» per conservarle.';}stats();}
function saveReview(){if(!active)return;reviews[active.key]={status:$('review-state').value,note:$('note').value.slice(0,1200),colour,revision:active.revision||1,updatedAt:new Date().toISOString()};save();updateButtonStatus();}
function updateButtonStatus(){for(const button of $('model-list').querySelectorAll('button')){const model=models.find(m=>m.key===button.dataset.model),small=button.querySelector('small');small.textContent=`${model.brand} · ${labels[status(model)]}`;small.className=status(model)==='fix'?'review-status-fix':'';}}
function navState(){const at=filtered.findIndex(m=>m.key===active?.key);$('position').textContent=at>=0?`${at+1} / ${filtered.length}`:'Fuori dal filtro';$('previous').disabled=at<=0;$('next').disabled=at<0||at>=filtered.length-1;}
function filterModels(selectFirst=true){
 const query=$('search').value.trim().toLocaleLowerCase('it'),brand=$('brand').value,filter=$('filter').value;
 filtered=models.filter(model=>(!brand||model.brand===brand)&&(filter==='all'||status(model)===filter)&&`${model.id} ${model.brand} ${model.name}`.toLocaleLowerCase('it').includes(query));
 $('results').textContent=`${filtered.length} ${filtered.length===1?'modello trovato':'modelli trovati'}`;$('model-list').replaceChildren();$('model-picker').replaceChildren();
 for(const model of filtered){const option=new Option(`#${model.id} · ${model.brand} ${model.name}`,model.key);$('model-picker').append(option);const button=document.createElement('button');button.type='button';button.dataset.model=model.key;button.append(document.createTextNode(`#${model.id} · ${model.name}`));const small=document.createElement('small');small.textContent=`${model.brand} · ${labels[status(model)]}`;small.className=status(model)==='fix'?'review-status-fix':'';button.append(small);button.addEventListener('click',()=>openModel(model));$('model-list').append(button);}
 if(!filtered.length){const p=document.createElement('p');p.className='empty';p.textContent='Nessun modello corrisponde ai filtri.';$('model-list').append(p);}
 if(selectFirst&&filtered.length&&!filtered.some(m=>m.key===active?.key))openModel(filtered[0]);
 else if(active){$('model-picker').value=active.key;for(const b of $('model-list').querySelectorAll('button'))b.setAttribute('aria-current',String(b.dataset.model===active.key));navState();}
}
function selectColour(id,writeURL=true){colour=id;$('original').src=original(active);$('original').alt=`${active.brand} ${active.name} · ${$('legacy-paint').checked?colourName(id):'originale'}`;$('original-caption').textContent=$('legacy-paint').checked?`Verniciatura attuale · ${colourName(id)}`:'Immagine attuale · originale';$('preview').src=image(active,id);$('preview').alt=`${active.brand} ${active.name} · ${colourName(id)}`;$('selected-name').textContent=colourName(id);for(const button of $('palette').querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.colour===id));if(writeURL)updateURL();}
function openModel(model){
 active=model;$('model-name').textContent=`#${model.id} · ${model.brand} ${model.name}`;$('model-info').textContent=`${model.year} · ${model.approved?'Prova già approvata':'Nuovo bozzetto da valutare'}`;
 for(const id of ['preview','mask','details-layer']){$(id).width=320;$(id).height=128;}$('original').width=model.originalWidth;$('original').height=model.originalHeight;$('details-layer').src=versioned(model.details,model);
 $('original').src=original(model);$('original').alt=`${model.brand} ${model.name} · originale`;$('mask').src=versioned(model.mask,model);$('mask').alt=`Area verniciata · ${model.brand} ${model.name}`;
 $('review-state').value=status(model);$('note').value=typeof reviews[model.key]?.note==='string'?reviews[model.key].note.slice(0,1200):'';$('saved').textContent=stale(model)?'Anteprima aggiornata. Le note precedenti sono conservate: ricontrolla il risultato e conferma la valutazione.':'';$('model-picker').value=model.key;
 for(const button of $('model-list').querySelectorAll('button'))button.setAttribute('aria-current',String(button.dataset.model===model.key));
 selectColour(colour);$('board').replaceChildren();for(const tint of catalog.colours){const figure=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption');img.src=image(model,tint.id);img.alt=`${model.brand} ${model.name} · ${tint.name}`;img.width=model.width;img.height=model.height;img.loading='lazy';caption.textContent=tint.name;figure.append(img,caption);$('board').append(figure);}navState();
}
function correctionText(){const fixes=models.filter(model=>status(model)==='fix');return ['POKETURISMO · REVISIONE AUTO PIXEL ART',`${fixes.length} modelli da correggere`,'',...fixes.flatMap(model=>{const r=reviews[model.key];return [`#${model.id} · ${model.brand} ${model.name}`,`Colore selezionato: ${colourName(r?.colour||'rosso')}`,stale(model)?'Valutazione precedente alla revisione del bozzetto: da ricontrollare.':'',r?.note?.trim()||'(Nessuna nota)',shareURL(model,r?.colour||'rosso'),''];})].join('\n');}
async function copy(text){try{await navigator.clipboard.writeText(text);announce('Copiato negli appunti.');}catch{$('copy-fallback').hidden=false;$('copy-text').value=text;$('copy-text').focus();$('copy-text').select();announce('Seleziona e copia il testo qui sotto.');}}
$('legacy-paint').addEventListener('change',()=>selectColour(colour,false));
$('search').addEventListener('input',()=>filterModels());$('brand').addEventListener('change',()=>filterModels());$('filter').addEventListener('change',()=>filterModels());$('model-picker').addEventListener('change',()=>{const model=models.find(m=>m.key===$('model-picker').value);if(model)openModel(model);});
$('previous').addEventListener('click',()=>{const at=filtered.findIndex(m=>m.key===active.key);if(at>0){openModel(filtered[at-1]);$('model-name').scrollIntoView({block:'start'});}});$('next').addEventListener('click',()=>{const at=filtered.findIndex(m=>m.key===active.key);if(at>=0&&at<filtered.length-1){openModel(filtered[at+1]);$('model-name').scrollIntoView({block:'start'});}});
$('confirm-review').addEventListener('click',saveReview);$('review-state').addEventListener('change',saveReview);$('note').addEventListener('input',saveReview);$('zoom').addEventListener('click',()=>{zoom=!zoom;document.querySelector('.selected').classList.toggle('pixel-zoom',zoom);$('zoom').setAttribute('aria-pressed',String(zoom));$('zoom').textContent=zoom?'Dimensione normale':'Ingrandisci pixel art ×2';});
$('copy-link').addEventListener('click',()=>copy(shareURL()));$('copy-list').addEventListener('click',()=>copy(correctionText()));$('export').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([correctionText()],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='poketurismo-correzioni-pixel-art.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);announce('Elenco correzioni esportato.');});
try{
 const response=await fetch('/images/pixel-cars/catalog.json',{cache:'no-store'});if(!response.ok)throw Error('Catalogo non disponibile. Ricarica tra poco.');catalog=await response.json();models=catalog.models;
 for(const brand of [...new Set(models.map(m=>m.brand))].sort((a,b)=>a.localeCompare(b,'it')))$('brand').append(new Option(brand,brand));
 for(const tint of catalog.colours){const button=document.createElement('button'),swatch=document.createElement('span');button.type='button';button.dataset.colour=tint.id;button.setAttribute('aria-pressed','false');swatch.className='swatch';swatch.style.background=`rgb(${tint.rgb.join(',')})`;swatch.setAttribute('aria-hidden','true');button.append(swatch,document.createTextNode(tint.name));button.addEventListener('click',()=>selectColour(tint.id));$('palette').append(button);}
 if(catalog.colours.some(c=>c.id===params.get('colore')))colour=params.get('colore');
 active=models.find(m=>m.key===params.get('auto'))||models.find(m=>m.key==='punto')||models[0];filterModels(false);openModel(active);stats();if(params.has('tavola'))$('all-colours').open=true;
}catch(error){$('error').hidden=false;$('error').textContent=error.message;$('progress').textContent='Catalogo non caricato.';}
