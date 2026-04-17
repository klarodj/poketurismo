import { create } from 'zustand';
import { calculateRaceStats } from '../logic/raceEngine';
import { fetchGarage } from '../services/api';

const useGarageStore = create((set, get) => ({
  cars: [],
  isLoading: false,

  initialize: async (userId = 1) => {
    set({ isLoading: true });
    try {
      const data = await fetchGarage(userId);
      const mappedCars = data.map(item => ({
        id: item.id,
        dbId: item.carId,
        name: item.car.name,
        brand: item.car.brand.name,
        cv: item.cv,
        nm: item.nm,
        kg: item.kg,
        driveType: item.car.driveType,
        engineType: item.car.engineType,
        km: item.km,
        speed: item.speed,
        acceleration: item.acceleration,
        revving: item.revving,
        transmission: item.transmission,
        turnSlow: item.turnSlow,
        turnFast: item.turnFast,
        brake: item.brake,
        traction: item.traction,
        tireGrip: 100, // Still mapping locally for now, db might need health fields
        engineHealth: 100,
        fuelCapacity: 45, 
        currentFuel: 20,
        fuelType: 'Normale',
        image: item.car.image,
        mods: item.mods.map(m => ({
          id: m.id,
          name: m.part.name,
          category: m.part.category,
          image: m.part.image,
          description: m.part.description,
          bonuses: {
            cv: m.part.cvBonus,
            nm: m.part.nmBonus,
            kg: m.part.kgBonus,
            speed: m.part.speedBonus,
            accel: m.part.accelBonus,
            brake: m.part.brakeBonus,
            traction: m.part.tractBonus
          }
        }))
      }));
      set({ cars: mappedCars, isLoading: false });
    } catch (err) {
      console.error('Garage init failed:', err);
      set({ isLoading: false });
    }
  },
  
  getCarStats: (carId) => {
    const car = get().cars.find(c => c.id === carId);
    if (!car) return null;
    return calculateRaceStats(car);
  },

  addCar: (car) => set((state) => ({ cars: [...state.cars, car] })),
  
  updateCarFuel: (carId, amount, fuelType = 'Normale') => set((state) => ({
    cars: state.cars.map(car => 
      car.id === carId 
        ? { 
            ...car, 
            currentFuel: Math.min(car.fuelCapacity, Math.max(0, car.currentFuel + amount)),
            fuelType: amount > 0 ? fuelType : car.fuelType 
          }
        : car
    )
  })),

  addKM: (carId, amount) => set((state) => ({
    cars: state.cars.map(car => 
      car.id === carId ? { ...car, km: car.km + amount } : car
    )
  })),

  applyWear: (carId, tireWear, engineWear) => set((state) => ({
    cars: state.cars.map(car => 
      car.id === carId 
        ? { 
            ...car, 
            tireGrip: Math.max(0, car.tireGrip - tireWear),
            engineHealth: Math.max(0, car.engineHealth - engineWear)
          } 
        : car
    )
  })),
  
  restoreWear: (carId, type) => set((state) => ({
    cars: state.cars.map(car => {
      if (car.id !== carId) return car;
      if (type === 'tires') return { ...car, tireGrip: 100 };
      if (type === 'engine' || type === 'rebuild') return { ...car, engineHealth: 100 };
      if (type === 'full') return { ...car, tireGrip: 100, engineHealth: 100 };
      return car;
    })
  }))
}));

export default useGarageStore;
