import React, { useState, useRef } from 'react';
import usePlayerStore from '../store/playerStore';
import useGarageStore from '../store/garageStore';
import useGameStore from '../store/gameStore';
import LCDDisplay from '../components/LCDDisplay';

export default function GasStation() {
  const { money, removeMoney } = usePlayerStore();
  const { equippedCarId, triggerEvent } = useGameStore();
  const { cars, updateCarFuel } = useGarageStore();

  const [fuelType, setFuelType] = useState('Normale'); // 'Normale' or 'Premium'
  const [litersPumped, setLitersPumped] = useState(0);
  const [costAccumulated, setCostAccumulated] = useState(0);
  const pumpInterval = useRef(null);

  const pricePerLiter = fuelType === 'Normale' ? 1.50 : 2.50;
  
  const equippedCar = cars.find(c => c.id === equippedCarId);
  const tankSpace = equippedCar ? (equippedCar.fuelCapacity - equippedCar.currentFuel - litersPumped) : 0;

  const handlePumpStart = () => {
    if (!equippedCar) {
      triggerEvent({ type: 'error', title: 'Nessuna Auto', message: 'Non hai un\'auto da rifornire.' });
      return;
    }
    
    if (pumpInterval.current) clearInterval(pumpInterval.current);
    
    pumpInterval.current = setInterval(() => {
      setLitersPumped(prev => {
        const nextLiters = prev + 0.1;
        const nextCost = nextLiters * pricePerLiter;
        
        // Stop conditions
        if (nextCost > money || prev >= tankSpace) {
           clearInterval(pumpInterval.current);
           return prev; // don't add
        }
        
        setCostAccumulated(nextCost);
        return nextLiters;
      });
    }, 50); // fast count up
  };

  const handlePumpStop = () => {
    if (pumpInterval.current) {
      clearInterval(pumpInterval.current);
      // finalize transaction
      if (litersPumped > 0) {
        removeMoney(costAccumulated);
        updateCarFuel(equippedCarId, litersPumped, fuelType);
        triggerEvent({ type: 'info', title: 'Rifornimento', message: `Hai pagato €${costAccumulated.toFixed(2)} per ${litersPumped.toFixed(2)}L di Benzina ${fuelType}.` });
        setLitersPumped(0);
        setCostAccumulated(0);
      }
    }
  };

  const handleQuickFill = (liters) => {
    if (!equippedCar) return;
    const actualLiters = Math.min(liters, tankSpace);
    const cost = actualLiters * pricePerLiter;
    
    if (money >= cost) {
      removeMoney(cost);
      updateCarFuel(equippedCarId, actualLiters, fuelType);
      triggerEvent({ type: 'info', title: 'Rifornimento Veloce', message: `Pieno completato: €${cost.toFixed(2)}.` });
    } else {
      triggerEvent({ type: 'error', title: 'Fondi Insufficienti', message: 'Non hai abbastanza soldi!' });
    }
  };

  return (
    <div className="w-full h-full bg-[#3e3e3e] flex flex-col items-center justify-center p-4">
      {/* Pump Machine UI */}
      <div className="bg-gray-200 border-8 border-gray-400 rounded-t-3xl shadow-2xl flex flex-col items-center max-w-sm w-full relative overflow-hidden">
        
        {/* Banner Image */}
        <div className="w-full h-32 bg-black mb-4 relative flex-shrink-0 border-b-4 border-gray-400">
           <img src="/images/fuel.png" alt="Benzinaio" className="w-full h-full object-cover opacity-80 mix-blend-screen" onError={(e) => e.target.style.display='none'} />
           <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,0,0,0.1)_2px,rgba(0,0,0,0.1)_4px)] pointer-events-none mix-blend-overlay"></div>
        </div>

        <div className="px-6 pb-6 w-full flex flex-col items-center">
          <h2 className="text-2xl font-black italic text-red-600 mb-6 drop-shadow-sm">AGIP 2002</h2>
        
        {/* Displays */}
        <div className="flex flex-col gap-4 mb-6 w-full">
           <LCDDisplay value={costAccumulated} unit="€" label="Importo" />
           <LCDDisplay value={litersPumped} unit="L" label="Erogato" />
           <LCDDisplay value={pricePerLiter} unit="€" label="Prezzo/L" />
        </div>
        
        {/* Fuel Selection */}
        <div className="flex w-full gap-2 mb-6">
          <button 
            onClick={() => setFuelType('Normale')}
            className={`flex-1 py-4 font-bold rounded-sm border-2 ${fuelType === 'Normale' ? 'bg-green-600 text-white border-green-800 shadow-inner' : 'bg-green-400 text-green-900 border-green-300'}`}
          >
            Verde 95<br/><span className="text-xs">1.50€/L</span>
          </button>
          <button 
            onClick={() => setFuelType('Premium')}
            className={`flex-1 py-4 font-bold rounded-sm border-2 ${fuelType === 'Premium' ? 'bg-blue-600 text-white border-blue-800 shadow-inner' : 'bg-blue-400 text-blue-900 border-blue-300'}`}
          >
            BluSuper 100<br/><span className="text-xs">2.50€/L</span>
          </button>
        </div>

        {/* Pump Trigger */}
        <button 
          onMouseDown={handlePumpStart}
          onMouseUp={handlePumpStop}
          onMouseLeave={handlePumpStop}
          onTouchStart={handlePumpStart}
          onTouchEnd={handlePumpStop}
          className="w-48 h-48 rounded-full bg-black border-8 border-gray-800 flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.5)] active:scale-95 transition-transform"
        >
          <div className="text-white font-bold text-xl uppercase tracking-widest pointer-events-none text-center">
            Tieni Premuto<br/>Per Erogare
          </div>
        </button>

        {/* Quick actions */}
        <div className="flex w-full mt-8 gap-2">
          <button 
             onClick={() => handleQuickFill(10)} 
             className="flex-1 bg-yellow-400 border border-yellow-600 font-bold py-2 rounded-sm active:bg-yellow-500"
          >
             Solo 10 Litri
          </button>
          <button 
             onClick={() => handleQuickFill(equippedCar ? equippedCar.fuelCapacity - equippedCar.currentFuel : 0)} 
             className="flex-1 bg-red-600 text-white border border-red-800 font-bold py-2 rounded-sm active:bg-red-700"
          >
             Il Pieno
          </button>
        </div>
      </div>
    </div>
  </div>
  );
}
