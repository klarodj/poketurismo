import { create } from 'zustand';
import { calculateRaceStats } from '../logic/raceEngine';
import { fetchGarage } from '../services/api';

const useGarageStore = create((set, get) => ({
  cars: [],
  isLoading: false,

  accept: (data) => {
      const mappedCars = data.map(item => ({
        id: item.id,
        dbId: item.carId,
        name: item.car.name,
        brand: item.car.brand?.name || 'Sconosciuta',
        cv: item.cv,
        baseCv: item.car.cv, baseKg: item.car.kg, velMax: item.car.velMax, zeroToHundred: item.car.zeroToHundred,
        resaleValue: item.resaleValue,
        nm: item.nm,
        kg: item.kg,
        driveType: item.car.driveType,
        engineType: item.car.engineType,
        cc: item.car.cc,
        km: item.km,
        speed: item.speed,
        acceleration: item.acceleration,
        revving: item.revving,
        transmission: item.transmission,
        turnSlow: item.turnSlow,
        turnFast: item.turnFast,
        brake: item.brake,
        traction: item.traction,
        tireGrip: item.tireGrip ?? 100,
        engineHealth: item.engineHealth ?? 100,
        serviceKm: item.serviceKm ?? 0,
        fuelCapacity: 45, 
        currentFuel: item.currentFuel,
        fuelType: item.fuelType,
        image: item.car.image,
        mods: item.mods.map(m => ({
          id: m.id,
          partId: m.partId,
          level: m.part.level,
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
  },
  initialize: async (userId = 1) => {
    set({ isLoading: true });
    try { const data = await fetchGarage(userId); useGarageStore.getState().accept(data); }
    catch (error) { set({ isLoading: false }); throw error; }
  },

  getCarStats: (carId) => {
    const car = get().cars.find(c => c.id === carId);
    if (!car) return null;
    return calculateRaceStats(car);
  },

}));

export default useGarageStore;
