/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AppState {
  counter: number;
  setCounter: (counter: number) => void;
}

export const useStore = create(
  persist<AppState>(
    (set) => ({
      counter: 0,
      setCounter: (counter) => set({ counter })
    }),
    {
      name: "thesis-project-storage"
    }
  )
);
