"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Search, SlidersHorizontal, Layers, Play, ShoppingBag, Disc } from "lucide-react"

interface PackProps {
  id: string
  title: string
  image: string | null
  price: number
  soundsCount: number
  category?: string
}

export default function SoundPacksCatalogPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Фильтры
  const [searchQuery, setSearchQuery] = React.useState(searchParams.get("query") || "")
  const [selectedCategory, setSelectedCategory] = React.useState(searchParams.get("category") || "all")
  const [sortBy, setSortBy] = React.useState(searchParams.get("sortBy") || "createdAt")

  // Состояния данных
  const [packs, setPacks] = React.useState<PackProps[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  const fetchFilteredPacks = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchQuery) params.set("query", searchQuery)
      if (selectedCategory !== "all") params.set("category", selectedCategory)
      if (sortBy !== "createdAt") params.set("sortBy", sortBy)

      router.push(`${pathname}?${params.toString()}`, { scroll: false })

      // Замените на ваш эндпоинт API для сэмпл-паков
      const res = await fetch(`/api/packs/search?${params.toString()}`)
      const data = await res.json()
      if (Array.isArray(data)) setPacks(data)
    } catch (error) {
      console.error("Ошибка фильтрации сэмпл-паков:", error)
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, selectedCategory, sortBy, router, pathname])

  React.useEffect(() => {
    const delayDebounce = setTimeout(fetchFilteredPacks, 350)
    return () => clearTimeout(delayDebounce)
  }, [fetchFilteredPacks])

  return (
    <div className="min-h-screen bg-[#0c0d12] text-zinc-100 p-4 sm:p-8 lg:p-12">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Шапка страницы */}
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold tracking-tight text-white">Сэмпл-паки и Kits</h1>
          <p className="text-sm text-zinc-500">Профессиональные аудио-ресурсы, Drum-киты и пресеты для продакшна</p>
        </div>

        {/* Поиск и сортировка */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Поиск паков по названию, стилю или тегам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/40 border border-white/[0.08] pl-12 pr-4 py-3 rounded-xl outline-none focus:border-purple-500/50 transition-all text-sm text-white placeholder-zinc-600"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-zinc-900/40 border border-white/[0.08] text-zinc-300 px-6 py-3 rounded-xl outline-none font-medium cursor-pointer text-sm focus:border-purple-500/50"
          >
            <option value="createdAt" className="bg-[#0c0d12]">Новинки</option>
            <option value="priceAsc" className="bg-[#0c0d12]">Сначала дешевые</option>
            <option value="priceDesc" className="bg-[#0c0d12]">Сначала дорогие</option>
          </select>
        </div>

        {/* Главный блок */}
        <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-5 gap-8 items-start relative">
          
          {/* Фиксированный Сайдбар параметров */}
          <aside className="bg-zinc-900/20 border border-white/[0.05] p-5 rounded-2xl space-y-6 lg:sticky lg:top-24 max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-none backdrop-blur-md z-10">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400 border-b border-white/[0.03] pb-3">
              <SlidersHorizontal size={14} className="text-purple-400" />
              Тип софта
            </div>

            {/* Выбор Категории Пака */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Категория</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-black/40 border border-white/[0.05] p-2.5 rounded-lg outline-none text-sm font-medium text-zinc-300 focus:border-purple-500/30 cursor-pointer"
              >
                <option value="all" className="bg-[#0c0d12]">Все паки</option>
                <option value="drumkits" className="bg-[#0c0d12]">Drum Kits</option>
                <option value="loops" className="bg-[#0c0d12]">Melody Loops</option>
                <option value="presets" className="bg-[#0c0d12]">Пресеты (Serum/Omni)</option>
              </select>
            </div>
          </aside>

          {/* Витрина: Сэмплпаки 5 карточек в ряд */}
          <main className="lg:col-span-3 xl:col-span-4">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} className="w-full aspect-[4/5] bg-zinc-900/20 border border-white/[0.05] animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : packs.length === 0 ? (
              <div className="text-center py-20 bg-zinc-900/10 border border-white/[0.05] rounded-2xl">
                <Layers className="mx-auto text-zinc-700 h-12 w-12" />
                <p className="mt-4 text-zinc-500 text-sm font-medium">Сэмпл-паки не найдены</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {packs.map((pack) => (
                  <div
                    key={pack.id}
                    className="group bg-zinc-900/20 border border-white/[0.05] p-3 rounded-2xl hover:bg-zinc-900/40 transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      {/* Обложка с Кнопкой Превью */}
                      <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-zinc-900 shadow-inner group/cover">
                        {pack.image ? (
                          <img src={pack.image} alt={pack.title} className="object-cover h-full w-full transition-transform duration-300 group-hover/cover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-950 text-zinc-800">
                            <Layers size={32} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={(e) => {
                              e.preventDefault()
                              // Логика быстрого прослушивания демо пака
                            }}
                            className="h-11 w-11 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                          >
                            <Play className="h-4 w-4 fill-current text-white ml-0.5" />
                          </button>
                        </div>
                      </div>

                      {/* Инфо */}
                      <div className="space-y-0.5 px-0.5">
                        <Link href={`/pack/${pack.id}`}>
                          <h3 className="font-semibold text-xs text-white truncate tracking-tight hover:text-purple-400 transition-colors">
                            {pack.title}
                          </h3>
                        </Link>
                      </div>
                    </div>

                    {/* Спецификация цен и Кнопка перехода к покупке */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between pb-2 border-b border-white/[0.03]">
                        <span className="text-[10px] font-mono text-zinc-500">{pack.soundsCount} сэмплов</span>
                        <span className="text-xs font-bold font-mono text-white">${pack.price}</span>
                      </div>

                      <Link 
                        href={`/pack/${pack.id}`}
                        className="w-full h-7 mt-2 rounded-lg bg-white/[0.03] border border-white/[0.05] hover:bg-white hover:text-black hover:border-transparent text-[10px] font-medium text-white transition-all duration-200 flex items-center justify-center gap-1"
                      >
                        <ShoppingBag className="h-2.5 w-2.5" /> Открыть пак
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