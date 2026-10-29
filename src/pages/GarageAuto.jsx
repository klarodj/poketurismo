import PerformanceBadge from '../components/PerformanceBadge';
import {carArtwork} from '../../shared/carArtwork.mjs';
import {paintFor,paintName} from '../../shared/carPaint.mjs';
import ClubRecoveryHint from '../components/ClubRecoveryHint';
import RaceDetailDialog from '../components/RaceDetailDialog';
import useRaceStore from '../store/raceStore';
import useRequestStore from '../store/requestStore';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usePlayerStore from '../store/playerStore';
import useGarageStore from '../store/garageStore';
import useGameStore from '../store/gameStore';
import Win98Window from '../components/Win98Window';
import GarageTabs from '../components/GarageTabs';
import { sellCar, equipCar } from '../services/api';

import { CAR_STAT_LABELS } from '../logic/raceEngine';

export default function GarageAuto() {
  const { id: userId } = usePlayerStore();
  const { cars, getCarStats } = useGarageStore();
  const { equippedCarId, setEquippedCarId, triggerEvent } = useGameStore();
  const navigate = useNavigate();
  const activeRace=useRaceStore(s=>s.activeRace),pending=useRequestStore(s=>s.pending);
  const [selling,setSelling]=useState(false);

  const [selectedCarId, setSelectedCarId] = useState(null);

  const selectedCar = cars.find(c => c.id === selectedCarId) || cars.find(c => c.id === equippedCarId) || cars[0];
  const raceStats = selectedCar ? getCarStats(selectedCar.id) : null;
  
  const estimatedValue = selectedCar?.resaleValue ?? 0;

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
            setSelectedCarId(equippedCarId);
            setSelling(false);
        }
    } catch {
        triggerEvent({ type: 'error', title: 'Errore', message: 'Il passaggio di proprietà ha fallito.'});
    }
  };

  if(!cars.length)return <Win98Window guideId="garage" title="Il tuo garage" imageUrl="/images/world/garage.png"><GarageTabs/><ClubRecoveryHint/><div className="period-page"><h1>Qui inizia la tua collezione</h1><p>Il garage è ancora vuoto. Cerca un usato per partire, oppure sfoglia il nuovo.</p><button className="win98-btn" onClick={()=>navigate('/used-cars')}>Cerca la prima auto usata</button><button className="win98-btn" onClick={()=>navigate('/dealership')}>Visita il concessionario</button><p>La scuola guida ti presta una vettura anche prima del primo acquisto.</p></div></Win98Window>;
  return (
    <Win98Window guideId="garage" title="Gestione Parco Auto" imageUrl="/images/world/garage.png">
      <div className="flex flex-col bg-win98-gray text-black">
        
        <GarageTabs /><ClubRecoveryHint/>{activeRace&&<p className="period-notice">Auto e preparazione bloccate durante la gara. Puoi consultare tutte le schede.</p>}

        <div className="p-4 flex flex-col lg:flex-row gap-4">
          
          {/* Left: Car List Master */}
          <div className="w-full lg:w-1/3 flex flex-col bg-white border-2 border-t-win98-darkerGray border-l-win98-darkerGray border-b-white border-r-white p-3 shadow-win98-inset">
             <h3 className="font-bold bg-win98-darkerGray text-white px-2 py-1.5 mb-2 text-base">Veicoli Posseduti ({cars.length})</h3>
             <div className="space-y-2 pr-1">
               {cars.map(car => (
                  <button type="button"
                    key={car.id} 
                    className={`w-full text-left p-3 border-2 cursor-pointer flex items-center justify-between transition-colors ${selectedCarId === car.id ? 'bg-win98-blue text-white border-black font-bold' : 'bg-win98-gray border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray text-black hover:bg-gray-200'}`}
                    onClick={() => setSelectedCarId(car.id)}
                  >
                     <div className="truncate pr-2 text-base">
                       <span className="mr-2">{car.id === equippedCarId ? '✔️' : '🚗'}</span>
                       {car.brand} {car.name}
                     </div><PerformanceBadge car={car}/>
                  </button>
               ))}
             {cars.length === 0 && <p className="italic text-gray-500 text-sm">Nessuna auto disponibile.</p>}
           </div>
        </div>

        {/* Right: Detailed View */}
        <div className="w-full lg:w-2/3 min-w-0 flex flex-col bg-white border-2 border-t-win98-darkerGray border-l-win98-darkerGray border-b-white border-r-white p-2 shadow-win98-inset">
          {selectedCar ? (
            <div className="flex flex-col h-full">
               <h2 className="text-xl font-bold bg-win98-blue text-white px-2 py-1 mb-2 flex justify-between">
                 <span>{selectedCar.brand} {selectedCar.name}{selectedCar.racePrepared?' · DA GARA · SOLO PISTA':''}</span>
                 <PerformanceBadge car={selectedCar}/>
               </h2>
               
               {/* Big Image & Quick Stats */}
               <div className="flex flex-col xl:flex-row gap-4 mb-4">
                  <div className="w-full xl:w-1/2 h-40 bg-white border-2 border-gray-500 shadow-win98-inset flex items-center justify-center p-2">
                     {selectedCar.image ? (
                        <img src={carArtwork(selectedCar)} alt={`${selectedCar.name} · ${selectedCar.racePrepared?'Livrea da gara':paintName(paintFor(selectedCar))}`} className="max-w-full max-h-full object-contain pixel-car-image" onError={(e) => e.target.style.display='none'}/>
                     ) : (
                        <span className="text-gray-400 italic font-bold">Nessun file immagine</span>
                     )}
                  </div>
                  
                  <div className="w-full xl:w-1/2 flex flex-col justify-center">
                     <div className="bg-win98-gray border border-gray-400 p-2 text-sm space-y-1"><div className="flex justify-between"><span>Colore:</span><strong>{selectedCar.racePrepared?'Livrea da gara':paintName(paintFor(selectedCar))}</strong></div>
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
               <details className="garage-setup bg-win98-bg text-white p-2 border-2 border-t-gray-500 border-l-gray-500 border-b-white border-r-white mb-4">
                  <summary className="font-bold">Caratteristiche e preparazione</summary>
                  {raceStats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-[10px] font-bold font-pixel px-1 mt-2 uppercase">
                       <p className="flex justify-between border-b border-gray-600 pb-0.5"><span>{CAR_STAT_LABELS.speed}</span> <span className="text-white">{raceStats.speed}</span></p>
                       <p className="flex justify-between border-b border-gray-600 pb-0.5"><span>{CAR_STAT_LABELS.acceleration}</span> <span className="text-white">{raceStats.acceleration}</span></p>
                       <p className="flex justify-between border-b border-gray-600 pb-0.5"><span>{CAR_STAT_LABELS.revving}</span> <span className="text-white">{raceStats.revving}</span></p>
                       <p className="flex justify-between border-b border-gray-600 pb-0.5"><span>{CAR_STAT_LABELS.transmission}</span> <span className="text-white">{raceStats.transmission}</span></p>
                       <p className="flex justify-between border-b border-gray-600 pb-0.5"><span>{CAR_STAT_LABELS.brake}</span> <span className="text-white">{raceStats.brake}</span></p>
                       <p className="flex justify-between border-b border-gray-600 pb-0.5"><span>{CAR_STAT_LABELS.traction}</span> <span className="text-white">{raceStats.traction}</span></p>
                       <p className="flex justify-between border-b border-gray-600 pb-0.5"><span>{CAR_STAT_LABELS.turnSlow}</span> <span className="text-white">{raceStats.turnSlow}</span></p>
                       <p className="flex justify-between border-b border-gray-600 pb-0.5"><span>{CAR_STAT_LABELS.turnFast}</span> <span className="text-white">{raceStats.turnFast}</span></p>
                    </div>
                  )}
                  <div className="mt-4 p-2 bg-win98-darkerGray border border-gray-400 font-pixel text-[10px] text-white">
                    <span className="text-yellow-400">🔧 SETUP ATTUALE: </span>
                    {selectedCar.mods && selectedCar.mods.length > 0 ? (
                      <span>{selectedCar.mods.length} MODIFICHE INSTALLATE</span>
                    ) : (
                      <span className="text-gray-400 italic">Auto di serie</span>
                    )}
                  </div>
               </details>
               
               <p className="period-status">Motore {Math.round(selectedCar.engineHealth)}% · gomme {Math.round(selectedCar.tireGrip)}% · {selectedCar.currentFuel.toFixed(1)} L</p>
               {/* Actions */}
               <div className="mt-auto pt-2 border-t-2 border-win98-darkerGray flex flex-wrap gap-2">
                  <button 
                    onClick={async () => {
                       try {
                           await equipCar(userId, selectedCar.id);
                           setEquippedCarId(selectedCar.id);
                       } catch {
                           triggerEvent({ type: 'error', title: 'Errore', message: 'Errore durante equipaggiamento.'});
                       }
                    }}
                    disabled={pending>0||!!activeRace||selectedCar.id === equippedCarId}
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
                    disabled={pending>0||!!activeRace||selectedCar.id===equippedCarId}
                    onClick={()=>setSelling(true)}
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
  {selling&&selectedCar&&<RaceDetailDialog title="Passaggio di proprietà" onClose={()=>setSelling(false)} closeLabel="Conserva l’auto"><p>Vuoi vendere <strong>{selectedCar.brand} {selectedCar.name}</strong> per <strong>€{estimatedValue.toLocaleString('it-IT')}</strong>?</p><p>La vettura e i suoi ricambi installati passano al mercatino.</p><button className="win98-btn" disabled={pending>0||!!activeRace||selectedCar.id===equippedCarId} onClick={handleSell}>Conferma vendita · €{estimatedValue.toLocaleString('it-IT')}</button></RaceDetailDialog>}
  </Win98Window>
);
}
