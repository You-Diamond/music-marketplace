"use client"

import { Disc, ChevronLeft, ChevronRight, ListMusic, Sparkles } from "lucide-react"
import Link from "next/link"
import { useScrollController } from "@/hooks/useScrollController"
import { useEffect } from "react"

interface PlaylistProps {
  id: string
  title: string
  image: string | null
  description: string | null
  isFeatured: boolean
  _count: { tracks: number }
}

export default function FeaturedPlaylists({ playlists }: { playlists: PlaylistProps[] }) {
  const { scrollContainerRef, scroll, canScrollLeft, canScrollRight, checkScrollBounds } = useScrollController()

  useEffect(() => {
    checkScrollBounds()
  }, [playlists])

  return (
    <div className="w-full space-y-6 group/carousel relative">
      <div className="flex items-end justify-between w-full px-1">
        <div className="space-y-1">
          <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-amber-400 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 fill-current animate-spin-slow" /> Эксклюзив
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-white">Авторские плейлисты</h2>
        </div>
        <Link href="/playlists" className="text-xs font-medium text-zinc-400 hover:text-white transition-colors">
          Все плейлисты
        </Link>
      </div>

      <div className="relative px-1">
        <button
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className={`absolute left-[-20px] top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full border bg-[#0c0d12]/90 border-white/[0.08] backdrop-blur-md flex items-center justify-center text-white shadow-xl transition-all duration-300 sm:opacity-0 group-hover/carousel:opacity-100 md:hover:bg-zinc-900 ${
            !canScrollLeft && "hidden"
          }`}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className={`absolute right-[-20px] top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full border bg-[#0c0d12]/90 border-white/[0.08] backdrop-blur-md flex items-center justify-center text-white shadow-xl transition-all duration-300 sm:opacity-0 group-hover/carousel:opacity-100 md:hover:bg-zinc-900 ${
            !canScrollRight && "hidden"
          }`}
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div 
          ref={scrollContainerRef}
          className="w-full flex gap-6 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
        >
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="w-[260px] shrink-0 snap-start bg-zinc-900/10 hover:bg-amber-500/[0.01] backdrop-blur-md border border-white/[0.03] hover:border-amber-500/30 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_30px_rgba(245,158,11,0.03)]"
            >
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-zinc-900/50 border border-white/[0.02] group/cover">
                <img src={playlist.image || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=400"} alt={playlist.title} className="w-full h-full object-cover transition-transform duration-700 group-hover/cover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                {/* Бейдж выбора редакции */}
                <div className="absolute top-3 left-3 h-5 px-2 rounded-md bg-amber-500/10 border border-amber-500/20 backdrop-blur-md flex items-center gap-1 text-amber-400">
                  <Sparkles className="h-2.5 w-2.5 fill-current" />
                  <span className="text-[8px] font-black tracking-wider uppercase">Curated</span>
                </div>

                <div className="absolute bottom-3 right-3 h-5 px-2 rounded-md bg-black/60 backdrop-blur-md border border-white/[0.05] flex items-center gap-1">
                  <ListMusic className="h-2.5 w-2.5 text-zinc-400" />
                  <span className="text-[8px] font-medium text-zinc-300">Mix</span>
                </div>
              </div>

              <div className="pt-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <Link href={`/playlists/${playlist.id}`} className="block">
                    <h3 className="text-sm font-semibold text-white tracking-tight truncate hover:text-amber-400 transition-colors">
                      {playlist.title}
                    </h3>
                  </Link>
                  {playlist.description && (
                    <p className="text-xs text-zinc-500 line-clamp-1 font-light">{playlist.description}</p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.03] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Disc className="h-3 w-3 text-zinc-500" />
                    <span className="text-[10px] font-mono font-medium tracking-wide">{playlist._count.tracks} треков</span>
                  </div>
                  <Link href={`/playlists/${playlist.id}`} className="text-[10px] font-medium text-zinc-400 hover:text-white transition-colors">Слушать →</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}