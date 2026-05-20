"use client"

import { ShoppingBag, Play, Heart, ChevronLeft, ChevronRight, Flame } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useScrollController } from "@/hooks/useScrollController"
import { addToCart } from "@/app/actions/cart"

interface TrackProps {
  id: string
  title: string
  image: string | null
  bpm: number
  musicKey: string
  startingPrice: number
  producer: { username: string; displayName: string | null }
}

export default function TrendingTracks({ tracks }: { tracks: TrackProps[] }) {
  const [likedTracks, setLikedTracks] = useState<Record<string, boolean>>({})
  const { scrollContainerRef, scroll, canScrollLeft, canScrollRight, checkScrollBounds } = useScrollController()

  const toggleLike = (id: string) => {
    setLikedTracks(prev => ({ ...prev, [id]: !prev[id] }))
  }

  useEffect(() => {
    checkScrollBounds()
  }, [tracks])

const handleAddToCart = async (trackId: string, title: string) => {
  const res = await addToCart(trackId)
  if (res.success) {
    alert(`Бит "${title}" добавлен в корзину!`)
  } else {
    alert(res.error)
  }
}

  return (
    <div className="w-full space-y-6 group/carousel relative">
      <div className="flex items-end justify-between w-full px-1">
        <div className="space-y-1">
          <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-red-400 flex items-center gap-1.5 animate-pulse">
            <Flame className="h-3 w-3 fill-current" /> Горячие хиты
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-white">В тренде сейчас</h2>
        </div>
      </div>

      <div className="relative px-1">
        <div 
          ref={scrollContainerRef}
          className="w-full flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
        >
          {tracks.map((track) => {
            const isLiked = likedTracks[track.id]
            return (
              <div 
                key={track.id}
                className="w-[280px] shrink-0 snap-start bg-zinc-900/10 backdrop-blur-md border border-white/[0.05] rounded-2xl p-4 transition-all duration-500 hover:border-red-500/50 ring-1 ring-transparent hover:ring-red-500/30 shadow-[0_0_0_rgba(239,68,68,0)] hover:shadow-[0_0_30px_rgba(239,68,68,0.15)] group/track"
              >
                {/* ОБЛОЖКА */}
                <Link href={`/beats/${track.id}`} className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-900/50 group/cover block">
                  <img src={track.image || "/placeholder.jpg"} alt={track.title} className="w-full h-full object-cover transition-transform duration-700 group-hover/cover:scale-110" />
                  
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/track:opacity-100 transition-opacity duration-300">
                    <div className="h-12 w-12 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] transform scale-90 group-hover/track:scale-100 transition-transform">
                      <Play className="h-5 w-5 fill-current ml-1" />
                    </div>
                  </div>
                </Link>

                {/* ИНФО */}
                <div className="pt-4 space-y-0.5">
                  <Link href={`/beats/${track.id}`} className="text-sm font-semibold text-white truncate block hover:text-red-400 transition-colors">{track.title}</Link>
                  <Link href={`/producer/${track.producer.username}`} className="text-xs text-zinc-500 hover:text-white transition-colors truncate block">
                    by {track.producer.displayName || `@${track.producer.username}`}
                  </Link>
                </div>

                {/* НИЖНЯЯ ПАНЕЛЬ */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/[0.05]">
                  <button 
                    onClick={() => handleAddToCart(track.id, track.title)} 
                    className="flex-1 h-8 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(220,38,38,0.3)]"
                  >
                    <ShoppingBag className="h-3 w-3" /> 
                    {track.startingPrice > 0 ? `Купить $${track.startingPrice}` : "Купить"}
                  </button>
                  
                  <button 
                    onClick={() => toggleLike(track.id)} 
                    className={`h-8 w-8 rounded-lg border flex items-center justify-center transition-all ${isLiked ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-white/[0.01] border-white/[0.05] text-zinc-400 hover:text-white hover:border-white/[0.2]'}`}
                  >
                    <Heart className={`h-3 w-3 ${isLiked ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}