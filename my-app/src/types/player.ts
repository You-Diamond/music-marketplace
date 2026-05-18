export type PlayerTrack = {
  id: string; // Изменено: number -> string
  publicId: string;
  title: string;
  author: string;
  image: string;
  audio: string;
};

export type PlayerState = {
  track: PlayerTrack | null;
  queue: PlayerTrack[];
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  
  play: (track: PlayerTrack, queue?: PlayerTrack[]) => void;
  pause: () => void;
  togglePlay: () => void;
  toggleMute: () => void;
  setVolume: (value: number) => void;
  setCurrentTime: (value: number) => void;
  setDuration: (value: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
};