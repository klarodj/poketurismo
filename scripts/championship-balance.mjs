import {createRequire} from 'node:module';
import {CHAMPIONSHIP_CATALOG,gridClassification,gridStandings} from '../shared/championshipCatalog.mjs';
import {buildTacticalTrack} from '../shared/trackGeometry.mjs';
import {routeProfileFor} from '../shared/raceContext.mjs';
const require=createRequire(import.meta.url);require('../server/node_modules/dotenv').config({path:process.env.ACCOUNTS_ENV_FILE||'/home/klaro/poketurismo-data/accounts/accounts.env',quiet:true});
const{PrismaClient}=require('../server/database');const{simulateDriver}=require('../server/championships');const p=new PrismaClient();
try{const cars=await p.car.findMany();const spec=CHAMPIONSHIP_CATALOG[0];const tracks=await p.track.findMany({where:{name:{in:spec.tracks}},include:{builds:{include:{section:true},orderBy:{ord:'asc'}},meteo:true,surface:true}});
 const pilot=skill=>Object.fromEntries(['brave','clean','reflex','acro','turn','brake','throttle','shift'].map(key=>[key,skill]));
 for(const name of ['Seicento Sporting','Cinquecento Sporting','Cooper S','Mini Turbo','A112 Abarth','Micra Super S']){const car=cars.find(c=>c.name===name);const drivers=[{id:'player',name:'Principiante',pilot:pilot(11),car:{...car,engineHealth:90,tireGrip:82,currentFuel:20,km:80000,serviceKm:75000,fuelType:'Normale'}},...spec.rivals.map(r=>({id:r.id,name:r.name,pilot:pilot(r.skill),car:{...cars.find(c=>c.name===r.carName),engineHealth:r.engineHealth,tireGrip:r.tireGrip,currentFuel:35,km:0,serviceKm:0,fuelType:'Normale'}}))];const placements=[];
  for(let seed=1;seed<=16;seed++){const results=[];for(const track of tracks){const distanceKm=track.lenght/1000;const state={sections:buildTacticalTrack(track.builds.map(b=>b.section),distanceKm,routeProfileFor('track')),distanceKm,environment:{weather:track.meteo.name,surface:track.surface.name},incidentPlan:null};results.push({classification:gridClassification(drivers.map((driver,index)=>simulateDriver(driver,state,seed*7919+index*101)))});}placements.push(gridStandings(results,drivers).findIndex(r=>r.id==='player')+1);}
  console.log(`${name}: piazzamento medio ${(placements.reduce((s,n)=>s+n,0)/placements.length).toFixed(2)}, podi ${placements.filter(p=>p<=3).length}/16`);
 }
}finally{await p.$disconnect();}
