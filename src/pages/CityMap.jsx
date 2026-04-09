import React from 'react';
import { useNavigate } from 'react-router-dom';
import useGameStore from '../store/gameStore';
import Win98Window from '../components/Win98Window';

const LOCATIONS = [
  { path: '/garage',        name: 'Garage / Casa',      id: 'garage',    image: '/images/garage.png', desc: 'Il tuo quartier generale' },
  { path: '/dealership',    name: 'Concessionario',     id: 'dealership',image: '/images/dealer.png', desc: 'Auto nuove di zecca' },
  { path: '/track-race',    name: 'Autodromo',          id: 'track',     image: '/images/track.png', desc: 'Gare ufficiali in pista' },
  { path: '/workshop',      name: 'Meccanico',          id: 'workshop',  image: '/images/workshop.png', desc: 'Riparazioni e tagliandi' },
  { path: '/parts-shop',    name: 'Negozio Tuning',     id: 'parts',     image: '/images/shop.png',  desc: 'Potenzia il tuo bolide' },
  { path: '/used-cars',     name: 'Auto Usate',         id: 'used',      image: '/images/used.png', desc: 'Forum compravendita' },
  { path: '/gas-station',   name: 'Benzinaio',          id: 'fuel',      image: '/images/fuel.png', desc: 'Fai il pieno' },
  { path: '/meet',          name: 'Car Meet',           id: 'meet',      image: '/images/meet.png', desc: 'Piazzale raduno' },
  { path: '/street-racing', name: 'Corse Clandestine',  id: 'street',    image: '/images/street.png', desc: 'Solo per i coraggiosi' },
];

export default function CityMap() {
  const navigate = useNavigate();
  const { travel } = useGameStore();

  const handleNavigate = (path) => {
    const canTravel = travel(path);
    if (canTravel) {
      navigate(path);
    }
  };

  return (
    <Win98Window title="Mappa della Città">
      <div 
        className="p-3 flex flex-col h-full bg-cover bg-center"
        style={{ backgroundImage: "url('/images/city.png')" }}
      >

        {/* Header */}
        <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-win98-darkerGray shrink-0 bg-white/80 p-2">
          <span className="text-2xl">🗺️</span>
          <h2 className="text-xl font-bold font-pixel text-black">Dove vuoi andare?</h2>
        </div>

        {/* Grid - flex-1 so it grows to fill available space */}
        <div className="flex-1 grid grid-cols-3 gap-3 content-start">
          {LOCATIONS.map(loc => (
            <button
              key={loc.id}
              onClick={() => handleNavigate(loc.path)}
              className="
                group relative
                bg-win98-gray
                border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray
                flex flex-col items-center justify-end
                hover:opacity-95
                active:border-t-win98-darkerGray active:border-l-win98-darkerGray
                active:border-b-white active:border-r-white
                transition-all duration-75
                h-32 w-full
                shadow-[2px_2px_0_rgba(0,0,0,0.15)]
                overflow-hidden
              "
            >
              <img 
                src={loc.image} 
                alt={loc.name} 
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                style={{ imageRendering: 'pixelated' }}
              />
              
              <div className="relative w-full bg-win98-gray/95 border-t-2 border-win98-darkerGray px-1 py-1.5 z-10 shadow-sm text-center">
                <span className="block font-bold text-xs font-pixel leading-tight text-black truncate">
                  {loc.name}
                </span>
                <span className="text-[9px] text-gray-800 leading-tight hidden md:block truncate mt-[1px]">
                  {loc.desc}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Footer tip */}
        <div className="mt-3 p-2 bg-win98-bg text-white text-xs font-pixel border-2 border-win98-darkerGray shrink-0">
          💡 Ogni spostamento consuma carburante. Fai il pieno al Benzinaio!
        </div>

      </div>
    </Win98Window>
  );
}
