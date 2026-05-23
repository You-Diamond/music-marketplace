"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { usePlayerStore, PlayerTrack } from "@/stores/player-store"
import { addToCart } from "@/app/actions/cart"
import { toast } from "sonner"
import { 
  Play, Pause, ShoppingBag, Music, Disc, LayoutGrid, List, Search, 
  X, SlidersHorizontal, ArrowRight, DiscAlbum, Loader2, ChevronLeft, 
  ChevronRight, Headphones, Send, MessageCircle, Sparkles, 
  Sliders, Layers, Heart, FileText, Info, Radio, Check, ChevronDown, Award
} from "lucide-react"
import { FullProducerPayload } from "@/app/producer/[username]/page"

interface ClientProps {
  producer: FullProducerPayload
}

const NOTES = ["C", "D", "E", "F", "G", "A", "B"]
const MODES = [
  { label: "Минор", value: "Minor" },
  { label: "Мажор", value: "Major" }
]

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const buildDatabaseKey = (note: string, accidental: string, mode: string) => {
  if (!note) return "all"
  return `${note}${accidental} ${mode === "Minor" ? "Minor" : "Major"}`.trim()
}

export default function ProducerProfileClient({ producer }: ClientProps) {
  const router = useRouter()
  
  // Zustand стор аудиоплеера
  const { 
    play, pause, track: currentTrack, isPlaying, setQueue, isLoading: isAudioLoading 
  } = usePlayerStore()
  
  // Внутренний стейт интерфейса
  const [activeTab, setActiveTab] = React.useState<"home" | "beats" | "kits">("home")
  const [viewMode, setViewMode] = React.useState<"list" | "grid">("list")
  const [isFollowed, setIsFollowed] = React.useState(false)
  const [likedTracks, setLikedTracks] = React.useState<Record<string, boolean>>({})

  // Стейт поисковой строки и фильтров
  const [globalSearch, setGlobalSearch] = React.useState("")
  const [selectedTags, setSelectedTags] = React.useState<string[]>([])
  const [selectedGenre, setSelectedGenre] = React.useState("all")
  const [selectedMood, setSelectedMood] = React.useState("all")
  const [selectedKey, setSelectedKey] = React.useState("all")
  const [sortBy, setSortBy] = React.useState("createdAt")

  // ОТКАЗОУСТОЙЧИВЫЙ СТЕЙТ BPM СЛАЙДЕРА
  const [isExactBpm, setIsExactBpm] = React.useState(false)
  const [minBpm, setMinBpm] = React.useState("60")
  const [maxBpm, setMaxBpm] = React.useState("180")

  const [showFilters, setShowFilters] = React.useState(false)
  const [activeLicenseWidgetTrack, setActiveLicenseWidgetTrack] = React.useState<any | null>(null)

  const [genreDropdownOpen, setGenreDropdownOpen] = React.useState(false)
  const [moodDropdownOpen, setMoodDropdownOpen] = React.useState(false)
  const [keyParts, setKeyParts] = React.useState({ note: "", accidental: "", mode: "Minor" })
  const [tagsSuggestionsOpen, setTagsSuggestionsOpen] = React.useState(false)

  const popularScrollRef = React.useRef<HTMLDivElement | null>(null)
  const newScrollRef = React.useRef<HTMLDivElement | null>(null)

  const currentMinBpmNum = parseInt(minBpm) || 60
  const currentMaxBpmNum = isExactBpm ? (parseInt(minBpm) || 60) : (parseInt(maxBpm) || 180)

  // Парсинг доступных опций из пропсов сервера для оптимизации автокомплита
  const availableGenres = React.useMemo(() => {
    const genresMap = new Map<string, string>()
    producer.tracks.forEach(t => { if (t.genre) genresMap.set(t.genre.slug, t.genre.name) })
    return Array.from(genresMap.entries()).map(([slug, name]) => ({ slug, name }))
  }, [producer])

  const availableMoods = React.useMemo(() => {
    const moodsMap = new Map<string, string>()
    producer.tracks.forEach(t => { t.moods?.forEach(m => moodsMap.set(m.slug, m.name)) })
    return Array.from(moodsMap.entries()).map(([slug, name]) => ({ slug, name }))
  }, [producer])

  const lastWord = globalSearch.split(" ").pop() || ""
  const isTypingTag = lastWord.startsWith("#") && lastWord.length > 1
  
  const { data: tagSuggestions = [] } = useQuery<string[]>({
    queryKey: ["producer-tag-autocomplete", lastWord],
    queryFn: async () => {
      const cleanVal = lastWord.replace("#", "").trim()
      if (!cleanVal) return []
      const res = await fetch(`/api/tags/search?query=${encodeURIComponent(cleanVal)}`)
      if (!res.ok) return []
      return res.json()
    },
    enabled: isTypingTag,
  })

  const mapToPlayerTrack = React.useCallback((t: any): PlayerTrack => {
    return {
      id: t.id,
      title: t.title,
      image: t.image,
      audio: t.audio,
      musicKey: t.musicKey,
      bpm: t.bpm,
      producer: { username: producer.username, displayName: producer.displayName },
      licenses: t.licenses?.map((l: any) => ({ id: l.id, price: l.price ?? 0 })) || []
    }
  }, [producer])

  // Реактивная фильтрация и сортировка на клиенте (сверхбыстрый UI без лишних fetch запросов)
  const filteredPlaylist: PlayerTrack[] = React.useMemo(() => {
    let result = producer.tracks.filter(track => {
      const matchesText = track.title.toLowerCase().includes(globalSearch.toLowerCase().replace(/#\S*/g, "").trim())
      const matchesGenre = selectedGenre === "all" || track.genre?.slug === selectedGenre
      const matchesMood = selectedMood === "all" || track.moods?.some(m => m.slug === selectedMood)
      const matchesKey = selectedKey === "all" || track.musicKey === selectedKey
      const matchesTags = selectedTags.length === 0 || selectedTags.every(tag => track.tags?.map(t => t.toLowerCase()).includes(tag))
      
      const matchesBpm = isExactBpm 
        ? track.bpm === currentMinBpmNum 
        : (track.bpm >= currentMinBpmNum && track.bpm <= currentMaxBpmNum)
      
      return matchesText && matchesGenre && matchesMood && matchesKey && matchesBpm && matchesTags
    })

    return result.sort((a: any, b: any) => {
      if (sortBy === "plays") return (b.plays || 0) - (a.plays || 0)
      if (sortBy === "downloads") return (b.downloads || 0) - (a.downloads || 0)
      if (sortBy === "featured") return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }).map(mapToPlayerTrack)
  }, [producer.tracks, globalSearch, selectedGenre, selectedMood, selectedKey, isExactBpm, currentMinBpmNum, currentMaxBpmNum, selectedTags, sortBy, mapToPlayerTrack])

  const spotlightTrack = React.useMemo(() => producer.tracks.find(t => t.featured) || producer.tracks[0] || null, [producer])
  const popularTracks = React.useMemo(() => [...producer.tracks].sort((a,b) => (b.plays || 0) - (a.plays || 0)).slice(0, 6).map(mapToPlayerTrack), [producer, mapToPlayerTrack])
  const newTracks = React.useMemo(() => [...producer.tracks].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6).map(mapToPlayerTrack), [producer, mapToPlayerTrack])

  const renderPlayButtonIcon = (trackId: string, iconSize = 14) => {
    const isCurrent = currentTrack?.id === trackId
    if (isCurrent && isAudioLoading) return <Loader2 size={iconSize} className="animate-spin text-purple-400" />
    if (isCurrent && isPlaying) return <Pause size={iconSize} className="fill-current text-white" />
    return <Play size={iconSize} className="fill-current text-white ml-0.5" />
  }

  const handleTrackPlayToggle = (track: PlayerTrack, contextQueue: PlayerTrack[]) => {
    if (currentTrack?.id === track.id) {
      if (isPlaying) pause()
      else play(currentTrack, contextQueue)
    } else {
      setQueue(contextQueue)
      play(track, contextQueue)
    }
  }

  const handleAddToCartAction = async (trackId: string, title: string, licenseId?: string) => {
    try {
      const res = await addToCart(trackId, licenseId)
      if (res.success) {
        toast.success(`Бит "${title}" добавлен в корзину`)
        setActiveLicenseWidgetTrack(null)
        router.refresh()
      }
    } catch {
      toast.error("Ошибка при добавлении в корзину")
    }
  }

  const handleTagToggle = (tag: string) => {
    const cleanTag = tag.replace("#", "").trim().toLowerCase()
    if (!cleanTag) return
    setSelectedTags(prev => prev.includes(cleanTag) ? prev.filter(t => t !== cleanTag) : [...prev, cleanTag])
  }

  const handleKeyChange = (type: "note" | "accidental" | "mode", value: string) => {
    setKeyParts(prev => {
      const updated = { ...prev }
      if (type === "note") updated.note = prev.note === value ? "" : value
      else if (type === "accidental") updated.accidental = prev.accidental === value ? "" : value
      else if (type === "mode") updated.mode = value

      if (!updated.note) setSelectedKey("all")
      else setSelectedKey(buildDatabaseKey(updated.note, updated.accidental, updated.mode))
      return updated
    })
  }

  const handleResetAll = () => {
    setSelectedGenre("all")
    setSelectedMood("all")
    setKeyParts({ note: "", accidental: "", mode: "Minor" })
    setSelectedKey("all")
    setMinBpm("60")
    setMaxBpm("180")
    setIsExactBpm(false)
    setGlobalSearch("")
    setSelectedTags([])
  }

  const scrollContainer = (element: HTMLDivElement | null, direction: "left" | "right") => {
    if (element) element.scrollBy({ left: direction === "left" ? -460 : 460, behavior: "smooth" })
  }

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const isLiked = !!likedTracks[id]
    setLikedTracks(prev => ({ ...prev, [id]: !isLiked }))
    toast.success(isLiked ? "Удалено из избранного" : "Добавлено в избранное")
  }

  return (
    <div className="min-h-screen bg-[#050608] text-zinc-100 pb-32 relative overflow-hidden select-none">
      
      {/* ДИНАМИЧЕСКИЙ ЗАДНИЙ ФОН С ЖИДКИМ РАЗМЫТИЕМ */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1600px] h-[750px] pointer-events-none z-0">
        <div 
          className="absolute inset-0 opacity-[0.06] blur-[160px] rounded-full scale-110 transition-all duration-1000"
          style={{ 
            backgroundImage: currentTrack?.image || spotlightTrack?.image
              ? `radial-gradient(circle at top, rgba(168,85,247,0.4) 0%, rgba(5,6,8,0) 70%), url(${currentTrack?.image || spotlightTrack?.image})` 
              : `radial-gradient(circle at top, rgba(168,85,247,0.2) 0%, rgba(5,6,8,0) 75%)`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050608]/70 to-[#050608]" />
      </div>

      {/* ================= HERO БЛОК ПРОФИЛЯ ================= */}
      <div className="relative z-10 border-b border-white/[0.02] bg-white/[0.01] backdrop-blur-3xl">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 pt-8 pb-4 space-y-6">
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-16 w-16 rounded-2xl overflow-hidden bg-zinc-900 border border-white/[0.06] shrink-0 relative shadow-2xl">
                {spotlightTrack?.image ? (
                  <img src={spotlightTrack.image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-700"><Disc size={28} /></div>
                )}
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black tracking-tight text-white">{producer.displayName || producer.username}</h1>
                  {producer.subscriptionStatus === "ACTIVE" && (
                    <span className="bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[8px] font-black font-mono px-1.5 py-0.5 rounded tracking-widest uppercase">PRO</span>
                  )}
                </div>
                <p className="text-[10px] text-purple-400 font-mono">@{producer.username}</p>
                <button 
                  onClick={() => { setIsFollowed(!isFollowed); toast.success(!isFollowed ? "Вы подписались" : "Подписка отменена") }}
                  className={`h-6 px-2.5 rounded-lg text-[9px] font-bold mt-1 transition-all active:scale-95 border ${isFollowed ? 'bg-white/5 border-white/5 text-zinc-400' : 'bg-purple-600 hover:bg-purple-500 text-white border-transparent'}`}
                >
                  {isFollowed ? "Вы подписаны" : "Подписаться"}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 lg:gap-6">
              <div className="border border-white/[0.03] bg-white/[0.01] px-4 py-2 rounded-xl backdrop-blur-md flex gap-4">
                <div className="text-center">
                  <div className="text-xs font-black font-mono text-white flex items-center gap-1"><Headphones size={11} className="text-purple-400" /> 14K</div>
                  <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Слушатели</div>
                </div>
                <div className="w-[1px] bg-white/5 self-stretch" />
                <div className="text-center">
                  <div className="text-xs font-black font-mono text-white flex items-center gap-1"><Music size={11} className="text-purple-400" /> {producer.tracks.length}</div>
                  <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">Биты</div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <a href="#" className="h-7 w-7 bg-white/[0.02] hover:bg-purple-600/20 border border-white/[0.04] rounded-lg flex items-center justify-center text-zinc-400 hover:text-purple-400 transition-all"><MessageCircle size={12} /></a>
                <a href="#" className="h-7 w-7 bg-white/[0.02] hover:bg-purple-600/20 border border-white/[0.04] rounded-lg flex items-center justify-center text-zinc-400 hover:text-purple-400 transition-all"><Send size={12} /></a>
              </div>
            </div>
          </div>

          <div className="flex gap-6 text-[10px] font-black tracking-widest uppercase border-t border-white/[0.02] pt-3">
            <button onClick={() => setActiveTab("home")} className={`pb-2 relative transition-colors ${activeTab === "home" ? 'text-purple-400' : 'text-zinc-500 hover:text-zinc-200'}`}>Главная витрина {activeTab === "home" && <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-purple-500 rounded-full" />}</button>
            <button onClick={() => setActiveTab("beats")} className={`pb-2 relative transition-colors ${activeTab === "beats" ? 'text-purple-400' : 'text-zinc-500 hover:text-zinc-200'}`}>Каталог треков ({producer.tracks.length}) {activeTab === "beats" && <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-purple-500 rounded-full" />}</button>
            <button onClick={() => setActiveTab("kits")} className={`pb-2 relative transition-colors ${activeTab === "kits" ? 'text-purple-400' : 'text-zinc-500 hover:text-zinc-200'}`}>Саунд-паки ({producer.soundPacks.length}) {activeTab === "kits" && <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-purple-500 rounded-full" />}</button>
          </div>

        </div>
      </div>

      {/* ================= КОНТЕНТ СТРАНИЦЫ ================= */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 pt-6 relative z-10">
        
        {activeTab === "home" && (
          <div className="space-y-10">
            
            {/* FEATURED SPOTLIGHT ТРЕК */}
            {spotlightTrack && (
              <div 
                onClick={() => handleTrackPlayToggle(mapToPlayerTrack(spotlightTrack), [mapToPlayerTrack(spotlightTrack)])}
                className="relative overflow-hidden rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/20 to-transparent backdrop-blur-md p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer group/spotlight transition-all hover:bg-purple-950/10 shadow-[0_0_35px_rgba(168,85,247,0.15)]"
              >
                <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto">
                  <div className="h-24 w-24 rounded-xl overflow-hidden bg-zinc-900 border border-white/10 relative shrink-0 shadow-2xl">
                    {spotlightTrack.image && <img src={spotlightTrack.image} alt="" className="w-full h-full object-cover group-hover/spotlight:scale-105 transition-transform duration-700" />}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/spotlight:opacity-100 transition-opacity">
                      <div className="h-10 w-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-md">{renderPlayButtonIcon(spotlightTrack.id, 14)}</div>
                    </div>
                  </div>
                  <div className="space-y-2 text-center sm:text-left">
                    <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest inline-flex items-center gap-1"><Award size={10} /> ВЫБОР АВТОРА</span>
                    <h2 className="text-xl font-black text-white group-hover/spotlight:text-purple-400 transition-colors tracking-tight">{spotlightTrack.title}</h2>
                    
                    {spotlightTrack.tags && spotlightTrack.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                        {spotlightTrack.tags.slice(0, 3).map((t: string) => (
                          <span key={t} className="text-[9px] font-medium text-purple-300/80 bg-purple-500/10 px-1.5 py-0.5 rounded">#{t}</span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-400 justify-center sm:justify-start pt-1">
                      <span className="bg-white/5 px-2 py-0.5 rounded font-bold">{spotlightTrack.bpm} BPM</span>
                      <span className="bg-white/5 px-2 py-0.5 rounded font-bold text-purple-300">{spotlightTrack.musicKey}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={() => setActiveLicenseWidgetTrack(spotlightTrack)}
                    className="h-10 min-w-[120px] px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black font-mono flex items-center justify-center gap-2 transition-all shadow-xl"
                  >
                    <ShoppingBag size={13} />
                    <span>{formatCurrency(Number(spotlightTrack.licenses?.[0]?.price || 2000))}</span>
                  </button>
                </div>
              </div>
            )}

            {/* ХИТЫ */}
            <div className="space-y-4 relative group/carousel overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black tracking-widest text-zinc-400 uppercase font-mono flex items-center gap-1.5"><Sparkles size={12} className="text-purple-400" /> Популярные биты</h3>
                <button onClick={() => { setActiveTab("beats"); setSortBy("plays"); }} className="flex items-center gap-1 text-[9px] font-black text-purple-400 font-mono uppercase tracking-widest hover:text-purple-300">Все по трендам <ArrowRight size={10} /></button>
              </div>
              <button onClick={() => scrollContainer(popularScrollRef.current, "left")} className="absolute left-1 top-[40%] -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-black/70 backdrop-blur-md border border-white/5 text-white flex items-center justify-center opacity-0 lg:group-hover/carousel:opacity-100 transition-all hover:bg-purple-600"><ChevronLeft size={14} /></button>
              <button onClick={() => scrollContainer(popularScrollRef.current, "right")} className="absolute right-1 top-[40%] -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-black/70 backdrop-blur-md border border-white/5 text-white flex items-center justify-center opacity-0 lg:group-hover/carousel:opacity-100 transition-all hover:bg-purple-600"><ChevronRight size={14} /></button>

              <div ref={popularScrollRef} style={{ scrollbarWidth: 'none' }} className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden">
                {popularTracks.map((b) => {
                  const rawTrack = producer.tracks.find(t => t.id === b.id)
                  const isFeatured = rawTrack?.featured
                  return (
                    <div 
                      key={`popular-${b.id}`} 
                      onClick={() => handleTrackPlayToggle(b, popularTracks)} 
                      className={`w-[185px] shrink-0 bg-white/[0.01] border p-3 rounded-2xl hover:bg-white/[0.03] transition-all cursor-pointer group/card snap-start relative ${
                        isFeatured ? 'border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.15)] bg-purple-950/5' : 'border-white/[0.03]'
                      }`}
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-950 mb-3 group shadow-sm">
                        {b.image && <img src={b.image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105" />}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                          <div className="h-9 w-9 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg">{renderPlayButtonIcon(b.id, 14)}</div>
                        </div>
                        {isFeatured && (
                          <div className="absolute top-2 left-2 bg-purple-600 text-white px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5 shadow-md">
                            <Award size={9} /> Выбор
                          </div>
                        )}
                      </div>
                      <h4 className="font-bold text-xs text-zinc-100 truncate group-hover/card:text-purple-400 transition-colors">{b.title}</h4>
                      
                      {rawTrack?.tags && rawTrack.tags.length > 0 && (
                        <div className="flex gap-1 truncate text-[9px] text-zinc-500 font-medium mt-1">
                          {rawTrack.tags.slice(0, 2).map((t: string) => <span key={t}>#{t}</span>)}
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setActiveLicenseWidgetTrack(rawTrack)} className="flex-1 h-8 min-w-[100px] max-w-[115px] rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black font-mono flex items-center justify-center gap-1 shadow-md truncate">
                          <ShoppingBag size={11} /> <span>{formatCurrency(Number(b.licenses?.[0]?.price || 2000))}</span>
                        </button>
                        <button onClick={(e) => toggleLike(b.id, e)} className="h-8 w-8 rounded-xl bg-white/[0.02] border border-white/[0.04] text-zinc-500 hover:text-white flex items-center justify-center shrink-0"><Heart size={12} className={likedTracks[b.id] ? "fill-red-500 text-red-500" : ""} /></button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* НОВИНКИ */}
            <div className="space-y-4 relative group/carouselNew overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black tracking-widest text-zinc-400 uppercase font-mono flex items-center gap-1.5"><DiscAlbum size={12} className="text-purple-400" /> Свежие релизы</h3>
              </div>
              <button onClick={() => scrollContainer(newScrollRef.current, "left")} className="absolute left-1 top-[40%] -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-black/70 backdrop-blur-md border border-white/5 text-white flex items-center justify-center opacity-0 lg:group-hover/carouselNew:opacity-100 transition-all hover:bg-purple-600"><ChevronLeft size={14} /></button>
              <button onClick={() => scrollContainer(newScrollRef.current, "right")} className="absolute right-1 top-[40%] -translate-y-1/2 z-20 h-8 w-8 rounded-full bg-black/70 backdrop-blur-md border border-white/5 text-white flex items-center justify-center opacity-0 lg:group-hover/carouselNew:opacity-100 transition-all hover:bg-purple-600"><ChevronRight size={14} /></button>

              <div ref={newScrollRef} style={{ scrollbarWidth: 'none' }} className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden">
                {newTracks.map((b) => {
                  const rawTrack = producer.tracks.find(t => t.id === b.id)
                  const isFeatured = rawTrack?.featured
                  return (
                    <div 
                      key={`new-${b.id}`} 
                      onClick={() => handleTrackPlayToggle(b, newTracks)} 
                      className={`w-[185px] shrink-0 bg-white/[0.01] border p-3 rounded-2xl hover:bg-white/[0.03] transition-all cursor-pointer group/card snap-start relative ${
                        isFeatured ? 'border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.15)] bg-purple-950/5' : 'border-white/[0.03]'
                      }`}
                    >
                      <div className="relative aspect-square rounded-xl overflow-hidden bg-zinc-950 mb-3 group shadow-sm">
                        {b.image && <img src={b.image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105" />}
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                          <div className="h-9 w-9 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg">{renderPlayButtonIcon(b.id, 14)}</div>
                        </div>
                      </div>
                      <h4 className="font-bold text-xs text-zinc-100 truncate group-hover/card:text-purple-400 transition-colors">{b.title}</h4>
                      
                      {rawTrack?.tags && rawTrack.tags.length > 0 && (
                        <div className="flex gap-1 truncate text-[9px] text-zinc-500 font-medium mt-1">
                          {rawTrack.tags.slice(0, 2).map((t: string) => <span key={t}>#{t}</span>)}
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setActiveLicenseWidgetTrack(rawTrack)} className="flex-1 h-8 min-w-[100px] max-w-[115px] rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black font-mono flex items-center justify-center gap-1 shadow-md truncate">
                          <ShoppingBag size={11} /> <span>{formatCurrency(Number(b.licenses?.[0]?.price || 2000))}</span>
                        </button>
                        <button onClick={(e) => toggleLike(b.id, e)} className="h-8 w-8 rounded-xl bg-white/[0.02] border border-white/[0.04] text-zinc-500 hover:text-white flex items-center justify-center shrink-0"><Heart size={12} className={likedTracks[b.id] ? "fill-red-500 text-red-500" : ""} /></button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        )}

        {/* ТАБ 2: КАТАЛОГ С ПОЛНОЙ ОПТИМИЗАЦИЕЙ */}
        {activeTab === "beats" && (
          <div className="space-y-6">
            
            {/* УМНАЯ СТРОКА ПОИСКА */}
            <div className="relative group z-20">
              <div className="relative flex items-center bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.05] rounded-2xl transition-all duration-300 backdrop-blur-xl">
                <Search className="absolute left-5 text-zinc-500 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Поиск по названию или введите #тег..."
                  value={globalSearch}
                  onFocus={() => setTagsSuggestionsOpen(true)}
                  onChange={(e) => { setGlobalSearch(e.target.value); setTagsSuggestionsOpen(true); }}
                  className="w-full bg-transparent pl-14 pr-12 py-3.5 rounded-2xl outline-none text-sm text-white placeholder:text-zinc-600 font-medium"
                />
                {globalSearch && (
                  <button onClick={() => { setGlobalSearch(""); setTagsSuggestionsOpen(false); }} className="absolute right-5 text-zinc-500 hover:text-white p-1"><X size={14} /></button>
                )}
              </div>

              {tagsSuggestionsOpen && isTypingTag && tagSuggestions.length > 0 && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setTagsSuggestionsOpen(false)} />
                  <div className="absolute top-[108%] left-0 right-0 bg-[#0c0e14]/95 backdrop-blur-2xl border border-white/[0.06] rounded-xl shadow-2xl z-40 p-2 flex flex-col max-h-[180px] overflow-y-auto">
                    {tagSuggestions.map(tag => (
                      <button
                        key={tag} type="button"
                        onClick={() => { handleTagToggle(tag); setGlobalSearch(""); setTagsSuggestionsOpen(false); }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between hover:bg-white/[0.04] text-zinc-300 hover:text-purple-400"
                      >
                        <span>#{tag}</span>
                        {selectedTags.includes(tag.toLowerCase()) && <Check size={12} className="text-purple-500" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* ТУЛБАР УПРАВЛЕНИЯ КАТАЛОГОМ */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/[0.01] border border-white/[0.03] p-2 rounded-2xl">
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button onClick={() => setShowFilters(!showFilters)} className={`h-9 px-4 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${showFilters ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' : 'bg-white/[0.02] border-white/[0.04] text-zinc-400'}`}>
                  <SlidersHorizontal size={13} /> <span>Фильтры</span>
                </button>
                
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="h-9 bg-[#0c0e14] border border-white/[0.04] text-zinc-300 px-3 rounded-xl outline-none text-xs font-bold cursor-pointer transition-all">
                  <option value="createdAt">✨ Сначала новые</option>
                  <option value="plays">🔥 По прослушиваниям</option>
                  <option value="downloads">📥 По скачиваниям</option>
                  <option value="featured">⭐ Выбор продюсера</option>
                </select>

                {(selectedGenre !== "all" || selectedMood !== "all" || selectedKey !== "all" || selectedTags.length > 0 || globalSearch !== "" || minBpm !== "60" || maxBpm !== "180" || isExactBpm) && (
                  <button onClick={handleResetAll} className="text-[11px] text-purple-400 hover:text-purple-300 font-bold ml-2">Сбросить всё</button>
                )}
              </div>

              <div className="hidden sm:flex p-1 bg-white/[0.02] rounded-xl items-center gap-1 border border-white/[0.03]">
                <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-purple-600 text-white" : "text-zinc-500"}`}><LayoutGrid size={13} /></button>
                <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg ${viewMode === "list" ? "bg-purple-600 text-white" : "text-zinc-500"}`}><List size={13} /></button>
              </div>
            </div>

            {/* АКТИВНЫЕ ТЕГИ КАТАЛОГА */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {selectedTags.map(tag => (
                  <div key={tag} className="flex items-center gap-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2.5 py-1 rounded-xl text-[10px] font-bold">
                    <span>#{tag}</span>
                    <button onClick={() => handleTagToggle(tag)} className="hover:text-white p-0.5"><X size={10} /></button>
                  </div>
                ))}
              </div>
            )}

            {/* УМНЫЙ ДВУХДИАПАЗОННЫЙ СЛАЙДЕР BPM БЕЗ БАГОВ */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 rounded-2xl bg-[#0c0e14]/40 border border-white/[0.03] backdrop-blur-md">
                
                {/* Жанры */}
                <div className="space-y-2 relative">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block flex items-center gap-1"><Layers size={11} /> Жанр</label>
                  <button onClick={() => { setGenreDropdownOpen(!genreDropdownOpen); setMoodDropdownOpen(false); }} className="w-full bg-black/20 border border-white/[0.06] h-10 px-3 rounded-xl flex items-center justify-between text-xs text-zinc-300">
                    <span>{availableGenres.find(g => g.slug === selectedGenre)?.name || "Все жанры"}</span>
                    <ChevronDown size={12} />
                  </button>
                  {genreDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setGenreDropdownOpen(false)} />
                      <div className="absolute top-[104%] left-0 right-0 bg-[#0c0e14] border border-white/[0.08] rounded-xl z-40 p-1 max-h-[160px] overflow-y-auto">
                        <button onClick={() => { setSelectedGenre("all"); setGenreDropdownOpen(false); }} className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-white/[0.02]">Все жанры</button>
                        {availableGenres.map(g => (
                          <button key={g.slug} onClick={() => { setSelectedGenre(g.slug); setGenreDropdownOpen(false); }} className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-white/[0.02] flex items-center justify-between">
                            <span>{g.name}</span> {selectedGenre === g.slug && <Check size={12} />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Настроения */}
                <div className="space-y-2 relative">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block flex items-center gap-1"><Sparkles size={11} /> Настроение</label>
                  <button onClick={() => { setMoodDropdownOpen(!moodDropdownOpen); setGenreDropdownOpen(false); }} className="w-full bg-black/20 border border-white/[0.06] h-10 px-3 rounded-xl flex items-center justify-between text-xs text-zinc-300">
                    <span>{availableMoods.find(m => m.slug === selectedMood)?.name || "Любое настроение"}</span>
                    <ChevronDown size={12} />
                  </button>
                  {moodDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setMoodDropdownOpen(false)} />
                      <div className="absolute top-[104%] left-0 right-0 bg-[#0c0e14] border border-white/[0.08] rounded-xl z-40 p-1 max-h-[160px] overflow-y-auto">
                        <button onClick={() => { setSelectedMood("all"); setMoodDropdownOpen(false); }} className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-white/[0.02]">Любое настроение</button>
                        {availableMoods.map(m => (
                          <button key={m.slug} onClick={() => { setSelectedMood(m.slug); setMoodDropdownOpen(false); }} className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs hover:bg-white/[0.02] flex items-center justify-between">
                            <span>{m.name}</span> {selectedMood === m.slug && <Check size={12} />}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* BPM СЛАЙДЕР БЕЗ КЛИК-БАГОВ И ПЕРЕХЛЁСТОВ */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Sliders size={11} /> Темп bpm</span>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1 text-[9px] cursor-pointer text-zinc-400 select-none normal-case">
                        <input 
                          type="checkbox" 
                          checked={isExactBpm} 
                          onChange={(e) => { 
                            setIsExactBpm(e.target.checked); 
                            if(e.target.checked) setMaxBpm(minBpm); 
                          }} 
                          className="rounded bg-black/40 border-white/10 text-purple-600 focus:ring-0 focus:ring-offset-0 h-3 w-3" 
                        />
                        <span>Точный темп</span>
                      </label>
                      <span className="text-purple-400 font-mono font-bold text-xs">
                        {isExactBpm ? `${minBpm} BPM` : `${minBpm} - ${maxBpm} BPM`}
                      </span>
                    </div>
                  </div>
                  
                  <div className="h-10 flex items-center relative px-1 select-none">
                    <div className="absolute h-[3px] left-0 right-0 top-1/2 -translate-y-1/2 bg-white/[0.05] rounded-full" />
                    
                    <div 
                      className="absolute h-[3px] top-1/2 -translate-y-1/2 bg-purple-500/80 rounded-full transition-all" 
                      style={{ 
                        left: `${((currentMinBpmNum - 60) / 120) * 100}%`, 
                        right: `${100 - ((currentMaxBpmNum - 60) / 120) * 100}%` 
                      }} 
                    />

                    {isExactBpm ? (
                      <input 
                        type="range" 
                        min="60" 
                        max="180" 
                        value={minBpm} 
                        onChange={(e) => { 
                          setMinBpm(e.target.value); 
                          setMaxBpm(e.target.value); 
                        }} 
                        className="absolute w-full h-5 top-1/2 -translate-y-1/2 left-0 appearance-none bg-transparent cursor-pointer accent-purple-500 z-30" 
                      />
                    ) : (
                      <>
                        <input 
                          type="range" 
                          min="60" 
                          max="180" 
                          value={minBpm} 
                          onChange={(e) => {
                            const nextMin = Math.min(Number(e.target.value), currentMaxBpmNum - 5); 
                            setMinBpm(String(nextMin));
                          }} 
                          style={{ zIndex: currentMinBpmNum > 150 ? 40 : 20 }} 
                          className="absolute w-full h-5 top-1/2 -translate-y-1/2 left-0 appearance-none bg-transparent pointer-events-none cursor-pointer accent-purple-500 [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto" 
                        />
                        <input 
                          type="range" 
                          min="60" 
                          max="180" 
                          value={maxBpm} 
                          onChange={(e) => {
                            const nextMax = Math.max(Number(e.target.value), currentMinBpmNum + 5); 
                            setMaxBpm(String(nextMax));
                          }} 
                          style={{ zIndex: currentMinBpmNum > 150 ? 20 : 30 }}
                          className="absolute w-full h-5 top-1/2 -translate-y-1/2 left-0 appearance-none bg-transparent pointer-events-none cursor-pointer accent-purple-500 [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto" 
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Выбор тональностей */}
                <div className="md:col-span-3 pt-3 border-t border-white/[0.02] space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block"><Music size={11} className="inline mr-1" /> Тональность трека</label>
                    {keyParts.note && <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">{keyParts.note}{keyParts.accidental} {keyParts.mode === "Minor" ? "Минор" : "Мажор"}</span>}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <div className="grid grid-cols-7 gap-1 bg-black/30 p-1 rounded-xl border border-white/[0.04] shrink-0">
                      {NOTES.map(n => (
                        <button key={n} onClick={() => handleKeyChange("note", n)} className={`h-7 w-7 rounded-lg text-xs font-bold transition-all ${keyParts.note === n ? "bg-purple-600 text-white" : "text-zinc-500 hover:text-white"}`}>{n}</button>
                      ))}
                    </div>
                    <div className="flex gap-1 bg-black/30 p-1 rounded-xl border border-white/[0.04]">
                      <button onClick={() => handleKeyChange("accidental", "#")} className={`h-7 w-7 text-xs font-bold rounded-lg ${keyParts.accidental === "#" ? "text-purple-400 bg-white/5" : "text-zinc-600"}`}>♯</button>
                      <button onClick={() => handleKeyChange("accidental", "b")} className={`h-7 w-7 text-xs font-bold rounded-lg ${keyParts.accidental === "b" ? "text-purple-400 bg-white/5" : "text-zinc-600"}`}>♭</button>
                    </div>
                    <div className="flex gap-1 bg-black/30 p-1 rounded-xl border border-white/[0.04]">
                      {MODES.map(m => (
                        <button key={m.value} onClick={() => handleKeyChange("mode", m.value)} className={`h-7 px-2 text-[10px] font-bold rounded-lg ${keyParts.mode === m.value ? "text-purple-400 bg-white/5" : "text-zinc-600"}`}>{m.label}</button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* РЕНДЕР КАТАЛОГА: СЕТКА */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredPlaylist.map((b) => {
                  const rawTrack = producer.tracks.find(t => t.id === b.id)
                  const isFeatured = rawTrack?.featured
                  return (
                    <div 
                      key={`catalog-grid-${b.id}`} 
                      onClick={() => handleTrackPlayToggle(b, filteredPlaylist)}
                      className={`group bg-white/[0.01] border p-4 rounded-2xl flex flex-col justify-between hover:bg-white/[0.02] cursor-pointer transition-all relative ${
                        isFeatured ? 'border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.15)] bg-purple-950/5' : 'border-white/[0.03]'
                      }`}
                    >
                      <div>
                        <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-zinc-950 shadow-sm">
                          {b.image && <img src={b.image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="h-10 w-10 rounded-full bg-purple-600 text-white flex items-center justify-center">{renderPlayButtonIcon(b.id, 14)}</div>
                          </div>
                          {isFeatured && (
                            <div className="absolute top-2.5 left-2.5 bg-purple-600 text-white px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider flex items-center gap-0.5 shadow-lg">
                              <Award size={9} /> Выбор
                            </div>
                          )}
                        </div>
                        <h3 className="font-bold text-xs text-zinc-100 truncate group-hover:text-purple-400 transition-colors">{b.title}</h3>
                        
                        {rawTrack?.tags && rawTrack.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1.5 max-h-[34px] overflow-hidden">
                            {rawTrack.tags.slice(0, 3).map((t: string) => (
                              <span key={t} className="text-[9px] font-semibold text-zinc-500">#{t}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-white/[0.04]">
                        <div className="flex items-center justify-between mb-3 text-[10px] font-mono text-zinc-500 font-bold">
                          <span>{b.bpm} BPM</span>
                          <span>{b.musicKey}</span>
                        </div>
                        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                          <button 
                            onClick={() => setActiveLicenseWidgetTrack(rawTrack)} 
                            className="flex-1 h-8 min-w-[100px] max-w-[140px] rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black font-mono flex items-center justify-center gap-1.5 shadow-md truncate px-2"
                          >
                            <ShoppingBag size={12} /> <span>{formatCurrency(Number(b.licenses?.[0]?.price || 2000))}</span>
                          </button>
                          <button onClick={(e) => toggleLike(b.id, e)} className="h-8 w-8 rounded-xl bg-white/[0.02] border border-white/[0.04] text-zinc-500 hover:text-white flex items-center justify-center shrink-0"><Heart size={12} className={likedTracks[b.id] ? "fill-red-500 text-red-500" : ""} /></button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              /* РЕНДЕР КАТАЛОГА: ТАБЛИЦА (УЛЬТРА-ОПТИМИЗИРОВАННАЯ И ЛЕГКАЯ) */
              <div className="bg-white/[0.01] border border-white/[0.02] rounded-2xl overflow-hidden backdrop-blur-2xl">
                <table className="w-full text-left border-collapse min-w-[720px]">
                  <thead>
                    <tr className="border-b border-white/[0.03] text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-white/[0.01]">
                      <th className="py-3 px-4 w-12"></th>
                      <th className="py-3 px-2">Название / Теги</th>
                      <th className="py-3 px-4 text-center">Темп</th>
                      <th className="py-3 px-4 text-center">Тональность</th>
                      <th className="py-3 px-4 text-right w-[180px]">Купить лицензию</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02]">
                    {filteredPlaylist.map((b) => {
                      const rawTrack = producer.tracks.find(t => t.id === b.id)
                      const isFeatured = rawTrack?.featured

                      return (
                        <tr 
                          key={`catalog-table-${b.id}`} 
                          onClick={() => handleTrackPlayToggle(b, filteredPlaylist)} 
                          className={`group transition-all hover:bg-white/[0.015] cursor-pointer ${
                            isFeatured ? 'bg-purple-950/[0.03]' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 relative">
                            {isFeatured && (
                              <div className="absolute left-0 top-0 bottom-0 w-[2.5px] bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                            )}
                            <button className="h-7 w-7 rounded-full flex items-center justify-center bg-white/[0.02] border border-white/5 text-zinc-400 group-hover:bg-purple-600 group-hover:text-white transition-all">
                              {renderPlayButtonIcon(b.id, 11)}
                            </button>
                          </td>
                          <td className="py-3.5 px-2">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-lg overflow-hidden bg-black/20 border border-white/[0.04] shrink-0">
                                {b.image && <img src={b.image} alt="" className="w-full h-full object-cover" />}
                              </div>
                              <div className="truncate space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-xs text-zinc-100 group-hover:text-purple-400 transition-colors truncate">{b.title}</h4>
                                  {isFeatured && <span className="bg-purple-500/20 text-purple-300 font-mono text-[7px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-0.5"><Award size={8} /> АВТОР</span>}
                                </div>
                                {rawTrack?.tags && rawTrack.tags.length > 0 && (
                                  <div className="flex gap-2 text-[10px] text-zinc-500 font-medium">
                                    {rawTrack.tags.slice(0, 3).map((t: string) => <span key={t}>#{t}</span>)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          
                          <td className="py-3.5 px-4 text-center font-mono text-xs text-zinc-400">{b.bpm} BPM</td>
                          <td className="py-3.5 px-4 text-center"><span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/10">{b.musicKey}</span></td>
                          
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={(e) => toggleLike(b.id, e)} className="h-8 w-8 rounded-xl bg-white/[0.02] border border-white/[0.04] text-zinc-500 hover:text-white flex items-center justify-center shrink-0"><Heart size={12} className={likedTracks[b.id] ? "fill-red-500 text-red-500" : ""} /></button>
                              <button 
                                onClick={() => setActiveLicenseWidgetTrack(rawTrack)} 
                                className="h-8 w-28 text-center rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-purple-600 hover:text-white text-xs font-black font-mono transition-all truncate px-2"
                              >
                                {formatCurrency(Number(b.licenses?.[0]?.price || 2000))}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ТАБ 3: САУНД-ПАКИ */}
        {activeTab === "kits" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {producer.soundPacks.map((pack) => (
              <div key={`kit-card-${pack.id}`} className="bg-white/[0.01] border border-white/[0.03] rounded-2xl p-4 flex flex-col justify-between hover:border-purple-500/20 transition-all group">
                <div className="space-y-3">
                  <div className="aspect-square w-full rounded-xl overflow-hidden bg-zinc-900 border border-white/[0.04] relative">
                    {pack.image && <img src={pack.image} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <h4 className="text-xs font-bold text-zinc-200 truncate">{pack.title}</h4>
                </div>
                <div className="flex items-center justify-between gap-4 pt-3 border-t border-white/[0.03] mt-4">
                  <p className="text-sm font-black font-mono text-zinc-200">{formatCurrency(pack.price)}</p>
                  <button onClick={() => handleAddToCartAction(pack.id, pack.title)} className="h-8 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md">
                    <ShoppingBag size={11} /> <span>В корзину</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* МОДАЛКА ЛИЦЕНЗИЙ (СОХРАНЕНА И СБАЛАНСИРОВАНА) */}
      {activeLicenseWidgetTrack && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xl z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0c10]/95 border border-white/[0.06] w-full max-w-4xl rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-white/[0.04] flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl overflow-hidden bg-black/40 relative border border-white/[0.04] shrink-0">
                  {activeLicenseWidgetTrack.image && <img src={activeLicenseWidgetTrack.image} alt="" className="w-full h-full object-cover" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Выбор прав: <span className="text-purple-400">«{activeLicenseWidgetTrack.title}»</span></h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Контракт с @{producer.username}</p>
                </div>
              </div>
              <button onClick={() => setActiveLicenseWidgetTrack(null)} className="h-8 w-8 rounded-xl bg-white/5 text-zinc-400 hover:text-white flex items-center justify-center"><X size={14} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 bg-black/10">
              {activeLicenseWidgetTrack.licenses?.map((lic: any) => {
                const t = lic.template
                const isNegotiable = t?.isPriceNegotiable
                return (
                  <div key={`modal-license-${lic.id}`} className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-5 flex flex-col justify-between hover:border-purple-500/30 hover:bg-white/[0.04] transition-all backdrop-blur-sm group/lic">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-bold text-xs text-zinc-100">{t?.name || "Лицензия"}</h4>
                        <span className="bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono text-[9px] px-2 py-0.5 rounded uppercase font-bold">{t?.fileType || "MP3"}</span>
                      </div>
                      <div className="my-4 flex items-baseline gap-1">
                        {isNegotiable ? (
                          <span className="text-base font-bold text-purple-400">Договорная</span>
                        ) : (
                          <>
                            <span className="text-xl font-black text-white font-mono">{formatCurrency(lic.price)}</span>
                            <span className="text-[9px] text-zinc-500 font-mono">/ бессрочно</span>
                          </>
                        )}
                      </div>
                      <div className="space-y-2.5 pt-4 border-t border-white/[0.04] text-[11px] text-zinc-400 mb-6">
                        <div className="flex items-center gap-2.5"><Radio size={13} className="text-purple-400/70 shrink-0" /> <span>Стримы: <strong className="text-zinc-200">{t?.audioStreams ? t.audioStreams.toLocaleString() : "Безлимит"}</strong></span></div>
                        <div className="flex items-center gap-2.5"><DiscAlbum size={13} className="text-purple-400/70 shrink-0" /> <span>Копии: <strong className="text-zinc-200">{t?.distributionCopies ? t.distributionCopies.toLocaleString() : "Безлимит"}</strong></span></div>
                        <div className="flex items-center gap-2.5"><FileText size={13} className="text-purple-400/70 shrink-0" /> <span>Юрисдикция: <span className="text-zinc-300 font-medium">{t?.governingLawCountry || "РФ"}</span></span></div>
                        <div className="flex items-center gap-2.5"><Info size={13} className="text-purple-400/70 shrink-0" /> <span>Радио: <span className={t?.radioBroadcastingRights ? "text-emerald-400/90" : "text-zinc-500"}>{t?.radioBroadcastingRights ? "Да" : "Нет"}</span></span></div>
                      </div>
                    </div>

                    {isNegotiable ? (
                      <Link 
                        href={`/inquiry/new?trackId=${activeLicenseWidgetTrack.id}&licenseId=${lic.id}`}
                        className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white font-bold text-xs text-center block border border-white/[0.05]"
                      >
                        Запросить условия
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleAddToCartAction(activeLicenseWidgetTrack.id, activeLicenseWidgetTrack.title, lic.id)}
                        className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-all"
                      >
                        Добавить в корзину
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}