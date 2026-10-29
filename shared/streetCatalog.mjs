import {periodTrackName,periodTrackLocation} from './periodWorld.mjs';
import {performanceIndex} from './vehiclePerformance.mjs';
// Fixed identities and catalogue cars: no opponent scaling with the player's upgrades.
const definitions = [
  ['parking','Il parcheggio del centro commerciale','Le prime sfide dopo la chiusura. Auto piccole, percorsi brevi e puntate contenute.',1,0,null,0,100,['Lago d’Iseo · porto → galleria'],
    [['Teo','Seicento Sporting','prudente',8],['Marta','Cinquecento Sporting','preciso',10],['Nico','Cooper S','tecnico',11],['Vale','Mini Turbo','aggressivo',9],['Simo','A112 Abarth','tecnico',12],['Giulia','Micra Super S','preciso',12],['Dado','Seicento Sporting','aggressivo',14],['Elisa','Cinquecento Sporting','prudente',15]]],
  ['industrial','I capannoni della Bassa','Dopo la chiusura delle officine: capannoni, cancelli e le prime compatte sportive.',2,38,'parking',12,300,['Cisa · strada del passo','Riviera di Levante · statale costiera'],
    [['Rame','Y10 Turbo','aggressivo',18],['Bea','Corsa Gsi mk2','preciso',19],['Pistone','Visa Gti','prudente',20],['Kiki','Swift GTI','tecnico',22],['Alex','106 Rallye 1.3','preciso',23],['Turbo','Uno Turbo','aggressivo',24],['Irene','Golf GTI mk1','prudente',25],['Luca','Charade Gtti','tecnico',26]]],
  ['coast','Il piazzale sul lago','Il venerdì sera sul lungolago, tra il bar e il parcheggio dei motorini. Curve scorrevoli e cambi di ritmo.',3,42,'industrial',20,600,['Riviera di Levante · statale costiera','Lario · statale del lago'],
    [['Luna','Mx-5 NA','tecnico',28],['Edo','205 Gti 1.9','aggressivo',29],['Maya','Clio Williams','preciso',30],['Riki','Civic EG','tecnico',31],['Sara','Saxo VTS','preciso',32],['La Volpe','5 Gt','aggressivo',33],['Alba','Mx-5 NB','prudente',34],['Diego','Integra','tecnico',35]]],
  ['mountain','Il bar del passo','Tornanti, pendenze e condizioni difficili. Richiede Rilascio progressivo dalla scuola guida.',4,45,'coast',30,1000,['Stelvio · Prato → passo','Passo del Cervo · Biellese','Salita del Santuario · Canavese','Val Seriana · strada delle cave','Discesa dei Castagni · Valsesia'],
    [['Beppe','Trueno Gt-Apex','tecnico',38],['Bruno','Delta HF 16v','aggressivo',39],['Nora','Impreza Gt','preciso',40],['Il Geometra','Lancer Evo 5','tecnico',41],['Sofia','Celica Carlos Sainz','prudente',42],['Roccia','M3 E30','aggressivo',43],['Michela','Elise','tecnico',44],['Vera','Impreza 22b','preciso',46]]],
  ['highway','L’area di servizio in tangenziale','Caffè al distributore e cofani aperti: qui si trovano le auto grosse e i piloti esperti.',6,48,'mountain',40,2000,['Riviera di Levante · statale costiera'],
    [['Lo Zero','Skyline GTR R32','tecnico',50],['Ari','Supra mk4','aggressivo',52],['Viola','M3 E46','preciso',53],['Mirko','Rx-7 FD','tecnico',54],['Il Fantasma','Corvette C5 Z06','aggressivo',56],['Eva','996 GT3','preciso',58],['V12','F355','prudente',60],['Rea','993 GT2','tecnico',62]]],
];
export const STREET_ZONES=definitions.map(([id,name,description,minLevel,minPerformance,previousZone,minReputation,maxWager,tracks,rivals])=>({id,name,description,minLevel,minPerformance,previousZone,minReputation,maxWager,tracks,technique:id==='mountain'?'progressive-release':null,rivals:rivals.map(([name,carName,style,skill],index)=>({id:`${id}-${index+1}`,name,carName,style,skill,engineHealth:id==='parking'?[84,86,86,95,86,92,80,90][index]:96,tireGrip:id==='parking'?[78,80,80,92,80,88,74,80][index]:96}))}));
export const STREET_STYLES={prudente:'Prudente',preciso:'Preciso',tecnico:'Specialista delle curve',aggressivo:'Aggressivo'};
export const streetPerformance=performanceIndex;
export function streetPilot(rival){const pilot=Object.fromEntries(['brave','clean','reflex','acro','turn','brake','throttle','shift'].map(key=>[key,rival.skill]));const bonuses={prudente:{clean:4,brake:3,brave:-2},preciso:{clean:4,reflex:3},tecnico:{turn:5,throttle:3},aggressivo:{brave:5,shift:3,clean:-3}};for(const[key,bonus]of Object.entries(bonuses[rival.style]||{}))pilot[key]=Math.max(1,pilot[key]+bonus);return pilot;}
export function repeatFactor(races=0){return [1,0.6,0.3,0.1,0][Math.min(4,Math.max(0,races))];}
export function streetReward({outcome,failure,completed,races=0,wins=races,easy=false,wager=0}){
  const valid=completed&&!failure;
  const factor=repeatFactor(outcome==='win'?wins:races)*(easy?0.2:1);
  return {money:outcome==='win'?wager*2:outcome==='draw'?wager:0,xp:valid?Math.floor((outcome==='win'?100:outcome==='draw'?40:20)*factor):0,reputation:valid?Math.floor((outcome==='win'?10:outcome==='draw'?3:1)*factor):0,factor};
}
export const STREET_TRACKS=[
  {name:'Parcheggio · anello dei magazzini',location:'Centro commerciale, Italia',distanceM:2400,elevation:8,weather:'sunny',difficulty:1,description:'Sprint punto a punto tra accessi e magazzini.',sections:[1,3,1,4,11,1,12,1],type:'City',format:'point-to-point'},
  {name:'Zona industriale · viale delle officine',location:'Distretto industriale, Italia',distanceM:4300,elevation:12,weather:'night',difficulty:2,description:'Rettilinei, incroci e frenate notturne.',sections:[2,3,1,11,2,4,1,12,2,3,1],type:'City',format:'point-to-point'},
  {name:'Tangenziale · svincolo nord → interporto',location:'Cintura urbana, Italia',distanceM:11500,elevation:35,weather:'night',difficulty:4,description:'Lunghi allunghi e curvoni tra gli svincoli.',sections:[1,10,2,5,2,6,2,9,5,2,3,1],type:'Highway',format:'point-to-point'},
];
STREET_ZONES[0].tracks.push(STREET_TRACKS[0].name);
STREET_ZONES[1].tracks=[STREET_TRACKS[1].name];
STREET_ZONES[3].tracks.push('Valico della Neve · Cadore');
STREET_ZONES[4].tracks=[STREET_TRACKS[2].name];
for(const track of STREET_TRACKS){track.name=periodTrackName(track.name);track.location=periodTrackLocation(track.name)||track.location;}

export function streetAccessReasons(zone,ctx){
 const reasons=[];
 if(ctx.garage?.racePrepared)reasons.push('Auto da gara: solo pista, vietate le clandestine');
 if(ctx.user.level<zone.minLevel)reasons.push(`Livello pilota ${zone.minLevel}`);
 if(!ctx.garage)reasons.push('Equipaggia un’auto');
 else if(streetPerformance(ctx.garage)<zone.minPerformance)reasons.push(`Indice prestazioni attuale ${zone.minPerformance}`);
 if(zone.previousZone&&(ctx.state[zone.previousZone]?.reputation||0)<zone.minReputation)reasons.push(`${zone.minReputation} reputazione in ${STREET_ZONES.find(item=>item.id===zone.previousZone).name}`);
 if(zone.technique&&!ctx.growth?.lessonPassed)reasons.push('Scuola guida: Rilascio progressivo');
 return reasons;
}
