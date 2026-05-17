"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Play, Pause, Music2, Calendar, Gauge, Disc, ShoppingCart, Check, ChevronLeft, Eye, Heart, Download } from "lucide-react"
import { usePlayerStore } from "@/stores/player-store"
import { useRecentStore } from "@/stores/recent-store"
import { MOCK_BEATS } from "@/mocks/beats"
import { BeatLicense } from "@/types/beat"

export default function BeatPage() {
  const params = useParams()
  const { track, isPlaying, play, togglePlay } = usePlayerStore()
  const addToRecent = useRecentStore((state) => state.addItem)

  const idFromUrl = React.useMemo(() => {
    const rawId = Array.isArray(params.id) ? params.id[0] : params.id
    return rawId ? Number(rawId) : NaN
  }, [params.id])

  const beat = React.useMemo(() => {
    return MOCK_BEATS.find((b) => b.id === idFromUrl)
  }, [idFromUrl])

  if (!beat) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white bg-brand-bg gap-6">
        <h1 className="text-4xl font-black uppercase tracking-widest text-zinc-600">Beat Not Found</h1>
        <Link href="/" className="text-brand-red font-bold uppercase text-sm tracking-wider hover:underline flex items-center gap-2">
          <ChevronLeft size={16} /> Back to Marketplace
        </Link>
      </div>
    )
  }

  const isCurrent = track?.id === beat.id

  const handlePlay = () => {
    if (isCurrent) {
      togglePlay()
    } else {
      play({
        id: beat.id,
        publicId: beat.publicId,
        title: beat.title,
        author: beat.producerDisplayName,
        image: beat.image,
        audio: beat.audio,
      })
      addToRecent(beat)
    }
  }

  // Форматирование секунд в формат ММ:СС
  const formatDuration = (s: number) => {
    if (!s) return "0:00"
    const mins = Math.floor(s / 60)
    const secs = Math.floor(s % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <main className="min-h-screen pt-32 pb-44 px-6 max-w-7xl mx-auto bg-brand-bg text-white relative overflow-hidden">
      {/* Задний размытый фон для атмосферы кино */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-red/10 blur-[160px] rounded-full pointer-events-none z-0" />

      {/* Кнопка Назад */}
      <Link href="/" className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors uppercase text-[10px] tracking-[0.3em] font-bold mb-12 z-10 relative">
        <ChevronLeft size={14} /> Back to explore
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start relative z-10">
        
        {/* ЛЕВАЯ КОЛОНКА: МЕГА-ОБЛОЖКА */}
        <div className="lg:col-span-5 sticky top-32">
          <div className="relative aspect-square w-full rounded-[40px] overflow-hidden border border-white/5 bg-zinc-900 group shadow-[0_50px_100px_rgba(0,0,0,0.8)]">
            <Image src={beat.image} alt={beat.title} fill priority className="object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button onClick={handlePlay} className="w-24 h-24 flex items-center justify-center rounded-full bg-white text-black hover:bg-brand-red hover:text-white transition-all duration-300 transform scale-90 group-hover:scale-100 shadow-2xl">
                {isCurrent && isPlaying ? <Pause size={36} fill="currentColor" /> : <Play size={36} className="ml-2" fill="currentColor" />}
              </button>
            </div>
          </div>

          {/* Быстрая статистика под обложкой (BPM, Тональность, Время) */}
          <div className="grid grid-cols-3 gap-4 mt-8 p-6 rounded-3xl bg-brand-card/20 border border-white/5 backdrop-blur-md">
            <div className="flex flex-col items-center justify-center text-center">
              <Gauge size={18} className="text-brand-red mb-2" />
              <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">BPM</span>
              <span className="text-base font-black mt-0.5">{beat.bpm}</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center border-x border-white/5">
              <Disc size={18} className="text-brand-red mb-2" />
              <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">KEY</span>
              <span className="text-base font-black mt-0.5">{beat.musicKey}</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center">
              <Calendar size={18} className="text-brand-red mb-2" />
              <span className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">DURATION</span>
              <span className="text-base font-black mt-0.5">{formatDuration(beat.duration)}</span>
            </div>
          </div>

          {/* Социальная статистика бита (Прослушивания, Лайки, Скачивания) */}
          <div className="flex justify-between px-6 py-4 mt-4 rounded-2xl bg-zinc-900/40 border border-white/5 text-xs font-bold text-zinc-400 uppercase tracking-wider">
            <span className="flex items-center gap-2"><Eye size={14} className="text-zinc-600" /> {beat.plays} Plays</span>
            <span className="flex items-center gap-2"><Heart size={14} className="text-zinc-600" /> {beat.likes} Likes</span>
            <span className="flex items-center gap-2"><Download size={14} className="text-zinc-600" /> {beat.downloads}</span>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА: ИНФО И ЛИЦЕНЗИИ */}
        <div className="lg:col-span-7">
          <div className="mb-12">
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight mb-4 leading-none text-white">
              {beat.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link href={`/${beat.producerUsername}`} className="text-sm text-brand-red font-black uppercase tracking-[0.2em] hover:text-white transition-colors">
                Produced by {beat.producerDisplayName}
              </Link>
              <span className="text-xs text-zinc-600 uppercase font-black tracking-widest px-3 py-1 bg-zinc-900 rounded-full border border-white/5">
                {beat.genre}
              </span>
            </div>

            {/* Рендеринг тегов бита из массива tags */}
            {beat.tags && beat.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {beat.tags.map((tag, index) => (
                  <span key={index} className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6">Select License</h3>
          
          <div className="space-y-4">
            {beat.licenses?.map((license: BeatLicense) => (
              <div key={license.id} className="group flex flex-col md:flex-row md:items-center justify-between p-6 md:p-8 rounded-[32px] bg-brand-card/30 border border-white/5 hover:border-brand-red/40 hover:bg-brand-card/60 transition-all duration-300 backdrop-blur-sm">
                <div className="flex items-center gap-6">
                  <div className="h-14 w-14 rounded-2xl bg-zinc-950 flex items-center justify-center text-zinc-500 border border-white/5 group-hover:text-brand-red group-hover:border-brand-red/20 transition-colors">
                    <Music2 size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl text-white group-hover:text-brand-red transition-colors">{license.title}</h4>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1.5">
                      <span className="flex items-center gap-1.5">
                        <Check size={12} strokeWidth={3} className="text-brand-red" /> MP3
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Check size={12} strokeWidth={3} className={license.wavIncluded ? "text-brand-red" : "text-zinc-800"} /> WAV
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Check size={12} strokeWidth={3} className={license.stemsIncluded ? "text-brand-red" : "text-zinc-800"} /> STEMS
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Check size={12} strokeWidth={3} className={license.trackoutIncluded ? "text-brand-red" : "text-zinc-800"} /> TRACKOUT
                      </span>
                      {license.unlimitedStreams && (
                        <span className="text-brand-red font-extrabold bg-brand-red/10 px-1.5 py-0.5 rounded text-[9px]">
                          UNLIMITED STREAMS
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button className="mt-6 md:mt-0 bg-white text-black hover:bg-brand-red hover:text-white px-8 py-4 rounded-xl font-black text-sm flex items-center justify-center gap-3 transition-all duration-300 active:scale-95 shadow-xl">
                  <ShoppingCart size={16} strokeWidth={2.5} />
                  <span>${license.price}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  )
}