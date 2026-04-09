import { create } from 'zustand';

// Initial Mock Moves
const initialMoves = [
  {
    id: 'm1',
    name: 'Guida Pulita',
    description: 'Nessun bonus particolare, ma non consuma usura extra.',
    trigger: 'always', // Always available
    bonus: { speed: 5, clean: 2 },
    costGrip: 0,
    costHealth: 0,
    aggressiveness: 1 // Low fuel consumption
  },
  {
    id: 'm2',
    name: 'Punta-Tacco',
    description: 'Ottieni vantaggio nei tornanti e staccate.',
    trigger: 'Tornante', // Valid for Tornante sections
    bonus: { turnSlow: 20, brake: 15 },
    costGrip: 2, // Consumes 2% tire grip
    costHealth: 0,
    aggressiveness: 2 
  },
  {
    id: 'm3',
    name: 'Recupero Disperato',
    description: 'Brucia motore per cercare di recuperare il gap.',
    trigger: 'Gap-Negative', 
    bonus: { acceleration: 30, speed: 20 },
    costGrip: 1,
    costHealth: 5, // Consumes 5% engine health
    aggressiveness: 3 // High fuel consumption
  }
];

const useInventoryStore = create((set) => ({
  moves: initialMoves, // All acquired moves
  equippedMoves: ['m1', 'm2', 'm3'], // IDs of up to 4 equipped moves for racing
  parts: [], // Mechanical parts
  
  equipMove: (moveId) => set((state) => {
    if (state.equippedMoves.includes(moveId)) return state;
    if (state.equippedMoves.length >= 4) return state; // Max 4
    return { equippedMoves: [...state.equippedMoves, moveId] };
  }),
  
  unequipMove: (moveId) => set((state) => ({
    equippedMoves: state.equippedMoves.filter(id => id !== moveId)
  })),
  
  addMove: (move) => set((state) => ({ moves: [...state.moves, move] })),
  
  addPart: (part) => set((state) => ({ parts: [...state.parts, part] })),
  removePart: (partId) => set((state) => ({
    parts: state.parts.filter(p => p.id !== partId)
  }))
}));

export default useInventoryStore;
