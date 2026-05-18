"use client"

import * as React from "react"
import Link from "next/link"
import { Flame, ArrowRight } from "lucide-react"
import BeatCard from "@/components/BeatCard"
import { useTrendingTracksStore } from "@/stores/useTrendingTracksStore"

export default function TrendingBeatsSection() {
  const { tracks, isLoading, fetchTrendingTracks } = useTrendingTracksStore()

  React.useEffect(() => {
    fetchTrendingTracks()
  }, [fetchTrendingTracks])

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 bg-transparent">
      {/* Заголовок секции */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-red">
            <span className="shrink-0"><Flame size={16} /></span>
            <h2 className="text-xs md:text-sm font-black uppercase tracking-wider text-zinc-950 dark:text-white">
              Trending Beats
            </h2>
          </div>
          <p className="text-[10px] md:text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1.5">
            Top charts right now
          </p>
        </div>

        <div className="shrink-0">
          <Link 
            href="/charts" 
            className="group flex items-center gap-1.5 rounded-xl border border-white/40 dark:border-white/5 bg-white/30 dark:bg-white/[0.01] backdrop-blur-md px-3.5 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-950 dark:text-white hover:text-brand-red dark:hover:text-brand-red transition-all active:scale-95"
          >
            <span>See Top Charts</span>
            <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
          </Link>
        </div>
      </div>

      {/* Сетка треков */}
      {isLoading ? (
        // Скелетон загрузки
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="aspect-square bg-zinc-200 dark:bg-zinc-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {tracks.map((track) => (
            <BeatCard 
              key={track.id} 
              // Обрати внимание: теперь мы передаем реальные данные с бэкенда!
              // Тебе может понадобиться немного обновить интерфейс внутри самого BeatCard,
              // чтобы он принимал тип ExtendedTrack из Prisma.
              beat={track as any} 
            />
          ))}
        </div>
      )}
    </section>
  )
}