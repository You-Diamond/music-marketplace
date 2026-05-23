"use client"

import * as React from "react"
import { usePlayerStore } from "@/stores/player-store"
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music, Shuffle, Repeat, Heart, ShoppingBag, Loader2, ChevronUp } from "lucide-react"
import { addToCart } from "@/app/actions/cart"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function AudioPlayer() {
  const router = useRouter()
  const { 
    track, isPlaying, volume, isLooping, isShuffled, isLoading,
    togglePlay, nextTrack, prevTrack, setVolume, toggleLoop, toggleShuffle, pause, setIsLoading 
  } = usePlayerStore()
  
  const audioRef = React.useRef<HTMLAudioElement | null>(null)
  const [currentTime, setCurrentTime] = React.useState(0)
  const [duration, setDuration] = React.useState(0)
  const [isMuted, setIsMuted] = React.useState(false)
  const [prevVolume, setPrevVolume] = React.useState(0.7)
  
  // Состояния для бэкенд-действий
  const [isLiked, setIsLiked] = React.useState(false)
  const [isAddingToCart, setIsAddingToCart] = React.useState(false)

  // При смене трека сбрасываем состояние лайка (для интеграции с бэком)
  React.useEffect(() => {
    setIsLiked(false)
  }, [track?.id])

  // Управление нативным аудио-элементом HTML5
  React.useEffect(() => {
    if (!audioRef.current || !track) return

    const audioSource = track.audio || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    
    if (audioRef.current.src !== audioSource) {
      audioRef.current.src = audioSource
      audioRef.current.load()
    }

    if (isPlaying) {
      audioRef.current.play().catch(() => pause())
    } else {
      audioRef.current.pause()
    }
  }, [track, isPlaying, pause])

  React.useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  if (!track) return null

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime)
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
      setIsLoading(false) // Метаданные загружены — снимаем лоадер первичного коннекта
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value)
    setCurrentTime(time)
    if (audioRef.current) audioRef.current.currentTime = time
  }

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false)
      setVolume(prevVolume)
    } else {
      setPrevVolume(volume)
      setIsMuted(true)
      setVolume(0)
    }
  }

  const handlePlayerAddToCart = async () => {
    if (!track) return
    setIsAddingToCart(true)
    try {
      const defaultLicenseId = track.licenses?.[0]?.id
      const res = await addToCart(track.id, defaultLicenseId)
      if (res.success) {
        toast.success(`Бит "${track.title}" добавлен в корзину!`)
        router.refresh()
      } else {
        toast.error(res.error || "Не удалось добавить бит")
      }
    } catch {
      toast.error("Ошибка при добавлении в корзину")
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handlePlayerToggleLike = () => {
    setIsLiked(!isLiked)
    toast.info(!isLiked ? "Добавлено в избранное" : "Удалено из избранного")
  }

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-24 sm:h-24 bg-zinc-950/90 border-t border-white/[0.06] backdrop-blur-2xl z-50 text-white px-4 sm:px-8 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.5)] select-none">
      
      {/* Нативный элемент с подпиской на сетевую буферизацию (isLoading) */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={nextTrack}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => setIsLoading(false)}
        onCanPlay={() => setIsLoading(false)}
      />

      {/* ТАЙМЛАЙН - На мобильных выносится в самый верх плеера в виде тонкой полоски (100% ширины) */}
      <div className="absolute top-0 left-0 right-0 flex items-center w-full text-[0] sm:hidden">
        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1 bg-zinc-800 appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400 m-0 p-0"
        />
      </div>

      {/* ЛЕВАЯ ЧАСТЬ: Трек + Обложка */}
      <div className="flex items-center gap-3 sm:gap-4 w-2/3 sm:w-1/4 min-w-0">
        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl overflow-hidden bg-zinc-900 border border-white/[0.05] flex-shrink-0 relative group shadow-inner">
          {track.image ? (
            <img src={track.image} alt={track.title} className="h-full w-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-zinc-950">
              <Music size={18} />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-xs sm:text-sm font-bold truncate text-zinc-100 pr-2">{track.title}</h4>
          <p className="text-[11px] sm:text-xs text-zinc-400 truncate mt-0.5">@{track.producer.username}</p>
        </div>
        
        {/* Быстрые действия (Лайк/Корзина) — скрываются на мобилках для экономии места */}
        <div className="hidden lg:flex items-center gap-1 shrink-0">
          <button 
            onClick={handlePlayerToggleLike}
            className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors ${isLiked ? 'text-red-500 bg-red-500/10' : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'}`}
          >
            <Heart size={15} className={isLiked ? "fill-current" : ""} />
          </button>
          <button 
            disabled={isAddingToCart}
            onClick={handlePlayerAddToCart}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors disabled:opacity-40"
          >
            <ShoppingBag size={15} className={isAddingToCart ? "animate-pulse text-purple-400" : ""} />
          </button>
        </div>
      </div>

      {/* ЦЕНТРАЛЬНАЯ ЧАСТЬ: Пульт управления + Полноценный Таймлайн на десктопе */}
      <div className="flex flex-col items-center gap-1.5 w-1/3 sm:w-2/4 max-w-2xl justify-center sm:justify-between">
        <div className="flex items-center gap-3 sm:gap-6">
          {/* Шафл: только десктоп */}
          <button 
            onClick={toggleShuffle} 
            className={`hidden sm:block transition-colors ${isShuffled ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'text-zinc-500 hover:text-zinc-200'}`}
          >
            <Shuffle size={14} />
          </button>

          {/* Prev: только десктоп */}
          <button onClick={prevTrack} className="hidden sm:block text-zinc-400 hover:text-white transition-colors">
            <SkipBack size={18} />
          </button>
          
          {/* Главная кнопка Play/Pause со встроенным Loader'ом */}
          <button 
            onClick={togglePlay} 
            className="h-11 w-11 sm:h-11 sm:w-11 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-lg shrink-0 relative"
          >
            {isLoading ? (
              <Loader2 size={18} className="animate-spin text-purple-600" />
            ) : isPlaying ? (
              <Pause size={16} className="fill-current" />
            ) : (
              <Play size={16} className="fill-current translate-x-0.5" />
            )}
          </button>

          {/* Next: доступен везде (основной мобильный паттерн "Свайп/Скип") */}
          <button onClick={nextTrack} className="text-zinc-400 hover:text-white transition-colors p-1 sm:p-0">
            <SkipForward size={18} />
          </button>

          {/* Повтор: только десктоп */}
          <button 
            onClick={toggleLoop} 
            className={`hidden sm:block transition-colors ${isLooping ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'text-zinc-500 hover:text-zinc-200'}`}
          >
            <Repeat size={14} />
          </button>
        </div>

        {/* Десктопный таймлайн (скрывается на мобильных) */}
        <div className="hidden sm:flex items-center gap-3 w-full text-[11px] font-mono text-zinc-500">
          <span className="w-8 text-right">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500 hover:accent-purple-400"
          />
          <span className="w-8 text-left">{formatTime(duration)}</span>
        </div>
      </div>

      {/* ПРАВАЯ ЧАСТЬ: BPM / Мета + Мобильные кнопки Корзины/Лайка */}
      <div className="flex items-center justify-end gap-3 sm:gap-6 w-auto sm:w-1/4 min-w-0 sm:min-w-[180px]">
        {/* Мобильный блок кнопок действий вместо скрытых левых */}
        <div className="flex sm:hidden items-center gap-1.5">
          <button 
            onClick={handlePlayerToggleLike}
            className={`h-9 w-9 rounded-xl flex items-center justify-center border transition-colors ${isLiked ? 'text-red-500 bg-red-500/10 border-red-500/20' : 'text-zinc-400 bg-white/[0.02] border-white/[0.05]'}`}
          >
            <Heart size={14} className={isLiked ? "fill-current" : ""} />
          </button>
          <button 
            disabled={isAddingToCart}
            onClick={handlePlayerAddToCart}
            className="h-9 w-9 rounded-xl flex items-center justify-center bg-purple-600 text-white shadow-md shadow-purple-900/30 transition-all active:scale-95 disabled:opacity-40"
          >
            <ShoppingBag size={14} className={isAddingToCart ? "animate-pulse" : ""} />
          </button>
        </div>

        {/* Десктопный блок BPM и Громкости (полностью скрыт на мобильных устройствах) */}
        <div className="hidden sm:flex flex-col items-end text-right font-mono text-[10px] text-zinc-500 gap-0.5 shrink-0">
          {track.bpm && <span className="bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded text-purple-400 font-bold">{track.bpm} BPM</span>}
          {track.musicKey && <span className="text-zinc-400">{track.musicKey}</span>}
        </div>

        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button onClick={toggleMute} className="text-zinc-400 hover:text-white transition-colors">
            {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setIsMuted(false)
              setVolume(Number(e.target.value))
            }}
            className="w-20 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>
      </div>
    </div>
  )
}