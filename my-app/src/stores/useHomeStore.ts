import { create } from 'zustand'

interface HomeStore {
  genres: any[]
  playlists: any[]
  soundPacks: any[]
  topProducers: any[]
  isLoading: boolean
  error: string | null
  fetchHomeData: () => Promise<void>
}

export const useHomeStore = create<HomeStore>((set) => ({
  genres: [],
  playlists: [],
  soundPacks: [],
  topProducers: [],
  isLoading: false,
  error: null,
  fetchHomeData: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch('/api/home-data')
      if (!res.ok) throw new Error('Could not load data')
      const data = await res.json()
      set({
        genres: data.genres || [],
        playlists: data.playlists || [],
        soundPacks: data.soundPacks || [],
        topProducers: data.topProducers || [],
        isLoading: false
      })
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  }
}))