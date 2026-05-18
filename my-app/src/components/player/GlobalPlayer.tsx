"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import WaveSurfer from "wavesurfer.js"
import { 
  Play, Pause, SkipForward, SkipBack, Heart, 
  Volume2, VolumeX, ShoppingCart, Shuffle, 
  Repeat, FolderPlus 
} from "lucide-react"
import { usePlayerStore } from "@/stores/player-store"

export default function GlobalPlayer() {
  const waveformRef = useRef<HTMLDivElement>(null)
  const wavesurfer = useRef<WaveSurfer | null>(null)
  const [isReady, setIsReady] = useState(false)

  const { 
    track, isPlaying, volume, isMuted, currentTime, duration,
    togglePlay, toggleMute, setVolume, nextTrack, previousTrack, setCurrentTime, setDuration 
  } = usePlayerStore()

  const initWaveSurfer = () => {
    if (!waveformRef.current) return
    if (wavesurfer.current) wavesurfer.current.destroy()

    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: "#333333", 
      progressColor: "#991414", 
      cursorColor: "#ffffff",
      cursorWidth: 2,
      barWidth: 4, 
      barGap: 3,
      height: 60,
      barRadius: 4,
      normalize: true,
      interact: true,
    })

    wavesurfer.current.on("ready", () => {
      setDuration(wavesurfer.current?.getDuration() || 0)
      setIsReady(true)
      if (isPlaying) wavesurfer.current?.play().catch(() => {})
    })

    wavesurfer.current.on("timeupdate", (t) => setCurrentTime(t))
    wavesurfer.current.on("finish", () => nextTrack())
  }

  useEffect(() => {
    if (track?.audio) {
      setIsReady(false)
      initWaveSurfer()
      wavesurfer.current?.load(track.audio)
    }
    return () => wavesurfer.current?.destroy()
  }, [track?.audio])

  useEffect(() => {
    if (!wavesurfer.current || !isReady) return
    isPlaying ? wavesurfer.current.play().catch(() => {}) : wavesurfer.current.pause()
  }, [isPlaying, isReady])

  useEffect(() => {
    if (wavesurfer.current) {
      wavesurfer.current.setVolume(isMuted ? 0 : volume)
    }
  }, [volume, isMuted])

  if (!track) return null

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60)
    const secs = Math.floor(s % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // Создаем безопасную ссылку на страницу автора на основе его имени
  const authorUrl = track.publicId ? `/${track.publicId}` : "#"

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] flex justify-center px-6 pb-8">
      <div className="w-full max-w-[1150px] bg-brand-bg/90 backdrop-blur-3xl border border-white/5 rounded-[32px] shadow-[0_50px_100px_rgba(0,0,0,0.6)] p-8">
        
        {/* Секция Волны */}
        <div className="flex items-center gap-10 mb-8">
          <span className="text-xl font-mono font-bold text-white w-14 text-right tabular-nums">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 relative">
            <div 
              ref={waveformRef} 
              className="cursor-pointer h-[60px]" 
              style={{ filter: "brightness(1.2)" }}
            />
          </div>
          <span className="text-xl font-mono font-bold text-zinc-600 w-14 tabular-nums">
            {formatTime(duration)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          
          {/* ЛЕВО: Трек */}
          <div className="flex items-center gap-5 w-[30%]">
            {/* ОБЛОЖКА — Теперь кликабельная ссылка */}
            <Link href={`/beats/${track.id}`} className="relative h-16 w-16 flex-shrink-0 rounded-2xl overflow-hidden border border-white/10 shadow-2xl block hover:opacity-90 transition-opacity">
              <Image src={track.image} alt={track.title} fill className="object-cover" />
            </Link>
            
            <div className="min-w-0 flex flex-col">
              {/* НАЗВАНИЕ БИТА — Теперь кликабельная ссылка */}
              <Link 
                href={`/beats/${track.id}`} 
                className="text-lg font-bold text-white uppercase truncate leading-tight transition-colors hover:text-brand-red block"
              >
                {track.title}
              </Link>
              
              {/* АВТОР — Теперь кликабельная ссылка */}
              <Link 
                href={authorUrl} 
                className="text-[10px] font-medium text-zinc-500 uppercase tracking-[0.2em] mt-1 hover:text-white transition-colors block"
              >
                {track.author}
              </Link>
              
              <div className="flex gap-4 mt-2">
                <button className="text-zinc-600 hover:text-brand-red transition-colors">
                  <Heart size={18} />
                </button>
                <button className="text-zinc-600 hover:text-white transition-colors">
                  <FolderPlus size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* ЦЕНТР: Управление */}
          <div className="flex items-center justify-center gap-8">
            <button className="text-zinc-700 hover:text-white transition-colors">
              <Shuffle size={20} />
            </button>
            <button onClick={previousTrack} className="text-zinc-400 hover:text-white transition transform active:scale-90">
              <SkipBack size={28} fill="currentColor" />
            </button>
            <button 
              onClick={togglePlay}
              className="w-14 h-14 flex items-center justify-center bg-white rounded-full text-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} className="ml-1" fill="currentColor" />}
            </button>
            <button onClick={nextTrack} className="text-zinc-400 hover:text-white transition transform active:scale-90">
              <SkipForward size={28} fill="currentColor" />
            </button>
            <button className="text-zinc-700 hover:text-white transition-colors">
              <Repeat size={20} />
            </button>
          </div>

          {/* ПРАВО: Громкость и Кнопка */}
          <div className="flex items-center justify-end gap-10 w-[30%]">
            <div className="flex items-center gap-4 group/vol">
              <button onClick={toggleMute} className="text-zinc-500 hover:text-white transition">
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <div className="relative flex items-center w-28 h-5">
                <div className="absolute w-full h-[3px] bg-zinc-900 rounded-full">
                  <div className="h-full bg-brand-red" style={{ width: `${(isMuted ? 0 : volume) * 100}%` }} />
                </div>
                <div 
                  className="absolute h-4 w-4 bg-white rounded-full shadow-md transition-transform group-hover/vol:scale-125 border border-brand-red cursor-grab active:cursor-grabbing" 
                  style={{ left: `calc(${(isMuted ? 0 : volume) * 100}% - 8px)` }} 
                />
                <input type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} onChange={(e) => setVolume(parseFloat(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30" />
              </div>
            </div>

            <button className="bg-brand-red hover:brightness-110 text-white px-7 py-3.5 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-3 min-w-[150px] shadow-lg shadow-brand-red/20">
              <ShoppingCart size={20} strokeWidth={2.5} /> 
              <span className="text-lg font-bold tracking-wide tabular-nums">
                $41.00
              </span>
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}