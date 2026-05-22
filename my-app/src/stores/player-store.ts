import { create } from "zustand"

interface PlayerTrack {
  id: string
  title: string
  image?: string | null
  audio?: string | null
  musicKey?: string | null
  bpm?: number
  licenses?: Array<{ id: string; price: number }>
  producer: {
    username: string
    displayName?: string | null
  }
}

interface PlayerState {
  track: PlayerTrack | null
  queue: PlayerTrack[]
  originalQueue: PlayerTrack[] // Храним исходный порядок для отключения шафла
  isPlaying: boolean
  volume: number
  isLooping: boolean // Повтор трека
  isShuffled: boolean // Перемешивание
  play: (track: PlayerTrack, queue?: PlayerTrack[]) => void
  pause: () => void
  togglePlay: () => void
  setVolume: (volume: number) => void
  toggleLoop: () => void
  toggleShuffle: () => void
  nextTrack: () => void
  prevTrack: () => void
  setQueue: (queue: PlayerTrack[]) => void // <-- ДОБАВЛЕННЫЙ МЕТОД КЛИЕНТСКОГО СТРИМИНГА
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  track: null,
  queue: [],
  originalQueue: [],
  isPlaying: false,
  volume: 0.7,
  isLooping: false,
  isShuffled: false,

  play: (track, queue = []) => set({ 
    track, 
    queue: get().isShuffled ? [...queue].sort(() => Math.random() - 0.5) : queue, 
    originalQueue: queue, 
    isPlaying: true 
  }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setVolume: (volume) => set({ volume }),
  
  toggleLoop: () => set((state) => ({ isLooping: !state.isLooping })),
  
  toggleShuffle: () => set((state) => {
    const nextShuffle = !state.isShuffled
    if (nextShuffle) {
      const filtered = state.queue.filter((t) => t.id !== state.track?.id)
      const shuffled = filtered.sort(() => Math.random() - 0.5)
      return {
        isShuffled: nextShuffle,
        queue: state.track ? [state.track, ...shuffled] : shuffled
      }
    } else {
      return {
        isShuffled: nextShuffle,
        queue: state.originalQueue
      }
    }
  }),

  // Метод динамического обновления плейлиста без прерывания текущего аудиопотока
  setQueue: (newQueue) => {
    const { isShuffled, track } = get()
    set({ originalQueue: newQueue })

    if (isShuffled) {
      const filtered = newQueue.filter((t) => t.id !== track?.id)
      const shuffled = filtered.sort(() => Math.random() - 0.5)
      set({ queue: track ? [track, ...shuffled] : shuffled })
    } else {
      set({ queue: newQueue })
    }
  },

  nextTrack: () => {
    const { track, queue, isLooping } = get()
    if (!track || queue.length === 0) return

    if (isLooping) {
      set({ isPlaying: false })
      setTimeout(() => set({ isPlaying: true }), 50)
      return
    }

    const currentIndex = queue.findIndex((t) => t.id === track.id)
    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      set({ track: queue[currentIndex + 1], isPlaying: true })
    } else {
      set({ track: queue[0], isPlaying: true })
    }
  },
  
  prevTrack: () => {
    const { track, queue } = get()
    if (!track || queue.length === 0) return
    const currentIndex = queue.findIndex((t) => t.id === track.id)
    if (currentIndex > 0) {
      set({ track: queue[currentIndex - 1], isPlaying: true })
    } else {
      set({ track: queue[queue.length - 1], isPlaying: true })
    }
  }
}))