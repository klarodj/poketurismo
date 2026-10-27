import React,{useState} from 'react';
import RaceCarArtwork from './RaceCarArtwork';
import CarPaintPicker from './CarPaintPicker';
import {paintName} from '../../shared/carPaint.mjs';
export default function BodyShop({car,money,disabled,onPaint}){
 const [colour,setColour]=useState(car.paint.paintColour),[confirm,setConfirm]=useState(false);
 const changed=colour!==car.paint.paintColour;
 return <section className="body-shop"><header className="body-shop-heading"><img src="/images/world/work/verniciatura.png" width="80" height="80" alt="Verniciatura nella cabina del carrozziere"/><h2>Carrozziere · Cambio colore</h2></header><p>Verniciatura completa: <strong>€{car.paint.price.toLocaleString('it-IT')}</strong>. Solo estetica, nessuna modifica alle prestazioni.</p><p>Colore attuale: <strong>{paintName(car.paint.paintColour)}</strong></p><RaceCarArtwork car={{...car,paintColour:colour}} large/><CarPaintPicker value={colour} onChange={v=>{setColour(v);setConfirm(false);}} disabled={disabled}/>{money<car.paint.price&&<p>Mancano €{(car.paint.price-money).toLocaleString('it-IT')}.</p>}{confirm?<div className="period-notice"><p>Verniciare {car.name} in {paintName(colour)} per €{car.paint.price.toLocaleString('it-IT')}?</p><button className="win98-btn" disabled={disabled||money<car.paint.price||!changed} onClick={()=>{setConfirm(false);onPaint(colour,car.paint.key);}}>Conferma verniciatura · €{car.paint.price.toLocaleString('it-IT')}</button><button className="win98-btn" onClick={()=>setConfirm(false)}>Annulla</button></div>:<button className="win98-btn" disabled={disabled||!changed||money<car.paint.price} onClick={()=>setConfirm(true)}>{changed?'Richiedi verniciatura':'Scegli un colore diverso'}</button>}</section>;
}
