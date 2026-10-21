import { create } from 'zustand';
const useRequestStore = create(() => ({ pending: 0, error: '', retry: null }));
export default useRequestStore;
