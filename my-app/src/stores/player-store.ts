import { create } from "zustand"

export interface PlayerTrack {
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
  originalQueue: PlayerTrack[] // Исходный порядок (для восстановления при отключении шафла)
  isPlaying: boolean
  isLoading: boolean // <-- НОВЫЙ СТЕЙТ: Индикатор загрузки аудио-потока из сети (буферизация)
  volume: number
  isLooping: boolean // Повтор одного трека
  isShuffled: boolean // Перемешивание очереди
  
  play: (track: PlayerTrack, queue?: PlayerTrack[]) => void
  pause: () => void
  togglePlay: () => void
  setVolume: (volume: number) => void
  setIsLoading: (isLoading: boolean) => void // <-- НОВЫЙ МЕТОД: Управление состоянием загрузки аудио-тегом
  toggleLoop: () => void
  toggleShuffle: () => void
  nextTrack: () => void
  prevTrack: () => void
  setQueue: (queue: PlayerTrack[]) => void // Динамическое обновление очереди без прерывания текущего трека
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  track: null,
  queue: [],
  originalQueue: [],
  isPlaying: false,
  isLoading: false, // Изначально ничего не качается
  volume: 0.7,
  isLooping: false,
  isShuffled: false,

  // Исправленный метод воспроизведения
  play: (track, nextQueue = []) => {
    // Если очередь не передана, используем существующую оригинальную
    const targetQueue = nextQueue.length > 0 ? nextQueue : get().originalQueue
    
    set({
      track,
      originalQueue: targetQueue,
      // Исправление бага шафла: текущий трек гарантированно первый, остальное перемешиваем
      queue: get().isShuffled
        ? [track, ...targetQueue.filter((t) => t.id !== track.id).sort(() => Math.random() - 0.5)]
        : targetQueue,
      isPlaying: true,
      // Включаем лоадер, так как аудио-элементу в UI потребуется время на коннект к сети
      isLoading: true 
    })
  },

  pause: () => set({ isPlaying: false }),
  
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  
  setVolume: (volume) => set({ volume }),
  
  setIsLoading: (isLoading) => set({ isLoading }),
  
  toggleLoop: () => set((state) => ({ isLooping: !state.isLooping })),
  
  // Исправленный и безопасный Shuffle
  toggleShuffle: () => set((state) => {
    const nextShuffle = !state.isShuffled
    const { track, originalQueue, queue } = state

    if (nextShuffle) {
      // Исключаем текущий трек из перемешивания, кидаем его в начало, а хвост мешаем
      const filtered = queue.filter((t) => t.id !== track?.id)
      const shuffled = filtered.sort(() => Math.random() - 0.5)
      return {
        isShuffled: nextShuffle,
        queue: track ? [track, ...shuffled] : shuffled
      }
    } else {
      // При отключении возвращаем исходную последовательность списка битов
      return {
        isShuffled: nextShuffle,
        queue: originalQueue
      }
    }
  }),

  // Динамическое обновление плейлиста без прерывания текущего аудиопотока
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

    // Если включен повтор текущего трека
    if (isLooping) {
      set({ isPlaying: false, isLoading: true })
      setTimeout(() => set({ isPlaying: true }), 50)
      return
    }

    const currentIndex = queue.findIndex((t) => t.id === track.id)
    
    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      // Переходим к следующему
      set({ track: queue[currentIndex + 1], isPlaying: true, isLoading: true })
    } else {
      // Если это был последний трек в каталоге — зацикливаем плейлист на первый
      set({ track: queue[0], isPlaying: true, isLoading: true })
    }
  },
  
  prevTrack: () => {
    const { track, queue } = get()
    if (!track || queue.length === 0) return
    
    const currentIndex = queue.findIndex((t) => t.id === track.id)
    
    if (currentIndex > 0) {
      set({ track: queue[currentIndex - 1], isPlaying: true, isLoading: true })
    } else {
      // Если мы в самом начале — прыгаем в конец плейлиста
      set({ track: queue[queue.length - 1], isPlaying: true, isLoading: true })
    }
  }
}))