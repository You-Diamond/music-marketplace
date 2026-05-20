"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useScrollController } from "@/hooks/useScrollController"
import { useEffect } from "react"

interface GenreProps {
  id: string
  name: string
  slug: string
  _count?: { tracks: number }
}

export default function GenreGrid({ genres }: { genres: GenreProps[] }) {
  const { scrollContainerRef, scroll, canScrollLeft, canScrollRight, checkScrollBounds } = useScrollController()

  useEffect(() => {
    checkScrollBounds()
  }, [genres])

  return (
    <div className="w-full space-y-6 group/carousel relative">
      <div className="flex items-end justify-between w-full px-1">
        <div className="space-y-1">
          <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-zinc-500">Фильтр каталога</span>
          <h2 className="text-2xl font-semibold tracking-tight text-white">Популярные жанры</h2>
        </div>
      </div>

      <div className="relative px-1">
        {/* Стрелочки строго по краям */}
        <button
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className={`absolute left-[-20px] top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full border bg-[#0c0d12]/90 border-white/[0.08] backdrop-blur-md flex items-center justify-center text-white shadow-xl transition-all duration-300 sm:opacity-0 group-hover/carousel:opacity-100 md:hover:bg-zinc-900 ${
            !canScrollLeft && "hidden"
          }`}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className={`absolute right-[-20px] top-1/2 -translate-y-1/2 z-20 h-9 w-9 rounded-full border bg-[#0c0d12]/90 border-white/[0.08] backdrop-blur-md flex items-center justify-center text-white shadow-xl transition-all duration-300 sm:opacity-0 group-hover/carousel:opacity-100 md:hover:bg-zinc-900 ${
            !canScrollRight && "hidden"
          }`}
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        {/* Горизонтальный контейнер-лента */}
        <div 
          ref={scrollContainerRef}
          className="w-full flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory"
        >
          {genres.map((genre) => (
            <Link
              key={genre.id}
              href={`/beats?genre=${genre.slug}`}
              className="shrink-0 snap-start px-5 py-3 rounded-full bg-zinc-900/40 hover:bg-zinc-800/60 border border-white/[0.04] hover:border-white/[0.1] flex flex-col items-center justify-center min-w-[130px] transition-all duration-200"
            >
              <span className="text-xs font-semibold text-zinc-200 tracking-wide text-center">
                {genre.name}
              </span>
              {genre._count && (
                <span className="text-[9px] text-zinc-500 font-mono mt-0.5">
                  {genre._count.tracks} треков
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}