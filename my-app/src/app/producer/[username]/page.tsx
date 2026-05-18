"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, Music, Disc, ExternalLink, Globe } from "lucide-react"
import { ExtendedTrack } from "@/stores/usePromoTracksStore"
import { usePlayerStore } from "@/stores/player-store"

interface ProducerProfile {
  id: string
  username: string
  displayName: string | null
  avatar: string | null
  biography: string | null
  verified: boolean
  _count: { tracks: number }
}

export default function ProducerProfilePage() {
  const params = useParams()
  // Безопасно извлекаем username для поддержки стандартов Next.js 16
  const username = typeof params?.username === "string" ? params.username : ""

  const [profile, setProfile] = React.useState<ProducerProfile | null>(null)
  const [beats, setBeats] = React.useState<ExtendedTrack[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  // Подключаем наш глобальный плеер
  const { play, track: currentTrack, isPlaying } = usePlayerStore()

  React.useEffect(() => {
    if (!username) return
    setIsLoading(true)
    
    // Исправлено: запрашиваем из верного эндпоинта /api/producer/
    fetch(`/api/producer/${username}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setProfile(data.profile)
          setBeats(data.beats)
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false))
  }, [username])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-zinc-500">
        Профиль битмейкера не найден.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 sm:p-12 transition-colors">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Шапка профиля (Продакшн-карточка) */}
        <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 rounded-[32px] p-6 sm:p-10 shadow-sm overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Свечение на заднем фоне карточки */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-red/5 rounded-full filter blur-3xl pointer-events-none" />
          
          {/* Аватар */}
          <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-3xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 shadow-md flex-shrink-0 relative group border-2 border-zinc-200/50 dark:border-zinc-800">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.username} className="object-cover h-full w-full" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-zinc-400 font-bold text-3xl uppercase">
                {profile.username.substring(0, 2)}
              </div>
            )}
          </div>

          {/* Инфо */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-center md:justify-start gap-2.5">
                <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
                  {profile.displayName || profile.username}
                </h1>
                {profile.verified && (
                <span title="Verified Producer" className="flex-shrink-0 flex items-center">
                  <CheckCircle size={22} className="text-blue-500 fill-blue-500/10" />
                </span>
              )}
              </div>
              <p className="text-sm font-semibold text-zinc-400 tracking-medium">
                @{profile.username}
              </p>
            </div>

            {/* Биография */}
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
              {profile.biography || "Этот битмейкер ещё не добавил информацию о себе."}
            </p>

            {/* Статистика и Соцсети */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-xs font-bold uppercase tracking-wider pt-2 text-zinc-400">
              <div className="bg-zinc-100 dark:bg-zinc-800/60 px-4 py-2 rounded-xl text-zinc-700 dark:text-zinc-300">
                Биты: <span className="text-brand-red font-black ml-0.5">{profile._count.tracks}</span>
              </div>
              <a href="#" className="flex items-center gap-1.5 hover:text-brand-red transition-colors">
                <Globe size={14} /> Website
              </a>
              <a href="#" className="flex items-center gap-1.5 hover:text-brand-red transition-colors">
                <ExternalLink size={14} /> Instagram
              </a>
            </div>
          </div>
        </div>

        {/* Сетка битов этого продюсера */}
        <div className="space-y-6">
          <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
            <Music size={20} className="text-brand-red" /> Все релизы автора
          </h2>

          <div className="space-y-3">
            {beats.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl">
                <Disc className="mx-auto text-zinc-300 dark:text-zinc-700 h-12 w-12" />
                <p className="mt-4 text-zinc-500 font-medium">Этот автор ещё не загрузил ни одного бита.</p>
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
                    {/* Обложка + Название бита */}
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
                              publicId: b.id
                            }
                            const playerReadyQueue = beats.map(item => ({
                              ...item,
                              author: item.producer.displayName || item.producer.username,
                              publicId: item.id
                            }))
                            play(playerReadyTrack as any, playerReadyQueue as any)
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
                        <div className="flex gap-2 mt-1.5 sm:hidden text-[10px] font-bold text-zinc-400">
                          <span>{b.bpm} BPM</span>
                          <span>•</span>
                          <span>{b.musicKey}</span>
                        </div>
                      </div>
                    </div>

                    {/* Характеристики + Цена */}
                    <div className="flex items-center gap-6 sm:gap-10">
                      <div className="hidden sm:flex items-center gap-6 text-xs font-semibold text-zinc-400 dark:text-zinc-500">
                        <span className="bg-zinc-100 dark:bg-zinc-800/80 px-2.5 py-1 rounded-md text-zinc-600 dark:text-zinc-400">
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