import { create } from 'zustand'
import { ExtendedTrack } from './usePromoTracksStore' // Переиспользуем тип из предыдущего стора

interface TrendingTracksState {
  tracks: ExtendedTrack[]
  isLoading: boolean
  error: string | null
  fetchTrendingTracks: () => Promise<void>
}

export const useTrendingTracksStore = create<TrendingTracksState>((set) => ({
  tracks: [],
  isLoading: false,
  error: null,
  fetchTrendingTracks: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/beats/trending')
      if (!response.ok) throw new Error('Не удалось загрузить популярные треки')
      const data = await response.json()
      set({ tracks: data, isLoading: false })
    } catch (err: any) {
      set({ error: err.message || 'Что-то пошло не так', isLoading: false })
    }
  },
}))