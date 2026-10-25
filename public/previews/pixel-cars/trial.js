const $=id=>document.getElementById(id),params=new URLSearchParams(location.search);
let catalog,active,colour=params.get('colore')||'rosso',zoom=false;
const identity={punto:'Punto GT · prima generazione, tre porte. Sagoma tondeggiante, cofano corto, fascioni neri e fanali posteriori verticali.',e30:'M3 E30 · due porte. Quattro fari tondi, passaruota allargati, paraurti sportivi, cerchi a intreccio e alettone sul baule.'};
const sourceName=url=>url.includes('bmw-m.com')?'BMW M · storia e carrozzeria della M3 E30':url.includes('italdesign')?'Italdesign · progetto Punto':'Giugiaro · progetto Punto';
const urlFor=(model=active)=>{const url=new URL(location.pathname,location.origin);url.searchParams.set('auto',model.key);url.searchParams.set('colore',colour);return url;};
function showColour(id){
 colour=id;const tint=catalog.colours.find(c=>c.id===id);$('pixel').src=active.images[id];$('pixel').alt=`${active.name} in pixel art · ${tint.name}`;$('pixel-caption').textContent=`Nuovo bozzetto · ${tint.name}`;
 $('original').src=$('legacy-paint').checked?`${active.legacyPaint}${id}.png?rev=3`:active.original;$('original-caption').textContent=$('legacy-paint').checked?`Verniciatura attuale · ${tint.name}`:'Immagine attuale · originale';
 for(const button of $('palette').querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.colour===id));history.replaceState(null,'',urlFor());
}
function showModel(model){
 active=model;$('name').textContent=model.name;$('identity').textContent=identity[model.key];$('original').alt=`${model.name} · immagine attuale`;$('body-layer').src=model.body;$('details-layer').src=model.details;
 for(const button of $('models').querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.model===model.key));
 $('sources').replaceChildren();for(const source of model.sources){const li=document.createElement('li'),a=document.createElement('a');a.href=source;a.textContent=sourceName(source);a.target='_blank';a.rel='noopener noreferrer';li.append(a);$('sources').append(li);}
 $('board').replaceChildren();for(const tint of catalog.colours){const f=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption');img.width=320;img.height=128;img.src=model.images[tint.id];img.alt=`${model.name} · ${tint.name}`;img.loading='lazy';caption.textContent=tint.name;f.append(img,caption);$('board').append(f);}showColour(colour);
}
$('legacy-paint').addEventListener('change',()=>showColour(colour));$('zoom').addEventListener('click',()=>{zoom=!zoom;$('pixel-stage').classList.toggle('zoom',zoom);$('zoom').setAttribute('aria-pressed',String(zoom));$('zoom').textContent=zoom?'Dimensione normale':'Ingrandisci pixel art ×2';});
$('copy-link').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(urlFor().href);$('notice').textContent='Collegamento copiato.';}catch{$('notice').textContent=`Collegamento: ${urlFor().href}`;}});
try{
 const response=await fetch('/images/pixel-cars/catalog.json',{cache:'no-store'});if(!response.ok)throw Error('Album non disponibile. Ricarica tra poco.');catalog=await response.json();if(!catalog.colours.some(c=>c.id===colour))colour='rosso';
 for(const model of catalog.models){const b=document.createElement('button');b.type='button';b.dataset.model=model.key;b.textContent=model.name;b.addEventListener('click',()=>showModel(model));$('models').append(b);}
 for(const tint of catalog.colours){const b=document.createElement('button'),swatch=document.createElement('span');b.type='button';b.dataset.colour=tint.id;swatch.className='swatch';swatch.style.background=`rgb(${tint.rgb.join(',')})`;swatch.setAttribute('aria-hidden','true');b.append(swatch,document.createTextNode(tint.name));b.addEventListener('click',()=>showColour(tint.id));$('palette').append(b);}
 showModel(catalog.models.find(m=>m.key===params.get('auto'))||catalog.models[0]);
}catch(error){$('error').hidden=false;$('error').textContent=error.message;}
