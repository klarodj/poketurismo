import React from 'react';
import usePlayerStore from '../store/playerStore';
import useGarageStore from '../store/garageStore';
import useGameStore from '../store/gameStore';
import Win98Window from '../components/Win98Window';

export default function GarageHome() {
  const { username, money, level, xp, stats } = usePlayerStore();
  const { cars, getCarStats } = useGarageStore();
  const { equippedCarId, setEquippedCarId } = useGameStore();

  const equippedCar = cars.find(c => c.id === equippedCarId);

  return (
    <Win98Window title="Garage / Casa" imageUrl="/images/garage.png">
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
        
        {/* Left: Player ID Card */}
        <div className="bg-white border-2 border-t-win98-darkerGray border-l-win98-darkerGray border-b-white border-r-white p-4 shadow-win98-inset">
          <h2 className="text-xl font-bold bg-win98-blue text-white px-2 mb-4">Profilo Pilota</h2>
          <div className="flex gap-4 mb-4">
             <div className="w-24 h-24 bg-gray-300 border-2 border-gray-500 overflow-hidden">
                <img src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=Pilota${level}`} alt="Avatar" className="w-full h-full object-cover"/>
             </div>
             <div className="flex-1 text-sm font-bold">
               <p>Utente: {username}</p>
               <p>Livello: {level} ({xp} XP)</p>
               <p>Saldo: €{money.toLocaleString()}</p>
             </div>
          </div>
          <div className="bg-win98-gray p-2 border border-gray-400 font-bold text-xs space-y-1">
             <div className="flex justify-between"><span>Brave (Coraggio):</span> <span>{stats.brave}</span></div>
             <div className="flex justify-between"><span>Clean (Pulizia):</span> <span>{stats.clean}</span></div>
             <div className="flex justify-between"><span>Reflex (Riflessi):</span> <span>{stats.reflex}</span></div>
             <div className="flex justify-between"><span>Shift (Cambiata):</span> <span>{stats.shift}</span></div>
          </div>
        </div>

        {/* Right: Garage Inventory */}
        <div className="bg-white border-2 border-t-win98-darkerGray border-l-win98-darkerGray border-b-white border-r-white p-2 h-[450px] overflow-auto shadow-win98-inset">
          <h2 className="text-xl font-bold bg-win98-darkerGray text-white px-2 mb-2">Il Tuo Piazzale</h2>
          
          <div className="space-y-3">
            {cars.map(car => {
              const raceStats = getCarStats(car.id);
              const perfIndex = raceStats ? Math.round((raceStats.speed + raceStats.acceleration + raceStats.turnSlow + raceStats.turnFast + raceStats.brake + raceStats.traction) / 6) : (Math.round(car.cv + (car.nm||0)/2 - (car.kg||0)*0.1));
              
              return (
                <div 
                  key={car.id} 
                  className={`p-2 border-2 flex flex-col sm:flex-row gap-3 items-center ${car.id === equippedCarId ? 'bg-win98-blue text-white font-bold border-black shadow-[inset_1px_1px_0_0_#ffffff]' : 'bg-win98-gray border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray cursor-pointer hover:bg-gray-200'}`}
                  onClick={() => setEquippedCarId(car.id)}
                >
                  <div className="w-full sm:w-1/3 h-20 sm:h-24 bg-white border-2 border-t-win98-darkerGray border-l-win98-darkerGray border-b-white border-r-white overflow-hidden flex items-center justify-center shrink-0 shadow-win98-inset">
                    {car.image ? (
                      <img src={`/images/car/${car.image}`} alt={car.name} className="h-full w-auto max-w-full object-contain mix-blend-multiply" onError={(e) => e.target.style.display='none'} />
                    ) : (
                      <span className="text-[10px] text-gray-500 italic">No Img</span>
                    )}
                  </div>
                  
                  <div className="flex-1 w-full flex flex-col justify-between h-full">
                    <div className="flex flex-col font-bold text-sm leading-tight mb-1">
                      <span className="truncate">{car.brand} {car.name}</span>
                      <span className={car.id === equippedCarId ? 'text-yellow-300 text-xs' : 'text-blue-800 text-xs'}>IP: {perfIndex > 0 ? perfIndex : 'N/A'}</span>
                    </div>
                    
                    <div className="text-[10px] grid grid-cols-2 gap-y-1 mb-1">
                      <span>KM: {car.km ? car.km.toLocaleString() : 0}</span>
                      <span>Benz: {car.currentFuel?.toFixed(1) || 0}L</span>
                      <span>Motore: {car.engineHealth || 0}%</span>
                      <span>Gomme: {car.tireGrip || 0}%</span>
                    </div>

                    {car.id !== equippedCarId && (
                      <button 
                         className="mt-1 text-xs w-full bg-win98-gray text-black border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray active:border-t-win98-darkerGray active:border-l-win98-darkerGray active:border-b-white active:border-r-white font-bold py-1 transition-colors"
                         onClick={(e) => { e.stopPropagation(); setEquippedCarId(car.id); }}
                      >
                        Scegli / Equipaggia
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {cars.length === 0 && <p className="p-4 italic text-gray-400">Nessuna auto nel garage.</p>}
          </div>
        </div>

      </div>
    </Win98Window>
  );
}
