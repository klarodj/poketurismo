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
    <div className="w-full bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray flex flex-row justify-between items-center px-2 py-1.5 shadow-win98-outset z-50 relative gap-2">
      <div className="flex gap-1.5 sm:gap-4 items-center flex-shrink-0">
        <button 
          onClick={handleMapClick}
          className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray active:border-t-win98-darkerGray active:border-l-win98-darkerGray active:border-b-white active:border-r-white text-xl sm:text-2xl shadow-[inset_-1px_-1px_0_rgba(0,0,0,0.5)]"
          title="Mappa della Città"
        >
          🗺️
        </button>
        <button 
          onClick={toggleHistory}
          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray active:border-t-win98-darkerGray active:border-l-win98-darkerGray active:border-b-white active:border-r-white text-lg sm:text-xl"
          title="Apri Cellulare (Notifiche)"
        >
          📱
        </button>
        
        <div className="font-bold flex items-center gap-1 sm:gap-2">
          <span className="hidden sm:inline text-xl sm:text-2xl">💰</span>
          <span className="text-[13px] sm:text-xl tracking-tight sm:tracking-wider text-green-800 bg-white px-1 sm:px-2 py-0.5 border border-win98-darkerGray shadow-win98-inset">
            €{money.toLocaleString()}
          </span>
        </div>
        
        <div className="hidden lg:flex font-bold text-win98-text text-sm">
          Lvl {level} Pilot
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-4 overflow-hidden">
        {equippedCar ? (
          <>
            <div className="bg-win98-blue text-white px-1.5 sm:px-2 py-0.5 sm:py-1 font-bold border-2 border-t-win98-darkGray border-l-win98-darkGray border-b-white border-r-white text-[11px] sm:text-sm whitespace-nowrap truncate max-w-[130px] sm:max-w-none">
              🚗 {equippedCar.name}
            </div>
            <FuelGauge currentFuel={equippedCar.currentFuel} maxFuel={equippedCar.fuelCapacity} />
          </>
        ) : (
          <div className="text-gray-500 italic font-bold text-[10px] sm:text-sm whitespace-nowrap">No Car</div>
        )}
      </div>
    </div>
  );
}
