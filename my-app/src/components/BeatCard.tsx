"use client"

import Image from "next/image"
import Link from "next/link"
import { Play, Pause, Heart, ShoppingCart } from "lucide-react"
import { Beat } from "@/types/beat"
import { usePlayerStore } from "@/stores/player-store"
import { useRecentStore } from "@/stores/recent-store"

type Props = {
  beat: Beat
}

export default function BeatCard({ beat }: Props) {
  const track = usePlayerStore((state) => state.track)
  const isPlaying = usePlayerStore((state) => state.isPlaying)
  const play = usePlayerStore((state) => state.play)
  const togglePlay = usePlayerStore((state) => state.togglePlay)
  const addToRecent = useRecentStore((state) => state.addItem)

  const isCurrent = track?.id === beat.id

  const handlePlay = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isCurrent) {
      togglePlay();
    } else {
      play({
        id: beat.id,
        publicId: beat.publicId,
        title: beat.title,
        author: beat.producerDisplayName,
        image: beat.image,
        audio: beat.audio,
      });
      addToRecent(beat);
    }
  };

  const price = beat.licenses?.length > 0 
    ? Math.min(...beat.licenses.map(l => l.price)) 
    : 0

  const fallbackImage = beat.image || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&auto=format&fit=crop"

  return (
    /* ЭФФЕКТ ЖИДКОГО СТЕКЛА: 
      bg-white/40 днем и bg-white/[0.02] ночью пропускают свет фоновых сфер.
      backdrop-blur-2xl матово размывает этот свет внутри карточки.
      border-white/40 создает тонкий хрустальный отблеск на гранях.
    */
    <div className="group relative transition-all duration-300 rounded-[36px] p-3
      bg-white/40 dark:bg-white/[0.02]
      backdrop-blur-2xl
      border border-white/40 dark:border-white/5
      shadow-[0_8px_32px_0_rgba(0,0,0,0.02)] dark:shadow-none
      hover:-translate-y-1.5 
      hover:bg-white/60 dark:hover:bg-white/[0.05]
      hover:border-white/60 dark:hover:border-white/10
      hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)]
    ">
      
      {/* КОНТЕЙНЕР ОБЛОЖКИ */}
      <Link 
        href={`/beats/${beat.id}`} 
        className="block relative aspect-square overflow-hidden rounded-[26px] border border-zinc-200/30 dark:border-zinc-800/50 bg-zinc-100/50 dark:bg-zinc-900/30"
      >
        <Image 
          src={fallbackImage} 
          alt={beat.title || "Beat cover"} 
          fill 
          className="object-cover transition-transform duration-700 group-hover:scale-105" 
        />
        
        {/* ОВЕРЛЕЙ КНОПКИ PLAY */}
        <div className="absolute inset-0 bg-black/10 dark:bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button 
            onClick={handlePlay}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black transition-all duration-300 transform scale-90 group-hover:scale-100 hover:bg-brand-red hover:text-white shadow-xl"
          >
            {isCurrent && isPlaying ? (
              <Pause size={22} fill="currentColor" />
            ) : (
              <Play size={22} className="ml-0.5" fill="currentColor" />
            )}
          </button>
        </div>
      </Link>

      {/* ИНФОРМАЦИЯ О ТРЕКЕ */}
      <div className="mt-4 px-1">
        <div className="flex justify-between items-start gap-3">
          <div className="min-w-0 flex flex-col">
            <Link 
              href={`/beats/${beat.id}`} 
              className="font-black text-base uppercase truncate text-zinc-950 dark:text-white tracking-tight leading-none transition-colors group-hover:text-brand-red hover:text-brand-red"
            >
              {beat.title}
            </Link>
            
            <Link 
              href={`/${beat.producerUsername}`} 
              className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.18em] font-bold mt-2 hover:text-zinc-950 dark:hover:text-zinc-200 transition-colors block"
            >
              {beat.producerDisplayName}
            </Link>
          </div>
          
          <button className="text-zinc-400 dark:text-zinc-600 hover:text-brand-red dark:hover:text-brand-red transition-colors pt-0.5 shrink-0">
            <Heart size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* ВЫСОКОКОНТРАСТНАЯ КНОПКА ПОКУПКИ */}
        <button 
          className="mt-5 w-full flex items-center justify-center gap-2.5 rounded-xl py-3.5 text-xs font-black uppercase tracking-widest transition-all duration-200 active:scale-[0.98]
            /* В светлой теме: Сплошной черный уголь с белым текстом */
            bg-zinc-950 text-white hover:bg-brand-red
            /* В темной теме: Кинематографичный кристально-белый с черным текстом */
            dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-brand-red dark:hover:text-white
            shadow-md shadow-zinc-950/5 dark:shadow-none hover:shadow-brand-red/20 dark:hover:shadow-brand-red/20"
        >
          <ShoppingCart size={14} strokeWidth={2.5} />
          <span>${price}</span>
        </button>
      </div>

    </div>
  )
}