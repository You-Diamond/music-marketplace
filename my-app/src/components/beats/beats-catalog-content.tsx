"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Search, SlidersHorizontal, Music, Disc, Play, Heart, ShoppingBag, X, User } from "lucide-react"
import { ExtendedTrack } from "@/stores/usePromoTracksStore"
import { usePlayerStore } from "@/stores/player-store"
import { addToCart } from "@/app/actions/cart"

interface Genre {
  id: string
  name: string
  slug: string
}

export default function BeatsCatalogContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = React.useState(searchParams.get("query") || "")
  const [selectedGenre, setSelectedGenre] = React.useState(searchParams.get("genre") || "all")
  const [selectedKey, setSelectedKey] = React.useState(searchParams.get("musicKey") || "all")
  const [selectedProducer, setSelectedProducer] = React.useState(searchParams.get("producer") || "")
  
  const [bpmRange, setBpmRange] = React.useState({
    min: Number(searchParams.get("bpmMin")) || 60,
    max: Number(searchParams.get("bpmMax")) || 180,
  })
  const [sortBy, setSortBy] = React.useState(searchParams.get("sortBy") || "createdAt")

  const [beats, setBeats] = React.useState<ExtendedTrack[]>([])
  const [genres, setGenres] = React.useState<Genre[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [likedTracks, setLikedTracks] = React.useState<Record<string, boolean>>({})

  const { play, track: currentTrack, isPlaying } = usePlayerStore()

  const musicKeys = ["A Minor", "C Major", "D Minor", "E Minor", "F# Minor", "G Minor"]

  const toggleLike = (id: string) => {
    setLikedTracks((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  React.useEffect(() => {
    fetch("/api/genres")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setGenres(data)
      })
      .catch((err) => console.error("Ошибка загрузки жанров:", err))
  }, [])

  const fetchFilteredBeats = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set("query", searchQuery)
      if (selectedGenre !== "all") params.set("genre", selectedGenre)
      if (selectedKey !== "all") params.set("musicKey", selectedKey)
      if (selectedProducer) params.set("producer", selectedProducer)
      if (bpmRange.min !== 60) params.set("bpmMin", bpmRange.min.toString())
      if (bpmRange.max !== 180) params.set("bpmMax", bpmRange.max.toString())
      if (sortBy !== "createdAt") params.set("sortBy", sortBy)

      router.push(`${pathname}?${params.toString()}`, { scroll: false })

      const res = await fetch(`/api/beats/search?${params.toString()}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setBeats(data)
      }
    } catch (error) {
      console.error("Ошибка фильтрации битов:", error)
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, selectedGenre, selectedKey, selectedProducer, bpmRange, sortBy, router, pathname])

  React.useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchFilteredBeats()
    }, 350)

    return () => clearTimeout(delayDebounce)
  }, [fetchFilteredBeats])

  React.useEffect(() => {
    setSelectedProducer(searchParams.get("producer") || "")
  }, [searchParams])

  const handleAddToCart = async (trackId: string, title: string) => {
    const res = await addToCart(trackId)
    if (res.success) {
      alert(`Бит "${title}" добавлен в корзину!`)
    } else {
      alert(res.error)
    }
  }

  return (
    <div className="min-h-screen bg-[#0c0d12] text-zinc-100 p-4 sm:p-8 lg:p-12 transition-colors">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight text-white">Магазин битов</h1>
            <p className="text-sm text-zinc-500">Премиальный продакшн от топовых мейкеров индустрии</p>
          </div>

          {selectedProducer && (
            <div className="flex items-center gap-2.5 bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400">
                <User size={14} />
                Каталог продюсера: <span className="text-white font-mono">@{selectedProducer}</span>
              </div>
              <button 
                onClick={() => setSelectedProducer("")}
                className="h-5 w-5 rounded-md bg-purple-500/10 hover:bg-purple-500/30 text-purple-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Поиск по названию бита или тегам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/40 border border-white/[0.08] pl-12 pr-4 py-3 rounded-xl outline-none focus:border-purple-500/50 transition-all text-sm text-white placeholder-zinc-600 shadow-sm"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-zinc-900/40 border border-white/[0.08] text-zinc-300 px-6 py-3 rounded-xl outline-none font-medium cursor-pointer text-sm shadow-sm focus:border-purple-500/50"
          >
            <option value="createdAt" className="bg-[#0c0d12]">Новинки</option>
            <option value="plays" className="bg-[#0c0d12]">Популярные</option>
            <option value="likes" className="bg-[#0c0d12]">Избранные</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-8 items-start relative">
          <aside className="bg-zinc-900/20 border border-white/[0.05] p-5 rounded-2xl space-y-6 lg:sticky lg:top-24 max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-none backdrop-blur-md z-10">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 border-b border-white/[0.03] pb-3">
              <SlidersHorizontal size={14} className="text-purple-400" />
              Параметры каталога
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Жанр</label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full bg-black/40 border border-white/[0.05] p-2.5 rounded-lg outline-none text-sm font-medium text-zinc-300 focus:border-purple-500/30 cursor-pointer"
              >
                <option value="all" className="bg-[#0c0d12]">Все жанры</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.slug} className="bg-[#0c0d12]">{g.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Тональность</label>
              <select
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                className="w-full bg-black/40 border border-white/[0.05] p-2.5 rounded-lg outline-none text-sm font-medium text-zinc-300 focus:border-purple-500/30 cursor-pointer"
              >
                <option value="all" className="bg-[#0c0d12]">Любая тональность</option>
                {musicKeys.map((k) => (
                  <option key={k} value={k} className="bg-[#0c0d12]">{k}</option>
                ))}
              </select>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                <span className="text-zinc-500">Темп (BPM)</span>
                <span className="text-purple-400 font-mono font-bold">{bpmRange.min} - {bpmRange.max}</span>
              </div>
              <div className="space-y-3 pt-1">
                <div>
                  <span className="text-[9px] text-zinc-600 block mb-1">Минимум:</span>
                  <input
                    type="range"
                    min="60"
                    max="180"
                    value={bpmRange.min}
                    onChange={(e) => setBpmRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
                <div>
                  <span className="text-[9px] text-zinc-600 block mb-1">Максимум:</span>
                  <input
                    type="range"
                    min="60"
                    max="180"
                    value={bpmRange.max}
                    onChange={(e) => setBpmRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                  />
                </div>
              </div>
            </div>

            {(selectedGenre !== "all" || selectedKey !== "all" || searchQuery || selectedProducer || bpmRange.min !== 60 || bpmRange.max !== 180) && (
              <button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedGenre("all")
                  setSelectedKey("all")
                  setSelectedProducer("")
                  setBpmRange({ min: 60, max: 180 })
                }}
                className="w-full h-9 rounded-xl border border-dashed border-zinc-800 hover:border-zinc-700 text-zinc-500 hover:text-zinc-400 text-xs font-semibold transition-all flex items-center justify-center gap-2"
              >
                Сбросить фильтры
              </button>
            )}
          </aside>

          <main className="lg:col-span-3 xl:col-span-4">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} className="w-full aspect-[4/5] bg-zinc-900/20 border border-white/[0.05] animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : beats.length === 0 ? (
              <div className="text-center py-20 bg-zinc-900/10 border border-white/[0.05] rounded-2xl">
                <Disc className="mx-auto text-zinc-700 h-12 w-12" />
                <p className="mt-4 text-zinc-500 text-sm font-medium">Биты по вашему запросу не найдены</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {beats.map((b) => {
                  const basePrice = b.licenses?.[0]?.price || 29.99
                  const isCurrent = currentTrack?.id === b.id
                  const isLiked = !!likedTracks[b.id]

                  return (
                    <div key={b.id} className={`group bg-zinc-900/20 border p-3 rounded-2xl hover:bg-zinc-900/40 transition-all duration-200 flex flex-col justify-between ${isCurrent ? "border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.05)]" : "border-white/[0.05]"}`}>
                      <div>
                        <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-zinc-900 shadow-inner group/cover">
                          {b.image ? <img src={b.image} alt={b.title} className="object-cover h-full w-full transition-transform duration-300 group-hover/cover:scale-105" /> : <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-800"><Music size={32} /></div>}
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <button
                              onClick={() => {
                                const playerReadyTrack = { ...b, author: b.producer.displayName || b.producer.username, publicId: b.id };
                                const playerReadyQueue = beats.map(item => ({ ...item, author: item.producer.displayName || item.producer.username, publicId: item.id }));
                                play(playerReadyTrack as any, playerReadyQueue as any);
                              }}
                              className="h-11 w-11 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform active:scale-95"
                            >
                              <Play className={`h-4 w-4 fill-current text-white ml-0.5 ${isCurrent && isPlaying ? "animate-pulse" : ""}`} />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-0.5 px-0.5">
                          <Link href={`/beats/${b.id}`} className="block">
                            <h3 className="font-semibold text-xs text-white truncate tracking-tight hover:text-purple-400 transition-colors">{b.title}</h3>
                          </Link>
                          <p className="text-[10px] text-zinc-500 font-light truncate">by <Link href={`/producer/${b.producer.username}`} className="hover:underline text-zinc-400 font-medium transition-colors">@{b.producer.username}</Link></p>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center justify-between pb-2 border-b border-white/[0.03]">
                          <div className="flex items-center gap-1 text-[9px] font-mono text-zinc-500">
                            <span className="bg-white/[0.02] border border-white/[0.04] px-1 py-0.2 rounded text-zinc-400">{b.bpm} BPM</span>
                            <span>•</span>
                            <span className="text-zinc-400 max-w-[45px] truncate">{b.musicKey || "N/A"}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] font-bold font-mono text-white">${basePrice.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 mt-2">
                          <button onClick={() => handleAddToCart(b.id, b.title)} className="flex-1 h-7 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:bg-white hover:text-black hover:border-transparent text-[10px] font-medium text-white transition-all duration-200 flex items-center justify-center gap-1">
                            <ShoppingBag className="h-2.5 w-2.5" /> Купить бит
                          </button>
                          <button onClick={() => toggleLike(b.id)} className={`h-7 w-7 rounded-lg border flex items-center justify-center transition-all duration-200 shrink-0 ${isLiked ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-white/[0.01] border-white/[0.05] text-zinc-400 hover:text-white hover:border-white/[0.1]'}`}>
                            <Heart className={`h-2.5 w-2.5 ${isLiked ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}