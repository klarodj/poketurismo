import PilotAvatar from './PilotAvatar';
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import usePlayerStore from '../store/playerStore';
import useGarageStore from '../store/garageStore';
import useGameStore from '../store/gameStore';
import FuelGauge from './FuelGauge';
import useRaceStore from '../store/raceStore';
import AccountContext from '../contexts/AccountContext';

export default function HUD() {
  const navigate = useNavigate();
  const account = useContext(AccountContext);
  const activeRace = useRaceStore(state => state.activeRace);
  const { money, level, username, avatar } = usePlayerStore();
  const { equippedCarId, toggleHistory, travel } = useGameStore();
  const { cars } = useGarageStore();
  
  const handleMapClick = () => {
    if (travel('/map', 0)) {
       navigate('/map');
    }
  };

  const equippedCar = cars.find(c => c.id === equippedCarId);

  return (
    <div className="w-full bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray flex flex-row flex-wrap justify-between items-center px-2 py-1.5 shadow-win98-outset z-50 relative gap-2">
      <div className="flex flex-wrap gap-1.5 sm:gap-4 items-center min-w-0 max-w-full">
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
        <button 
          onClick={() => {
            if (travel('/dev-sandbox', 0)) {
               navigate('/dev-sandbox');
            }
          }}
          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray active:border-t-win98-darkerGray active:border-l-win98-darkerGray active:border-b-white active:border-r-white text-lg sm:text-xl"
          title="Dev Sandbox"
        >
          🔧
        </button>
        
        {activeRace && <button className="bg-yellow-200 text-black border px-2 py-1 text-xs font-bold" onClick={() => navigate(`${activeRace.mode === 'street' ? '/street-racing' : '/track-race'}?raceId=${activeRace.id}`)}>Riprendi gara</button>}
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

      <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4 min-w-0 max-w-full ml-auto">
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
        {account && <>
          <button type="button" className="pilot-name-with-avatar text-sm font-bold" onClick={()=>navigate('/garage/pilota')} title="Apri il profilo pilota"><PilotAvatar avatar={avatar} size={32} decorative/><span className="truncate max-w-[100px] sm:max-w-[160px]">{username}</span></button>
          <button type="button" className="win98-btn" onClick={account.logout} disabled={account.busy} aria-label="Esci dalla partita">Esci</button>
        </>}
      </div>
    </div>
  );
}
