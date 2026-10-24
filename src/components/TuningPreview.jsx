import {kmPerLiter} from '../logic/displayUnits.mjs';
import {partName,partDescription} from '../logic/partLabels.mjs';
import React from 'react';
const euro=value=>`€${value.toLocaleString('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const format=value=>value.toLocaleString('it-IT',{maximumFractionDigits:2});
const rows=[['fuelConsumption','Consumo in gara stimato',' km/l',false],['performanceIndex','Indice prestazioni','',false],['cv','Potenza',' CV',false],['nm','Coppia',' Nm',false],['kg','Peso',' kg',true],['topSpeedKmh','Velocità potenziale',' km/h',false],['turnSlow','Curve lente','',false],['turnFast','Curve veloci','',false],['brake','Freni','',false],['traction','Trazione','',false]];
export function TuningAccess({preview}){
 const changed=gate=>JSON.stringify(gate.beforeErrors)!==JSON.stringify(gate.afterErrors);
 const lost=preview.championships.filter(cup=>!cup.beforeErrors.length&&cup.afterErrors.length);
 const gained=preview.championships.filter(cup=>cup.beforeErrors.length&&!cup.afterErrors.length);
 const zones=preview.zones.filter(changed);
 return <section className="tuning-access"><h3>Accesso alle competizioni</h3>
 {lost.map(cup=><p className="tuning-warning" key={cup.id}>{cup.active?'Attenzione al campionato in corso: ':''}{cup.name}: auto fuori regolamento dopo il montaggio. {cup.afterErrors.join(' · ')}.</p>)}
 {gained.map(cup=><p className="tuning-info" key={cup.id}>{cup.name}: l’auto rientra nei requisiti.{cup.pilotErrors.length?` Restano: ${cup.pilotErrors.join(' · ')}.`:' Puoi partecipare se hai la quota d’iscrizione.'}</p>)}
 {zones.map(zone=><p className={zone.afterErrors.length?'tuning-warning':'tuning-info'} key={zone.id}>{zone.name}: {zone.afterErrors.length?`requisiti ancora da soddisfare: ${zone.afterErrors.join(' · ')}`:'accesso disponibile dopo il montaggio'}.</p>)}
 {!lost.length&&!gained.length&&!zones.length&&<p>Questa sostituzione non cambia i requisiti di accesso soddisfatti.</p>}
 <p className="tuning-small">Le soglie IP usano le condizioni attuali. Usura, carburante, livello, reputazione e scuola guida possono modificare l’accesso; i controlli vengono ripetuti prima della gara.</p>
 <details><summary>Tutti i requisiti attuali</summary><ul>{preview.championships.map(cup=><li key={cup.id}><strong>{cup.name}:</strong> {[...cup.afterErrors,...cup.pilotErrors].join(' · ')||'Auto e pilota ammessi; serve la quota d’iscrizione.'}</li>)}{preview.zones.map(zone=><li key={zone.id}><strong>{zone.name} · IP minimo {zone.minPerformance}:</strong> {zone.afterErrors.join(' · ')||'Requisiti soddisfatti.'}</li>)}</ul></details>
 </section>;
}
export default function TuningPreview({part,carName,money,disabled,onBuy,onMount}){
 const preview=part.preview;
 return <article className="tuning-detail"><header className="tuning-detail-header"><img src={`/images/part/${part.image}`} alt={partName(part.name)} onError={event=>{event.currentTarget.onerror=null;event.currentTarget.src='/images/shop.png';}}/><div><h2>{partName(part.name)} · livello {part.level}</h2><p>{partDescription(part)}</p><strong>{euro(part.price)}</strong><p>Nel magazzino: {part.ownedQuantity}</p></div></header>
 {preview?<><p className="tuning-replacement"><strong>{carName}</strong> · {preview.alreadyMounted?'Questa variante è già montata.':preview.installed?`Sostituisce il livello ${preview.installed.level}: ${partDescription(preview.installed)}. Il vecchio pezzo torna in magazzino.`:'Si aggiunge ai componenti già presenti.'}</p>
 <div className="tuning-table-scroll"><table className="tuning-table"><caption>Confronto con la preparazione attuale</caption><thead><tr><th>Caratteristica</th><th>Prima</th><th>Dopo</th><th>Differenza netta</th></tr></thead><tbody>{rows.filter(([key])=>Number.isFinite(preview.before[key])&&Number.isFinite(preview.after[key])).map(([key,label,unit,lowerBetter])=>{const before=key==='fuelConsumption'?kmPerLiter(preview.before[key]):preview.before[key],after=key==='fuelConsumption'?kmPerLiter(preview.after[key]):preview.after[key];if(before==null||after==null)return null;const delta=Number((after-before).toFixed(3)),better=lowerBetter?delta<0:delta>0;return <tr key={key}><th scope="row">{label}</th><td>{format(before)}{unit}</td><td>{format(after)}{unit}</td><td className={delta===0?'':better?'tuning-positive':'tuning-negative'}>{delta>0?'+':''}{format(delta)}{unit}</td></tr>;})}</tbody></table></div>
 <p className="tuning-small">Stesso carburante, motore e gomme: il confronto isola il ricambio. Velocità potenziale stimata sull’asciutto; il tempo effettivo dipende da tracciato e pilota. L’IP è arrotondato.</p>
 <section className="tuning-advice"><h3>Effetti attesi</h3><ul>{preview.advice.map(tip=><li key={tip}>{tip}</li>)}</ul></section><TuningAccess preview={preview}/></>:<p>Scegli prima una vettura per confrontare il ricambio. Puoi comunque acquistarlo per il magazzino.</p>}
 <div className="tuning-actions">{onBuy&&<button className="win98-btn" disabled={disabled||money<part.price} onClick={onBuy}>Acquista per il magazzino · {euro(part.price)}</button>}{onMount&&<button className="win98-btn" disabled={disabled||!preview||preview.alreadyMounted||part.ownedQuantity<1} onClick={onMount}>{preview?.alreadyMounted?'Già montato':'Conferma montaggio del pezzo posseduto'}</button>}</div>{onBuy&&money<part.price&&<p className="tuning-negative">Per l’acquisto mancano {euro(part.price-money)}.</p>}{onMount&&part.ownedQuantity<1&&<p className="tuning-small">L’acquisto aggiunge il pezzo al magazzino; il montaggio si conferma separatamente.</p>}
 </article>;
}
