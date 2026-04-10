import { create } from 'zustand';
import { fetchPlayer } from '../services/api';

const usePlayerStore = create((set) => ({
  id: null,
  username: '',
  money: 0,
  xp: 0,
  level: 1,
  stats: {
    brave: 0,
    clean: 0,
    reflex: 0,
    shift: 0,
    acro: 0,
    turn: 0,
    brake: 0,
    throttle: 0,
  },
  carDrive: null,
  isLoading: false,

  initialize: async (playerId = 1) => {
    set({ isLoading: true });
    try {
      const data = await fetchPlayer(playerId);
      set({
        id: data.id,
        username: data.username,
        money: data.money,
        xp: data.exp,
        level: data.level,
        carDrive: data.carDrive,
        stats: {
          brave: data.brave,
          clean: data.clean,
          reflex: data.reflex,
          shift: data.shift,
          acro: data.acro,
          turn: data.turn,
          brake: data.brake,
          throttle: data.throttle,
        },
        isLoading: false
      });
    } catch (err) {
      console.error('Player init failed:', err);
      set({ isLoading: false });
    }
  },
  
  addMoney: (amount) => set((state) => ({ money: state.money + amount })),
  removeMoney: (amount) => set((state) => ({ money: Math.max(0, state.money - amount) })),
  
  addXp: (amount) => set((state) => {
    const newXp = state.xp + amount;
    const newLevel = Math.floor(newXp / 1000) + 1;
    return { xp: newXp, level: newLevel };
  }),
  
  updateStat: (statName, value) => set((state) => ({
    stats: { ...state.stats, [statName]: state.stats[statName] + value }
  }))
}));

export default usePlayerStore;
