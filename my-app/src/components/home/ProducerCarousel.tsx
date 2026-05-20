"use client"

import { User, ChevronLeft, ChevronRight, CheckCircle2, Users, Music } from "lucide-react"
import Link from "next/link"
import { useScrollController } from "@/hooks/useScrollController"
import { useEffect } from "react"

interface ProducerProps {
  id: string
  username: string
  displayName: string | null
  avatar: string | null
  verified: boolean
  followersCount: number
  _count: { tracks: number }
}

interface CarouselProps {
  producers: ProducerProps[]
  displayType: "followers" | "tracks"
}

export default function ProducerCarousel({ producers, displayType }: CarouselProps) {
  const { scrollContainerRef, scroll, canScrollLeft, canScrollRight, checkScrollBounds } = useScrollController()

  useEffect(() => {
    checkScrollBounds()
  }, [producers])

  return (
    <div className="w-full group/carousel relative">
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
          className="w-full flex gap-5 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
        >
          {producers.map((producer) => (
            <div
              key={producer.id}
              className={`w-[190px] shrink-0 snap-start bg-zinc-900/10 backdrop-blur-md border rounded-2xl p-4 flex flex-col items-center gap-4 transition-all duration-300 shadow-[0_4px_30px_rgba(0,0,0,0.15)] ${
                producer.verified 
                  ? "border-blue-500/15 hover:border-blue-400/40 bg-blue-950/[0.01] hover:shadow-[0_4px_30px_rgba(59,130,246,0.04)]" 
                  : "border-white/[0.02] hover:border-white/[0.08]"
              }`}
            >
              {/* Аватар */}
              <div className={`relative h-20 w-20 rounded-full bg-zinc-900 border flex items-center justify-center shrink-0 ${
                producer.verified ? "border-blue-500/20" : "border-white/[0.04]"
              }`}>
                {producer.avatar ? (
                  <img src={producer.avatar} alt={producer.displayName || producer.username} className="w-full h-full object-cover rounded-full" />
                ) : (
                  <User className="h-6 w-6 text-zinc-700" />
                )}
                
                {producer.verified && (
                  <div className="absolute bottom-0 right-0 bg-[#0c0d12] rounded-full p-0.5">
                    <CheckCircle2 className="h-4 w-4 text-blue-400 fill-blue-950" />
                  </div>
                )}
              </div>

              {/* Инфо */}
              <div className="w-full text-center min-w-0 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-white tracking-tight truncate hover:text-zinc-300">
                    {producer.displayName || producer.username}
                  </h3>
                  <p className="text-[10px] text-zinc-500 truncate mt-0.5 font-light">@{producer.username}</p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/[0.03] flex items-center justify-center gap-1.5">
                  {displayType === "followers" ? (
                    <>
                      <Users className="h-3 w-3 text-zinc-500" />
                      <span className="text-[10px] text-zinc-300 font-mono font-medium">
                        {producer.followersCount.toLocaleString()} фолловеров
                      </span>
                    </>
                  ) : (
                    <>
                      <Music className="h-3 w-3 text-zinc-500" />
                      <span className="text-[10px] text-zinc-300 font-mono font-medium">
                        {producer._count.tracks} треков
                      </span>
                    </>
                  )}
                </div>
              </div>

              <Link
                href={`/user/${producer.username}`}
                className="w-full h-7 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-white hover:text-black hover:border-transparent text-[10px] font-medium text-white transition-all duration-200 flex items-center justify-center"
              >
                Профиль
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}