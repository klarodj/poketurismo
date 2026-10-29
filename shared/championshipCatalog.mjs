import {periodCupName} from './periodWorld.mjs';
import {performanceIndex} from './vehiclePerformance.mjs';
const definitions=[
 ['Coppa Primi Giri','Piccole auto, primi piazzamenti e tre circuiti per imparare.','N/A',40,85,1,0,300,1800,350,['Pistino di San Rocco · Pavese','Pista club del Ticino · Novarese','Pista club del Po · Ferrarese'],['Seicento Sporting','Cinquecento Sporting','Seicento Sporting','A112 Abarth','Cinquecento Sporting','A112 Abarth','Seicento Sporting'],12],
 ['Trofeo Aspirato · Club','Motori aspirati e precisione: quattro appuntamenti tecnici.','Aspirato',80,180,2,38,800,4500,550,['Pistino di San Rocco · Pavese','Pista club del Ticino · Novarese','Circuito del Santerno · Imolese','Pista club del Po · Ferrarese'],['Micra Super S','AX Gti','Yaris Ts','Tigra 1.6','106 Rallye 1.3','Swift GTI','Saxo VTS'],15],
 ['Trofeo GT 280 · Nord Italia','Il trofeo dei club del Nord: gran turismo fino a 280 CV.','GT',150,280,3,44,1800,9000,750,['Autodromo della Bassa · Cremonese','Pista club del Po · Ferrarese','Autodromo del Garda · Bresciano','Circuito della Cascina · Lodigiano'],['M3 E30','S2000','Rx-7 FD','Delta Evoluzione','Lancer Evo 6','Boxster','Impreza 22b'],21],
 ['Coppa Italiane · Passione','Solo marchi italiani, da 80 a 250 CV.','Leggenda',80,250,3,40,1200,6500,650,['Pista club del Ticino · Novarese','Circuito del Santerno · Imolese','Autodromo della Bassa · Cremonese'],['Uno Turbo','Punto GT','145 Quadrifoglio','155 Q4','Delta HF 16v','Delta HPE','Coupè 20v'],19],
 ['Trofeo Trazione Posteriore','FR, MR e RR: equilibrio e controllo della potenza.','Open',100,350,4,45,2200,11000,900,['Pistino di San Rocco · Pavese','Pista della Cava · Veronese','Circuito delle Colline · Langhe','Autodromo della Bassa · Cremonese'],['Mx-5 NB','MRs','Elise','S2000','Rx-7 FD','M3 E36','964 RS'],26],
 ['Coppa Gran Turismo · Club del Nord','Cinque domeniche tra i club del Nord, per auto oltre 350 CV e piloti esperti.','Supercar',350,9999,6,50,5000,24000,1300,['Autodromo della Bassa · Cremonese','Anello dei Colli · Euganei','Autodromo del Garda · Bresciano','Circuito della Cascina · Lodigiano','Pista della Cava · Veronese'],['F355','996 GT3','Corvette C5 Z06','993 GT2','Zonda','F40','Diablo'],34],
];
const names=['Andrea','Michele','Sonia','Lele','Nadia','Renato','Ale'];
export const CHAMPIONSHIP_CATALOG=definitions.map(([name,description,category,minCv,maxCv,minLevel,minPerfIndex,entryFee,rewardMoney,rewardXp,tracks,cars,skill],cup)=>({name,description,category,minCv,maxCv,minLevel,minPerfIndex,entryFee,rewardMoney,rewardXp,tracks,allowedDrive:'any',minBrave:0,minClean:0,minReflex:0,minShift:0,
 engineTypes:cup===1?['NA']:null,brands:cup===3?['Alfa Romeo','Fiat','Lancia','Autobianchi','Ferrari','Lamborghini','Maserati','De Tomaso','Pagani']:null,drives:cup===4?['FR','MR','RR']:null,
 rivals:cars.map((carName,index)=>({id:`cup-${cup}-${index}`,name:names[index],carName,skill:skill+index,engineHealth:92,tireGrip:90}))}));
// Game calendars inspired by period touring/GT categories, not homologation regulations.
const imola='Imola · Autodromo Enzo e Dino Ferrari',mugello='Mugello · Autodromo internazionale';
const aciDefinitions=[
 ['Coppa Piccole Turismo · ACI CSAI','Utilitarie da corsa e scocche leggere: la prima stagione dopo la preparazione in officina.','Piccole Turismo',100,200,3,1800,9000,650,['Pistino di San Rocco · Pavese','Pista club del Ticino · Novarese','Pista club del Po · Ferrarese'],['Seicento Sporting','Cinquecento Sporting','A112 Abarth','Micra Super S','AX Gti','Swift GTI','106 Rallye 1.3'],24,null,null,null],
 ['Trofeo Turismo 1600 · ACI CSAI','Piccole aspirate a trazione anteriore, fino a 1600 cm³. Preparazione da asfalto e guida precisa.','Turismo 1600',160,240,4,2800,14000,900,['Pista club del Ticino · Novarese','Pista della Cava · Veronese',imola,'Pista club del Po · Ferrarese'],['Saxo VTS','106 Gti 16v','Corsa Gsi mk2','Yaris Ts','Civic EG','Swift GTI','106 Rallye 1.3'],29,1600,['NA'],['FF']],
 ['Coppa Superproduzione 2000 · ACI CSAI','Berline e compatte aspirate fino a due litri: quattro gare di velocità turismo.','Superproduzione',200,310,5,4000,20000,1100,['Autodromo della Bassa · Cremonese',imola,'Circuito della Cascina · Lodigiano',mugello],['145 Quadrifoglio','Xsara VTS','ZX 2.0','Tipo 16v','306 Gti','Clio Rs','Megane Coupè'],34,2000,['NA'],['FF','FR','RR']],
 ['Trofeo Superturismo · ACI CSAI','Berline da corsa, livree da paddock e motori diversi: conta mettere insieme la stagione.','Superturismo',220,400,6,6000,30000,1400,[imola,'Autodromo del Garda · Bresciano','Circuito della Cascina · Lodigiano',mugello],['155 Q4','M3 E30','190 Evo','Mondeo ST200','Primera GT','IS200 RS','Laguna'],39,null,null,null],
 ['Coppa Gran Turismo · ACI CSAI','Coupé da gara a trazione posteriore: cinque appuntamenti per preparazioni e piloti esperti.','Gran Turismo',380,750,8,9000,45000,1800,['Autodromo della Bassa · Cremonese',imola,'Autodromo del Garda · Bresciano','Circuito delle Colline · Langhe',mugello],['F355','996 GT3','Corvette C5 Z06','993 GT2','F40','Diablo','550'],45,null,null,['FR','MR','RR']],
];
CHAMPIONSHIP_CATALOG.push(...aciDefinitions.map(([name,description,category,minCv,maxCv,minLevel,entryFee,rewardMoney,rewardXp,tracks,cars,skill,maxCc,engineTypes,drives],cup)=>({name,description,category,minCv,maxCv,minLevel,entryFee,rewardMoney,rewardXp,tracks,series:'aci-csai',racePrepared:true,maxCc,engineTypes,drives,brands:null,minPerfIndex:0,allowedDrive:'any',minBrave:0,minClean:0,minReflex:0,minShift:0,
 rivals:cars.map((carName,index)=>({id:`aci-${cup}-${index}`,name:names[index],carName,skill:skill+index,engineHealth:96,tireGrip:96}))})));
export function championshipInfo(name){return CHAMPIONSHIP_CATALOG.find(cup=>cup.name===periodCupName(name))||null;}
export function championshipRules(spec){return {drives:spec.drives,engineTypes:spec.engineTypes,brands:spec.brands,...(spec.racePrepared?{racePrepared:true,maxCc:spec.maxCc}: {})};}
export function championshipSeries(cup){return cup?.series||((cup?.rules||championshipInfo(cup?.name)||cup)?.racePrepared?'aci-csai':'northern');}
export function championshipCarErrors(car,cup){
 if(!car)return ['Nessuna auto equipaggiata'];
 const errors=[];const base=car.car||car;const rules=cup.rules||championshipInfo(cup.name)||cup;
 const brand=typeof base.brand==='string'?base.brand:base.brand?.name;
 if(rules.racePrepared&&car.racePrepared!==true)errors.push('Richiesta la preparazione da gara definitiva del meccanico');
 if(rules.maxCc&&(!Number.isFinite(base.cc)||base.cc>rules.maxCc))errors.push(`Cilindrata massima: ${rules.maxCc} cm³`);
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
