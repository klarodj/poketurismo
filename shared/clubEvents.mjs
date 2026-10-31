import {newCarPrice,marketTier} from './carEconomy.mjs';
export const CLUB_EVENTS_VERSION=1;
export const CLUB_EVENT_IMAGE='/images/world/events/club-events.png';
const rows=[
 ['piccole-pesti','Piccole pesti','Utilitarie','Sul pistino del club le piccole si prendono la scena. Pochi cavalli, curve strette e un rivale alla portata: qui conta imparare a far scorrere la macchina.',1,'Pistino di San Rocco · Pavese','Cinquecento Sporting',8,'Utilitarie stradali: massimo 1.400 cm³, 100 CV e peso di serie fino a 1.100 kg.'],
 ['originali','Come mamma l’ha fatta','Vetture originali','Sergio dà un’occhiata sotto il cofano, poi si va in pista. Niente elaborazioni: gomme stradali, carrozzeria di serie e la soddisfazione di guidare bene ciò che hai.',1,'Pista club del Ticino · Novarese','Seicento Sporting',10,'Massimo 160 CV; nessun ricambio tuning montato. Manutenzione e vernice ammesse.'],
 ['budget','Pochi soldi, tanto manico','Budget limitato','In officina si fanno i conti sul retro di un foglio. Scegli una base economica e pochi interventi sensati: il limite riguarda il valore convenzionale della preparazione, non quanto hai saputo contrattare.',2,'Pistino di San Rocco · Pavese','Cinquecento Sporting',12,'Massimo 120 CV e 12.000 € di valore convenzionale tra vettura e pezzi.'],
 ['italiane','Domenica italiana','Raduno nazionale','Ci si incontra al bar del lago, si guardano i cofani e poi il gruppo si sposta al pistino per una prova amichevole. Utilitarie e berline italiane hanno tutte qualcosa da raccontare.',2,'Pistino di San Rocco · Pavese','Punto GT',12,'Marchi italiani, vetture stradali fino a 160 CV. Raduno sul lago, prova cronometrata in pista.'],
 ['regolarita','Il cronometro del navigatore','Regolarità','Roadbook di carta, controlli e un cronometro sul tavolino. Su un percorso riservato al club devi passare ai controlli al momento giusto: arrivare in anticipo vale quanto arrivare in ritardo.',1,'Lago d’Iseo · porto → galleria','Seicento Sporting',10,'Stradali fino a 160 CV. Scarto medio massimo 3 secondi dai tempi imposti di settore; non conta battere un rivale.'],
];
export const CLUB_EVENTS=Object.freeze(rows.map(([id,title,category,description,minLevel,trackName,rivalCar,skill,rules])=>Object.freeze({id,title,category,description,minLevel,trackName,rivalCar,skill,rules,version:CLUB_EVENTS_VERSION,image:`/images/world/events/${id}.png`,entryFee:0,winMoney:300,finishMoney:100,winXp:60,finishXp:20,regularity:id==='regolarita',road:id==='regolarita'})));
export const clubEvent=id=>CLUB_EVENTS.find(event=>event.id===id)||null;
export function eventBudget(car){const base=car?.car||car;if(!base)return Infinity;return Math.ceil(Math.max(marketTier(base).usedFloor,newCarPrice(base)*.6)/50)*50+(car.mods||[]).reduce((sum,mod)=>sum+Math.max(0,Number(mod.part?.price)||0),0);}
export function eventCarErrors(car,event){
 if(!car)return ['Scegli una tua vettura.'];const base=car.car||car,cv=car.cv??base.cv,errors=[];
 if(car.racePrepared)errors.push('Sono ammesse soltanto vetture stradali.');
 if(event.id==='piccole-pesti'){if(base.cc>1400)errors.push('Cilindrata massima 1.400 cm³.');if(cv>100)errors.push('Potenza massima 100 CV.');if(!Number.isFinite(base.kg)||base.kg>1100)errors.push('Peso di serie massimo 1.100 kg.');}
 else if(event.id==='budget'){if(cv>120)errors.push('Potenza massima 120 CV.');if(eventBudget(car)>12000)errors.push('Valore convenzionale massimo 12.000 €.');}
 else if(cv>160)errors.push('Potenza massima 160 CV.');
 if(event.id==='originali'&&(car.mods||[]).length)errors.push('Smonta tutti i ricambi tuning: vettura di serie obbligatoria.');
 const brand=typeof base.brand==='string'?base.brand:base.brand?.name;
 if(event.id==='italiane'&&!['Alfa Romeo','Fiat','Lancia','Autobianchi','Ferrari','Lamborghini','Maserati','Pagani'].includes(brand))errors.push('Scegli un marchio italiano.');
 if(car.engineHealth<=0)errors.push('Ripara il motore.');if(car.tireGrip<=0)errors.push('Sostituisci le gomme.');if(car.currentFuel<=0)errors.push('Fai rifornimento.');return errors;
}
export const eventRewardFactor=count=>[1,.5,.25][count]||0;
export function regularityTargets(sections){return sections.map(s=>Math.round((s.segments||[]).reduce((n,segment)=>n+segment.lengthM,0)/1000*72*1000)/1000);}
export function regularityResult(state){const targets=state.clubEvent.targets||[],splits=state.logs.map((log,i)=>({sector:i+1,target:targets[i],actual:log.playerSeconds,delta:Number((log.playerSeconds-targets[i]).toFixed(3))}));const valid=!state.failure&&state.finished&&splits.length===targets.length&&targets.length>0;const mean=valid?splits.reduce((n,s)=>n+Math.abs(s.delta),0)/splits.length:null;return {passed:valid&&mean<=3,meanDeviation:mean===null?null:Number(mean.toFixed(3)),splits};}
