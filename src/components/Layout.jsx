import React, { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import useGameStore from '../store/gameStore';
import HUD from './HUD';
import NokiaModal from './NokiaModal';
import Win98ErrorDialog from './Win98ErrorDialog';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentLocation = useGameStore(state => state.currentLocation);
  const setLocation = useGameStore(state => state.setLocation);
  const travel = useGameStore(state => state.travel);

  useEffect(() => {
    // Sync store with the router's current path (single source of truth)
    if (location.pathname !== currentLocation) {
      setLocation(location.pathname);
    }
  }, [location.pathname, currentLocation, setLocation]);

  // Determine submenus based on path
  const getSubMenus = () => {
    const path = location.pathname;
    if (path.includes('dealership')) {
      return [{ label: 'Nuovo Ordine', path: '/dealership' }, { label: 'Brands', path: '#' }];
    }
    if (path.includes('workshop')) {
      return [{ label: 'Riparazioni', path: '/workshop' }, { label: 'Tagliando', path: '#' }];
    }
    if (path.includes('garage')) {
      return [{ label: '👤 Pilota', path: '/garage/pilota' }, { label: '🚗 Auto', path: '/garage/auto' }];
    }
    return [{ label: 'Nessuna Azione', path: '#' }];
  };

  const localNavLinks = getSubMenus();

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-4 bg-win98-bg">
      <NokiaModal />
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
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
