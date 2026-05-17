import { create } from "zustand";
import { PlayerState, PlayerTrack } from "@/types/player";

export const usePlayerStore = create<PlayerState>((set, get) => ({
  track: null,
  queue: [],
  isPlaying: false,
  isMuted: false,
  volume: 0.7,
  currentTime: 0,
  duration: 0,

  play: (track, queue = []) => set({ 
    track, 
    queue: queue.length > 0 ? queue : get().queue,
    isPlaying: true, 
    currentTime: 0 
  }),

  pause: () => set({ isPlaying: false }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  setVolume: (volume) => set({ volume, isMuted: volume === 0 }),

  setCurrentTime: (currentTime) => set({ currentTime }),

  setDuration: (duration) => set({ duration }),

  nextTrack: () => {
    const { queue, track } = get();
    if (!track || queue.length === 0) return;
    
    const currentIndex = queue.findIndex(t => t.id === track.id);
    const nextIndex = (currentIndex + 1) % queue.length;
    set({ track: queue[nextIndex], currentTime: 0, isPlaying: true });
  },

  previousTrack: () => {
    const { queue, track } = get();
    if (!track || queue.length === 0) return;
    
    const currentIndex = queue.findIndex(t => t.id === track.id);
    const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
    set({ track: queue[prevIndex], currentTime: 0, isPlaying: true });
  }
}));