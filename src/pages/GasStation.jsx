import FuelConsumption from '../components/FuelConsumption';
import React, { useState } from 'react';
import usePlayerStore from '../store/playerStore';
import useGarageStore from '../store/garageStore';
import useGameStore from '../store/gameStore';
import Win98Window from '../components/Win98Window';
import LCDDisplay from '../components/LCDDisplay';
import { refuelCar } from '../services/api';
export default function GasStation() {
  const { id: userId, money } = usePlayerStore();
  const { equippedCarId, triggerEvent } = useGameStore();
  const { cars } = useGarageStore();
  const [fuelType, setFuelType] = useState('Normale');
  const [liters, setLiters] = useState(10);
  const car = cars.find(car => car.id === equippedCarId);
  const capacity = car ? Math.max(0, 45 - car.currentFuel) : 0;
  const quantity = Math.min(capacity, liters);
  const price = fuelType === 'Premium' ? 2.5 : 1.5;
  const cost = Math.round(quantity * price * 100) / 100;
  const buy = async () => {
    try {
      const result = await refuelCar(car.id, userId, quantity, fuelType);
      triggerEvent({ type: 'info', title: 'Rifornimento salvato', message: `${result.liters.toFixed(2)} L · €${result.cost.toFixed(2)}. Il nuovo saldo e il carburante sono salvati.` });
    } catch (error) { triggerEvent({ type: 'error', title: 'Rifornimento non riuscito', message: error.message }); }
  };
  return <Win98Window title="Distributore — AGIP 2002"><div className="bg-win98-gray p-4 flex justify-center text-black">
    <div className="bg-gray-200 border-4 border-t-white border-l-white border-b-black border-r-black max-w-md w-full overflow-hidden">
      <img src="/images/fuel.png" alt="Benzinaio" className="w-full h-32 object-cover" />
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-black italic text-red-600">AGIP 2002</h1>
        {!car ? <p>Equipaggia un’auto dal garage.</p> : <>
          <p>{car.brand} {car.name}: <strong>{car.currentFuel.toFixed(2)} / 45 L</strong> · {car.fuelType}</p>
          <FuelConsumption car={car}/><LCDDisplay value={cost} unit="€" label="Importo" />
          <LCDDisplay value={quantity} unit="L" label="Da erogare" />
          <label className="block font-bold">Carburante
            <select className="block w-full p-2 border border-gray-500" value={fuelType} onChange={event => setFuelType(event.target.value)}>
              <option>Normale</option><option>Premium</option>
            </select>
          </label>
          <p>{price.toFixed(2)} €/L · Premium: +2% alle prestazioni del motore fino al prossimo rifornimento normale.</p>
          <label className="block font-bold">Litri
            <input type="number" min="0.01" max="45" step="0.1" value={liters} onChange={event => setLiters(Math.max(0, Math.min(45, Number(event.target.value))))} className="block w-full p-2 border border-gray-500" />
          </label>
          <div className="flex gap-2"><button onClick={() => setLiters(10)} className="bg-yellow-300 border p-2">10 litri</button><button onClick={() => setLiters(capacity)} className="bg-yellow-300 border p-2">Pieno</button></div>
          <button disabled={quantity <= 0 || money < cost} onClick={buy} className="win98-btn w-full font-bold py-3 disabled:opacity-50">Conferma rifornimento · €{cost.toFixed(2)}</button>
        </>}
      </div>
    </div>
  </div></Win98Window>;
}
