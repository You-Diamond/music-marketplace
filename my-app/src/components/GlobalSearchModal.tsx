"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Search,
  Flame,
  Music2,
  User,
  ListMusic,
} from "lucide-react"
import clsx from "clsx"

import {
  searchResultsMock,
  trendingSearchesMock,
} from "@/mocks/search.mock"

function getCategoryIcon(category: string) {
  switch (category) {
    case "beat":
      return <Music2 size={18} />
    case "producer":
      return <User size={18} />
    default:
      return <ListMusic size={18} />
  }
}

type Props = {
  isOpen: boolean
  onClose: () => void
}

export default function GlobalSearchModal({ isOpen, onClose }: Props) {
  const [query, setQuery] = useState("")

  const filteredResults = useMemo(() => {
    if (!query.trim()) return searchResultsMock

    return searchResultsMock.filter(
      (item) =>
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.subtitle?.toLowerCase().includes(query.toLowerCase())
    )
  }, [query])

  if (!isOpen) return null

  return (
    /* Наложение: Днем мягкое размытое стекло / Ночью глубокое темное */
    <div className="fixed inset-0 z-[200] bg-zinc-950/20 dark:bg-black/70 backdrop-blur-md transition-colors duration-200">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-12 md:py-20">
        
        {/* Тело контейнера поиска */}
        <div className="overflow-hidden rounded-3xl border border-zinc-200/80 dark:border-zinc-900 bg-white dark:bg-[#121214] shadow-2xl transition-colors duration-200 text-zinc-950 dark:text-zinc-50">
          
          {/* Верхняя панель ввода */}
          <div className="border-b border-zinc-100 dark:border-zinc-900 p-6 md:p-8">
            <div className="flex items-center gap-4">
              <Search
                size={24}
                className="text-zinc-400 dark:text-zinc-500 shrink-0"
              />

              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search beats, producers, playlists..."
                className="h-12 w-full bg-transparent text-xl font-black uppercase outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 tracking-wide"
              />

              <button
                onClick={onClose}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shrink-0"
              >
                ESC
              </button>
            </div>
          </div>

          {/* Блок трендов (показывается, если инпут пустой) */}
          {!query && (
            <div className="border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10 p-6 md:p-8">
              <div className="flex items-center gap-2">
                <Flame size={16} className="text-brand-red animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
                  Trending Searches
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2.5">
                {trendingSearchesMock.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setQuery(item.query)}
                    className="rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 hover:border-brand-red dark:hover:border-brand-red hover:text-brand-red dark:hover:text-brand-red transition shadow-sm"
                  >
                    {item.query}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Зона вывода результатов поиска */}
          <div className="max-h-[50vh] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900">
            {filteredResults.map((result) => (
              <Link
                key={result.id}
                href={result.href}
                onClick={onClose}
                className="flex items-center gap-4 p-5 transition hover:bg-zinc-50 dark:hover:bg-zinc-900/50 group"
              >
                {/* Обложка / Иконка категории */}
                <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-zinc-200/60 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 shrink-0">
                  {result.image ? (
                    <Image
                      src={result.image}
                      alt={result.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    getCategoryIcon(result.category)
                  )}
                </div>

                {/* Текстовая информация */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border border-zinc-200/40 dark:border-zinc-800/40">
                      {result.category}
                    </span>
                  </div>

                  <h2 className="mt-1.5 text-lg font-black uppercase truncate text-zinc-900 dark:text-zinc-100 group-hover:text-brand-red transition-colors">
                    {result.title}
                  </h2>

                  {result.subtitle && (
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">
                      {result.subtitle}
                    </p>
                  )}
                </div>

                {/* Правая статус-иконка категории */}
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/40 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition shrink-0">
                  {getCategoryIcon(result.category)}
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}