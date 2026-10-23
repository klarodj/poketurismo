import { test } from 'node:test';
import assert from 'node:assert/strict';
import { transformWithOxc } from 'vite';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { makeRace } from '../scripts/race-balance.mjs';
import { publicDevelopment } from '../shared/driverDevelopment.mjs';
import { DEMO_TRACK } from '../shared/trackGeometry.mjs';
const require = createRequire(import.meta.url);
// Compile JSX without starting a Vite server or opening network ports.
const compiled = new Map();
async function compile(filename) {
  if (compiled.has(filename)) return compiled.get(filename);
  const promise = (async () => {
    const result = await transformWithOxc(readFileSync(filename, 'utf8'), filename, { jsx: { runtime: 'classic' } });
    const source = result.code.replace(/import ['"][^'"]+\.css['"];?/g, '');
    const imports = [...source.matchAll(/from ['"]([^'"]+)['"]/g)];
    const targets = await Promise.all(imports.map(async match => {
      const specifier = match[1];
      let target = specifier.startsWith('.') ? resolve(dirname(filename), specifier) : require.resolve(specifier);
      if (!existsSync(target)) target += existsSync(target + '.jsx') ? '.jsx' : '.js';
      return target.endsWith('.jsx') ? compile(target) : pathToFileURL(target).href;
    }));
    let index = 0;
    const code = source.replace(/from ['"]([^'"]+)['"]/g, () => `from ${JSON.stringify(targets[index++])}`);
    return 'data:text/javascript;base64,' + Buffer.from(code).toString('base64');
  })();
  compiled.set(filename, promise);
  return promise;
}
async function component(name, exported = 'default') {
  return (await import(await compile(resolve(`src/components/${name}.jsx`))))[exported];
}
test('race UI renders a labelled map and only relevant driving controls', async () => {
  const TrackPreview = await component('TrackPreview'), TacticalControls = await component('TacticalControls');
  const race = makeRace();
  const map = renderToStaticMarkup(React.createElement(TrackPreview, { sections: race.sections, paths: DEMO_TRACK.mapPaths, index: 0, compact: true }));
  assert.ok(map.includes('<svg')); assert.ok(map.includes('aria-current="step"')); assert.ok(map.includes('PROSSIMO'));
  race.index = 7; race.gapSeconds = 2;
  const straight = renderToStaticMarkup(React.createElement(TacticalControls, { race, pending: 0, onTurn() {} }));
  assert.ok(!straight.includes('Staccata')); assert.ok(!straight.includes('Traiettoria')); assert.ok(!straight.includes('Prepara il sorpasso'));
  race.index = 1; race.gapSeconds = 0.5;
  const corner = renderToStaticMarkup(React.createElement(TacticalControls, { race, pending: 0, onTurn() {} }));
  assert.ok(corner.includes('Chiudi l’interno')); assert.ok(corner.includes('Staccata'));
  race.index = 3; race.gapSeconds = -0.5; race.incidentCue = { description: 'Sporco segnalato' };
  const behind = renderToStaticMarkup(React.createElement(TacticalControls, { race, pending: 0, onTurn() {} }));
  assert.ok(behind.includes('Sfrutta la scia')); assert.ok(behind.includes('Tenta il sorpasso')); assert.ok(behind.includes('Sporco segnalato'));
  assert.ok(!behind.includes('Chiudi l’interno'));
});


test('cockpit shows both real car images and keeps technical data out of the main view', async () => {
  const Dashboard = await component('RaceDashboard');
  const race = makeRace();
  Object.assign(race, { status: 'active', mode: 'track', trackName: 'Circuito Scuola' });
  race.car.image = '106.png'; race.opponent.car.image = '114.png';
  const markup = renderToStaticMarkup(React.createElement(Dashboard, { race, pending: 0, onAbandon() {} }, 'CONTROLLI'));
  assert.ok(markup.includes('/images/car/106.png')); assert.ok(markup.includes('/images/car/114.png'));
  assert.ok(markup.includes('Apri dettaglio: La tua auto')); assert.ok(markup.includes('Apri dettaglio: Auto rivale'));
  assert.ok(markup.includes('Apri dettaglio: tempi e distacco')); assert.ok(markup.includes('Settore attuale'));
  assert.ok(markup.includes('CONTROLLI'));
  assert.ok(!markup.includes('<dialog')); assert.ok(!markup.includes('Geometria dei tratti')); assert.ok(!markup.includes('<table'));
  assert.ok(!markup.includes('Abbandona gara'));
});

test('car, sector and history details retain the requested data and missing images have a fallback', async () => {
  const CarDetail = await component('RaceDetails', 'CarDetail');
  const SectorDetail = await component('RaceDetails', 'SectorDetail');
  const History = await component('RaceDetails', 'RaceHistory');
  const race = makeRace();
  const car = renderToStaticMarkup(React.createElement(CarDetail, { car: race.car, pilot: race.pilot, name: 'Tu' }));
  assert.ok(car.includes('Immagine non disponibile')); assert.ok(car.includes('Potenza')); assert.ok(car.includes('Motore')); assert.ok(car.includes('Coraggio'));
  const sector = renderToStaticMarkup(React.createElement(SectorDetail, { race }));
  assert.ok(sector.includes('Geometria dei tratti')); assert.ok(sector.includes('Larghezza'));
  const history = renderToStaticMarkup(React.createElement(History, { race }));
  assert.ok(history.includes('Nessun settore ancora percorso'));
});

test('cockpit keeps critical warnings visible and tolerates a finished or legacy race', async () => {
  const Dashboard = await component('RaceDashboard');
  const race = makeRace();
  Object.assign(race, { status: 'active', mode: 'street', trackName: 'Strada', incidentCue: { description: 'Sporco segnalato' } });
  Object.assign(race.car, { currentFuel: 0.5, engineHealth: 20, tireGrip: 30 });
  let markup = renderToStaticMarkup(React.createElement(Dashboard, { race, pending: 0, onAbandon() {} }));
  assert.ok(markup.includes('Sporco segnalato')); assert.ok(markup.includes('Carburante basso')); assert.ok(markup.includes('Gomme usurate')); assert.ok(markup.includes('Motore compromesso'));
  race.index = race.sections.length; race.status = 'completed';
  markup = renderToStaticMarkup(React.createElement(Dashboard, { race, pending: 0, onAbandon() {} }));
  assert.ok(markup.includes('Gara conclusa')); assert.ok(!markup.includes('Carburante basso'));
  delete race.rulesVersion; race.gap = -100; race.sections = [{ name: 'Vecchio settore' }]; race.index = 0;
  markup = renderToStaticMarkup(React.createElement(Dashboard, { race, pending: 0, onAbandon() {} }));
  assert.ok(markup.includes('100')); assert.ok(markup.includes('Sei dietro'));
});


test('pilot development UI explains the school, bounded practice and first-time rewards', async () => {
  const Panel = await component('DriverDevelopmentPanel');
  const Summary = await component('DevelopmentSummary');
  const development = publicDevelopment(null);
  let markup = renderToStaticMarkup(React.createElement(Panel, { development, onRead() {}, onStart() {} }));
  assert.ok(markup.includes('Scuola guida')); assert.ok(markup.includes('Leggi la lezione'));
  assert.ok(markup.includes('disabled=""')); assert.ok(markup.includes('0/120'));
  const learned = publicDevelopment({ lessonRead: true, lessonPassed: true, earlyPractice: 4, referencePractice: 4, latePractice: 4, techniquePractice: 20 });
  markup = renderToStaticMarkup(React.createElement(Panel, { development: learned, onRead() {}, onStart() {} }));
  assert.ok(markup.includes('Ripeti la prova')); assert.ok(markup.includes('Consolidata')); assert.ok(markup.includes('senza altre ricompense'));
  markup = renderToStaticMarkup(React.createElement(Summary, { summary: { message: 'Promosso', gains: { early: 4, optimal: 4, late: 4 }, xp: 40, techniqueGain: 0, lesson: { passed: true, correct: 4, total: 4 } } }));
  assert.ok(markup.includes('Prova superata')); assert.ok(markup.includes('+40 XP')); assert.ok(markup.includes('Frenata al riferimento'));
});

test('driving school opens with available courses and keeps the fifty-course catalogue accessible', async () => {
  const Panel = await component('TechniqueSchoolPanel');
  const { publicCurriculum } = await import('../shared/techniqueCatalog.mjs');
  const markup = renderToStaticMarkup(React.createElement(Panel, { development: { curriculum: publicCurriculum(null,1) }, pending: 0, activeRace: null, onRead() {}, onStart() {} }));
  assert.equal((markup.match(/<article\b/g)||[]).length,publicCurriculum(null,1).filter(item=>item.unlocked&&!item.learned).length);
  assert.ok(markup.includes('0 / 50 tecniche apprese'));
  assert.ok(markup.includes('Quando usarla'));assert.ok(markup.includes('Mostra'));
  assert.ok(markup.includes('Tutte le tecniche'));
  assert.ok(markup.includes('school-course'));assert.equal(publicCurriculum(null,1).length,50);
  assert.ok(markup.includes('Da imparare ora'));assert.ok(markup.includes('Leggi la lezione'));
});

test('Car Meet cards and detail show actual photos, installed parts and a comparison',async()=>{
 const Card=await component('MeetShowcase','MeetShowcaseCard');const Details=await component('MeetShowcase','MeetCarDetails');
 const showcase={pilot:{id:1,name:'Pilota Uno',level:2},car:{id:1,name:'Seicento',brand:'Fiat',image:'fiat.png',year:1998,cv:55,nm:90,kg:735,driveType:'FF',engineType:'NA',km:80000,engineHealth:90,tireGrip:82,performanceIndex:40,tier:'Primi passi',parts:[{id:1,name:'Filtro sportivo',description:'Aspirazione migliorata',level:1}]}};
 const card=renderToStaticMarkup(React.createElement(Card,{showcase,mine:true,onOpen(){}}));assert.ok(card.includes('Pilota Uno'));assert.ok(card.includes('/images/car/fiat.png'));assert.ok(card.includes('1 pezzi installati'));
 const details=renderToStaticMarkup(React.createElement(Details,{showcase,ownCar:showcase.car}));assert.ok(details.includes('Filtro sportivo'));assert.ok(details.includes('Confronto con la tua auto'));
});
test('shared timing UI explains missing legacy conditions and renders a useful empty state',async()=>{
 const Board=await component('MeetLeaderboard');const empty=renderToStaticMarkup(React.createElement(Board,{board:{records:[]},userId:1}));assert.ok(empty.includes('Nessun giro condiviso'));
 const board={total:1,model:{name:'Seicento',brand:'Fiat'},track:{name:'Tsukuba'},records:[{pilot:{id:1,name:'Pilota Uno'},position:1,timeMs:123456,gapMs:0,car:{cv:55,kg:735,performanceIndex:40},configuration:null}]};
 const html=renderToStaticMarkup(React.createElement(Board,{board,userId:1}));assert.ok(html.includes('123.456'));assert.ok(html.includes('Giro precedente'));assert.ok(html.includes('(tu)'));
});
test('workshop services show the actual quote, before/after effects and disabled unnecessary work',async()=>{
 const Panel=await component('WorkshopServices');const html=renderToStaticMarkup(React.createElement(Panel,{car:{engineHealth:50,tireGrip:80,performanceIndex:35,services:[{id:'rebuild',name:'Revisione motore',description:'Ripristina motore',enabled:true,price:820,after:{engineHealth:100,tireGrip:80,performanceIndex:44}},{id:'tires',name:'Gomme',description:'Già a posto',enabled:false,reason:'Gomme già al 100%.',price:0}]},money:100,onService(){},disabled:false}));assert.ok(html.includes('Revisione motore'));assert.ok(html.includes('820,00'));assert.ok(html.includes('Mancano'));assert.ok(html.includes('50.0% → 100.0%'));assert.ok(html.includes('Gomme già al 100%.'));assert.ok(html.includes('disabled'));
});

test('tuning comparison shows net replacement effects, ownership and explicit championship warnings',async()=>{
 const TuningPreview=await component('TuningPreview');const before={performanceIndex:40,cv:80,nm:90,kg:1000,topSpeedKmh:180,turnSlow:60,turnFast:50,brake:50,traction:60},after={...before,cv:90,performanceIndex:42};
 const part={id:1,name:'ECU',description:'Mappa',level:2,price:500,image:'ec2.png',ownedQuantity:1,preview:{before,after,installed:{level:1,description:'Mappa base'},alreadyMounted:false,advice:['Utile sui rettilinei'],championships:[{id:1,name:'Coppa Primi Giri',active:true,beforeErrors:[],afterErrors:['Potenza massima: 85 CV'],pilotErrors:[]}],zones:[]}};
 const markup=renderToStaticMarkup(React.createElement(TuningPreview,{part,carName:'Utilitaria',money:1000,disabled:false,onBuy(){},onMount(){}}));assert.ok(markup.includes('Differenza netta'));assert.ok(markup.includes('Sostituisce il livello 1'));assert.ok(markup.includes('vecchio pezzo torna in magazzino'));assert.ok(markup.includes('campionato in corso'));assert.ok(markup.includes('85 CV'));assert.ok(markup.includes('Conferma montaggio'));assert.ok(markup.includes('+10'));
 const same=renderToStaticMarkup(React.createElement(TuningPreview,{part:{...part,preview:{...part.preview,alreadyMounted:true}},money:0,disabled:true,onBuy(){},onMount(){}}));assert.ok(same.includes('Già montato'));assert.ok(same.includes('disabled=""'));
});

test('meet challenge cards explain frozen conditions, consent, time results and model restrictions',async()=>{
 const Card=await component('MeetChallengeCard');const car={id:1,modelId:1,name:'Seicento',brand:'Fiat',cv:55,kg:735,performanceIndex:45,parts:[]};const challenge={id:'test',senderId:2,recipientId:1,status:'pending',expiresAt:'2026-10-25T10:00:00Z',format:'model',modelId:1,minIP:0,maxIP:49,track:{name:'Tsukuba',weather:'sunny',surface:'tarmac'},sender:{pilot:{name:'Rivale',level:1},car},recipient:null,results:{}};
 const markup=renderToStaticMarkup(React.createElement(Card,{challenge,userId:1,peerName:'Rivale',cars:[car],garageId:1,disabled:false,onRespond(){}}));assert.ok(markup.includes('Stesso modello'));assert.ok(markup.includes('20 L normale'));assert.ok(markup.includes('un tentativo')||markup.includes('Un tentativo'));assert.ok(markup.includes('Accetta con l’auto selezionata'));assert.ok(!markup.includes('disabled=""'));
 const wrong=renderToStaticMarkup(React.createElement(Card,{challenge,userId:1,peerName:'Rivale',cars:[{...car,modelId:2}],garageId:1,disabled:false}));assert.ok(wrong.includes('disabled=""'));assert.ok(wrong.includes('non rispetta'));
});
test('meet cockpit shows a personal clock and honest ghost rather than a live fictional rival',async()=>{
 const Dashboard=await component('RaceDashboard');const race=makeRace();Object.assign(race,{status:'active',mode:'track',trackName:'Tsukuba',meetTrial:true,meetChallenge:{otherName:'Marta'},meetGhost:{splits:[30000],totalMs:60000}});const markup=renderToStaticMarkup(React.createElement(Dashboard,{race,pending:0,onAbandon(){}}));assert.ok(markup.includes('Sfida asincrona'));assert.ok(markup.includes('Fantasma disponibile'));assert.ok(markup.includes('Tempo personale'));assert.ok(!markup.includes('Auto rivale'));assert.ok(!markup.includes('Affiancati'));
});

test('mechanic previews keep all four original workshop pictures alongside their real quotes',async()=>{
 const Services=await component('WorkshopServices');const car={id:1,engineHealth:50,tireGrip:50,performanceIndex:40,services:['engine','tires','rebuild','full'].map(id=>({id,name:id,description:'Lavorazione',price:150,enabled:true,after:{engineHealth:100,tireGrip:100,performanceIndex:45}}))};const html=renderToStaticMarkup(React.createElement(Services,{car,money:1000,disabled:false,onService(){}}));for(const file of ['oil.png','tyre.png','rebuild.png','repair.png']){assert.ok(html.includes('/images/work/'+file));assert.ok(existsSync(resolve('public/images/work/'+file)));}
});

test('track previews show the local scene, sector minimap, active sector and open-road finish',async()=>{
 const TrackPreview=await component('TrackPreview');
 const markup=renderToStaticMarkup(React.createElement(TrackPreview,{trackName:'Lario · statale del lago',sections:DEMO_TRACK.sections,index:2,profile:{kind:'road'}}));
 assert.ok(markup.includes('/images/tracks/lario.png'));assert.ok(markup.includes('Minimappa di Lario'));assert.ok(markup.includes('settore 3 evidenziato'));assert.ok(markup.includes('punto a punto'));assert.ok(markup.includes('P: partenza'));assert.ok(markup.includes('aria-current="step"'));assert.ok(markup.includes('Giallo: settore 3'));
 const Illustration=await component('TrackIllustration');assert.equal(renderToStaticMarkup(React.createElement(Illustration,{name:'Percorso privato sconosciuto'})),'');
});
test('old track labels display the same illustration without altering the school map',async()=>{
 const Illustration=await component('TrackIllustration');const old=renderToStaticMarkup(React.createElement(Illustration,{name:'Tsukuba · Ibaraki'})),current=renderToStaticMarkup(React.createElement(Illustration,{name:'Pistino di San Rocco · Pavese'}));assert.equal(old,current);assert.ok(old.includes('san-rocco.png'));
 const TrackPreview=await component('TrackPreview');const demo=renderToStaticMarkup(React.createElement(TrackPreview,{trackName:DEMO_TRACK.name,sections:DEMO_TRACK.sections,paths:DEMO_TRACK.mapPaths}));assert.ok(demo.includes('scuola.png'));assert.ok(demo.includes(DEMO_TRACK.mapPaths[0]));assert.ok(demo.includes('P / A'));
});

test('track sector names are Italian in previews, map titles, progress and saved race history',async()=>{
 const TrackPreview=await component('TrackPreview'),{trackSectionLabel}=await import('../shared/trackSectionLabels.mjs');
 const names=['Short Straight','Long Straight','Slow Right Turn','Slow Left Turn','Fast Right Turn','Fast Left Turn','Hump','Depression','Descent','Climb','Chicane','Hairpin Right','Hairpin Left','Right Inversion','Left Inversion','Obstacle'];
 for(const name of names)assert.notEqual(trackSectionLabel(name),name);
 assert.equal(trackSectionLabel('Climb → Hairpin Right'),'Salita → Tornante a destra');assert.equal(trackSectionLabel('Esse del Bosco'),'Esse del Bosco');assert.equal(trackSectionLabel('Bar Straight · settore privato'),'Bar Straight · settore privato');
 const sections=structuredClone(DEMO_TRACK.sections);sections[0].name='Short Straight';sections[1].name='Climb → Hairpin Right';const before=JSON.stringify(sections);
 const markup=renderToStaticMarkup(React.createElement(TrackPreview,{trackName:DEMO_TRACK.name,sections,paths:DEMO_TRACK.mapPaths,index:0}));assert.ok(markup.includes('Rettilineo breve'));assert.ok(markup.includes('Salita → Tornante a destra'));assert.ok(!markup.includes('Short Straight'));assert.ok(!markup.includes('Hairpin Right'));assert.equal(JSON.stringify(sections),before);
 const RaceTiming=await component('RaceTiming','RaceTiming');const race=makeRace();race.sections=sections;assert.ok(!renderToStaticMarkup(React.createElement(RaceTiming,{race})).includes('Short Straight'));
 const RaceHistory=await component('RaceDetails','RaceHistory');race.logs=[{section:'Long Straight → Fast Left Turn',move:'Guida normale',playerSeconds:2,opponentSeconds:3,deltaSeconds:1,peakKmh:100,exitKmh:80,potentialSeconds:2,driverLossSeconds:0,fuel:0.2,tires:0.1,engine:0.1}];const history=renderToStaticMarkup(React.createElement(RaceHistory,{race}));assert.ok(history.includes('Rettilineo lungo → Curva veloce a sinistra'));assert.equal(race.logs[0].section,'Long Straight → Fast Left Turn');
});

test('active race always shows scene, live minimap and highlighted sector without opening a dialog',async()=>{
 const Dashboard=await component('RaceDashboard'),race=makeRace();race.trackName='Lario · statale del lago';race.status='active';race.index=2;const html=renderToStaticMarkup(React.createElement(Dashboard,{race,pending:0,onAbandon:()=>{}}));assert.ok(html.includes('Mappa e ambientazione durante la gara'));assert.ok(html.includes('/images/tracks/lario.png'));assert.ok(html.includes('settore 3 evidenziato'));assert.ok(html.includes('Esamina tutti i settori'));assert.ok(!html.includes('<dialog'));
});

test('avatar picker renders twenty labelled choices and selected local image with a safe legacy fallback',async()=>{
 const Picker=await component('AvatarPicker'),Portrait=await component('PilotAvatar');const html=renderToStaticMarkup(React.createElement(Picker,{value:'mechanic-woman',onChange:()=>{}}));assert.equal((html.match(/type="radio"/g)||[]).length,20);assert.ok(html.includes('La meccanica'));assert.ok(html.includes('/images/avatars/mechanic-woman.png'));assert.ok(html.includes('checked=""'));assert.ok(!html.includes('dicebear'));
 const fallback=renderToStaticMarkup(React.createElement(Portrait,{avatar:'https://evil.invalid/a.png'}));assert.ok(fallback.includes('Avatar da scegliere'));assert.ok(!fallback.includes('evil.invalid'));
});
test('fuel estimate panel distinguishes mixed and race pace without presenting homologated figures',async()=>{
 const FuelConsumption=await component('FuelConsumption'),html=renderToStaticMarkup(React.createElement(FuelConsumption,{car:{cc:1600,cv:100,baseCv:100,kg:1000,engineType:'NA'}}));
 for(const text of['Consumo stimato','L/100 km','Misto indicativo','conserva','ritmo pulito','attacco','non è un dato omologato'])assert.ok(html.includes(text));assert.ok(!html.includes('NaN'));
});
test('phone Snake renders a green pixel board and labelled touch controls',async()=>{
 const {createSnake}=await import('../src/logic/snake.mjs'),SnakeBoard=await component('PhoneSnake','SnakeBoard'),SnakePad=await component('PhoneSnake','SnakePad');const html=renderToStaticMarkup(React.createElement(React.Fragment,null,React.createElement(SnakeBoard,{game:createSnake(123)}),React.createElement(SnakePad)));
 for(const text of['Campo di Snake','0 punti','shape-rendering="crispEdges"','Snake su','Snake sinistra','Snake giù','Snake destra'])assert.ok(html.includes(text),text);
});
test('phone challenge details require a compatible car to accept and respect an active race',async()=>{
 if(!globalThis.window)Object.defineProperty(globalThis,'window',{configurable:true,value:{location:{hostname:'localhost'}}});
 const PhoneChallengeItem=await component('PhoneChallenges','PhoneChallengeItem'),car={id:4,modelId:10,name:'Compatta QA',brand:'Fiat',cv:55,kg:735,performanceIndex:40,parts:[]},person={pilot:{id:2,name:'Pilota QA'},car};
 const challenge={id:'qa-invite',senderId:2,recipientId:1,status:'pending',format:'model',modelId:10,minIP:0,maxIP:49,results:{},expiresAt:'2099-01-01',track:{name:'Pistino QA',weather:'sunny',surface:'Asphalt'},sender:person,recipient:null};const render=(ch,vehicle,activeRace)=>renderToStaticMarkup(React.createElement(PhoneChallengeItem,{challenge:ch,userId:1,car:vehicle,activeRace,now:1,onRespond:()=>{},onStart:()=>{},onRace:()=>{}}));
 const valid=render(challenge,car);assert.ok(valid.includes('sereno'));assert.ok(valid.includes('asfalto'));assert.ok(valid.includes('Accetta con l’auto selezionata'));assert.ok(!valid.includes('non rispetta'));const invalid=render(challenge,{...car,modelId:99});assert.match(invalid,/disabled=""[^>]*>Accetta/);assert.ok(invalid.includes('non rispetta'));
 const running=render({...challenge,status:'accepted',recipient:{...person,pilot:{id:1,name:'Tu'}}},car,{id:'already-driving'});assert.match(running,/disabled=""[^>]*>Inizia il tuo tentativo/);
});
test('grid cockpit keeps current neighbours, imagery and controls in one primary view',async()=>{
 const{gridTiming}=await import('../shared/gridTiming.mjs'),race=makeRace();
 Object.assign(race,{id:'grid-qa',mode:'championship',status:'active',gridOpponentId:'last',index:1,trackName:'Pistino di San Rocco · Pavese'});
 race.gridTiming=gridTiming([{id:'first',name:'Andrea',carName:'Prima',timeMs:10000},{id:'player',name:'Tu',carName:'Tua',timeMs:12000},{id:'next',name:'Sonia',carName:'Dietro',timeMs:13000},{id:'last',name:'Ultimo QA',carName:'Ultima',timeMs:20000}],{sector:1,totalSectors:8,featuredId:'last'});
 race.opponent.name='Ultimo QA';race.car.image='106.png';
 const Dashboard=await component('RaceDashboard'),Controls=await component('TacticalControls');
 const html=renderToStaticMarkup(React.createElement(Dashboard,{race,pending:0,onAbandon:()=>{}},React.createElement(Controls,{race,pending:0,onTurn:()=>{},showAlerts:false})));
 for(const text of ['aria-label="Posizione e distacchi"','2°','/ 4','Andrea','Sonia','Dopo il settore 1','san-rocco.png','106.png','settore 2 evidenziato','Percorri il settore','Classifica e settori'])assert.ok(html.includes(text),text);
 assert.equal((html.match(/Davanti a te/g)||[]).length,1);assert.equal((html.match(/Dietro di te/g)||[]).length,1);
 assert.ok(!html.includes('<table'));assert.ok(!html.includes('grid-sector-summary'));assert.ok(!html.includes('race-instruments'));
 assert.ok(!html.includes('aria-label="Duello e posizione"'));assert.ok(!html.includes('Sei davanti'));
});

test('location windows preserve artwork without offering inert window buttons',async()=>{
 const Window=await component('Win98Window');
 const html=renderToStaticMarkup(React.createElement(Window,{title:'Officina',imageUrl:'/images/workshop.png'},'Preventivo'));
 assert.ok(html.includes('/images/workshop.png'));assert.ok(html.includes('Preventivo'));assert.ok(!html.includes('<button'));
 const closable=renderToStaticMarkup(React.createElement(Window,{title:'Scheda',onClose:()=>{}},'Dettagli'));
 assert.ok(closable.includes('aria-label="Chiudi Scheda"'));
});
test('used listings lead with the car photo, price and condition while keeping full inspection available',async()=>{
 const Post=await component('ForumPost');const car={name:'Seicento',brand:{name:'Fiat'},image:'106.png',year:1998,cc:1108,cv:55,nm:90,kg:735,engineType:'NA',driveType:'FF',velMax:150,zeroToHundred:13};const listing={car,cv:55,nm:90,kg:735,km:70000,serviceKm:65000,engineHealth:85,tireGrip:80,currentFuel:10,mods:[]};
 const html=renderToStaticMarkup(React.createElement(Post,{author:'Club',title:'Fiat Seicento',carDetails:{...listing,...car,brand:'Fiat'},listing,price:4200,remainingMoney:5800,onBuy:()=>{}}));
 assert.ok(html.indexOf('/images/car/106.png')<html.indexOf('<details'));assert.ok(html.includes((4200).toLocaleString('it-IT')));assert.ok(html.includes('motore')||html.includes('Motore'));assert.ok(html.includes('Apri foto, caratteristiche e pezzi installati'));assert.ok(!html.includes('Iscritto: 2001'));
});
