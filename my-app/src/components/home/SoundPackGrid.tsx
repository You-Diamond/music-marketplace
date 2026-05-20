"use client"

import { ShoppingBag, Play, ChevronLeft, ChevronRight, Layers } from "lucide-react"
import Link from "next/link"
import { useScrollController } from "@/hooks/useScrollController"
import { useEffect } from "react"

interface PackProps {
  id: string
  title: string
  image: string | null
  price: number
  soundsCount: number
}

export default function SoundPackGrid({ packs }: { packs: PackProps[] }) {
  const { scrollContainerRef, scroll, canScrollLeft, canScrollRight, checkScrollBounds } = useScrollController()

  useEffect(() => {
    checkScrollBounds()
  }, [packs])

  return (
    <div className="w-full space-y-6 group/carousel relative">
      <div className="flex items-end justify-between w-full px-1">
        <div className="space-y-1">
          <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-purple-400 flex items-center gap-1.5">
            <Layers className="h-3 w-3" /> Студийный софт
          </span>
          <h2 className="text-2xl font-semibold tracking-tight text-white">Сэмпл-паки и Kits</h2>
        </div>
        <Link href="/packs" className="text-xs font-medium text-zinc-400 hover:text-white transition-colors">
          Все паки
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
          {packs.map((pack) => (
            <div
              key={pack.id}
              className="w-[230px] shrink-0 snap-start bg-zinc-900/10 hover:bg-purple-500/[0.01] backdrop-blur-md border border-white/[0.03] hover:border-purple-500/25 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_4px_30px_rgba(168,85,247,0.04)]"
            >
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-zinc-900/50 border border-white/[0.02]">
                <img src={pack.image || "/placeholder.jpg"} alt={pack.title} className="w-full h-full object-cover" />
                
                {/* Инженерный бейдж */}
                <div className="absolute top-3 left-3 h-5 px-2 rounded-md bg-purple-500/10 border border-purple-500/20 backdrop-blur-md flex items-center gap-1 text-purple-400">
                  <Layers className="h-2.5 w-2.5" />
                  <span className="text-[8px] font-black tracking-wider uppercase">Wav Kit</span>
                </div>
              </div>

              <div className="pt-4 pb-2">
                <Link href={`/pack/${pack.id}`} className="block">
                  <h3 className="text-sm font-semibold text-white tracking-tight truncate hover:text-purple-400 transition-colors">
                    {pack.title}
                  </h3>
                </Link>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[11px] text-zinc-500 font-mono">{pack.soundsCount} сэмплов</span>
                  <span className="text-xs font-bold text-white font-mono">${pack.price}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2 pt-1">
                <button className="flex-1 h-8 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-white hover:text-black hover:border-transparent text-[10px] font-medium text-white transition-all duration-200 flex items-center justify-center gap-1">
                  <Play className="h-2.5 w-2.5 fill-current" /> Превью
                </button>
                <button onClick={(e) => e.preventDefault()} className="h-8 px-3 rounded-lg bg-white/[0.01] border border-white/[0.05] text-zinc-400 hover:text-white flex items-center justify-center shrink-0 hover:border-white/[0.1]">
                  <ShoppingBag className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}