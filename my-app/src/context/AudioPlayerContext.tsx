import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

// Типизация трека на основе твоей схемы Prisma (с реляциями)
export interface TrackWithDetails {
  id: string;
  title: string;
  bpm: number;
  musicKey: string;
  image: string | null;
  audio: string; // URL превью-файла
  duration: number;
  producer: {
    id: string;
    username: string;
    displayName: string | null;
  };
  licenses: {
    id: string;
    price: number | null;
    template: { name: string; slug: string };
  }[];
  _count?: {
    likes: number;
  };
}

interface AudioContextType {
  currentTrack: TrackWithDetails | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  queue: TrackWithDetails[];
  isLiked: boolean;
  isInCart: boolean;
  playTrack: (track: TrackWithDetails, queue?: TrackWithDetails[]) => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (volume: number) => void;
  toggleLike: () => Promise<void>;
  addToCart: (licenseId: string) => Promise<void>;
  nextTrack: () => void;
  prevTrack: () => void;
}

const AudioPlayerContext = createContext<AudioContextType | undefined>(undefined);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<TrackWithDetails | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [queue, setQueue] = useState<TrackWithDetails[]>([]);
  
  // Состояния для UI-индикаторов
  const [isLiked, setIsLiked] = useState(false);
  const [isInCart, setIsInCart] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio();
    
    const audio = audioRef.current;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration || 0);
    const handleEnded = () => nextTrack();

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [queue, currentTrack]);

  // Синхронизируем состояние лайка и корзины при смене трека
  useEffect(() => {
    if (!currentTrack) return;
    
    // Инициализация состояний (в реальном приложении — запрос к API или проверка в локальном стейте)
    // checkStatusInDb(currentTrack.id)
    setIsLiked(false); 
    setIsInCart(false);
  }, [currentTrack]);

  const playTrack = (track: TrackWithDetails, newQueue: TrackWithDetails[] = []) => {
    if (!audioRef.current) return;

    if (newQueue.length > 0) setQueue(newQueue);
    
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      setCurrentTrack(track);
      audioRef.current.src = track.audio;
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log("Playback interrupted:", err));
    }
  };

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.log(err));
    }
  };

  const seek = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  const setVolume = (val: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = val;
    setVolumeState(val);
  };

  const nextTrack = () => {
    if (queue.length === 0 || !currentTrack) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex !== -1 && currentIndex < queue.length - 1) {
      playTrack(queue[currentIndex + 1]);
    }
  };

  const prevTrack = () => {
    if (queue.length === 0 || !currentTrack) return;
    const currentIndex = queue.findIndex(t => t.id === currentTrack.id);
    if (currentIndex > 0) {
      playTrack(queue[currentIndex - 1]);
    }
  };

  // Интеграция с твоей бэкенд-логикой Prisma
  const toggleLike = async () => {
    if (!currentTrack) return;
    try {
      // Имитация вызова к API (POST /api/tracks/[id]/like)
      // Мапится на модель Like: unique([userId, trackId])
      setIsLiked(!isLiked);
    } catch (err) {
      console.error(err);
    }
  };

  const addToCart = async (licenseId: string) => {
    if (!currentTrack) return;
    try {
      // Имитация вызова к API (POST /api/cart)
      // Мапится на модель CartItem: unique([userId, trackId])
      setIsInCart(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AudioPlayerContext.Provider value={{
      currentTrack, isPlaying, currentTime, duration, volume, queue, isLiked, isInCart,
      playTrack, togglePlay, seek, setVolume, toggleLike, addToCart, nextTrack, prevTrack
    }}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (!context) throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  return context;
};