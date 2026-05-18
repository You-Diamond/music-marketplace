"use client"

import * as React from "react"
import Link from "next/link"
import { 
  TrendingUp, Play, Download, DollarSign, 
  Plus, ArrowUpRight, Disc, Music, Layers 
} from "lucide-react"

export default function DashboardHome() {
  // В будущем эти данные полетят из базы через tRPC или API-роут
  const stats = [
    { label: "Earnings (Gross)", value: "$1,450.25", change: "+12.5%", icon: DollarSign, color: "text-green-500 bg-green-500/10" },
    { label: "Total Plays", value: "45,820", change: "+8.2%", icon: Play, color: "text-blue-500 bg-blue-500/10" },
    { label: "Free Downloads", value: "1,240", change: "+4.1%", icon: Download, color: "text-purple-500 bg-purple-500/10" },
  ]

  const recentTracks = [
    { id: "1", title: "God Mode", bpm: 140, key: "E Minor", plays: 12450, sales: 8 },
    { id: "2", title: "Deep Waters", bpm: 128, key: "G Major", plays: 3100, sales: 2 },
    { id: "3", title: "Cyberpunk 2026", bpm: 155, key: "C# Minor", plays: 28900, sales: 14 },
  ]

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Заголовок с приветствием и быстрой кнопкой */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">Vision Studio</h1>
            <p className="text-xs text-zinc-400 font-medium mt-0.5">Добро пожаловать назад. Вот статистика вашей студии на сегодня.</p>
          </div>
          <button className="flex items-center gap-2 bg-brand-red hover:bg-brand-red/90 text-white font-bold text-xs uppercase px-4 py-3 rounded-xl tracking-wider transition-all shadow-lg shadow-brand-red/10">
            <Plus size={14} strokeWidth={3} />
            <span>Upload New Beat</span>
          </button>
        </div>

        {/* Сетка аналитики (Stats Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <div key={i} className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-900 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">{stat.label}</span>
                  <h3 className="text-xl font-black tracking-tight">{stat.value}</h3>
                  <span className="text-[10px] text-green-500 font-bold flex items-center gap-0.5">
                    <TrendingUp size={10} /> {stat.change} <span className="text-zinc-400 font-normal">this month</span>
                  </span>
                </div>
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                  <Icon size={18} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Основной контент: Список треков и быстрые плашки */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Левая колонка: Последние релизы */}
          <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-900 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Recent Uploads</h3>
              <Link href="/dashboard/tracks" className="text-[10px] font-bold uppercase text-brand-red flex items-center gap-0.5 hover:underline">
                View All <ArrowUpRight size={12} />
              </Link>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {recentTracks.map((track) => (
                <div key={track.id} className="py-3.5 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-center justify-center text-zinc-400">
                      <Music size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold tracking-tight">{track.title}</h4>
                      <span className="text-[10px] text-zinc-400 font-semibold">{track.bpm} BPM • {track.key}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <span className="text-[9px] text-zinc-400 block uppercase font-medium">Plays</span>
                      <span className="text-xs font-bold">{track.plays.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-400 block uppercase font-medium">Sales</span>
                      <span className="text-xs font-bold text-green-500">{track.sales}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Правая колонка: Быстрые действия и виджет подписки */}
          <div className="space-y-4">
            
            {/* Виджет лимитов */}
            <div className="bg-zinc-900 text-white p-5 rounded-2xl space-y-4 shadow-md">
              <div className="flex items-center gap-2">
                <Layers className="text-brand-red h-4 w-4" />
                <h4 className="text-xs font-black uppercase tracking-wider">Account Limits</h4>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[10px] font-bold text-zinc-400 mb-1">
                    <span>TRACK SLOTS</span>
                    <span className="text-white">3 / 10 used</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="bg-brand-red h-full w-[30%]" />
                  </div>
                </div>
                <p className="text-[10px] text-zinc-400 font-medium pt-1">
                  Вы используете бесплатный тариф. Повысьте уровень, чтобы получить неограниченные слоты и открыть все типы лицензий.
                </p>
              </div>
            </div>

            {/* Ссылки быстрого доступа */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-900 rounded-2xl p-4 shadow-sm space-y-2">
              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block px-1 mb-1">Quick Setup</span>
              <Link href="/dashboard/licenses" className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-950 text-xs font-bold transition">
                <span>Configure Contract Templates</span>
                <ArrowUpRight size={14} className="text-zinc-400" />
              </Link>
              <Link href="/billing" className="flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-950 text-xs font-bold transition">
                <span>Setup Payout Method</span>
                <ArrowUpRight size={14} className="text-zinc-400" />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}