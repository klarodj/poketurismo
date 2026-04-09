import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePlayerStore from '../store/playerStore';
import useGarageStore from '../store/garageStore';
import useGameStore from '../store/gameStore';
import Win98Window from '../components/Win98Window';
import { sellCar, equipCar } from '../services/api';

export default function GarageAuto() {
  const { id: userId, initialize: refreshPlayer } = usePlayerStore();
  const { cars, getCarStats, initialize: refreshGarage } = useGarageStore();
  const { equippedCarId, setEquippedCarId, triggerEvent } = useGameStore();
  const navigate = useNavigate();

  const [selectedCarId, setSelectedCarId] = useState(equippedCarId || (cars.length > 0 ? cars[0].id : null));

  const selectedCar = cars.find(c => c.id === selectedCarId);
  const raceStats = selectedCar ? getCarStats(selectedCar.id) : null;
  const perfIndex = raceStats ? Math.round((raceStats.speed + raceStats.acceleration + raceStats.turnSlow + raceStats.turnFast + raceStats.brake + raceStats.traction) / 6) : 0;
  
  const estimatedValue = selectedCar ? Math.floor((selectedCar.cv * 20) * 0.5) : 0;

  const handleSell = async () => {
    if (!selectedCar) return;
    
    // Prevent selling if it's the equipped car (or automatically unequip)
    if (selectedCar.id === equippedCarId) {
       triggerEvent({ type: 'error', title: 'Impossibile', message: "Non puoi vendere l'auto attualmente equipaggiata! Cambia auto prima di procedere."});
       return;
    }

    try {
        const res = await sellCar(userId, selectedCar.id);
        if (res.success) {
            triggerEvent({ type: 'info', title: 'Vendita Completata', message: `Hai incassato €${res.sellValue.toLocaleString()}. L'auto ora si trova al mercato usato.`});
            await refreshGarage(userId);
            await refreshPlayer(userId);
            setSelectedCarId(equippedCarId);
        }
    } catch(e) {
        triggerEvent({ type: 'error', title: 'Errore', message: 'Il passaggio di proprietà ha fallito.'});
    }
  };

  return (
    <Win98Window title="Gestione Parco Auto" imageUrl="/images/garage.png">
      <div className="flex flex-col h-full bg-win98-gray text-black overflow-hidden">
        
        {/* Navigation Tabs */}
        <div className="flex gap-1 p-2 bg-win98-gray border-b-2 border-win98-darkerGray">
           <button 
             onClick={() => navigate('/garage/pilota')}
             className="px-6 py-2 bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray active:border-t-win98-darkerGray active:border-l-win98-darkerGray active:border-b-white active:border-r-white font-bold text-base flex items-center gap-2"
           >
             👤 PILOTA
           </button>
           <button 
             onClick={() => navigate('/garage/auto')}
             className={`px-6 py-2 bg-white border-2 border-win98-darkerGray shadow-win98-inset font-bold text-base flex items-center gap-2`}
           >
             🚗 AUTO
           </button>
        </div>

        <div className="p-4 flex flex-col lg:flex-row gap-4 flex-1 overflow-hidden min-h-0">
          
          {/* Left: Car List Master */}
          <div className="w-full lg:w-1/3 flex flex-col bg-white border-2 border-t-win98-darkerGray border-l-win98-darkerGray border-b-white border-r-white p-3 shadow-win98-inset h-full min-h-0">
             <h3 className="font-bold bg-win98-darkerGray text-white px-2 py-1.5 mb-2 text-base">Veicoli Posseduti ({cars.length})</h3>
             <div className="flex-1 overflow-y-auto space-y-2 pr-1">
               {cars.map(car => (
                  <div 
                    key={car.id} 
                    className={`p-3 border-2 cursor-pointer flex items-center justify-between transition-colors ${selectedCarId === car.id ? 'bg-win98-blue text-white border-black font-bold' : 'bg-win98-gray border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray text-black hover:bg-gray-200'}`}
                    onClick={() => setSelectedCarId(car.id)}
                  >
                     <div className="truncate pr-2 text-base">
                       <span className="mr-2">{car.id === equippedCarId ? '✔️' : '🚗'}</span>
                       {car.brand} {car.name}
                     </div>
                  </div>
               ))}
             {cars.length === 0 && <p className="italic text-gray-500 text-sm">Nessuna auto disponibile.</p>}
           </div>
        </div>

        {/* Right: Detailed View */}
        <div className="w-full md:w-2/3 flex flex-col bg-white border-2 border-t-win98-darkerGray border-l-win98-darkerGray border-b-white border-r-white p-2 shadow-win98-inset h-full overflow-y-auto">
          {selectedCar ? (
            <div className="flex flex-col h-full">
               <h2 className="text-xl font-bold bg-win98-blue text-white px-2 py-1 mb-2 flex justify-between">
                 <span>{selectedCar.brand} {selectedCar.name}</span>
                 <span className="text-yellow-300">IP: {perfIndex}</span>
               </h2>
               
               {/* Big Image & Quick Stats */}
               <div className="flex flex-col xl:flex-row gap-4 mb-4">
                  <div className="w-full xl:w-1/2 h-40 bg-white border-2 border-gray-500 shadow-win98-inset flex items-center justify-center p-2">
                     {selectedCar.image ? (
                        <img src={`/images/car/${selectedCar.image}`} alt={selectedCar.name} className="max-w-full max-h-full object-contain mix-blend-multiply" onError={(e) => e.target.style.display='none'}/>
                     ) : (
                        <span className="text-gray-400 italic font-bold">Nessun file immagine</span>
                     )}
                  </div>
                  
                  <div className="w-full xl:w-1/2 flex flex-col justify-center">
                     <div className="bg-win98-gray border border-gray-400 p-2 text-sm space-y-1">
                        <div className="flex justify-between font-bold border-b border-gray-300">
                           <span>Motore:</span> <span className="text-blue-800">{selectedCar.cv} CV / {selectedCar.nm} Nm</span>
                        </div>
                        <div className="flex justify-between font-bold border-b border-gray-300">
                           <span>Peso:</span> <span>{selectedCar.kg} Kg</span>
                        </div>
                        <div className="flex justify-between font-bold border-b border-gray-300">
                           <span>Trazione:</span> <span>{selectedCar.driveType}</span>
                        </div>
                        <div className="flex justify-between font-bold border-b border-gray-300">
                           <span>Chilometraggio:</span> <span>{selectedCar.km.toLocaleString()} KM</span>
                        </div>
                        <div className="flex justify-between font-bold">
                           <span>Valore Usato:</span> <span className="text-green-700">~ €{estimatedValue.toLocaleString()}</span>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Complete Race Stats Box */}
               <div className="bg-win98-bg text-white p-2 border-2 border-t-gray-500 border-l-gray-500 border-b-white border-r-white mb-4">
                  <h3 className="font-bold font-pixel text-sm mb-1 text-yellow-300 border-b border-gray-500 pb-1">Telemetria e Setup</h3>
                  {raceStats && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs font-bold font-pixel px-1 mt-2">
                       <p>Speed: {raceStats.speed}</p>
                       <p>Accel: {raceStats.acceleration}</p>
                       <p>Brake: {raceStats.brake}</p>
                       <p>Turn S: {raceStats.turnSlow}</p>
                       <p>Turn F: {raceStats.turnFast}</p>
                       <p>Traction: {raceStats.traction}</p>
                    </div>
                  )}
                  <div className="mt-4 p-2 bg-win98-darkerGray border border-gray-400 font-pixel text-[10px] text-white">
                    <span className="text-yellow-400">🔧 SETUP ATTUALE: </span>
                    {selectedCar.mods && selectedCar.mods.length > 0 ? (
                      <span>{selectedCar.mods.length} MODIFICHE INSTALLATE</span>
                    ) : (
                      <span className="text-gray-400 italic">AUTO ORIGINALE (ORANGE STOCK)</span>
                    )}
                  </div>
               </div>
               
               {/* Actions */}
               <div className="mt-auto pt-2 border-t-2 border-win98-darkerGray flex flex-wrap gap-2">
                  <button 
                    onClick={async () => {
                       try {
                           await equipCar(userId, selectedCar.id);
                           setEquippedCarId(selectedCar.id);
                           refreshPlayer(userId);
                       } catch(e) {
                           triggerEvent({ type: 'error', title: 'Errore', message: 'Errore durante equipaggiamento.'});
                       }
                    }}
                    disabled={selectedCar.id === equippedCarId}
                    className={`flex-1 min-w-[120px] py-2 font-bold border-2 ${selectedCar.id === equippedCarId ? 'bg-gray-300 text-gray-500 border-gray-400' : 'bg-win98-gray border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray active:border-t-win98-darkerGray active:border-l-win98-darkerGray active:border-b-white active:border-r-white'} transition-colors`}
                  >
                    {selectedCar.id === equippedCarId ? '✔️ Attiva' : '🏎️ Equipaggia'}
                  </button>

                  <button 
                    onClick={() => navigate(`/garage/auto/${selectedCar.id}`)}
                    className="flex-1 min-w-[120px] py-2 font-bold border-2 bg-win98-gray border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray active:border-t-win98-darkerGray active:border-l-win98-darkerGray active:border-b-white active:border-r-white"
                  >
                    🔍 Dettaglio
                  </button>

                  <button 
                    onClick={handleSell}
                    className="flex-1 min-w-[120px] py-2 font-bold border-2 bg-red-800 text-white border-t-red-400 border-l-red-400 border-b-red-900 border-r-red-900 active:border-t-red-900 active:border-l-red-900 active:border-b-red-400 active:border-r-red-400 transition-colors"
                  >
                    💵 Vendi (€{estimatedValue.toLocaleString()})
                  </button>
               </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center italic text-gray-500">
               Nessun veicolo selezionato.
            </div>
          )}
        </div>
      </div>
    </div>
  </Win98Window>
);
}
