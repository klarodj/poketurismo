import { create } from 'zustand';
import { fetchInventory, equipMoves } from '../services/api';
const useInventoryStore = create((set, get) => ({
  moves: [], equippedMoves: [], parts: [],
  accept: data => set(data),
  initialize: async (userId = 1) => { const data = await fetchInventory(userId); set(data); },
  equipMove: async (moveId, userId = 1) => {
    const ids = get().equippedMoves;
    if (ids.includes(moveId) || ids.length >= 4) return;
    await equipMoves(userId, [...ids, moveId]);
  },
  unequipMove: async (moveId, userId = 1) => { await equipMoves(userId, get().equippedMoves.filter(id => id !== moveId)); }
}));
export default useInventoryStore;
