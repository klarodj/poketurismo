import PhoneBridge from './PhoneBridge';
import PhoneNotification from './PhoneNotification';
import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import useGameStore from '../store/gameStore';
import HUD from './HUD';
import useRaceStore from '../store/raceStore';
import useRequestStore from '../store/requestStore';
import NokiaModal from './NokiaModal';
import Win98ErrorDialog from './Win98ErrorDialog';

export default function Layout() {
  const location = useLocation();
  const race = useRaceStore(state => state.race);
  const inChampionship = location.pathname === '/track-race' && !!(race?.gridOpponentId || race?.championship?.format === 'grid');
  const { pending, error, retry } = useRequestStore();
  const currentLocation = useGameStore(state => state.currentLocation);
  const setLocation = useGameStore(state => state.setLocation);

  useEffect(() => {
    // Sync store with the router's current path (single source of truth)
    if (location.pathname !== currentLocation) {
      setLocation(location.pathname);
    }
  }, [location.pathname, currentLocation, setLocation]);



  return (
    <div className={`period-desktop ${inChampionship ? 'championship-desktop' : ''} min-h-screen flex flex-col items-center justify-start p-4 bg-win98-bg`}>
      <PhoneBridge />
      <NokiaModal />
      <PhoneNotification />
      <Win98ErrorDialog />

      {/* HUD Bar */}
      <div className="w-full max-w-5xl mb-2 flex-shrink-0">
        <HUD />
      </div>

      {/* Main Container - expands with content */}
      <div className="w-full max-w-5xl bg-win98-gray border-2 border-t-white border-l-white border-b-win98-darkerGray border-r-win98-darkerGray shadow-[2px_2px_0_0_#000000] flex flex-col">
        {/* Main Execution Area */}
        <div className="flex flex-col">
          {/* Content View */}
          <div className="w-full bg-white border-2 border-t-win98-darkerGray border-l-win98-darkerGray border-b-white border-r-white shadow-[inset_1px_1px_0_0_#000000]">
            {error && <div role="alert" className="bg-red-100 text-red-900 p-3">{error} {retry && <button disabled={pending > 0} className="underline font-bold" onClick={retry}>Riprova operazione</button>}</div>}
            {pending > 0 && <span className="sr-only" role="status">Salvataggio in corso…</span>}
            <fieldset disabled={pending > 0} className="min-w-0"><Outlet /></fieldset>
          </div>
        </div>
      </div>
    </div>
  );
}
