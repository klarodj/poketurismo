import {periodCupName} from './periodWorld.mjs';
import {performanceIndex} from './vehiclePerformance.mjs';
const definitions=[
 ['Coppa Primi Giri','Piccole auto, primi piazzamenti e tre circuiti per imparare.','N/A',40,85,1,0,300,1800,350,['Pistino di San Rocco · Pavese','Pista club del Ticino · Novarese','Pista club del Po · Ferrarese'],['Seicento Sporting','Cinquecento Sporting','Seicento Sporting','Cooper S','Cinquecento Sporting','A112 Abarth','Seicento Sporting'],8],
 ['Trofeo Aspirato · Club','Motori aspirati e precisione: quattro appuntamenti tecnici.','Aspirato',80,180,2,38,800,4500,550,['Pistino di San Rocco · Pavese','Pista club del Ticino · Novarese','Circuito del Santerno · Imolese','Pista club del Po · Ferrarese'],['106 Rallye 1.3','Swift GTI','Mx-5 NA','205 Gti 1.9','Civic EF','Civic EG','Colt GTI'],18],
 ['Trofeo GT 280 · Nord Italia','Il trofeo dei club del Nord: gran turismo fino a 280 CV.','GT',150,280,3,44,1800,9000,750,['Autodromo della Bassa · Cremonese','Pista club del Po · Ferrarese','Autodromo del Garda · Bresciano','Circuito della Cascina · Lodigiano'],['M3 E30','S2000','Rx-7 FD','Delta Evoluzione','Lancer Evo 6','Boxster','Impreza 22b'],28],
 ['Coppa Italiane · Passione','Solo marchi italiani, da 80 a 250 CV.','Leggenda',80,250,3,40,1200,6500,650,['Pista club del Ticino · Novarese','Circuito del Santerno · Imolese','Autodromo della Bassa · Cremonese'],['Uno Turbo','Punto GT','145 Quadrifoglio','155 Q4','Delta HF 16v','Delta HPE','Coupè 20v'],25],
 ['Trofeo Trazione Posteriore','FR, MR e RR: equilibrio e controllo della potenza.','Open',100,350,4,45,2200,11000,900,['Pistino di San Rocco · Pavese','Pista della Cava · Veronese','Circuito delle Colline · Langhe','Autodromo della Bassa · Cremonese'],['Mx-5 NB','MRs','Elise','S2000','Rx-7 FD','M3 E36','964 RS'],34],
 ['Coppa Gran Turismo · Club del Nord','Cinque domeniche tra i club del Nord, per auto oltre 350 CV e piloti esperti.','Supercar',350,9999,6,50,5000,24000,1300,['Autodromo della Bassa · Cremonese','Anello dei Colli · Euganei','Autodromo del Garda · Bresciano','Circuito della Cascina · Lodigiano','Pista della Cava · Veronese'],['F355','996 GT3','Corvette C5 Z06','993 GT2','Zonda','F40','Diablo'],46],
];
const names=['Andrea','Michele','Sonia','Lele','Nadia','Renato','Ale'];
export const CHAMPIONSHIP_CATALOG=definitions.map(([name,description,category,minCv,maxCv,minLevel,minPerfIndex,entryFee,rewardMoney,rewardXp,tracks,cars,skill],cup)=>({name,description,category,minCv,maxCv,minLevel,minPerfIndex,entryFee,rewardMoney,rewardXp,tracks,allowedDrive:'any',minBrave:0,minClean:0,minReflex:0,minShift:0,
 engineTypes:cup===1?['NA']:null,brands:cup===3?['Alfa Romeo','Fiat','Lancia','Autobianchi','Ferrari','Lamborghini','Maserati','De Tomaso','Pagani']:null,drives:cup===4?['FR','MR','RR']:null,
 rivals:cars.map((carName,index)=>({id:`cup-${cup}-${index}`,name:names[index],carName,skill:skill+index,engineHealth:cup===0?[84,86,86,82,88,82,86][index]:96,tireGrip:cup===0?[76,78,78,76,78,76,78][index]:94}))}));
export function championshipInfo(name){return CHAMPIONSHIP_CATALOG.find(cup=>cup.name===periodCupName(name))||null;}
export function championshipCarErrors(car,cup){
 if(!car)return ['Nessuna auto equipaggiata'];
 const errors=[];const base=car.car||car;const rules=cup.rules||championshipInfo(cup.name)||cup;
 const brand=typeof base.brand==='string'?base.brand:base.brand?.name;
 if(car.cv<cup.minCv)errors.push(`Potenza minima: ${cup.minCv} CV`);
 if(car.cv>cup.maxCv)errors.push(`Potenza massima: ${cup.maxCv} CV`);
 if(performanceIndex(car)<cup.minPerfIndex)errors.push(`Indice prestazioni minimo: ${cup.minPerfIndex}`);
 if(cup.allowedDrive!=='any'&&base.driveType!==cup.allowedDrive)errors.push(`Trazione richiesta: ${cup.allowedDrive}`);
 if(rules.drives&&!rules.drives.includes(base.driveType))errors.push(`Trazioni ammesse: ${rules.drives.join(', ')}`);
 if(rules.engineTypes&&!rules.engineTypes.includes(base.engineType))errors.push('Richiesto un motore aspirato');
 if(rules.brands&&!rules.brands.includes(brand))errors.push('Richiesto un marchio italiano');
 return errors;
}
export const GRID_POINTS=[10,8,6,5,4,3,2,1];
export function gridClassification(rows){
 const sorted=rows.slice().sort((a,b)=>Number(!!a.failure)-Number(!!b.failure)||(a.timeMs||0)-(b.timeMs||0)||a.id.localeCompare(b.id));
 let anchor=null,position=0;
 return sorted.map((row,index)=>{if(!anchor||row.failure||anchor.failure||row.timeMs-anchor.timeMs>10){anchor=row;position=index+1;}return {...row,position,points:row.failure?0:GRID_POINTS[position-1]||0};});
}
export function gridStandings(results,drivers){return drivers.map(driver=>{const rows=results.flatMap(round=>round.classification||[]).filter(row=>row.id===driver.id);return {...driver,points:rows.reduce((s,r)=>s+r.points,0),wins:rows.filter(r=>r.position===1&&!r.failure).length,totalTimeMs:rows.reduce((s,r)=>s+(r.failure?999999999:r.timeMs),0)};}).sort((a,b)=>b.points-a.points||b.wins-a.wins||a.totalTimeMs-b.totalTimeMs||a.id.localeCompare(b.id));}
