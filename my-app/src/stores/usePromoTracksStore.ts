import { create } from 'zustand'
// Импортируем типы, включая Genre
import { Track, License, Genre } from '@prisma/client'

// Описываем тип трека с расширенными связями (продюсер, лицензии и объект жанра)
export type ExtendedTrack = Omit<Track, 'genre'> & {
  producer: {
    username: string
    displayName: string | null
    avatar: string | null     // Добавлено!
    biography: string | null  // Добавлено!
  }
  licenses: License[]
  genre: Genre | null
}

interface PromoTracksState {
  tracks: ExtendedTrack[]
  isLoading: boolean
  error: string | null
  fetchSpotlightTracks: () => Promise<void>
}

export const usePromoTracksStore = create<PromoTracksState>((set) => ({
  tracks: [],
  isLoading: false,
  error: null,
  fetchSpotlightTracks: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('/api/beats/spotlight')
      if (!response.ok) {
        throw new Error('Не удалось загрузить промо-треки')
      }
      const data = await response.json()
      set({ tracks: data, isLoading: false })
    } catch (err: any) {
      set({ error: err.message || 'Что-то пошло не так', isLoading: false })
    }
  },
}))