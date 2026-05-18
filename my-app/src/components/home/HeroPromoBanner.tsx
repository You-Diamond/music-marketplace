"use client"

import * as React from "react"
import Image from "next/image"
import { Search, Play, ArrowRight, Sparkles, Heart, ShoppingCart } from "lucide-react"
import { usePromoTracksStore } from "@/stores/usePromoTracksStore"

export default function HeroPromoBanner() {
  const { tracks, isLoading, error, fetchSpotlightTracks } = usePromoTracksStore()
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [isFavorite, setIsFavorite] = React.useState(false)
  const [isInCart, setIsInCart] = React.useState(false)

  // Загружаем данные с бэкенда при монтировании баннера
  React.useEffect(() => {
    fetchSpotlightTracks()
  }, [fetchSpotlightTracks])

  // Ротация слайдов (работает только если треки успешно загрузились)
  React.useEffect(() => {
    if (tracks.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tracks.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [tracks])

  // Состояние загрузки (Скелетон)
  if (isLoading) {
    return (
      <div className="w-full bg-transparent border-b border-zinc-200/50 dark:border-zinc-900 min-h-[240px] xs:min-h-[260px] sm:min-h-[320px] flex items-center justify-center">
        <div className="animate-pulse flex space-x-4 w-full max-w-6xl px-6">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
              <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2"></div>
            </div>
            <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-2/3"></div>
          </div>
          <div className="w-[130px] sm:w-[180px] h-48 bg-zinc-200 dark:bg-zinc-800 rounded-3xl"></div>
        </div>
      </div>
    )
  }

  // Если произошла ошибка или массив пуст, не ломаем интерфейс
  if (error || tracks.length === 0) {
    return null
  }

  const activeTrack = tracks[currentIndex]

  const unifiedButtonClasses = `
    h-8 w-8 sm:h-9 sm:w-9 flex items-center justify-center rounded-full border transition-all active:scale-95 shrink-0 shadow-md
    bg-white/30 border-white/40 text-zinc-900 hover:bg-brand-red/10 hover:text-brand-red
    dark:bg-white/5 dark:border-white/10 dark:text-zinc-100 dark:hover:bg-brand-red/20 dark:hover:text-brand-red
  `

  const iconClasses = "h-[11px] w-[11px] sm:h-[12px] sm:w-[12px]"

  // Берем цену первой доступной лицензии или ставим дефолтную
  const trackPrice = activeTrack.licenses[0]?.price ?? 29.99

  return (
    <div className="w-full bg-transparent border-b border-zinc-200/50 dark:border-zinc-900 transition-colors duration-300 relative overflow-hidden">
      <div className="max-w-6xl mx-auto flex flex-row flex-nowrap justify-between items-stretch min-h-[240px] xs:min-h-[260px] sm:min-h-[320px] relative px-4 sm:px-6 gap-4">
        
        {/* ЛЕВАЯ ЧАСТЬ: Контентная зона */}
        <div className="flex-1 flex flex-col justify-center py-4 space-y-2 sm:space-y-3.5 z-30 relative bg-transparent min-w-0">
          <div className="space-y-1 sm:space-y-1.5">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 text-brand-red bg-brand-red/5 dark:bg-brand-red/10 px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full border border-brand-red/10 w-fit">
              <Sparkles className="h-2 w-2 sm:h-2.5 sm:w-2.5 animate-pulse shrink-0" />
              <span className="text-[7px] xs:text-[7.5px] sm:text-[8.5px] font-black uppercase tracking-[0.2em] whitespace-nowrap">
                Spotlight Release
              </span>
            </div>
            
            <h1 className="text-lg xs:text-xl md:text-2xl lg:text-3xl font-black uppercase tracking-tighter text-zinc-950 dark:text-zinc-100 leading-[1.05] xs:leading-[1] sm:leading-[0.95] transition-all">
              Find Your Perfect <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-red via-rose-500 to-zinc-700 dark:to-zinc-300">
                Sound Signature
              </span>
            </h1>
            
            <p className="text-zinc-600 dark:text-zinc-400 text-[8px] xs:text-[8.5px] sm:text-[9.5px] uppercase tracking-[0.12em] sm:tracking-[0.15em] font-bold max-w-sm leading-relaxed transition-colors hidden xxs:block">
              Premium beats and drum kits from top-tier industry producers.
            </p>
          </div>

          {/* Строка поиска */}
          <div className="w-full max-w-[200px] xs:max-w-[260px] sm:max-w-md relative group cursor-pointer">
            <div className="absolute inset-0 bg-brand-red/10 dark:bg-brand-red/5 rounded-xl sm:rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative flex items-center p-0.5 transition-all rounded-xl sm:rounded-2xl
              bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl
              border border-zinc-200/60 dark:border-white/5
              shadow-[0_8px_32px_0_rgba(0,0,0,0.02)]
              group-hover:border-zinc-300 dark:group-hover:border-white/10
            ">
              <Search className="text-zinc-400 dark:text-zinc-500 mx-1 xs:mx-2 sm:mx-3 shrink-0 h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <input 
                type="text" 
                readOnly
                placeholder="Search beats..." 
                className="w-full bg-transparent text-[9px] xs:text-[9.5px] sm:text-[10.5px] font-bold outline-none text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 cursor-pointer transition-colors"
              />
              <button className="bg-zinc-950 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-950 px-1.5 py-0.5 xs:px-2.5 xs:py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[7px] xs:text-[7.5px] sm:text-[8.5px] font-black uppercase tracking-widest hover:bg-brand-red dark:hover:bg-brand-red dark:hover:text-zinc-100 transition-all flex items-center gap-1 shrink-0 shadow-md">
                <span className="hidden xs:inline">Explore</span>
                <ArrowRight className="h-2 w-2 xs:h-2.5 xs:w-2.5 sm:h-3 sm:w-3" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>

        {/* ПРАВАЯ ЧАСТЬ: Выделенная зона под плеер и панораму */}
        <div className="w-[130px] xs:w-[140px] sm:w-[180px] md:w-[240px] lg:w-[280px] relative flex items-center justify-center shrink-0 transition-all duration-300">
          
          {/* Фоновая обложка */}
          <div 
            className="absolute inset-y-0 -right-4 -left-6 xs:-left-16 sm:-left-24 md:-left-32 z-10 transition-all duration-500 ease-in-out"
            key={activeTrack.id}
            style={{
              WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 5%, rgba(0,0,0,0.4) 20%, black 35%, black 80%, rgba(0,0,0,0.2) 95%, transparent 100%)",
              maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.05) 5%, rgba(0,0,0,0.4) 20%, black 35%, black 80%, rgba(0,0,0,0.2) 95%, transparent 100%)",
            }}
          >
            {activeTrack.image && (
              <Image 
                src={activeTrack.image} 
                alt={activeTrack.title}
                fill
                priority
                className="object-cover w-full h-full pointer-events-none" 
              />
            )}
          </div>

          {/* Компактный плеер */}
          <div className="relative z-40 p-2 sm:p-3 rounded-[1.4rem] sm:rounded-[1.8rem] w-full max-w-[120px] xs:max-w-[125px] sm:max-w-[155px] text-center transition-all duration-500
            -translate-x-1.5 xs:-translate-x-2.5 sm:-translate-x-3.5 md:-translate-x-4
            bg-white/40 dark:bg-zinc-950/20 backdrop-blur-3xl 
            border border-zinc-200/50 dark:border-white/5
            shadow-[0_12px_40px_rgba(0,0,0,0.03)] dark:shadow-none
          ">
            
            <div className="flex justify-center mb-1.5">
              <span className="text-[7px] sm:text-[7.5px] font-black uppercase tracking-[0.2em] text-brand-red bg-brand-red/5 px-2 py-0.5 rounded-md">
                {activeTrack.genre?.name || "Unknown"}
              </span>
            </div>
            
            <div className="flex justify-center mb-2">
              <div className="relative h-14 w-14 sm:h-18 sm:w-18 rounded-lg sm:rounded-xl overflow-hidden shadow-md border border-white/10 shrink-0">
                {activeTrack.image && <Image src={activeTrack.image} alt={activeTrack.title} fill className="object-cover" />}
              </div>
            </div>
            
            <div className="min-w-0 w-full px-0.5 mb-2">
              <h3 className="text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-tight text-zinc-950 dark:text-zinc-100 truncate transition-colors">
                {activeTrack.title}
              </h3>
              <p className="text-[7.5px] sm:text-[8px] text-zinc-600 dark:text-zinc-400 uppercase tracking-widest font-bold mt-0.5 truncate transition-colors">
                {activeTrack.producer.displayName || activeTrack.producer.username}
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-1 sm:gap-1.5 mb-1.5 px-0.5">
              <button 
                onClick={(e) => { e.preventDefault(); setIsInCart(!isInCart); }}
                title="Add to Cart"
                className={`${unifiedButtonClasses} ${
                  isInCart ? "!bg-zinc-950 !border-transparent !text-zinc-100 dark:!bg-zinc-100 dark:!text-zinc-950" : ""
                }`}
              >
                <ShoppingCart className={iconClasses} strokeWidth={2.5} />
              </button>

              <button title="Play Track" className={unifiedButtonClasses}>
                <Play className={`${iconClasses} ml-0.5 fill-current`} />
              </button>

              <button 
                onClick={(e) => { e.preventDefault(); setIsFavorite(!isFavorite); }}
                title="Add to Favorites"
                className={`${unifiedButtonClasses} ${
                  isFavorite ? "!bg-brand-red !border-transparent !text-zinc-100" : ""
                }`}
              >
                <Heart className={`${iconClasses} ${isFavorite ? "fill-zinc-100" : ""}`} strokeWidth={2.5} />
              </button>
            </div>

            <div className="text-[8.5px] sm:text-[9px] font-black tracking-tight text-zinc-950 dark:text-zinc-100 transition-colors">
              ${trackPrice.toFixed(2)}
            </div>
          </div>

          {/* Индикатор слайдов */}
          <div className="absolute bottom-2 left-1/2 -translate-x-[calc(50%+6px)] sm:-translate-x-[calc(50%+14px)] z-40 flex gap-1.5">
            {tracks.map((_, idx) => (
              <div 
                key={idx}
                className={`h-1 rounded-full transition-all duration-700 ${
                  idx === currentIndex 
                    ? "w-4 sm:w-6 bg-brand-red" 
                    : "w-1 sm:w-1.5 bg-zinc-300 dark:bg-zinc-800 hover:bg-zinc-400"
                }`}
              />
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}