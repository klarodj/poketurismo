import React from 'react';
import { useNavigate } from 'react-router-dom';
import usePlayerStore from '../store/playerStore';
import useGarageStore from '../store/garageStore';
import useGameStore from '../store/gameStore';
import FuelGauge from './FuelGauge';

export default function HUD() {
  const navigate = useNavigate();
  const { money, level } = usePlayerStore();
  const { equippedCarId, toggleHistory, travel } = useGameStore();
  const { cars } = useGarageStore();
  
  const handleMapClick = () => {
    if (travel('/map', 0)) {
       navigate('/map');
    }
  };

  const equippedCar = cars.find(c => c.id === equippedCarId);

  return (
    <div className="w-full bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray flex flex-col sm:flex-row justify-between items-center px-4 py-2 shadow-win98-outset z-50 relative">
      <div className="flex gap-4 items-center flex-1">
        <button 
          onClick={handleMapClick}
          className="w-10 h-10 flex items-center justify-center bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray active:border-t-win98-darkerGray active:border-l-win98-darkerGray active:border-b-white active:border-r-white text-2xl shadow-[inset_-1px_-1px_0_rgba(0,0,0,0.5)]"
          title="Mappa della Città"
        >
          🗺️
        </button>
        <button 
          onClick={toggleHistory}
          className="w-8 h-8 flex items-center justify-center bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray active:border-t-win98-darkerGray active:border-l-win98-darkerGray active:border-b-white active:border-r-white text-xl"
          title="Apri Cellulare (Notifiche)"
        >
          📱
        </button>
        
        <div className="font-bold flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <span className="text-xl tracking-wider text-green-800 bg-white px-2 py-0.5 border border-win98-darkerGray shadow-win98-inset">
            € {money.toLocaleString()}
          </span>
        </div>
        
        <div className="hidden md:flex font-bold text-win98-text">
          Lvl {level} Pilot
        </div>
      </div>

      {equippedCar ? (
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="bg-win98-blue text-white px-3 py-1 font-bold border-2 border-t-win98-darkGray border-l-win98-darkGray border-b-white border-r-white text-sm whitespace-nowrap">
            🚗 {equippedCar.name}
          </div>
          <FuelGauge currentFuel={equippedCar.currentFuel} maxFuel={equippedCar.fuelCapacity} />
        </div>
      ) : (
        <div className="text-gray-500 italic font-bold">Nessuna auto equipaggiata</div>
      )}
    </div>
  );
}
