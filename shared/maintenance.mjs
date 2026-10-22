import {marketTier,tradeInValue} from './carEconomy.mjs';
import {performanceIndex} from './vehiclePerformance.mjs';
const round=value=>Math.ceil(value/5)*5;
const tiers={starter:1,compact:1.25,sport:1.6,gt:2,performance:3,super:4};
export const SERVICE_NAMES={engine:'Tagliando',tires:'Cambio gomme',rebuild:'Revisione motore',full:'Ripristino completo'};
export function maintenanceFactor(garage){return tiers[marketTier(garage.car,garage).id];}
export function safeServicePrice(garage,changes,basePrice){const after={...garage,...changes};const gain=Math.max(0,tradeInValue(garage.car,after)-tradeInValue(garage.car,garage));return round(Math.max(basePrice,gain+25*maintenanceFactor(garage)));}
export function maintenanceQuotes(garage){
 const factor=maintenanceFactor(garage),missing=100-garage.engineHealth,tireWear=100-garage.tireGrip;
 const overdue=Math.max(0,garage.km-garage.serviceKm)>=100000;
 const items=[
 {id:'engine',name:SERVICE_NAMES.engine,description:'Olio, filtri e manutenzione. Recupera fino a 10 punti motore e azzera il malus da tagliando.',enabled:garage.engineHealth>=30&&(missing>0||overdue),reason:garage.engineHealth<30?'Motore troppo danneggiato: serve una revisione.':'Motore e manutenzione già a posto.',changes:{engineHealth:Math.min(100,garage.engineHealth+10),serviceKm:garage.km},base:150*factor},
 {id:'tires',name:SERVICE_NAMES.tires,description:'Sostituisce gli pneumatici e riporta l’aderenza al 100%.',enabled:tireWear>0,reason:'Gomme già al 100%.',changes:{tireGrip:100},base:(80+tireWear*4)*factor},
 {id:'rebuild',name:SERVICE_NAMES.rebuild,description:'Ripristina il motore al 100% e aggiorna il tagliando. Il costo cresce con il danno e la fascia dell’auto.',enabled:missing>0||overdue,reason:'Motore e manutenzione già a posto.',changes:{engineHealth:100,serviceKm:garage.km},base:(120+missing*14+(garage.engineHealth===0?250:0))*factor},
 ];
 for(const item of items){item.price=item.enabled?safeServicePrice(garage,item.changes,item.base):0;delete item.base;item.after={engineHealth:item.changes.engineHealth??garage.engineHealth,tireGrip:item.changes.tireGrip??garage.tireGrip,performanceIndex:performanceIndex({...garage,...item.changes})};}
 const engine=missing<=10&&garage.engineHealth>=30?items[0]:items[2];const changes={engineHealth:100,tireGrip:100,serviceKm:garage.km};const enabled=missing>0||tireWear>0||overdue;
 items.push({id:'full',name:SERVICE_NAMES.full,description:'Combina motore, gomme e tagliando. Il preventivo comprende solo gli interventi necessari.',enabled,reason:'Auto già in condizioni perfette.',price:enabled?safeServicePrice(garage,changes,(engine.price+items[1].price)*(engine.price>0&&items[1].price>0?0.95:1)):0,changes,after:{engineHealth:100,tireGrip:100,performanceIndex:performanceIndex({...garage,...changes})}});
 return items;
}
export function essentialRepair(garage){
 const changes={engineHealth:Math.max(60,garage.engineHealth),tireGrip:Math.max(60,garage.tireGrip),currentFuel:Math.max(8,garage.currentFuel),fuelType:garage.currentFuel<8?'Normale':garage.fuelType,serviceKm:garage.km};
 const factor=maintenanceFactor(garage),engineDelta=changes.engineHealth-garage.engineHealth,tireDelta=changes.tireGrip-garage.tireGrip;
 const base=(engineDelta>0?120+engineDelta*14+(garage.engineHealth===0?250:0):0)*factor+(tireDelta>0?80+tireDelta*4:0)*factor+(changes.currentFuel-garage.currentFuel)*1.5;
 return {changes,price:safeServicePrice(garage,changes,base)};
}
