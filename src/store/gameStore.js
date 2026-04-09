import { create } from 'zustand';
import useGarageStore from './garageStore';
import usePlayerStore from './playerStore';

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

  travel: (destinationPath, fuelCost = 0) => {
    if (destinationPath === '/map' || destinationPath === '/' || destinationPath === '/garage' || destinationPath === '/dealership' || destinationPath === '/used-cars') return true;

    const state = get();
    // 1. Get current car from garage store
    const garage = useGarageStore.getState();
    const player = usePlayerStore.getState();
    
    if (!state.equippedCarId) {
      set({ activeEvent: { type: 'error', title: 'Errore Sistema', message: 'Nessuna auto equipaggiata!' }});
      return false;
    }
    
    const car = garage.cars.find(c => c.id === state.equippedCarId);
    if (!car) return false;
    
    // 2. Check Fuel logic for traveling
    if (car.currentFuel < fuelCost) {
      // Out of fuel penalty!
      player.removeMoney(200);
      set({ 
        activeEvent: { 
          type: 'error', 
          title: 'Errore Fatale', 
          message: 'Sei a secco! Il carro attrezzi ti ha addebitato 200€ e ti ha riportato in Officina.' 
        },
        currentLocation: '/workshop'
      });
      return false; // Prevent travel to requested dest
    }
    
    garage.updateCarFuel(car.id, -fuelCost);
    garage.addKM(car.id, 5);
    // set({ currentLocation: destinationPath }); // Don't set here anymore, let router do it
    
    // 4. RNG 5% Barn Find logic
    const rng = Math.random();
    if (rng < 0.05) {
      set({ 
        activeEvent: { 
          type: 'barn', 
          title: 'Barn Find!', 
          message: 'Hai scorto un fienile abbandonato durante il tragitto... forse c\'è qualcosa dentro!' 
        }
      });
    }
    
    return true; // Travel success
  }
}));

export default useGameStore;
