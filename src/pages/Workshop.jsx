import React from 'react';
import usePlayerStore from '../store/playerStore';
import useGarageStore from '../store/garageStore';
import useGameStore from '../store/gameStore';
import Win98Window from '../components/Win98Window';

export default function Workshop() {
  const { money, removeMoney } = usePlayerStore();
  const { equippedCarId, triggerEvent } = useGameStore();
  const { cars, restoreWear, setEquippedCarId } = useGarageStore();

  const equippedCar = cars.find(c => c.id === equippedCarId);

  const SERVICES = [
    { id: 'engine', name: 'Tagliando', desc: 'Sostituzione olio e filtri. Ripristina salute motore.', price: 150, image: 'oil.png' },
    { id: 'tires', name: 'Cambio Gomme', desc: 'Nuova mescola per massimo grip.', price: 500, image: 'tyre.png' },
    { id: 'rebuild', name: 'Rifare Motore', desc: 'Revisione completa del blocco motore.', price: 2500, image: 'rebuild.png' },
    { id: 'full', name: 'Riparare Auto', desc: 'Ripristino totale meccanica e carrozzeria.', price: 3500, image: 'repair.png' },
  ];

  const handleMaintenance = (service) => {
    if (!equippedCar) {
      triggerEvent({ type: 'error', title: 'Nessuna Auto', message: 'Scegli un\'auto dal piazzale.' });
      return;
    }

    const currentHealth = service.id === 'tires' ? equippedCar.tireGrip : (service.id === 'full' ? Math.min(equippedCar.engineHealth, equippedCar.tireGrip) : equippedCar.engineHealth);

    if (currentHealth === 100 && service.id !== 'full') {
      triggerEvent({ type: 'info', title: 'A posto', message: 'Questo componente è già in perfette condizioni.' });
      return;
    }

    if (money >= service.price) {
      removeMoney(service.price);
      restoreWear(equippedCarId, service.id);
      triggerEvent({ type: 'info', title: 'Lavoro Eseguito', message: `Hai speso €${service.price} per ${service.name}.` });
    } else {
      triggerEvent({ type: 'error', title: 'Fondi Insufficienti', message: 'Il meccanico non ti fa credito.' });
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
                  className="bg-win98-gray h-10 px-4 border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray active:border-t-win98-darkerGray active:border-l-win98-darkerGray active:border-b-white active:border-r-white font-bold whitespace-nowrap"
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
          <div className="flex-1 bg-white border-2 border-t-win98-darkerGray border-l-win98-darkerGray border-b-white border-r-white p-2 min-h-[300px] overflow-auto shadow-win98-inset">
            <div className="space-y-2">
              {cars.map(car => (
                <div 
                  key={car.id} 
                  className={`p-2 border-2 cursor-pointer ${car.id === equippedCarId ? 'bg-win98-blue text-white font-bold' : 'bg-win98-gray border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray text-black'}`}
                  onClick={() => setEquippedCarId(car.id)}
                >
                  <div className="flex justify-between items-center text-sm">
                    <span className="truncate mr-2">{car.name}</span>
                    <span className="text-xs opacity-80">{car.km.toLocaleString()} KM</span>
                  </div>
                  <div className="text-xs mt-1 grid grid-cols-2 gap-x-2">
                    <div className="flex justify-between">
                      <span>Motore:</span>
                      <span className={car.engineHealth < 50 ? (car.id === equippedCarId ? 'text-yellow-300' : 'text-red-600') : ''}>{car.engineHealth}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gomme:</span>
                      <span className={car.tireGrip < 50 ? (car.id === equippedCarId ? 'text-yellow-300' : 'text-red-600') : ''}>{car.tireGrip}%</span>
                    </div>
                  </div>
                </div>
              ))}
              {cars.length === 0 && <p className="p-4 italic text-gray-400">Piazzale vuoto.</p>}
            </div>
          </div>
        </div>

      </div>
    </Win98Window>
  );
}
