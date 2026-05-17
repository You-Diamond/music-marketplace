import { create } from "zustand"
import { Beat } from "@/types/beat"

type RecentStore = {
  items: Beat[]
  addItem: (beat: Beat) => void
  clear: () => void
}

export const useRecentStore = create<RecentStore>((set) => ({
  items: [],
  addItem: (beat) =>
    set((state) => ({
      items: [beat, ...state.items.filter((b) => b.id !== beat.id)].slice(0, 20),
    })),
  clear: () => set({ items: [] }),
}))