"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Search, SlidersHorizontal, ListMusic, Disc, Play } from "lucide-react"

interface PlaylistProps {
  id: string
  title: string
  image: string | null
  description: string | null
  isFeatured: boolean
  _count: { tracks: number }
}

export default function PlaylistsCatalogPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Фильтры в URL
  const [searchQuery, setSearchQuery] = React.useState(searchParams.get("query") || "")
  const [filterType, setFilterType] = React.useState(searchParams.get("type") || "all")
  const [sortBy, setSortBy] = React.useState(searchParams.get("sortBy") || "createdAt")

  // Состояния данных
  const [playlists, setPlaylists] = React.useState<PlaylistProps[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const fetchFilteredPlaylists = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set("query", searchQuery)
      if (filterType !== "all") params.set("type", filterType)
      if (sortBy !== "createdAt") params.set("sortBy", sortBy)

      router.push(`${pathname}?${params.toString()}`, { scroll: false })

      // Замените на ваш эндпоинт API для плейлистов
      const res = await fetch(`/api/playlists/search?${params.toString()}`)
      const data = await res.json()
      if (Array.isArray(data)) setPlaylists(data)
    } catch (error) {
      console.error("Ошибка фильтрации плейлистов:", error)
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, filterType, sortBy, router, pathname])

  React.useEffect(() => {
    const delayDebounce = setTimeout(fetchFilteredPlaylists, 350)
    return () => clearTimeout(delayDebounce)
  }, [fetchFilteredPlaylists])

  return (
    <div className="min-h-screen bg-[#0c0d12] text-zinc-100 p-4 sm:p-8 lg:p-12">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Шапка */}
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-white">Авторские плейлисты</h1>
          <p className="text-sm text-zinc-500">Музыкальные подборки и эксклюзивные миксы по настроениям</p>
        </div>

        {/* Быстрый поиск и сортировка */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Поиск плейлистов по названию или описанию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/40 border border-white/[0.08] pl-12 pr-4 py-3 rounded-xl outline-none focus:border-amber-500/50 transition-all text-sm text-white placeholder-zinc-600"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-zinc-900/40 border border-white/[0.08] text-zinc-300 px-6 py-3 rounded-xl outline-none font-medium cursor-pointer text-sm focus:border-amber-500/50"
          >
            <option value="createdAt" className="bg-[#0c0d12]">Новые</option>
            <option value="popular" className="bg-[#0c0d12]">Популярные</option>
          </select>
        </div>

        {/* Главный контент */}
        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-8 items-start relative">
          
          {/* Фиксированный Сайдбар параметров */}
          <aside className="bg-zinc-900/20 border border-white/[0.05] p-5 rounded-2xl space-y-6 lg:sticky lg:top-24 max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-none backdrop-blur-md z-10">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 border-b border-white/[0.03] pb-3">
              <SlidersHorizontal size={14} className="text-amber-400" />
              Тип контента
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Категория подборки</label>
              <div className="space-y-1.5">
                {[
                  { slug: "all", name: "Все плейлисты" },
                  { slug: "featured", name: "Эксклюзивные" },
                  { slug: "albums", name: "Альбомы мейкеров" },
                  { slug: "moods", name: "По настроению" }
                ].map((item) => (
                  <button
                    key={item.slug}
                    onClick={() => setFilterType(item.slug)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      filterType === item.slug
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "text-zinc-400 hover:bg-white/[0.02] border border-transparent"
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Витрина: Плейлисты 5 карточек в ряд */}
          <main className="lg:col-span-3 xl:col-span-4">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} className="w-full aspect-[4/5] bg-zinc-900/20 border border-white/[0.05] animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : playlists.length === 0 ? (
              <div className="text-center py-20 bg-zinc-900/10 border border-white/[0.05] rounded-2xl">
                <ListMusic className="mx-auto text-zinc-700 h-12 w-12" />
                <p className="mt-4 text-zinc-500 text-sm font-medium">Плейлисты не найдены</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className="group bg-zinc-900/20 border border-white/[0.05] p-3 rounded-2xl hover:bg-zinc-900/40 transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      {/* Обложка с Ховер-эффектом Play */}
                      <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-zinc-900 shadow-inner group/cover">
                        {playlist.image ? (
                          <img src={playlist.image} alt={playlist.title} className="object-cover h-full w-full transition-transform duration-300 group-hover/cover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-800">
                            <ListMusic size={32} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Link
                            href={`/playlists/${playlist.id}`}
                            className="h-11 w-11 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                          >
                            <Play className="h-4 w-4 fill-current text-black ml-0.5" />
                          </Link>
                        </div>
                        {playlist.isFeatured && (
                          <span className="absolute top-2 left-2 text-[8px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">Mix</span>
                        )}
                      </div>

                      {/* Инфо */}
                      <div className="space-y-0.5 px-0.5">
                        <Link href={`/playlists/${playlist.id}`}>
                          <h3 className="font-semibold text-xs text-white truncate tracking-tight hover:text-amber-400 transition-colors">
                            {playlist.title}
                          </h3>
                        </Link>
                        {playlist.description && (
                          <p className="text-[10px] text-zinc-500 font-light truncate line-clamp-1">{playlist.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Подвал и Основная Кнопка */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between pb-2 border-b border-white/[0.03] text-[10px] font-mono text-zinc-500">
                        <div className="flex items-center gap-1">
                          <Disc className="h-3 w-3 text-zinc-600" />
                          <span>{playlist._count.tracks} треков</span>
                        </div>
                      </div>

                      <Link 
                        href={`/playlists/${playlist.id}`}
                        className="w-full h-7 mt-2 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:bg-white hover:text-black hover:border-transparent text-[10px] font-medium text-white transition-all duration-200 flex items-center justify-center"
                      >
                        Слушать подборку →
                      </Link>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  )
}