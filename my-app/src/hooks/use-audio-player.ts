import { useEffect, useRef } from "react";
import { usePlayerStore } from "@/stores/player-store";

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { track, isPlaying, volume, isMuted, setCurrentTime, setDuration, nextTrack } = usePlayerStore();

  useEffect(() => {
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;

    const handleTime = () => setCurrentTime(audio.currentTime);
    const handleDuration = () => setDuration(audio.duration);
    const handleEnded = () => nextTrack();

    audio.addEventListener("timeupdate", handleTime);
    audio.addEventListener("durationchange", handleDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTime);
      audio.removeEventListener("durationchange", handleDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  useEffect(() => {
    if (track && audioRef.current) {
      audioRef.current.src = track.audio;
      if (isPlaying) audioRef.current.play().catch(() => {});
    }
  }, [track]);

  useEffect(() => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.play().catch(() => {}) : audioRef.current.pause();
  }, [isPlaying]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  return {
    seek: (time: number) => {
      if (audioRef.current) audioRef.current.currentTime = time;
    }
  };
}