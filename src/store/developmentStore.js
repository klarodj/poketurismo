import { create } from 'zustand';
const useDevelopmentStore = create(set => ({ development: null, accept: development => set({ development }) }));
export default useDevelopmentStore;
