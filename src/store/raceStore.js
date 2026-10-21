import { create } from 'zustand';
const useRaceStore = create(() => ({ race: null, activeRace: null }));
export default useRaceStore;
