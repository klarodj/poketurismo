import React,{useState}from'react';
import{Link}from'react-router-dom';
import FuelConsumption from '../components/FuelConsumption';
import usePlayerStore from '../store/playerStore';
import useGarageStore from '../store/garageStore';
import useGameStore from '../store/gameStore';
import useRaceStore from '../store/raceStore';
import useRequestStore from '../store/requestStore';
import Win98Window from '../components/Win98Window';
import LCDDisplay from '../components/LCDDisplay';
import{refuelCar}from'../services/api';
export default function GasStation(){
 const{id:userId,money}=usePlayerStore(),{equippedCarId,triggerEvent}=useGameStore(),{cars}=useGarageStore(),active=useRaceStore(s=>s.activeRace),pending=useRequestStore(s=>s.pending);
 const[fuelType,setFuelType]=useState('Normale'),[liters,setLiters]=useState(10),car=cars.find(c=>c.id===equippedCarId),capacity=car?Math.max(0,45-car.currentFuel):0,quantity=Math.min(capacity,liters),price=fuelType==='Premium'?2.5:1.5,cost=Math.round(quantity*price*100)/100;
 const buy=async()=>{try{const result=await refuelCar(car.id,userId,quantity,fuelType);triggerEvent({type:'info',title:'Rifornimento salvato',message:`${result.liters.toFixed(2)} L erogati · €${result.cost.toFixed(2)}.`});}catch(e){triggerEvent({type:'error',title:'Rifornimento non riuscito',message:e.message});}};
 return <Win98Window guideId="fuel" title="Distributore — AGIP 2002" imageUrl="/images/fuel.png"><div className="period-page fuel-page"><h1>AGIP · La pompa del paese</h1>{!car?<><p>Equipaggia un’auto per fare rifornimento.</p><Link to="/garage/auto" className="win98-btn">Vai al garage</Link></>:<><p className="period-status">{car.brand} {car.name} · {car.currentFuel.toFixed(1)} / 45 L · {car.fuelType}</p>{active&&<p className="period-notice">Concludi la gara in corso prima di fare rifornimento.</p>}<div className="fuel-displays"><LCDDisplay value={cost} unit="€" label="Importo"/><LCDDisplay value={quantity} unit="L" label="Da erogare"/></div><div className="catalog-filters"><label>Carburante<select value={fuelType} onChange={e=>setFuelType(e.target.value)}><option value="Normale">Normale · 1,50 €/L</option><option value="Premium">Premium · 2,50 €/L</option></select></label><label>Litri<input type="number" min="0.01" max={capacity||45} step="0.1" value={liters} onChange={e=>setLiters(Math.max(0,Math.min(45,Number(e.target.value))))}/></label></div><div className="fuel-actions"><button className="win98-btn" onClick={()=>setLiters(Math.min(10,capacity))}>10 litri</button><button className="win98-btn" onClick={()=>setLiters(capacity)}>Pieno · {capacity.toFixed(1)} L</button></div><button className="win98-btn" disabled={pending>0||!!active||quantity<=0||!Number.isFinite(quantity)||money<cost} onClick={buy}>Conferma rifornimento · €{cost.toFixed(2)}</button>{money<cost&&<p className="period-notice">Mancano €{(cost-money).toFixed(2)}.</p>}<FuelConsumption car={car}/><details className="period-details"><summary>Carburanti e prestazioni</summary><p>Premium: +2% alle prestazioni del motore fino al prossimo rifornimento normale. Il prezzo viene confermato dal benzinaio prima dell’erogazione.</p></details></>}</div></Win98Window>;
}
