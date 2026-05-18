"use client"

import * as React from "react"
import { useState, useTransition } from "react"
import Link from "next/link"
import { 
  Music, Layers, Plus, Trash2, Edit3, 
  Eye, EyeOff, Star, Loader2, Search, SlidersHorizontal 
} from "lucide-react"
import { deleteTrackAction, toggleTrackFeaturedStatus } from "@/app/actions/studio"

// Демо-данные загруженного контента (в реальности прилетят из БД через useEffect или Server Component)
const MOCK_TRACKS = [
  { id: "track-1", title: "God Mode", bpm: 140, key: "E Minor", genre: "Trap", featured: true, isActive: true, plays: 12450, downloads: 320, createdAt: "12.05.2026" },
  { id: "track-2", title: "Deep Waters", bpm: 128, key: "G Major", genre: "Drill", featured: false, isActive: true, plays: 3100, downloads: 45, createdAt: "10.05.2026" },
  { id: "track-3", title: "Cyberpunk 2026", bpm: 155, key: "C# Minor", genre: "Synthwave", featured: false, isActive: false, plays: 0, downloads: 0, createdAt: "15.05.2026" },
]

const MOCK_SOUNDPACKS = [
  { id: "pack-1", title: "Overdrive Drill Kit", price: 29.99, soundsCount: 150, isFeatured: true, isActive: true, createdAt: "01.05.2026" }
]

export default function TracksManagerPage() {
  const [activeSubTab, setActiveSubTab] = useState<"beats" | "kits">("beats")
  const [searchQuery, setSearchQuery] = useState("")
  const [isPending, startTransition] = useTransition()
  
  // Локальный стейт контента для мгновенного отклика (Optimistic UI)
  const [tracks, setTracks] = useState(MOCK_TRACKS)

  // Функция удаления трека
  const handleDeleteTrack = async (trackId: string) => {
    if (!confirm("Вы уверены, что хотите полностью удалить этот трек? Это действие сотрет все его кастомные лицензии.")) return

    // 1. Убираем из UI сразу
    setTracks(prev => prev.filter(t => t.id !== trackId))

    // 2. Стираем из БД через Server Action
    startTransition(async () => {
      await deleteTrackAction(trackId)
    })
  }

  // Функция переключения фичеред-статуса (Звезда / Попадание в Тренды)
  const handleToggleFeatured = (trackId: string, currentFeatured: boolean) => {
    setTracks(prev => prev.map(t => t.id === trackId ? { ...t, featured: !currentFeatured } : t))

    startTransition(async () => {
      await toggleTrackFeaturedStatus(trackId, !currentFeatured)
    })
  }

  // Фильтрация по поисковому запросу
  const filteredTracks = tracks.filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.genre.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Верхняя панель: Заголовок и Действие */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Tracks & Kits Manager</h1>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">
              Центральный узел управления вашим аудио-каталогом, релизами и статистикой по каждому элементу.
            </p>
          </div>
          <Link 
            href="/studio/upload" 
            className="flex items-center gap-2 bg-brand-red hover:bg-brand-red/90 text-white font-bold text-xs uppercase px-4 py-3 rounded-xl tracking-wider transition shadow-lg shadow-brand-red/10"
          >
            <Plus size={14} strokeWidth={3} />
            <span>Upload Content</span>
          </Link>
        </div>

        {/* Поиск и фильтры + Переключатель типов контента */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-900 shadow-sm">
          
          {/* Мини-табы (Биты / Сэмпл-паки) */}
          <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl">
            <button
              onClick={() => setActiveSubTab("beats")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition ${
                activeSubTab === "beats" ? "bg-white dark:bg-zinc-900 text-brand-red shadow-sm" : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              <Music size={12} />
              <span>Beats ({tracks.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab("kits")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition ${
                activeSubTab === "kits" ? "bg-white dark:bg-zinc-900 text-brand-red shadow-sm" : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              <Layers size={12} />
              <span>Sound Packs ({MOCK_SOUNDPACKS.length})</span>
            </button>
          </div>

          {/* Строка поиска */}
          <div className="relative flex items-center flex-1 sm:max-w-xs">
            <Search size={14} className="absolute left-3 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by title or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold focus:outline-none focus:border-brand-red transition"
            />
          </div>
        </div>

        {/* Лоадер синхронизации */}
        {isPending && (
          <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold uppercase tracking-widest pl-2 animate-pulse">
            <Loader2 size={12} className="animate-spin text-brand-red" />
            <span>Updating database records...</span>
          </div>
        )}

        {/* ТАБЛИЦА КОНТЕНТА */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-900 rounded-2xl shadow-sm overflow-hidden">
          {activeSubTab === "beats" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800/80">
                    <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Item Info</th>
                    <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-wider">Stats</th>
                    <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-wider text-center">Trending</th>
                    <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-wider text-center">Status</th>
                    <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                  {filteredTracks.map((track) => (
                    <tr key={track.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-950/10 transition">
                      
                      {/* Инфо элемента */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 shrink-0">
                            <Music size={16} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold tracking-tight">{track.title}</h4>
                            <span className="text-[10px] text-zinc-400 font-semibold bg-zinc-100 dark:bg-zinc-950 px-1.5 py-0.5 rounded mr-1.5">
                              {track.bpm} BPM
                            </span>
                            <span className="text-[10px] text-zinc-400 font-semibold">
                              {track.genre} • {track.key}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Статистика */}
                      <td className="p-4">
                        <div className="text-[11px] font-semibold">
                          <div>Plays: <span className="font-bold text-zinc-900 dark:text-white">{track.plays.toLocaleString()}</span></div>
                          <div className="text-zinc-400">DLs: <span className="font-medium text-zinc-600 dark:text-zinc-300">{track.downloads}</span></div>
                        </div>
                      </td>

                      {/* Переключатель Трендов (Featured) */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleFeatured(track.id, track.featured)}
                          className={`p-2 rounded-lg transition ${
                            track.featured 
                              ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20" 
                              : "text-zinc-300 dark:text-zinc-700 hover:text-zinc-500"
                          }`}
                          title={track.featured ? "Убрать из трендов главной" : "Вывести в тренды на главную"}
                        >
                          <Star size={14} fill={track.featured ? "currentColor" : "none"} strokeWidth={2.5} />
                        </button>
                      </td>

                      {/* Статус модерации/активности */}
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          track.isActive 
                            ? "bg-green-500/10 text-green-500" 
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                        }`}>
                          {track.isActive ? <Eye size={10} /> : <EyeOff size={10} />}
                          {track.isActive ? "Active" : "Hidden"}
                        </span>
                      </td>

                      {/* Кнопки действий */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-850 rounded-lg transition"
                            title="Редактировать метаданные"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteTrack(track.id)}
                            className="p-2 text-zinc-400 hover:text-brand-red hover:bg-red-500/5 rounded-lg transition"
                            title="Удалить трек"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  ))}

                  {filteredTracks.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-xs font-medium text-zinc-400">
                        Ничего не найдено по вашему запросу.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Простая заглушка под вкладку Сэмпл-паков */
            <div className="p-8 text-center space-y-3">
              <Layers size={24} className="mx-auto text-zinc-400" />
              <div className="text-xs font-bold">Сэмпл-паки и Драм-киты</div>
              <p className="text-[11px] text-zinc-400 max-w-xs mx-auto">
                Здесь будет выводиться список ваших паков. Управление ими работает аналогично битам.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}