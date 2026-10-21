import React, { useState } from 'react';
import usePlayerStore from '../store/playerStore';
import useGarageStore from '../store/garageStore';
import useGameStore from '../store/gameStore';
import Win98Window from '../components/Win98Window';
import { performCarService } from '../services/api';

export default function Workshop() {
  const { money, id: userId } = usePlayerStore();
  const { equippedCarId, triggerEvent, setEquippedCarId } = useGameStore();
  const { cars } = useGarageStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const equippedCar = cars.find(c => c.id === equippedCarId);

  // Helper to calculate KM malus level
  const getKmMalusLabel = (car) => {
    if (!car) return null;
    const diffKm = car.km - (car.serviceKm || 0);
    if (diffKm >= 400000) return { label: 'CRITICO (100%)', color: 'text-red-600' };
    if (diffKm >= 300000) return { label: 'GRAVE (50%)', color: 'text-red-600' };
    if (diffKm >= 200000) return { label: 'ELEVATO (10%)', color: 'text-orange-600' };
    if (diffKm >= 100000) return { label: 'LIEVE (1%)', color: 'text-yellow-600' };
    return { label: 'NESSUNO', color: 'text-green-600' };
  };

  const SERVICES = [
    { id: 'engine', name: 'Tagliando', desc: 'Olio, filtri e reset KM malus. Ripristina salute motore.', price: 150, image: 'oil.png' },
    { id: 'tires', name: 'Cambio Gomme', desc: 'Nuova mescola per massimo grip.', price: 500, image: 'tyre.png' },
    { id: 'rebuild', name: 'Rifare Motore', desc: 'Revisione completa. Necessario se il motore è fuso (0%).', price: 2500, image: 'rebuild.png' },
    { id: 'full', name: 'Riparare Auto', desc: 'Ripristino totale (Motore, Gomme e KM malus).', price: 3500, image: 'repair.png' },
  ];

  const handleMaintenance = async (service) => {
    if (!equippedCar) {
      triggerEvent({ type: 'error', title: 'Nessuna Auto', message: 'Scegli un\'auto dal piazzale.' });
      return;
    }

    if (isProcessing) return;
    if (service.id === 'engine' && equippedCar.engineHealth <= 0) {
      triggerEvent({ type: 'error', title: 'Motore fuso', message: 'Serve una revisione completa del motore.' });
      return;
    }

    // Logic for "is it already at 100%?"
    const diffKm = equippedCar.km - (equippedCar.serviceKm || 0);
    const needsKmReset = (service.id === 'engine' || service.id === 'full' || service.id === 'rebuild') && diffKm >= 100000;
    const needsEngineHealth = (service.id === 'engine' || service.id === 'full' || service.id === 'rebuild') && equippedCar.engineHealth < 100;
    const needsTires = (service.id === 'tires' || service.id === 'full') && equippedCar.tireGrip < 100;

    if (!needsKmReset && !needsEngineHealth && !needsTires) {
      triggerEvent({ type: 'info', title: 'A posto', message: 'Questo componente è già in perfette condizioni.' });
      return;
    }

    if (money < service.price) {
      triggerEvent({ type: 'error', title: 'Fondi Insufficienti', message: 'Il meccanico non ti fa credito.' });
      return;
    }

    try {
      setIsProcessing(true);
      const res = await performCarService(equippedCar.id, userId, service.id);
      
      if (res.success) {
        triggerEvent({ type: 'info', title: 'Lavoro Eseguito', message: `Hai speso €${service.price} per ${service.name}.` });
      }
    } catch {
      triggerEvent({ type: 'error', title: 'Errore Officina', message: 'Il meccanico ha avuto un problema con la fattura.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Win98Window title="Officina Meccanica" imageUrl="/images/workshop.png">
      <div className="p-4 flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Services */}
        <div className="flex-1 space-y-4">
          <h2 className="text-xl font-bold bg-win98-darkerGray text-white px-2">Servizi di Manutenzione</h2>
          
          <div className="grid grid-cols-1 gap-3">
            {SERVICES.map(service => (
              <div key={service.id} className="bg-win98-gray p-3 border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray flex items-center gap-4">
                <div className="w-16 h-16 bg-white border-2 border-win98-darkerGray flex-shrink-0 flex items-center justify-center overflow-hidden">
                  <img 
                    src={`/images/work/${service.image}`} 
                    alt={service.name} 
                    className="w-full h-full object-contain"
                    onError={(e) => { e.target.src = '/images/workshop.png'; }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg leading-tight">{service.name}</h3>
                  <p className="text-sm text-gray-700">{service.desc}</p>
                </div>
                <button 
                  onClick={() => handleMaintenance(service)}
                  disabled={isProcessing}
                  className={`bg-win98-gray h-10 px-4 border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray active:border-t-win98-darkerGray active:border-l-win98-darkerGray active:border-b-white active:border-r-white font-bold whitespace-nowrap ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  €{service.price}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Garage Inventory */}
        <div className="w-full lg:w-80 flex flex-col">
          <h2 className="text-xl font-bold bg-win98-darkerGray text-white px-2 mb-2">Il Tuo Piazzale</h2>
          <div className="bg-white border-2 border-t-win98-darkerGray border-l-win98-darkerGray border-b-white border-r-white p-2 shadow-win98-inset">
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {cars.map(car => {
                const kmMalus = getKmMalusLabel(car);
                return (
                  <div 
                    key={car.id} 
                    className={`p-2 border-2 cursor-pointer ${car.id === equippedCarId ? 'bg-win98-blue text-white font-bold' : 'bg-win98-gray border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray text-black'}`}
                    onClick={() => setEquippedCarId(car.id)}
                  >
                    <div className="flex justify-between items-center text-sm">
                      <span className="truncate mr-2">{car.name}</span>
                      <span className="text-xs opacity-80">{car.km.toLocaleString()} KM</span>
                    </div>
                    <div className="text-[10px] mt-1 grid grid-cols-2 gap-x-2">
                      <div className="flex justify-between">
                        <span>Motore:</span>
                        <span className={car.engineHealth < 50 ? (car.id === equippedCarId ? 'text-yellow-300' : 'text-red-600') : ''}>
                          {car.engineHealth === 0 ? 'FUSO' : `${car.engineHealth}%`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gomme:</span>
                        <span className={car.tireGrip < 50 ? (car.id === equippedCarId ? 'text-yellow-300' : 'text-red-600') : ''}>{car.tireGrip}%</span>
                      </div>
                      <div className="col-span-2 flex justify-between mt-1 border-t border-black/10 pt-1">
                        <span>Usura KM:</span>
                        <span className={kmMalus.color}>{kmMalus.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {cars.length === 0 && <p className="p-4 italic text-gray-400">Piazzale vuoto.</p>}
            </div>
          </div>
          {equippedCar && equippedCar.engineHealth === 0 && (
             <div className="mt-4 bg-red-600 text-white p-2 font-bold text-center border-2 border-white animate-pulse">
                ATTENZIONE: MOTORE FUSO!<br/>
                L'AUTO NON PUÒ GAREGGIARE.
             </div>
          )}
        </div>

      </div>
    </Win98Window>
  );
}
