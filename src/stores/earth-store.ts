import { create } from "zustand";

interface EarthState {
  currentIndex: number;
  setIndex: (i: number) => void;
}

export const useEarthStore = create<EarthState>((set) => ({
  currentIndex: 0,
  setIndex: (i) => set({ currentIndex: i }),
}));
