import * as React from "react"
import Link from "next/link"
import { 
  TrendingUp, Music, DollarSign, Layers, 
  ArrowUpRight, Plus, ShieldCheck, BarChart3, Clock
} from "lucide-react"
import { getStudioDashboardData } from "@/app/actions/studio"

export default async function StudioDashboard() {
  // Имитируем ID текущего авторизованного продюсера.
  // В будущем тут будет сессия, например: const session = await auth(); const mockProducerId = session.user.id;
  const mockProducerId = "user-producer-uuid-here" 

  const result = await getStudioDashboardData(mockProducerId)

  // Если продюсера нет в БД (например, после очистки базы), покажем базовые нули, чтобы не падать в ошибку
  const stats = result.success && result.data ? result.data : {
    grossEarnings: 0,
    totalPlays: 0,
    tracksCount: 0,
    recentTracks: []
  }

  // Форматирование валюты
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Верхняя панель: Приветствие и быстрые действия */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Studio Dashboard</h1>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">
              Добро пожаловать обратно! Мониторинг продаж, аналитика стриминга и управление каталогом.
            </p>
          </div>
          
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Link 
              href="/studio/licenses" 
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-850 text-zinc-700 dark:text-zinc-300 font-bold text-xs uppercase px-4 py-3 rounded-xl tracking-wider transition"
            >
              <ShieldCheck size={14} />
              <span>Matrix</span>
            </Link>
            <Link 
              href="/studio/upload" 
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-brand-red hover:bg-brand-red/90 text-white font-bold text-xs uppercase px-4 py-3 rounded-xl tracking-wider transition shadow-lg shadow-brand-red/10"
            >
              <Plus size={14} strokeWidth={3} />
              <span>Upload Beat</span>
            </Link>
          </div>
        </div>

        {/* МЕТРИКИ (Грид из 3 карточек) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          
          {/* Выручка */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-900 p-5 rounded-2xl shadow-sm space-y-2 relative overflow-hidden group">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Gross Earnings</span>
              <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
                <DollarSign size={14} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">{formatCurrency(stats.grossEarnings)}</h3>
              <p className="text-[10px] text-zinc-400 font-medium flex items-center gap-1 mt-0.5">
                <span className="text-green-500 font-bold flex items-center">静态 +0%</span> за этот месяц
              </p>
            </div>
          </div>

          {/* Прослушивания */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-900 p-5 rounded-2xl shadow-sm space-y-2 relative overflow-hidden group">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Total Plays</span>
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                <TrendingUp size={14} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">{stats.totalPlays.toLocaleString()}</h3>
              <p className="text-[10px] text-zinc-400 font-medium flex items-center gap-1 mt-0.5">
                <span className="text-blue-500 font-bold">Стриминг</span> с вашей витрины
              </p>
            </div>
          </div>

          {/* Всего треков */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-900 p-5 rounded-2xl shadow-sm space-y-2 relative overflow-hidden group">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Active Beats</span>
              <div className="p-2 bg-brand-red/10 text-brand-red rounded-lg">
                <Music size={14} />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">{stats.tracksCount}</h3>
              <p className="text-[10px] text-zinc-400 font-medium flex items-center gap-1 mt-0.5">
                <Link href="/studio/tracks" className="text-brand-red hover:underline font-bold flex items-center gap-0.5">
                  Manage Catalog <ArrowUpRight size={10} />
                </Link>
              </p>
            </div>
          </div>

        </div>

        {/* НИЖНИЙ БЛОК: Визуальный симулятор графика + Последние треки */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Левая часть: Симулятор Графика Продаж (2 колонки на десктопе) */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-900 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <BarChart3 size={14} /> Sales Overview
              </h3>
              <span className="text-[10px] bg-zinc-100 dark:bg-zinc-950 border border-zinc-200/40 dark:border-zinc-800 text-zinc-400 font-bold px-2 py-0.5 rounded">
                6 Months
              </span>
            </div>
            
            {/* Имитация графика с помощью CSS гридов и блоков для минимализма и высокой скорости загрузки */}
            <div className="h-44 flex items-end gap-3 pt-6 border-b border-zinc-100 dark:border-zinc-800/60 px-2">
              {[
                { month: "Dec", value: "h-12" },
                { month: "Jan", value: "h-20" },
                { month: "Feb", value: "h-16" },
                { month: "Mar", value: "h-28" },
                { month: "Apr", value: "h-24" },
                { month: "May", value: "h-36" },
              ].map((bar, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                  <div className={`w-full bg-zinc-100 dark:bg-zinc-950 group-hover:bg-brand-red rounded-t-lg transition-all duration-300 ${bar.value} relative`}>
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition shadow-md pointer-events-none">
                      Stable
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase text-zinc-400 tracking-wider mb-2">{bar.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Правая часть: Последние загруженные треки (1 колонка) */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-900 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Clock size={14} /> Recent Content
            </h3>

            <div className="space-y-3">
              {stats.recentTracks.length > 0 ? (
                stats.recentTracks.map((track: any) => (
                  <div key={track.id} className="flex items-center justify-between p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-xl hover:border-brand-red/20 transition">
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 shrink-0 font-bold text-xs">
                        {track.bpm}
                      </div>
                      <div className="truncate">
                        <h4 className="text-xs font-bold tracking-tight truncate">{track.title}</h4>
                        <p className="text-[9px] text-zinc-400 font-semibold uppercase tracking-wide">
                          {track.genre?.name || "Beat"}
                        </p>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-zinc-400 shrink-0 ml-2">
                      {track.licenses?.length || 0} Lic
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 space-y-2">
                  <p className="text-[11px] text-zinc-400 font-medium">Каталог пока пуст.</p>
                  <Link href="/studio/upload" className="text-[10px] text-brand-red font-bold uppercase tracking-wider hover:underline block">
                    Загрузить первый бит
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}