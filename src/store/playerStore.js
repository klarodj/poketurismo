import { create } from 'zustand';
import { fetchPlayer } from '../services/api';

const usePlayerStore = create((set) => ({
  id: null,
  username: '',
  avatar: null,
  isAdmin: false,
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

  accept: (data) => set({ id: data.id, username: data.username, avatar: data.avatar || null, isAdmin: Boolean(data.isAdmin), money: data.money, xp: data.exp, level: data.level,
    carDrive: data.carDrive, isLoading: false, stats: Object.fromEntries(['brave', 'clean', 'reflex', 'shift', 'acro', 'turn', 'brake', 'throttle'].map(key => [key, data[key]])) }),
  initialize: async (playerId = 1) => {
    set({ isLoading: true });
    try { const data = await fetchPlayer(playerId); usePlayerStore.getState().accept(data); }
    catch (error) { set({ isLoading: false }); throw error; }
  },

}));

export default usePlayerStore;
