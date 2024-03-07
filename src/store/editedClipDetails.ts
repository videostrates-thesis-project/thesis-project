import { create } from "zustand"

export interface EditedClipDetailsState {
  details: string[] | undefined
  setDetails: (details: string[] | undefined) => void
  position: { x: number; y: number }
  setPosition: (position: { x: number; y: number }) => void
}

export const useEditedClipDetails = create<EditedClipDetailsState>((set) => ({
  details: undefined,
  setDetails: (details: string[] | undefined) => set({ details }),
  position: { x: 0, y: 0 },
  setPosition: (position: { x: number; y: number }) => set({ position }),
}))
