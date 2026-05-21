"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Play, Heart, ShoppingBag, Sparkles } from "lucide-react"
import Link from "next/link"
import { addToCart } from "@/app/actions/cart"

interface TrackProps {
  id: string
  title: string
  image: string | null
  producer: { username: string; displayName: string | null }
}

export default function HeroDynamicSpotlight({ tracks }: { tracks: TrackProps[] }) {
  const [mounted, setMounted] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dominantColor, setDominantColor] = useState<string | null>(null)
  const [isHeaderHovered, setIsHeaderHovered] = useState(false)
  const [isAuthorHovered, setIsAuthorHovered] = useState(false)

  const colorCache = useRef<Record<string, string>>({})

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isPlaying || !mounted || !tracks || tracks.length <= 1) {
      setProgress(0)
      return
    }
    const duration = 7000
    const intervalTime = 100
    const steps = duration / intervalTime
    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      setProgress((currentStep / steps) * 100)
      if (currentStep >= steps) {
        currentStep = 0
        setActiveIndex((prev) => (prev + 1) % tracks.length)
        setIsLiked(false)
      }
    }, intervalTime)
    return () => clearInterval(timer)
  }, [isPlaying, activeIndex, mounted, tracks?.length])

  const currentTrack = tracks?.[activeIndex]

  useEffect(() => {
    if (!mounted || !currentTrack || !currentTrack.image || typeof window === "undefined") return

    const imageUrl = currentTrack.image

    if (colorCache.current[currentTrack.id]) {
      setDominantColor(colorCache.current[currentTrack.id])
      return
    }

    const img = new Image()
    img.crossOrigin = "Anonymous"
    img.src = imageUrl
    img.onload = () => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      canvas.width = 1
      canvas.height = 1
      if (ctx) {
        ctx.drawImage(img, 0, 0, 1, 1)
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
        const rRatio = r / 255
        const gRatio = g / 255
        const bRatio = b / 255
        const max = Math.max(rRatio, gRatio, bRatio)
        const min = Math.min(rRatio, gRatio, bRatio)
        let h = 0
        let s = 0
        let l = (max + min) / 2
        if (max !== min) {
          const d = max - min
          s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
          switch (max) {
            case rRatio: h = (gRatio - bRatio) / d + (gRatio < bRatio ? 6 : 0); break
            case gRatio: h = (bRatio - rRatio) / d + 2; break
            case bRatio: h = (rRatio - gRatio) / d + 4; break
          }
          h /= 6
        }
        h = Math.round(h * 360)
        s = Math.round(s * 100)
        l = Math.round(l * 100)
        if (l < 45) { l = 55; if (s < 30) s = 60 }
        if (l > 80) { l = 75 }
        
        const computedColor = `hsl(${h}, ${s}%, ${l}%)`
        colorCache.current[currentTrack.id] = computedColor
        
        requestAnimationFrame(() => {
          setDominantColor(computedColor)
        })
      }
    }
    img.onerror = () => {
      setDominantColor("hsl(270, 80%, 60%)")
    }
  }, [activeIndex, currentTrack, mounted])

  const isReady = mounted && tracks && tracks.length > 0 && dominantColor !== null
  const safeColor = dominantColor || "hsl(270, 80%, 60%)"

const handleAddToCart = async (e: React.MouseEvent) => {
  e.preventDefault()
  if (!currentTrack) return

  const res = await addToCart(currentTrack.id)
  if (res.success) {
    alert(`Бит "${currentTrack.title}" добавлен в корзину!`)
  } else {
    alert(res.error)
  }
}

  // СКЕЛЕТОН 
  if (!isReady) {
    return (
      <div className="relative w-full h-[500px] sm:h-[460px] lg:h-[440px] rounded-3xl overflow-hidden border border-white/[0.04] bg-[#09090b] flex flex-col items-center justify-center lg:block p-6 lg:p-0 select-none animation-pulse">
        <div className="absolute inset-0 z-0 pointer-events-none before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.02] before:to-transparent" />
        
        <div className="lg:absolute lg:left-0 lg:top-0 lg:w-[55%] lg:h-full flex flex-col justify-center lg:p-12 w-full max-w-sm lg:max-w-none mb-8 lg:mb-0 space-y-8">
          <div className="space-y-4 flex flex-col items-center lg:items-start">
            <div className="h-10 lg:h-12 bg-white/[0.04] rounded-xl w-1/2 sm:w-5/12" />
            <div className="h-10 lg:h-12 bg-white/[0.04] rounded-xl w-3/4 sm:w-7/12" />
          </div>
          <div className="w-full max-w-sm h-12 bg-white/[0.02] border border-white/[0.04] rounded-xl" />
        </div>

        <div className="lg:absolute lg:right-0 lg:top-0 lg:w-[45%] lg:h-full flex flex-col items-center justify-center lg:justify-end lg:p-12 w-full max-w-xs lg:max-w-none">
          <div className="w-[220px] bg-white/[0.01] border border-white/[0.04] rounded-2xl p-3 flex flex-col gap-3 backdrop-blur-sm shadow-xl">
            <div className="space-y-1.5 flex flex-col items-center py-1">
              <div className="h-3 bg-white/[0.04] rounded w-2/3" />
              <div className="h-2 bg-white/[0.02] rounded w-1/3" />
            </div>
            <div className="flex items-center gap-1.5 w-full">
              <div className="flex-1 h-8 bg-white/[0.03] rounded-xl border border-white/[0.05]" />
              <div className="h-8 w-8 bg-white/[0.03] rounded-xl border border-white/[0.05]" />
              <div className="h-8 w-8 bg-white/[0.03] rounded-xl border border-white/[0.05]" />
            </div>
          </div>
          <div className="h-5 w-20 bg-white/[0.02] border border-white/[0.04] rounded-full mt-3 hidden lg:block" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-[500px] sm:h-[460px] lg:h-[440px] rounded-3xl overflow-hidden border border-white/[0.04] bg-black flex items-center justify-center lg:block shadow-2xl transition-all [transition-duration:1200ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)]">
      
      <div className={`absolute inset-0 z-0 select-none pointer-events-none w-full h-full transition-opacity [transition-duration:1200ms] ${isReady ? 'opacity-100' : 'opacity-0'}`}>
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/90 z-20 lg:hidden" />
          
          <div 
            className="absolute top-0 right-0 h-full w-full lg:w-[55%] transition-all duration-500 ease-out z-0"
            style={{
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.2) 20%, rgba(0, 0, 0, 1) 100%)',
              maskImage: 'linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.2) 20%, rgba(0, 0, 0, 1) 100%)',
            }}
          >
            <img 
              src={currentTrack.image || "/placeholder.jpg"} 
              alt="" 
              className={`w-full h-full object-cover object-center transition-all z-0 ${
                isReady ? 'opacity-40 lg:opacity-[0.75]' : 'opacity-0'
              }`}
              style={{
                transitionProperty: 'opacity, transform',
                transitionDuration: isReady ? '1200ms, 300ms' : '0s',
                transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                willChange: 'transform, opacity',
                transformOrigin: 'center center',
                transform: 'scale(clamp(1.02, 1.08 - (100vw - 1024px) / 12000, 1.12))',
              }}
            />
          </div>
        </div>
      </div>

      <div className="relative z-20 flex flex-col items-center justify-center text-center p-6 w-full max-w-sm lg:max-w-none lg:text-left lg:block lg:p-0 lg:h-full">
        
        {/* ЛЕВАЯ ЧАСТЬ */}
        <div className="lg:absolute lg:left-0 lg:top-0 lg:w-[55%] lg:h-full flex flex-col justify-center lg:p-12 mb-8 lg:mb-0">
          <div className="space-y-8 flex flex-col items-center lg:items-start">
            
            <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-black tracking-tight text-white uppercase leading-[0.95] select-none">
              НАЙДИ
              <br />
              СВОЮ <span className="font-extrabold antialiased transition-colors [transition-duration:1000ms] [transition-timing-function:ease-in-out]" style={{ color: safeColor }}>АУРУ</span>
              <span className="transition-colors [transition-duration:1000ms] [transition-timing-function:ease-in-out]" style={{ color: safeColor }}>.</span>
            </h1>
            
            <div className="w-full max-w-sm relative bg-white/[0.02] backdrop-blur-xl border border-white/[0.06] rounded-xl group transition-all shadow-2xl focus-within:border-white/10 focus-within:bg-white/[0.04]">
              <Search 
                className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 transition-colors [transition-duration:1200ms]"
                style={{ color: isPlaying ? safeColor : undefined }} 
              />
              <input 
                type="text" 
                placeholder="Жанр, настроение, BPM или автор..." 
                className="w-full bg-transparent pl-11 pr-5 py-3.5 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none text-center lg:text-left tracking-wide" 
              />
            </div>
          </div>

          <div className="hidden lg:flex gap-1.5 absolute bottom-12 left-12 bg-white/[0.01] backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/[0.04] w-fit">
            {tracks.map((_, idx) => (
              <button
                key={idx}
                onClick={() => { setActiveIndex(idx); setIsPlaying(false); }}
                className="h-1 rounded-full transition-all duration-500 relative bg-white/[0.06] overflow-hidden"
                style={{ width: idx === activeIndex ? "24px" : "6px" }}
              >
                {idx === activeIndex && (
                  <div className="absolute left-0 top-0 bottom-0 transition-all duration-100 ease-linear" style={{ width: `${progress}%`, backgroundColor: safeColor }} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ПРАВАЯ СЕКЦИЯ */}
        <div className="lg:absolute lg:right-0 lg:top-0 lg:w-[45%] lg:h-full flex items-center lg:items-end justify-center lg:p-12 z-30">
          <div className="flex flex-col gap-3 items-center group/monolith">
            
            <div 
              className="w-[220px] bg-black/50 backdrop-blur-2xl rounded-2xl p-3 flex flex-col gap-2.5 border border-white/[0.06] select-none relative overflow-hidden transition-all duration-500 shadow-2xl"
              style={{
                boxShadow: `inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 20px 40px -10px rgba(0,0,0,0.8)`
              }}
            >
              <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden rounded-2xl">
                <div className="absolute top-0 -left-[100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transform -skew-x-12 transition-all duration-1000 ease-out group-hover/monolith:animate-[shimmer_1s_ease-out_forwards]" />
              </div>

              <div className="min-w-0 text-center w-full px-1 flex flex-col gap-0.5 relative z-10">
                <Link 
                  href={`/track/${currentTrack.id}`} 
                  className="block group w-full"
                  onMouseEnter={() => setIsHeaderHovered(true)}
                  onMouseLeave={() => setIsHeaderHovered(false)}
                >
                  <h3 
                    className="text-[11px] font-black text-white uppercase tracking-wider truncate antialiased transition-all duration-500 ease-in-out"
                    style={{ 
                      color: isHeaderHovered ? safeColor : "#ffffff",
                      filter: isHeaderHovered ? `drop-shadow(0 2px 6px ${safeColor})` : "none"
                    }}
                  >
                    {currentTrack.title}
                  </h3>
                </Link>
                
                <Link 
                  href={`/producer/${currentTrack.producer.username}`}
                  className="block w-full"
                  onMouseEnter={() => setIsAuthorHovered(true)}
                  onMouseLeave={() => setIsAuthorHovered(false)}
                >
                  <p 
                    className="text-[9px] font-bold truncate transition-colors duration-500 ease-in-out drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]"
                    style={{ color: isAuthorHovered ? safeColor : "rgba(228, 228, 231, 0.6)" }}
                  >
                    @{currentTrack.producer.displayName || currentTrack.producer.username}
                  </p>
                </Link>
              </div>

              <div className="flex items-center gap-1.5 w-full relative z-10">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex-1 h-8 rounded-xl flex items-center justify-center font-mono text-[9px] font-bold tracking-wider bg-white/[0.07] text-white border border-white/20 hover:text-black group/listen overflow-hidden transition-all duration-500 ease-in-out"
                  style={{
                    backgroundColor: isPlaying ? safeColor : undefined,
                    color: isPlaying ? "#000000" : undefined,
                    borderColor: isPlaying ? "transparent" : undefined,
                    boxShadow: isPlaying ? `0 0 20px ${safeColor}50` : "none"
                  }}
                  onMouseEnter={(e) => {
                    if (!isPlaying) {
                      e.currentTarget.style.backgroundColor = safeColor
                      e.currentTarget.style.color = "#000000"
                      e.currentTarget.style.borderColor = "transparent"
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isPlaying) {
                      e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.07)"
                      e.currentTarget.style.color = "#ffffff"
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"
                    }
                  }}
                >
                  {isPlaying ? (
                    <div className="flex items-end gap-[2px] h-2.5 mr-1.5 mb-[1px]">
                      <span className="w-[1.5px] h-full bg-current rounded-full animate-[equalizer_0.6s_ease-in-out_infinite_alternate]" />
                      <span className="w-[1.5px] h-3/4 bg-current rounded-full animate-[equalizer_0.4s_ease-in-out_infinite_alternate_0.15s]" />
                      <span className="w-[1.5px] h-1/2 bg-current rounded-full animate-[equalizer_0.7s_ease-in-out_infinite_alternate_0.3s]" />
                    </div>
                  ) : (
                    <Play className="h-3 w-3 fill-current ml-0.5 mr-1 transition-transform group-hover/listen:scale-110" />
                  )}
                  <span>{isPlaying ? "PAUSE" : "Play"}</span>
                </button>

                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className="h-8 w-8 shrink-0 rounded-xl border flex items-center justify-center bg-white/[0.07] group/heart transition-all duration-500 ease-in-out"
                  style={{
                    borderColor: isLiked ? "rgba(239, 68, 68, 0.6)" : "rgba(255,255,255,0.2)",
                    backgroundColor: isLiked ? "rgba(239, 68, 68, 0.2)" : "rgba(255,255,255,0.07)",
                    color: isLiked ? "#ef4444" : "#e4e4e7"
                  }}
                  onMouseEnter={(e) => { 
                    e.currentTarget.style.borderColor = isLiked ? "rgba(239, 68, 68, 0.9)" : "rgba(239, 68, 68, 0.5)"
                    e.currentTarget.style.color = isLiked ? "#f87171" : "#ef4444"
                    if (!isLiked) e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.08)"
                  }}
                  onMouseLeave={(e) => { 
                    e.currentTarget.style.borderColor = isLiked ? "rgba(239, 68, 68, 0.6)" : "rgba(255,255,255,0.2)"
                    e.currentTarget.style.color = isLiked ? "#ef4444" : "#e4e4e7"
                    e.currentTarget.style.backgroundColor = isLiked ? "rgba(239, 68, 68, 0.2)" : "rgba(255,255,255,0.07)"
                  }}
                >
                  <Heart className={`h-3 w-3 transition-transform duration-300 group-hover/heart:scale-110 ${isLiked ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={handleAddToCart}
                  className="h-8 w-8 shrink-0 rounded-xl bg-white/[0.07] border border-white/20 text-zinc-200 hover:text-black hover:bg-white hover:border-transparent flex items-center justify-center transition-all duration-500 ease-in-out"
                  title="Добавить в корзину"
                >
                  <ShoppingBag className="h-3 w-3" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.05] backdrop-blur-md select-none w-fit shadow-sm">
              <Sparkles className="h-2.5 w-2.5 text-zinc-400" />
              <span className="text-[8px] font-black tracking-widest text-zinc-400 uppercase">
                Избранное
              </span>
            </div>

          </div>
        </div>

      </div>

      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes equalizer {
          0% { height: 4px; }
          100% { height: 12px; }
        }
      `}</style>

    </div>
  )
}