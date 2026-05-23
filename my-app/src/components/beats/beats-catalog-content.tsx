"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Search, SlidersHorizontal, Play, Pause, Heart, ShoppingBag, X, LayoutGrid, List, FileText, Info, Radio, DiscAlbum, ChevronDown, Check, Loader2 } from "lucide-react"
import { usePlayerStore } from "@/stores/player-store"
import { addToCart } from "@/app/actions/cart"
import { toast } from "sonner"

// --- ИНТЕРФЕЙСЫ ДАННЫХ ---
interface Genre { id: string; name: string; slug: string }
interface Mood { id: string; name: string; slug: string }

interface LicenseTemplateType {
  id: string; name: string; slug: string; fileType: "MP3" | "MP3_WAV" | "MP3_WAV_STEMS"; isPriceNegotiable: boolean
  governingLawCountry: string; distributionCopies: number | null; audioStreams: number | null; radioBroadcastingRights: boolean
}
interface LicenseWithType { id: string; price: number; isActive: boolean; trackId: string; templateId: string; template: LicenseTemplateType }
interface ProducerType { id: string; username: string; displayName: string | null }
interface TrackWithRelations {
  id: string; title: string; bpm: number; musicKey: string; image: string | null; audio: string; duration: number
  plays: number; downloads: number; featured: boolean; exclusiveAvailable: boolean; producerId: string; genreId: string
  producer: ProducerType; licenses?: LicenseWithType[]; tags: string[]; isLiked?: boolean
}

const NOTES = ["C", "D", "E", "F", "G", "A", "B"]
const MODES = [
  { label: "Minor", value: "Minor" },
  { label: "Major", value: "Major" }
]

// Хелпер для форматирования цен в рубли (РФ локаль)
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
  const shortMode = mode === "Minor" ? "Minor" : "Major"
  return `${note}${accidental} ${shortMode}`.trim()
}

export default function BeatsCatalogContent() {
  const pathname = usePathname()

  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid")
  const [mobileFiltersOpen, setMobileFiltersOpen] = React.useState(false)
  const [activeLicenseWidgetTrack, setActiveLicenseWidgetTrack] = React.useState<TrackWithRelations | null>(null)

  // --- СОСТОЯНИЯ ФИЛЬТРОВ ---
  const [globalSearch, setGlobalSearch] = React.useState("")
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]) 
  const [selectedGenre, setSelectedGenre] = React.useState("all")
  const [selectedMood, setSelectedMood] = React.useState("all")
  const [selectedKey, setSelectedKey] = React.useState("all")
  const [sortBy, setSortBy] = React.useState("createdAt")
  const [appliedBpm, setAppliedBpm] = React.useState({ min: 60, max: 180 })

  // --- ДЕБАУНС ДЛЯ ПОИСКА И URL (РЕШАЕТ ПРОБЛЕМУ ЛИШНИХ ЗАПРОСОВ) ---
  const [debouncedSearch, setDebouncedSearch] = React.useState(globalSearch)
  const [debouncedBpm, setDebouncedBpm] = React.useState(appliedBpm)

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(globalSearch)
      setDebouncedBpm(appliedBpm)
    }, 400)
    return () => clearTimeout(handler)
  }, [globalSearch, appliedBpm])

  // --- КЛИЕНТСКИЕ СОСТОЯНИЯ ПОПОВЕРОВ ---
  const [genreSearch, setGenreSearch] = React.useState("")
  const [genreDropdownOpen, setGenreDropdownOpen] = React.useState(false)
  const [moodSearch, setMoodSearch] = React.useState("")
  const [moodDropdownOpen, setMoodDropdownOpen] = React.useState(false)
  const [tagsSuggestionsOpen, setTagsSuggestionsOpen] = React.useState(false)

  const [keyParts, setKeyParts] = React.useState({ note: "", accidental: "", mode: "Minor" })
  const [likedTracks, setLikedTracks] = React.useState<Record<string, boolean>>({})

  // Достаем isLoading из Zustand (если у вас реализован стейт буферизации аудио в player-store)
  const { play, pause, track: currentTrack, isPlaying, setQueue, isLoading: isAudioLoading } = usePlayerStore()

  // --- ЗАПРОС КАТАЛОГА (Завязан строго на debounced-состояния) ---
  const { data: beats = [], isLoading } = useQuery<TrackWithRelations[]>({
    queryKey: ["beats", debouncedSearch, selectedTags, selectedGenre, selectedMood, selectedKey, debouncedBpm, sortBy],
    queryFn: async () => {
      const params = new URLSearchParams()
      let cleanQuery = debouncedSearch.trim()
      
      if (cleanQuery.includes("@")) {
        const authorMatch = cleanQuery.match(/@([a-zA-Z0-9_\-]+)/)
        if (authorMatch) {
          params.set("producer", authorMatch[1])
          cleanQuery = cleanQuery.replace(authorMatch[0], "").trim()
        }
      }

      if (cleanQuery) params.set("query", cleanQuery)
      if (selectedTags.length > 0) params.set("tags", selectedTags.join(",")) 
      if (selectedGenre !== "all") params.set("genre", selectedGenre)
      if (selectedMood !== "all") params.set("mood", selectedMood)
      if (selectedKey !== "all") params.set("musicKey", selectedKey)
      if (debouncedBpm.min !== 60) params.set("bpmMin", debouncedBpm.min.toString())
      if (debouncedBpm.max !== 180) params.set("bpmMax", debouncedBpm.max.toString())
      if (sortBy !== "createdAt") params.set("sortBy", sortBy)

      const res = await fetch(`/api/beats/search?${params.toString()}`)
      if (!res.ok) throw new Error()
      return res.json()
    },
    placeholderData: (prev) => prev,
  })

  const { data: genres = [] } = useQuery<Genre[]>({ queryKey: ["genres"], queryFn: async () => (await fetch("/api/genres")).json() })
  const { data: moods = [] } = useQuery<Mood[]>({ queryKey: ["moods"], queryFn: async () => (await fetch("/api/moods")).json() })

  const lastWord = globalSearch.split(" ").pop() || ""
  const isTypingTag = lastWord.startsWith("#") && lastWord.length > 1
  
  const { data: tagSuggestions = [] } = useQuery<string[]>({
    queryKey: ["tag-autocomplete", lastWord],
    queryFn: async () => {
      const cleanVal = lastWord.replace("#", "").trim()
      if (!cleanVal) return []
      const res = await fetch(`/api/tags/search?query=${encodeURIComponent(cleanVal)}`)
      if (!res.ok) return []
      return res.json()
    },
    enabled: isTypingTag,
  })

  const filteredGenres = genres.filter(g => g.name.toLowerCase().includes(genreSearch.toLowerCase()))
  const filteredMoods = moods.filter(m => m.name.toLowerCase().includes(moodSearch.toLowerCase()))

  // Синхронизация URL работает на debounced-данных, не вызывая лишних триггеров
  React.useEffect(() => {
    const params = new URLSearchParams()
    if (debouncedSearch) params.set("query", debouncedSearch)
    if (selectedTags.length > 0) params.set("tags", selectedTags.join(","))
    if (selectedGenre !== "all") params.set("genre", selectedGenre)
    if (selectedMood !== "all") params.set("mood", selectedMood)
    if (selectedKey !== "all") params.set("musicKey", selectedKey)
    if (debouncedBpm.min !== 60) params.set("bpmMin", debouncedBpm.min.toString())
    if (debouncedBpm.max !== 180) params.set("bpmMax", debouncedBpm.max.toString())
    if (sortBy !== "createdAt") params.set("sortBy", sortBy)

    const newUrl = `${pathname}?${params.toString()}`
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, "", newUrl)
  }, [debouncedSearch, selectedTags, selectedGenre, selectedMood, selectedKey, debouncedBpm, sortBy, pathname])

  const handleTagToggle = (tag: string) => {
    const cleanTag = tag.replace("#", "").trim().toLowerCase()
    if (!cleanTag) return
    setSelectedTags(prev => prev.includes(cleanTag) ? prev.filter(t => t !== cleanTag) : [...prev, cleanTag])
  }

  const handleSelectSuggestedTag = (tag: string) => {
    handleTagToggle(tag)
    const words = globalSearch.split(" ")
    words.pop()
    setGlobalSearch(words.join(" ") + (words.length > 0 ? " " : ""))
    setTagsSuggestionsOpen(false)
  }

  const toggleLike = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const current = !!likedTracks[id]
    setLikedTracks(prev => ({ ...prev, [id]: !current }))
    try {
      const res = await fetch(`/api/beats/${id}/like`, { method: "POST" })
      if (!res.ok) throw new Error()
      toast.success(current ? "Удалено из избранного" : "Добавлено в избранное!")
    } catch {
      setLikedTracks(prev => ({ ...prev, [id]: current }))
    }
  }

  // --- ИСПРАВЛЕННАЯ ЛОГИКА ПЛЕЕРА (Очередь ставится ТУТ, а не в useEffect) ---
  const handlePlayToggle = (b: TrackWithRelations) => {
    if (currentTrack?.id === b.id) {
      if (isPlaying) pause()
      else play(currentTrack, [])
    } else {
      // Формируем новую очередь из ТЕКУЩЕГО среза состояния каталога в момент клика
      const targetQueue = beats.map(item => ({
        id: item.id, title: item.title, image: item.image, audio: item.audio, musicKey: item.musicKey, bpm: item.bpm,
        licenses: item.licenses?.map(l => ({ id: l.id, price: l.price })) || [],
        producer: { username: item.producer.username, displayName: item.producer.displayName }
      }))
      
      const trackToPlay = {
        id: b.id, title: b.title, image: b.image, audio: b.audio, musicKey: b.musicKey, bpm: b.bpm,
        licenses: b.licenses?.map(l => ({ id: l.id, price: l.price })) || [],
        producer: { username: b.producer.username, displayName: b.producer.displayName }
      }

      setQueue(targetQueue)
      play(trackToPlay, targetQueue)
    }
  }

  const handleAddToCart = async (trackId: string, title: string, licenseId?: string, licenseName = "Basic") => {
    try {
      const res = await addToCart(trackId, licenseId)
      if (res.success) toast.success(`Бит "${title}" (${licenseName}) добавлен в корзину!`)
      else toast.error(res.error || "Не удалось добавить бит")
    } catch (err) {
      toast.error("Произошла ошибка при добавлении в корзину")
    }
  }

  const activeGenreName = genres.find(g => g.slug === selectedGenre)?.name || "Все жанры"
  const activeMoodName = moods.find(m => m.slug === selectedMood)?.name || "Все настроения"

  const handleResetAll = () => {
    setSelectedGenre("all")
    setSelectedMood("all")
    setKeyParts({ note: "", accidental: "", mode: "Minor" })
    setSelectedKey("all")
    setAppliedBpm({ min: 60, max: 180 })
    setGlobalSearch("")
    setSelectedTags([])
  }

  // Рендер кнопки Play/Pause со спиннером загрузки буфера аудио
  const renderPlayButtonIcon = (trackId: string, iconSize = 18, isTable = false) => {
    const isCurrent = currentTrack?.id === trackId
    if (isCurrent && isAudioLoading) {
      return <Loader2 size={iconSize} className="animate-spin text-purple-400" />
    }
    if (isCurrent && isPlaying) {
      return <Pause size={iconSize} className="fill-current" />
    }
    return <Play size={iconSize} className={`fill-current ${!isTable ? "ml-1" : "ml-0.5"}`} />
  }

  const FiltersSidebar = () => {
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

    return (
      <div className="space-y-7 select-none">
        <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400">
            <SlidersHorizontal size={13} className="text-purple-500" /> Фильтры
          </div>
          {(selectedGenre !== "all" || selectedMood !== "all" || selectedTags.length > 0 || selectedKey !== "all" || appliedBpm.min !== 60 || appliedBpm.max !== 180 || globalSearch !== "") && (
            <button onClick={handleResetAll} className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold transition-colors">Сбросить всё</button>
          )}
        </div>

        {/* ЖАНРЫ */}
        <div className="space-y-2 relative">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Музыкальный Жанр</label>
          <button
            onClick={() => { setGenreDropdownOpen(!genreDropdownOpen); setMoodDropdownOpen(false); }}
            className="w-full bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] p-3 rounded-xl flex items-center justify-between text-sm text-zinc-200 transition-all text-left backdrop-blur-md"
          >
            <span className="truncate font-medium text-white">{activeGenreName}</span>
            <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-200 ${genreDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {genreDropdownOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setGenreDropdownOpen(false)} />
              <div className="absolute top-[104%] left-0 right-0 bg-[#0b0d12]/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl z-40 p-2 flex flex-col max-h-[250px]">
                <div className="relative mb-2 shrink-0">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 h-3.5 w-3.5" />
                  <input
                    type="text" placeholder="Поиск жанра..." value={genreSearch}
                    onChange={(e) => setGenreSearch(e.target.value)}
                    className="w-full bg-zinc-950/50 border border-white/[0.06] pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none text-white focus:border-purple-500/50"
                  />
                </div>
                <div className="overflow-y-auto flex-1 space-y-0.5 pr-1 scrollbar-thin">
                  <button
                    onClick={() => { setSelectedGenre("all"); setGenreDropdownOpen(false); setGenreSearch(""); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${selectedGenre === "all" ? "bg-purple-600/20 text-purple-400" : "text-zinc-400 hover:bg-white/[0.02] hover:text-white"}`}
                  >
                    <span>Все жанры</span>
                    {selectedGenre === "all" && <Check size={12} />}
                  </button>
                  {filteredGenres.map((g) => {
                    const isSelected = selectedGenre === g.slug
                    return (
                      <button
                        key={g.id} onClick={() => { setSelectedGenre(g.slug); setGenreDropdownOpen(false); setGenreSearch(""); }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${isSelected ? "bg-purple-600/20 text-purple-400" : "text-zinc-400 hover:bg-white/[0.02] hover:text-white"}`}
                      >
                        <span className="truncate">{g.name}</span>
                        {isSelected && <Check size={12} />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* НАСТРОЕНИЯ */}
        <div className="space-y-2 relative">
          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Настроение трека</label>
          <button
            onClick={() => { setMoodDropdownOpen(!moodDropdownOpen); setGenreDropdownOpen(false); }}
            className="w-full bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] p-3 rounded-xl flex items-center justify-between text-sm text-zinc-200 transition-all text-left backdrop-blur-md"
          >
            <span className="truncate font-medium text-white">{activeMoodName}</span>
            <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-200 ${moodDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {moodDropdownOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setMoodDropdownOpen(false)} />
              <div className="absolute top-[104%] left-0 right-0 bg-[#0b0d12]/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl z-40 p-2 flex flex-col max-h-[250px]">
                <div className="relative mb-2 shrink-0">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500 h-3.5 w-3.5" />
                  <input
                    type="text" placeholder="Поиск настроения..." value={moodSearch}
                    onChange={(e) => setMoodSearch(e.target.value)}
                    className="w-full bg-zinc-950/50 border border-white/[0.06] pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none text-white focus:border-purple-500/50"
                  />
                </div>
                <div className="overflow-y-auto flex-1 space-y-0.5 pr-1 scrollbar-thin">
                  <button
                    onClick={() => { setSelectedMood("all"); setMoodDropdownOpen(false); setMoodSearch(""); }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${selectedMood === "all" ? "bg-purple-600/20 text-purple-400" : "text-zinc-400 hover:bg-white/[0.02] hover:text-white"}`}
                  >
                    <span>Все настроения</span>
                    {selectedMood === "all" && <Check size={12} />}
                  </button>
                  {filteredMoods.map((m) => {
                    const isSelected = selectedMood === m.slug
                    return (
                      <button
                        key={m.id} onClick={() => { setSelectedMood(m.slug); setMoodDropdownOpen(false); setMoodSearch(""); }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${isSelected ? "bg-purple-600/20 text-purple-400" : "text-zinc-400 hover:bg-white/[0.02] hover:text-white"}`}
                      >
                        <span className="truncate">{m.name}</span>
                        {isSelected && <Check size={12} />}
                      </button>
                    )
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* ТОНАЛЬНОСТИ */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Тональность</label>
            {keyParts.note && (
              <span className="text-[11px] font-mono font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                {keyParts.note}{keyParts.accidental} {keyParts.mode === "Minor" ? "Мин" : "Маж"}
              </span>
            )}
          </div>
          <div className="space-y-2">
            <div className="grid grid-cols-7 gap-1 bg-black/20 p-1 rounded-xl border border-white/[0.04]">
              {NOTES.map(n => {
                const isActive = keyParts.note === n
                return (
                  <button
                    key={n} type="button" onClick={() => handleKeyChange("note", n)}
                    className={`h-8 rounded-lg text-xs font-bold transition-all duration-150 ${isActive ? "bg-purple-600 text-white shadow-md shadow-purple-900/40 scale-[1.03]" : "text-zinc-400 hover:text-white hover:bg-white/[0.03]"}`}
                  >
                    {n}
                  </button>
                )
              })}
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              <div className="col-span-2 grid grid-cols-2 gap-1 bg-black/20 p-1 rounded-xl border border-white/[0.04]">
                <button
                  type="button" onClick={() => handleKeyChange("accidental", "#")}
                  className={`h-8 rounded-lg text-xs font-black transition-all duration-150 ${keyParts.accidental === "#" ? "bg-purple-500/20 border border-purple-500/40 text-purple-400" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"}`}
                >
                  ♯
                </button>
                <button
                  type="button" onClick={() => handleKeyChange("accidental", "b")}
                  className={`h-8 rounded-lg text-xs font-black transition-all duration-150 ${keyParts.accidental === "b" ? "bg-purple-500/20 border border-purple-500/40 text-purple-400" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"}`}
                >
                  ♭
                </button>
              </div>
              <div className="col-span-3 grid grid-cols-2 gap-1 bg-black/20 p-1 rounded-xl border border-white/[0.04]">
                {MODES.map(m => {
                  const isActive = keyParts.mode === m.value
                  return (
                    <button
                      key={m.value} type="button" onClick={() => handleKeyChange("mode", m.value)}
                      className={`h-8 rounded-lg text-[11px] font-bold transition-all duration-150 ${isActive ? "bg-purple-500/20 border border-purple-500/40 text-purple-400" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"}`}
                    >
                      {m.label === "Minor" ? "Минор" : "Мажор"}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* BPM */}
        <BpmFilter appliedMin={appliedBpm.min} appliedMax={appliedBpm.max} onApply={(min, max) => setAppliedBpm({ min, max })} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050608] text-zinc-100 p-4 sm:p-8 lg:p-12 relative overflow-hidden">
      
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-indigo-900/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1600px] mx-auto space-y-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.02] pb-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500">Биты и Инструменталы</h1>
            <p className="text-xs text-zinc-400">Премиум-каталог: поиск по названию, @автору и #тегам</p>
          </div>
        </div>

        {/* ОМНИБАР */}
        <div className="relative group z-20">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-purple-500/10 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative flex items-center bg-white/[0.01] hover:bg-white/[0.02] border border-white/[0.05] rounded-2xl transition-all duration-300 backdrop-blur-xl shadow-lg focus-within:border-purple-500/40 focus-within:bg-white/[0.03]">
            <Search className="absolute left-5 text-zinc-500 h-5 w-5" />
            <input
              type="text"
              placeholder="Найти бит, введите @автора или #тег..."
              value={globalSearch}
              onFocus={() => setTagsSuggestionsOpen(true)}
              onChange={(e) => {
                setGlobalSearch(e.target.value)
                setTagsSuggestionsOpen(true)
              }}
              className="w-full bg-transparent pl-14 pr-12 py-4 rounded-2xl outline-none text-base text-white placeholder:text-zinc-600 font-medium"
            />
            {globalSearch && (
              <button 
                onClick={() => { setGlobalSearch(""); setTagsSuggestionsOpen(false); }} 
                className="absolute right-5 text-zinc-500 hover:text-white transition-colors p-1"
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* АВТОКОМПЛИТ ТЕГОВ */}
          {tagsSuggestionsOpen && isTypingTag && tagSuggestions.length > 0 && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setTagsSuggestionsOpen(false)} />
              <div className="absolute top-[108%] left-0 right-0 bg-[#0c0e14]/90 backdrop-blur-2xl border border-white/[0.06] rounded-2xl shadow-2xl z-40 p-2 flex flex-col max-h-[220px] overflow-y-auto scrollbar-thin animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="text-[10px] font-bold text-zinc-500 px-3 py-2 uppercase tracking-wider">Найдено тегов:</div>
                {tagSuggestions.map(tag => {
                  const isAdded = selectedTags.includes(tag)
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleSelectSuggestedTag(tag)}
                      className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-between hover:bg-white/[0.04] text-zinc-300 hover:text-purple-400 transition-colors"
                    >
                      <span>#{tag}</span>
                      {isAdded && <Check size={14} className="text-purple-500" />}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* СОРТИРОВКА И ПЕРЕКЛЮЧАТЕЛЬ ВИДА */}
        <div className="flex items-center justify-between bg-white/[0.01] border border-white/[0.03] p-2 rounded-2xl backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <button onClick={() => setMobileFiltersOpen(true)} className="lg:hidden flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"><SlidersHorizontal size={15} /> Фильтры</button>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-transparent hover:bg-white/[0.04] border border-transparent hover:border-white/[0.06] text-zinc-300 px-3 py-2 rounded-xl outline-none text-xs font-bold cursor-pointer transition-all appearance-none">
              <option value="createdAt">✨ Сначала новые</option>
              <option value="plays">🔥 По популярности</option>
            </select>
          </div>
          <div className="hidden sm:flex p-1 bg-white/[0.02] rounded-xl items-center gap-1 border border-white/[0.03]">
            <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-all duration-200 ${viewMode === "grid" ? "bg-purple-600/90 text-white shadow-md shadow-purple-900/20" : "text-zinc-500 hover:text-white hover:bg-white/[0.05]"}`}><LayoutGrid size={15} /></button>
            <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg transition-all duration-200 ${viewMode === "list" ? "bg-purple-600/90 text-white shadow-md shadow-purple-900/20" : "text-zinc-500 hover:text-white hover:bg-white/[0.05]"}`}><List size={15} /></button>
          </div>
        </div>

        {/* АКТИВНЫЕ ТЕГИ */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 p-1 animate-in fade-in duration-300">
            {selectedTags.map(tag => (
              <div key={tag} className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-300 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm backdrop-blur-md">
                <span>#{tag}</span>
                <button onClick={() => handleTagToggle(tag)} className="hover:text-white hover:bg-purple-500/30 transition-colors p-0.5 rounded-full">
                  <X size={12} />
                </button>
              </div>
            ))}
            <button onClick={() => setSelectedTags([])} className="text-[11px] text-zinc-500 hover:text-white transition-colors ml-2 font-medium">Очистить всё</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-8 items-start">
          <aside className="hidden lg:block bg-white/[0.01] border border-white/[0.03] p-6 rounded-[2rem] lg:sticky lg:top-6 backdrop-blur-2xl shadow-2xl ring-1 ring-white/[0.01]">
            <FiltersSidebar />
          </aside>

          {/* МОБИЛЬНЫЙ ФИЛЬТР */}
          {mobileFiltersOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-50 lg:hidden flex justify-end animate-in fade-in duration-200">
              <div className="bg-[#0b0c10]/80 w-full max-w-sm h-full p-6 overflow-y-auto space-y-6 flex flex-col justify-between border-l border-white/[0.05] shadow-2xl animate-in slide-in-from-right-8 duration-300 backdrop-blur-2xl">
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-white/[0.05] pb-4">
                    <h3 className="text-base font-bold">Настройка фильтров</h3>
                    <button onClick={() => setMobileFiltersOpen(false)} className="text-zinc-400 p-2 bg-white/[0.05] rounded-full hover:text-white transition-colors"><X size={16} /></button>
                  </div>
                  <FiltersSidebar />
                </div>
                <button onClick={() => setMobileFiltersOpen(false)} className="w-full bg-purple-600 hover:bg-purple-500 py-3.5 rounded-xl font-bold text-sm text-white transition-colors shadow-lg shadow-purple-900/20">Применить фильтры</button>
              </div>
            </div>
          )}

          {/* КАТАЛОГ */}
          <main className="lg:col-span-3 xl:col-span-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(n => <div key={n} className="h-20 bg-white/[0.02] border border-white/[0.03] rounded-3xl animate-pulse backdrop-blur-sm" />)}
              </div>
            ) : beats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 px-4 text-center border border-white/[0.02] rounded-[2rem] bg-white/[0.01] backdrop-blur-md">
                <Search size={48} className="text-zinc-800 mb-5" />
                <h3 className="text-lg font-bold text-white mb-2">Ничего не найдено</h3>
                <p className="text-sm text-zinc-500 max-w-md">По вашему запросу нет совпадений. Попробуйте изменить параметры фильтрации или строку поиска.</p>
                <button onClick={handleResetAll} className="mt-8 px-6 py-3 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.05] rounded-xl text-sm font-bold transition-all shadow-sm">Сбросить фильтры</button>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                {beats.map((b) => {
                  const defaultPrice = b.licenses?.[0]?.price || 2000
                  const isCurrent = currentTrack?.id === b.id
                  return (
                    <div key={b.id} className={`group bg-white/[0.01] border p-3.5 rounded-[2rem] transition-all duration-300 flex flex-col justify-between hover:bg-white/[0.03] backdrop-blur-md ${isCurrent && isPlaying ? "border-purple-500/50 shadow-[0_0_30px_rgba(147,51,234,0.1)] ring-1 ring-purple-500/20" : "border-white/[0.03]"}`}>
                      <div>
                        <div onClick={() => handlePlayToggle(b)} className="relative aspect-square rounded-[1.25rem] overflow-hidden mb-4 bg-zinc-950 cursor-pointer shadow-lg group/cover">
                          {b.image && <Image src={b.image} alt="" fill className="object-cover group-hover/cover:scale-105 transition-transform duration-700 ease-out" />}
                          <div className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-all duration-300 ${isCurrent ? "opacity-100" : "opacity-0 group-hover/cover:opacity-100"}`}>
                            <div className="h-12 w-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-2xl scale-90 group-hover/cover:scale-100 transition-transform duration-300">
                              {renderPlayButtonIcon(b.id, 18)}
                            </div>
                          </div>
                        </div>

                        <Link href={`/beats/${b.id}`} className="font-bold text-sm text-zinc-100 hover:text-purple-400 transition-colors block truncate">
                          {b.title}
                        </Link>
                        <Link href={`/producer/${b.producerId}`} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors block mt-0.5 truncate">
                          @{b.producer.username}
                        </Link>
                        
                        <div className="flex flex-wrap gap-1 mt-3 max-h-[44px] overflow-hidden">
                          {b.tags.map(t => {
                            const isAct = selectedTags.includes(t.toLowerCase())
                            return (
                              <button 
                                key={t} onClick={() => handleTagToggle(t)} 
                                className={`text-[10px] px-2 py-0.5 rounded-lg font-medium border transition-colors ${isAct ? "bg-purple-500/20 text-purple-300 border-purple-500/30" : "bg-white/[0.03] border-white/[0.05] text-zinc-400 hover:text-white"}`}
                              >
                                #{t}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      
                      <div className="mt-5 pt-3 border-t border-white/[0.04]">
                        <div className="flex items-center justify-between mb-3 text-[10px] font-mono text-zinc-500 font-medium">
                          <span className="bg-black/20 px-1.5 py-0.5 rounded border border-white/[0.02]">{b.bpm} BPM</span>
                          <span className="bg-black/20 px-1.5 py-0.5 rounded border border-white/[0.02]">{b.musicKey}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setActiveLicenseWidgetTrack(b)} className="flex-1 h-9 rounded-xl bg-purple-600/90 hover:bg-purple-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-md"><ShoppingBag size={13} /> <span>{formatCurrency(Number(defaultPrice))}</span></button>
                          <button onClick={(e) => toggleLike(b.id, e)} className="h-9 w-9 shrink-0 rounded-xl bg-white/[0.03] border border-white/[0.05] text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all flex items-center justify-center"><Heart size={14} className={likedTracks[b.id] ? "fill-red-500 text-red-500" : ""} /></button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              // ОБНОВЛЕННЫЙ ТАБЛИЧНЫЙ ВИД С "ЗАМОРОЖЕННОЙ" ШИРИНОЙ КНОПОК
              <div className="bg-white/[0.01] border border-white/[0.02] rounded-[2rem] overflow-hidden backdrop-blur-2xl shadow-2xl ring-1 ring-white/[0.01]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                      <tr className="border-b border-white/[0.03] text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-white/[0.01]">
                        <th className="py-4 px-5 w-14 text-center"></th>
                        <th className="py-4 px-2">Трек</th>
                        <th className="py-4 px-4 w-24 text-center">BPM</th>
                        <th className="py-4 px-4 w-28 text-center">Ключ</th>
                        <th className="py-4 px-4">Теги</th>
                        <th className="py-4 px-5 text-right w-[180px]">Действия</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                      {beats.map((b) => {
                        const isCurrent = currentTrack?.id === b.id
                        const defaultPrice = b.licenses?.[0]?.price || 2000
                        return (
                          <tr key={b.id} className={`group transition-colors hover:bg-white/[0.02] ${isCurrent ? "bg-purple-500/[0.04]" : ""}`}>
                            <td className="py-3 px-5 text-center">
                              <button onClick={() => handlePlayToggle(b)} className={`h-10 w-10 rounded-full flex items-center justify-center transition-all ${isCurrent ? "bg-purple-600 text-white shadow-lg shadow-purple-900/30 scale-105" : "bg-white/[0.04] border border-white/[0.04] text-zinc-400 group-hover:bg-purple-600 group-hover:text-white group-hover:border-transparent group-hover:scale-105"}`}>
                                {renderPlayButtonIcon(b.id, 14, true)}
                              </button>
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl overflow-hidden relative bg-black/20 border border-white/[0.04] shrink-0 shadow-sm">{b.image && <Image src={b.image} alt="" fill className="object-cover" />}</div>
                                <div className="min-w-0">
                                  <Link href={`/beats/${b.id}`} className="font-bold text-sm text-zinc-100 hover:text-purple-400 transition-colors block truncate">{b.title}</Link>
                                  <Link href={`/producer/${b.producerId}`} className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors block mt-0.5 truncate">@{b.producer.username}</Link>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center font-mono text-[11px] font-medium text-zinc-400"><span className="bg-black/20 px-2 py-1 rounded border border-white/[0.02]">{b.bpm}</span></td>
                            <td className="py-3 px-4 text-center"><span className="inline-block bg-white/[0.02] px-2.5 py-1 rounded-lg border border-white/[0.04] text-[10px] font-mono font-medium text-purple-300">{b.musicKey}</span></td>
                            <td className="py-3 px-4">
                              <div className="flex flex-wrap gap-1.5">
                                {b.tags.slice(0, 3).map((t) => {
                                  const isFilterActive = selectedTags.includes(t.toLowerCase())
                                  return (
                                    <button
                                      key={t} onClick={() => handleTagToggle(t)}
                                      className={`text-[10px] font-medium px-2 py-1 rounded-lg border transition-all duration-150 ${isFilterActive ? "bg-purple-500/20 border-purple-500/30 text-purple-300" : "bg-white/[0.02] border-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/[0.05]"}`}
                                    >
                                      #{t}
                                    </button>
                                  )
                                })}
                                {b.tags.length > 3 && <span className="text-[10px] text-zinc-600 font-medium px-1 py-1">+{b.tags.length - 3}</span>}
                              </div>
                            </td>
                            <td className="py-3 px-5 text-right">
                              <div className="flex items-center justify-end gap-2.5">
                                <button onClick={(e) => toggleLike(b.id, e)} className="h-9 w-9 shrink-0 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"><Heart size={14} className={likedTracks[b.id] ? "fill-red-500 text-red-500" : ""} /></button>
                                <button onClick={() => setActiveLicenseWidgetTrack(b)} className="h-9 w-28 shrink-0 rounded-xl bg-white/[0.04] border border-white/[0.06] hover:bg-purple-600/90 hover:text-white hover:border-transparent text-[11px] font-bold font-sans text-zinc-200 transition-all flex items-center justify-center gap-1.5 shadow-sm">
                                  <ShoppingBag size={13} /> 
                                  <span>{formatCurrency(Number(defaultPrice))}</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* МОДАЛЬНОЕ ОКНО ЛИЦЕНЗИЙ */}
      {activeLicenseWidgetTrack && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0b0c10]/80 backdrop-blur-2xl border border-white/[0.06] w-full max-w-4xl rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[85vh] scale-100 animate-in zoom-in-95 duration-200 ring-1 ring-white/[0.02]">
            <div className="p-6 border-b border-white/[0.04] flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl overflow-hidden bg-black/40 relative shadow-md border border-white/[0.04]">{activeLicenseWidgetTrack.image && <Image src={activeLicenseWidgetTrack.image} alt="" fill className="object-cover" />}</div>
                <div>
                  <h3 className="text-sm font-bold text-white">Выбор прав: <span className="text-purple-400">«{activeLicenseWidgetTrack.title}»</span></h3>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Контракт с @{activeLicenseWidgetTrack.producer.username}</p>
                </div>
              </div>
              <button onClick={() => setActiveLicenseWidgetTrack(null)} className="h-9 w-9 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.05] text-zinc-400 hover:text-white flex items-center justify-center transition-colors"><X size={16} /></button>
            </div>
            
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-5 bg-black/10">
              {activeLicenseWidgetTrack.licenses?.map((lic) => {
                const t = lic.template
                const isNegotiable = t?.isPriceNegotiable
                return (
                  <div key={lic.id} className="bg-white/[0.02] border border-white/[0.04] rounded-2xl p-6 flex flex-col justify-between hover:border-purple-500/30 hover:bg-white/[0.04] transition-all backdrop-blur-sm group/lic">
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-bold text-xs text-zinc-100">{t?.name || "Лицензия"}</h4>
                        <span className="bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono text-[9px] px-2 py-1 rounded-lg uppercase font-bold">{t?.fileType || "MP3"}</span>
                      </div>
                      
                      <div className="my-4 flex items-baseline gap-1">
                        {isNegotiable ? (
                          <span className="text-lg font-bold text-purple-400">Договорная</span>
                        ) : (
                          <>
                            <span className="text-2xl font-black text-white font-mono">{formatCurrency(lic.price)}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">/ бессрочно</span>
                          </>
                        )}
                      </div>

                      <div className="space-y-2.5 pt-4 border-t border-white/[0.04] text-[11px] text-zinc-400 mb-6">
                        <div className="flex items-center gap-2.5"><Radio size={14} className="text-purple-400/70 shrink-0" /> <span>Стримы: <strong className="text-zinc-200">{t?.audioStreams ? t.audioStreams.toLocaleString() : "Безлимит"}</strong></span></div>
                        <div className="flex items-center gap-2.5"><DiscAlbum size={14} className="text-purple-400/70 shrink-0" /> <span>Копии: <strong className="text-zinc-200">{t?.distributionCopies ? t.distributionCopies.toLocaleString() : "Безлимит"}</strong></span></div>
                        <div className="flex items-center gap-2.5"><FileText size={14} className="text-purple-400/70 shrink-0" /> <span>Право: <span className="text-zinc-300 font-medium">{t?.governingLawCountry || "РФ"}</span></span></div>
                        <div className="flex items-center gap-2.5"><Info size={14} className="text-purple-400/70 shrink-0" /> <span>Радио: <span className={t?.radioBroadcastingRights ? "text-emerald-400/90" : "text-zinc-500"}>{t?.radioBroadcastingRights ? "Да" : "Нет"}</span></span></div>
                      </div>
                    </div>

                    {isNegotiable ? (
                      <Link 
                        href={`/inquiry/new?trackId=${activeLicenseWidgetTrack.id}&licenseId=${lic.id}`}
                        className="w-full py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white font-bold text-xs transition-all text-center block border border-white/[0.05]"
                      >
                        Запросить условия
                      </Link>
                    ) : (
                      <button
                        onClick={() => {
                          handleAddToCart(activeLicenseWidgetTrack.id, activeLicenseWidgetTrack.title, lic.id, t?.name)
                          setActiveLicenseWidgetTrack(null)
                        }}
                        className="w-full py-3 rounded-xl bg-purple-600/90 hover:bg-purple-500 text-white font-bold text-xs transition-all shadow-lg shadow-purple-900/20 group-hover/lic:scale-[1.02]"
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

// --- ВЫДЕЛЕННЫЙ ВЫСОКОПРОИЗВОДИТЕЛЬНЫЙ BPM ФИЛЬТР ---
interface BpmFilterProps { appliedMin: number; appliedMax: number; onApply: (min: number, max: number) => void }
function BpmFilter({ appliedMin, appliedMax, onApply }: BpmFilterProps) {
  const [isExact, setIsExact] = React.useState(appliedMin === appliedMax)
  const [minVal, setMinVal] = React.useState<string>(String(appliedMin))
  const [maxVal, setMaxVal] = React.useState<string>(String(appliedMax))
  const [lastChanged, setLastChanged] = React.useState<"min" | "max">("min")

  React.useEffect(() => {
    setMinVal(String(appliedMin))
    maxVal !== String(appliedMax) && setMaxVal(String(appliedMax))
    setIsExact(appliedMin === appliedMax)
  }, [appliedMin, appliedMax])

  const currentMinNum = Math.max(60, Math.min(parseInt(minVal) || 60, 180))
  const currentMaxNum = Math.max(60, Math.min(parseInt(maxVal) || 180, 180))

  React.useEffect(() => {
    const handler = setTimeout(() => {
      let cleanMin = currentMinNum
      let cleanMax = isExact ? currentMinNum : currentMaxNum
      if (!isExact && cleanMin > cleanMax) { const temp = cleanMin; cleanMin = cleanMax; cleanMax = temp }
      if (cleanMin !== appliedMin || cleanMax !== appliedMax) onApply(cleanMin, cleanMax)
    }, 300)
    return () => clearTimeout(handler)
  }, [minVal, maxVal, isExact])

  const minPct = ((currentMinNum - 60) / (180 - 60)) * 100
  const maxPct = ((currentMaxNum - 60) / (180 - 60)) * 100

  const toggleMode = () => {
    const nextExact = !isExact
    setIsExact(nextExact)
    if (nextExact) { setMaxVal(minVal); onApply(currentMinNum, currentMinNum) } 
    else { setMaxVal("180"); onApply(currentMinNum, 180) }
  }

  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Темп (BPM)</label>
        <button type="button" onClick={toggleMode} className="text-[10px] font-bold px-2 py-0.5 rounded border border-white/[0.04] bg-white/[0.02] text-zinc-400 hover:text-white transition-colors backdrop-blur-sm">
          {isExact ? "• Точный" : "⇄ Диапазон"}
        </button>
      </div>
      <div className="flex items-center justify-between gap-1.5 text-zinc-500 text-xs font-mono bg-black/20 p-2 rounded-xl border border-white/[0.02]">
        {isExact ? (
          <div className="flex items-center gap-2 w-full justify-center">
            <span className="text-[10px] text-zinc-600">ЗНАЧЕНИЕ:</span>
            <input type="text" value={minVal} onChange={(e) => { const c = e.target.value.replace(/\D/g, ""); setMinVal(c); setMaxVal(c) }} className="w-12 bg-transparent text-center font-bold text-purple-400 outline-none border-b border-purple-500/30 focus:border-purple-500 text-sm" />
            <span className="text-[10px] text-zinc-600">BPM</span>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full px-1">
            <div className="flex items-center gap-1"><span className="text-[10px] text-zinc-600">ОТ</span><input type="text" value={minVal} onChange={(e) => setMinVal(e.target.value.replace(/\D/g, ""))} className="w-8 bg-transparent text-center font-bold text-white outline-none border-b border-white/10" /></div>
            <span className="text-zinc-700">|</span>
            <div className="flex items-center gap-1"><span className="text-[10px] text-zinc-600">ДО</span><input type="text" value={maxVal} onChange={(e) => setMaxVal(e.target.value.replace(/\D/g, ""))} className="w-8 bg-transparent text-center font-bold text-purple-400 outline-none border-b border-white/10" /></div>
          </div>
        )}
      </div>
      <div className="relative pt-2 pb-2 px-1">
        <div className="absolute h-[3px] left-1 right-1 top-1/2 -translate-y-1/2 bg-white/[0.05] rounded-full" />
        <div className="absolute h-[3px] top-1/2 -translate-y-1/2 bg-purple-500/80 rounded-full" style={{ left: `${isExact ? 0 : Math.min(minPct, maxPct)}%`, right: `${100 - (isExact ? minPct : Math.max(minPct, maxPct))}%` }} />
        {isExact ? (
          <input type="range" min="60" max="180" value={currentMinNum} onChange={(e) => { setMinVal(e.target.value); setMaxVal(e.target.value) }} className="absolute w-full h-1 top-1/2 -translate-y-1/2 left-0 appearance-none bg-transparent cursor-pointer accent-purple-500" />
        ) : (
          <>
            <input type="range" min="60" max="180" value={currentMinNum} onChange={(e) => { setLastChanged("min"); setMinVal(e.target.value) }} style={{ zIndex: lastChanged === "min" ? 20 : 10 }} className="absolute w-full h-1 top-1/2 -translate-y-1/2 left-0 appearance-none bg-transparent pointer-events-none cursor-pointer accent-purple-500 [&::-webkit-slider-thumb]:pointer-events-auto" />
            <input type="range" min="60" max="180" value={currentMaxNum} onChange={(e) => { setLastChanged("max"); setMaxVal(e.target.value) }} style={{ zIndex: lastChanged === "max" ? 20 : 10 }} className="absolute w-full h-1 top-1/2 -translate-y-1/2 left-0 appearance-none bg-transparent pointer-events-none cursor-pointer accent-purple-500 [&::-webkit-slider-thumb]:pointer-events-auto" />
          </>
        )}
      </div>
    </div>
  )
}