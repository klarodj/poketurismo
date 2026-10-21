import { create } from 'zustand';
import useGarageStore from './garageStore';

const useGameStore = create((set, get) => ({
  currentLocation: '/map',
  equippedCarId: null, // Initialized from playerStore/API later
  
  // Game events (sys messages, barn finds, errors)
  activeEvent: null, // { type: 'info' | 'error' | 'barn', message: string, title: string }
  notifications: [], // array of past events
  isHistoryOpen: false, // flag for the history modal
  
  setLocation: (path) => set({ currentLocation: path }),
  setEquippedCarId: (id) => set({ equippedCarId: id }),
  clearEvent: () => set({ activeEvent: null }),
  triggerEvent: (event) => set((state) => ({ 
    activeEvent: event,
    notifications: [{ ...event, timestamp: new Date().toLocaleTimeString() }, ...state.notifications]
  })),
  toggleHistory: () => set((state) => ({ isHistoryOpen: !state.isHistoryOpen })),

  // City navigation is free; race distances and fuel are recorded by the server.
  travel: destinationPath => {
    if (['/map', '/', '/garage', '/dealership', '/used-cars', '/racing'].includes(destinationPath)) return true;
    const car = useGarageStore.getState().cars.find(car => car.id === get().equippedCarId);
    if (car) return true;
    set({ activeEvent: { type: 'error', title: 'Nessuna auto', message: 'Equipaggia prima una vettura dal garage.' } });
    return false;
  }
}));
export default useGameStore;
