import {STREET_ZONES,streetPilot} from '../shared/streetCatalog.mjs';
import {buildTacticalTrack} from '../shared/trackGeometry.mjs';
import {routeProfileFor} from '../shared/raceContext.mjs';
import {makeRace} from './race-balance.mjs';
import {advanceTacticalRace,DEFAULT_DECISION} from '../shared/tacticalRace.mjs';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
require('../server/node_modules/dotenv').config({path:process.env.ACCOUNTS_ENV_FILE||'/home/klaro/poketurismo-data/accounts/accounts.env',quiet:true});
const {PrismaClient}=require('../server/database');const prisma=new PrismaClient();
try{
 const cars=await prisma.car.findMany();
 const track=await prisma.track.findFirst({where:{name:'Lago d’Iseo · porto → galleria'},include:{builds:{include:{section:true},orderBy:{ord:'asc'}}}});
 if(!track)throw Error('Catalogo tracciati richiesto');
 for(const myName of ['Seicento Sporting','Cinquecento Sporting','Cooper S','Mini Turbo','A112 Abarth','Micra Super S']){
  const mine=cars.find(car=>car.name===myName);let approachable=0;const results=[];
  for(const rival of STREET_ZONES[0].rivals){const theirs=cars.find(car=>car.name===rival.carName);let wins=0;
   for(let seed=1;seed<=48;seed++){
    let state=makeRace({seed:seed*7919,mySkill:11});state.routeProfile=routeProfileFor('street');
    state.sections=buildTacticalTrack(track.builds.map(build=>build.section),3.2,state.routeProfile);
    state.car={...mine,baseCv:mine.cv,baseKg:mine.kg,engineHealth:90,tireGrip:82,km:80000,serviceKm:75000,currentFuel:20,fuelType:'Normale'};
    state.opponent={car:{...theirs,baseCv:theirs.cv,baseKg:theirs.kg,engineHealth:rival.engineHealth,tireGrip:rival.tireGrip,km:0,serviceKm:0,currentFuel:20,fuelType:'Normale'},pilot:streetPilot(rival)};
    state.street={style:rival.style};state.environment={weather:'sunny',surface:'tarmac'};state.incidentPlan=null;
    while(!state.finished)state=advanceTacticalRace(state,null,DEFAULT_DECISION);
    wins+=state.outcome==='win'?1:0;
   }
   if(wins>=24)approachable++;results.push(`${rival.name} ${wins}/48`);
  }
  assert.ok(approachable>=2,`${myName}: nessuna sfida iniziale accessibile`);
  console.log(`${myName}: ${results.join(' · ')}`);
 }
}finally{await prisma.$disconnect();}
