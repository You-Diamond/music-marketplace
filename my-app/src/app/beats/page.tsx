"use client"

import * as React from "react"
import Link from "next/link"
import { Search, SlidersHorizontal, Music, Disc } from "lucide-react"
import { ExtendedTrack } from "@/stores/usePromoTracksStore"
import { usePlayerStore } from "@/stores/player-store"

interface Genre {
  id: string
  name: string
  slug: string
}

export default function BeatsCatalogPage() {
  // Состояния фильтров
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedGenre, setSelectedGenre] = React.useState("all")
  const [selectedKey, setSelectedKey] = React.useState("all")
  const [bpmRange, setBpmRange] = React.useState({ min: 60, max: 180 })
  const [sortBy, setSortBy] = React.useState("createdAt")

  // Данные с сервера
  const [beats, setBeats] = React.useState<ExtendedTrack[]>([])
  const [genres, setGenres] = React.useState<Genre[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  // Интеграция с твоим глобальным плеером
  const { play, track: currentTrack, isPlaying } = usePlayerStore()

  const musicKeys = ["A Minor", "C Major", "D Minor", "E Minor", "F# Minor", "G Minor"]

  // Загрузка жанров из API
  React.useEffect(() => {
    fetch("/api/genres")
      .then((res) => res.json())
      .then((data) => setGenres(data))
      .catch((err) => console.error(err))
  }, [])

  // Функция запроса отфильтрованных битов
  const fetchFilteredBeats = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        query: searchQuery,
        genre: selectedGenre,
        musicKey: selectedKey,
        bpmMin: bpmRange.min.toString(),
        bpmMax: bpmRange.max.toString(),
        sortBy: sortBy,
      })

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
  }, [searchQuery, selectedGenre, selectedKey, bpmRange, sortBy])

  // Эффект дебаунса для ввода текста
  React.useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchFilteredBeats()
    }, 300)

    return () => clearTimeout(delayDebounce)
  }, [fetchFilteredBeats])

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 sm:p-12 transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Заголовок */}
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase sm:text-4xl">
            Магазин битов
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Премиальный продакшн от топовых мейкеров индустрии
          </p>
        </div>

        {/* Поиск и Сортировка */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Поиск по названию бита или тегам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 pl-12 pr-4 py-3.5 rounded-2xl outline-none focus:border-brand-red dark:focus:border-brand-red font-medium transition-all shadow-sm"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-6 py-3.5 rounded-2xl outline-none font-semibold cursor-pointer text-sm shadow-sm"
          >
            <option value="createdAt">Новинки</option>
            <option value="plays">Популярные</option>
            <option value="likes">Избранные</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Панель фильтров */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl space-y-6 shadow-sm">
            <div className="flex items-center gap-2 font-black uppercase text-xs tracking-wider border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <SlidersHorizontal size={16} className="text-brand-red" />
              Параметры
            </div>

            {/* Фильтр Жанров */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Жанр</label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl outline-none text-sm font-medium"
              >
                <option value="all">Все жанры</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.slug}>{g.name}</option>
                ))}
              </select>
            </div>

            {/* Фильтр Тональностей */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Тональность</label>
              <select
                value={selectedKey}
                onChange={(e) => setSelectedKey(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl outline-none text-sm font-medium"
              >
                <option value="all">Любая</option>
                {musicKeys.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            {/* Ползунки темпа */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                <span className="text-zinc-400">Темп (BPM)</span>
                <span className="text-brand-red font-black">{bpmRange.min} - {bpmRange.max}</span>
              </div>
              <div className="space-y-2">
                <input
                  type="range"
                  min="60"
                  max="180"
                  value={bpmRange.min}
                  onChange={(e) => setBpmRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                  className="w-full accent-brand-red cursor-pointer"
                />
                <input
                  type="range"
                  min="60"
                  max="180"
                  value={bpmRange.max}
                  onChange={(e) => setBpmRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                  className="w-full accent-brand-red cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Результаты поиска (Список строк) */}
          <div className="lg:col-span-3 space-y-3">
            {isLoading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="w-full h-20 bg-zinc-200 dark:bg-zinc-900 animate-pulse rounded-2xl" />
              ))
            ) : beats.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl">
                <Disc className="mx-auto text-zinc-300 dark:text-zinc-700 h-12 w-12" />
                <p className="mt-4 text-zinc-500 font-medium">Биты по вашему запросу не найдены</p>
              </div>
            ) : (
              beats.map((b) => {
                const basePrice = b.licenses[0]?.price || 29.99
                const isCurrent = currentTrack?.id === b.id

                return (
                  <div
                    key={b.id}
                    className={`flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border rounded-2xl group transition-all hover:shadow-md ${
                      isCurrent ? "border-brand-red bg-brand-red/[0.01]" : "border-zinc-200/60 dark:border-zinc-800/60"
                    }`}
                  >
                    {/* Обложка + Название */}
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12 rounded-xl overflow-hidden shadow-inner flex-shrink-0 bg-zinc-100 dark:bg-zinc-800">
                        {b.image && (
                          <img src={b.image} alt={b.title} className="object-cover h-full w-full" />
                        )}
                        <button
                          onClick={() => {
                            const playerReadyTrack = {
                              ...b,
                              author: b.producer.displayName || b.producer.username,
                              publicId: b.id,
                            };
                            
                            const playerReadyQueue = beats.map(item => ({
                              ...item,
                              author: item.producer.displayName || item.producer.username,
                              publicId: item.id
                            }));

                            play(playerReadyTrack as any, playerReadyQueue as any);
                          }}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                        >
                          <Music size={18} className={isCurrent && isPlaying ? "animate-bounce" : ""} />
                        </button>
                      </div>

                      <div>
                        <Link href={`/beats/${b.id}`} className="font-bold text-sm tracking-tight leading-none hover:text-brand-red transition-colors block">
                          {b.title}
                        </Link>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                          by{" "}
                          <Link href={`/producer/${b.producer.username}`} className="hover:underline hover:text-brand-red transition-colors font-medium">
                            {b.producer.displayName || b.producer.username}
                          </Link>
                        </p>
                      </div>
                    </div>

                    {/* Характеристики + Кнопка цены */}
                    <div className="flex items-center gap-6 sm:gap-10">
                      <div className="hidden sm:flex items-center gap-6 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                        <span className="bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md text-zinc-600 dark:text-zinc-400">
                          {b.bpm} BPM
                        </span>
                        <span className="w-16 text-center">{b.musicKey}</span>
                        <span className="w-16 text-right uppercase tracking-wider text-[10px] text-brand-red font-black">
                          {b.genre?.name}
                        </span>
                      </div>

                      <Link
                        href={`/beats/${b.id}`}
                        className="bg-zinc-900 hover:bg-brand-red dark:bg-zinc-100 dark:hover:bg-brand-red text-white dark:text-zinc-900 dark:hover:text-white px-4 py-2 rounded-xl font-bold text-xs tracking-tight transition-all active:scale-95 shadow-sm block text-center"
                      >
                        ${basePrice.toFixed(2)}
                      </Link>
                    </div>
                  </div>
                )
              })
            )}
          </div>

        </div>
      </div>
    </div>
  )
}