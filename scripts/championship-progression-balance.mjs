// Read-only diagnostic: actual fixed grids, public catalog cars and real circuit geometry.
import {createRequire} from 'node:module';
import {CHAMPIONSHIP_CATALOG,gridClassification,gridStandings} from '../shared/championshipCatalog.mjs';
import {driverIndex} from '../shared/driverIndex.mjs';
import {buildTacticalTrack} from '../shared/trackGeometry.mjs';
import {routeProfileFor,contextualDecision} from '../shared/raceContext.mjs';
import {DEFAULT_DECISION} from '../shared/tacticalRace.mjs';
import {initializeGrid,advanceGridRace,gridRows} from '../shared/gridRace.mjs';
import {makeRace} from './race-balance.mjs';
const require=createRequire(import.meta.url);require('../server/node_modules/dotenv').config({path:process.env.ACCOUNTS_ENV_FILE||'/home/klaro/poketurismo-data/accounts/accounts.env',quiet:true});
const {PrismaClient}=require('../server/database'),{championshipVehicle}=require('../server/championships'),p=new PrismaClient();
const keys=['brave','clean','reflex','shift','acro','turn','brake','throttle'],priority=['brake','turn','throttle','clean','reflex','shift','brave','acro'];
function levelPilot(level){const pilot=Object.fromEntries(keys.map(k=>[k,11]));for(let i=0;i<(level-1)*6;i++)pilot[priority[i%8]]++;return pilot;}
function raceRound(car,pilot,drivers,track,seed){
 const profile=routeProfileFor('track'),distanceKm=track.lenght/(track.lenght>=100?1000:1),sections=buildTacticalTrack(track.builds.map(b=>b.section),distanceKm,profile);
 let state=initializeGrid({...makeRace({seed}),fuelModelVersion:3,mode:'championship',gridSeed:seed,gridOpponentId:drivers[0].id,car:structuredClone(car),pilot,opponent:structuredClone(drivers[0]),sections,routeProfile:profile,distanceKm,environment:{weather:track.meteo.name,surface:track.surface.name},incidentPlan:null,incidentCue:null},{playerName:'Pilota campione',drivers});
 while(!state.finished)state=advanceGridRace(state,null,contextualDecision(state,DEFAULT_DECISION));
 return {classification:gridClassification(gridRows(state)),completed:!state.failure,retired:!!state.failure};
}
function season(car,pilot,drivers,tracks,seed){const results=tracks.map((t,i)=>raceRound({...car,currentFuel:45,engineHealth:car.engineHealth,tireGrip:car.tireGrip},pilot,drivers,t,seed*7919+i*101));const table=gridStandings(results,[{id:'player',name:'Pilota campione'},...drivers]);return {position:table.findIndex(r=>r.id==='player')+1,retirements:results.filter(r=>r.retired).length};}
const summarize=rows=>({meanPosition:Number((rows.reduce((s,r)=>s+r.position,0)/rows.length).toFixed(2)),wins:rows.filter(r=>r.position===1).length,podiums:rows.filter(r=>r.position<=3).length,lasts:rows.filter(r=>r.position===8).length,retirements:rows.reduce((s,r)=>s+r.retirements,0)});
const samples=Number(process.argv[2]||16);if(!Number.isSafeInteger(samples)||samples<1||samples>128)throw Error('Campioni da1a128');
try{
 const cars=await p.car.findMany({include:{brand:true}}),parts=await p.part.findMany({where:{level:3}}),allTracks=await p.track.findMany({include:{builds:{include:{section:true},orderBy:{ord:'asc'}},meteo:true,surface:true}}),oldBase=[12,15,21,19,26,34,24,29,34,39,45],report=[];
 for(const [index,spec]of CHAMPIONSHIP_CATALOG.entries()){
  const drivers=spec.rivals.map(r=>({id:r.id,name:r.name,pilot:Object.fromEntries(keys.map(k=>[k,r.skill])),car:championshipVehicle(cars.find(c=>c.name===r.carName),{...r,racePrepared:spec.racePrepared},parts)}));
  const old=drivers.map((d,i)=>({...d,pilot:Object.fromEntries(keys.map(k=>[k,oldBase[index]+i]))}));
  const pilot=levelPilot(spec.minLevel),car={...structuredClone(drivers[3].car),engineHealth:92,tireGrip:90},tracks=spec.tracks.map(name=>allTracks.find(t=>t.name===name)),before=[],after=[];
  for(let seed=1;seed<=samples;seed++){before.push(season(car,pilot,old,tracks,seed));after.push(season(car,pilot,drivers,tracks,seed));}
  report.push({name:spec.name,minLevel:spec.minLevel,playerIG:driverIndex(pilot),car:car.name,oldMeanIG:Math.round(old.reduce((n,d)=>n+driverIndex(d.pilot),0)/7),meanIG:Math.round(drivers.reduce((n,d)=>n+driverIndex(d.pilot),0)/7),before:summarize(before),after:summarize(after)});
 }
 // The tester's current build is read only and anonymised in the output.
 const user=await p.user.findFirst({where:{isAdmin:true}});let tester;
 if(user){const g=await p.garage.findUnique({where:{id:user.carDrive},include:{car:{include:{brand:true}},mods:{include:{part:true}}}});if(g){const car={...g.car,...g,...require('../server/gameRules').restoredHandlingStats(g),baseCv:g.car.cv,baseKg:g.car.kg,name:g.car.name},pilot=Object.fromEntries(keys.map(k=>[k,user[k]])),spec=CHAMPIONSHIP_CATALOG[1],drivers=spec.rivals.map(r=>({id:r.id,name:r.name,pilot:Object.fromEntries(keys.map(k=>[k,r.skill])),car:championshipVehicle(cars.find(c=>c.name===r.carName),r)})),old=drivers.map((d,i)=>({...d,pilot:Object.fromEntries(keys.map(k=>[k,15+i]))})),tracks=spec.tracks.map(name=>allTracks.find(t=>t.name===name)),before=[],after=[];for(let seed=1;seed<=samples;seed++){before.push(season(car,pilot,old,tracks,seed));after.push(season(car,pilot,drivers,tracks,seed));}tester={car:g.car.name,cv:g.cv,IG:driverIndex(pilot),before:summarize(before),after:summarize(after)};}}
 console.log(JSON.stringify({samples,profile:'Equilibrato, soli punti di livello distribuiti; nessun allenamento, nessuna tecnica; ritmo pulito e scelte normali',report,tester},null,2));
}finally{await p.$disconnect();}
