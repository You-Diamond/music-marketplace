"use client"

import { useState } from "react"
import Link from "next/link"
import { Plus, Music, Sliders, EyeOff } from "lucide-react"
import TrackRowActions from "@/components/studio/TrackRowActions"
import TrackLicensesManager from "@/components/studio/TrackLicensesManager"

export default function TrackListClient({ initialTracks }: { initialTracks: any[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [tracks, setTracks] = useState(initialTracks) // Локальный стейт для оптимистичных обновлений

  const toggleSelectAll = () => {
    if (selectedIds.length === tracks.length) setSelectedIds([])
    else setSelectedIds(tracks.map(t => t.id))
  }

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) setSelectedIds(prev => prev.filter(i => i !== id))
    else setSelectedIds(prev => [...prev, id])
  }

  const handleBulkHide = async () => {
    if (!confirm(`Скрыть ${selectedIds.length} треков с витрины?`)) return
    
    // Оптимистичное обновление UI
    setTracks(prev => prev.map(t => selectedIds.includes(t.id) ? { ...t, isActive: false } : t))
    setSelectedIds([])
    
    // Здесь будет вызов серверного экшена: await bulkHideTracks(selectedIds)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.04] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Мои Треки</h1>
          <p className="text-zinc-500 text-xs mt-1">Управляйте своим каталогом битов, стоимостью и приватностью.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/studio/tracks/bulk" className="inline-flex items-center justify-center h-10 px-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] text-zinc-300 text-xs font-bold uppercase tracking-wider transition-all">
            Пакетная загрузка
          </Link>
          <Link href="/studio/tracks/new" className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(220,38,38,0.15)]">
            <Plus className="h-4 w-4" /> Загрузить бит
          </Link>
        </div>
      </div>

      {/* ПАНЕЛЬ МАССОВЫХ ДЕЙСТВИЙ */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-600/10 border border-blue-500/20 p-3 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-200">
          <span className="text-xs font-mono text-blue-400">Выбрано битов: {selectedIds.length}</span>
          <div className="flex gap-2">
            <button onClick={handleBulkHide} className="text-[10px] font-bold uppercase bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
              <EyeOff className="h-3 w-3" /> Скрыть выбранные
            </button>
          </div>
        </div>
      )}

      {tracks.length === 0 ? (
        <div className="p-16 border border-white/[0.04] bg-[#0c0d12]/20 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-white/[0.01] border border-white/[0.05] flex items-center justify-center text-zinc-600">
            <Music className="h-5 w-5" />
          </div>
          <p className="text-[11px] text-zinc-500 max-w-xs leading-normal">Каталог пуст.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="px-4 flex items-center gap-4">
            <input 
              type="checkbox" 
              checked={selectedIds.length === tracks.length} 
              onChange={toggleSelectAll} 
              className="rounded bg-black border-white/[0.1] text-red-600 h-4 w-4 cursor-pointer" 
            />
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Выбрать все</span>
          </div>

          {tracks.map((track) => (
            <div key={track.id} className="bg-[#0c0d12]/30 backdrop-blur-md border border-white/[0.04] rounded-2xl overflow-hidden hover:border-white/[0.08] transition-all flex">
              
              {/* Чекбокс для массовых действий */}
              <div className="p-4 flex items-center justify-center border-r border-white/[0.02]">
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(track.id)} 
                  onChange={() => toggleSelect(track.id)} 
                  className="rounded bg-black border-white/[0.1] text-red-600 h-4 w-4 cursor-pointer" 
                />
              </div>

              <div className="flex-1">
                {/* Главная строка трека */}
                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="h-12 w-12 rounded-xl bg-zinc-800 shrink-0 flex items-center justify-center border border-white/[0.05] overflow-hidden">
                      {track.image ? <img src={track.image} alt={track.title} className="w-full h-full object-cover" /> : <Music className="h-5 w-5 text-zinc-600" />}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white truncate">{track.title}</h3>
                        {!track.isActive && <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[8px] font-mono text-zinc-500 uppercase">Скрыт</span>}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-mono text-zinc-500">
                        <span className="text-purple-400">{track.genre.name}</span>
                        <span>•</span>
                        <span>{track.bpm} BPM</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 md:mx-auto shrink-0 border-t border-b border-white/[0.02] md:border-none py-2 md:py-0">
                    <div className="text-center md:text-left">
                      <span className="block text-[9px] font-mono text-zinc-600 uppercase">Прослушивания</span>
                      <span className="text-xs font-bold text-zinc-300 font-mono">{track.plays}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 shrink-0">
                    <Link href={`/studio/tracks/${track.id}/edit`} className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] text-zinc-400 hover:text-white transition-all">
                      <Sliders className="h-4 w-4" />
                    </Link>
                    <TrackRowActions trackId={track.id} isActive={track.isActive} />
                  </div>
                </div>

                {/* Управление лицензиями */}
                <div className="border-t border-white/[0.02] bg-black/20">
                  <TrackLicensesManager trackTitle={track.title} licenses={track.licenses} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}