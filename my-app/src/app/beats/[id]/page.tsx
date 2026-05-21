import prisma from "@/lib/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Play, Heart, ShoppingBag, Share2, Music, Activity, Clock } from "lucide-react"
// Импортируем типы, которые сгенерировала Prisma на основе твоей схемы
import { Track, License, LicenseTemplate, Genre, User } from "@prisma/client"

export const revalidate = 0

// Расширяем тип трека, чтобы TypeScript знал о вложенных связях, полученных через include
type TrackWithRelations = Track & {
  producer: User
  genre: Genre
  licenses: (License & {
    template: LicenseTemplate
  })[]
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TrackPage({ params }: PageProps) {
  const { id } = await params

  // Явно указываем TypeScript, какую структуру мы ожидаем получить из базы данных
  const track = await prisma.track.findUnique({
    where: { id: id, isActive: true },
    include: {
      producer: true,
      genre: true,
      licenses: {
        include: { template: true },
        where: { isActive: true }
      }
    }
  }) as TrackWithRelations | null

  if (!track) notFound()

  const formatDuration = (seconds: number): string => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // ИСПРАВЛЕНИЕ: Используем оператор ?? Infinity для безопасного вычисления минимальной цены
  const startingPrice = track.licenses.length > 0 
    ? Math.min(...track.licenses.map((l) => l.price ?? Infinity)) 
    : 0

  return (
    <div className="w-full min-h-screen bg-[#0c0d12] text-zinc-100 pb-32">
      {/* HEADER / HERO СЕКЦИЯ */}
      <div className="relative w-full pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden flex justify-center">
        <div className="absolute inset-0 z-0 opacity-20 blur-[100px] scale-110 pointer-events-none">
          <img src={track.image || "/placeholder.jpg"} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0c0d12]/80 to-[#0c0d12] z-0" />

        <div className="relative z-10 max-w-6xl w-full flex flex-col md:flex-row gap-8 items-center md:items-end">
          <div className="w-64 h-64 md:w-80 md:h-80 shrink-0 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative group">
            <img src={track.image || "/placeholder.jpg"} alt={track.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <button className="h-20 w-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)]">
                <Play className="h-8 w-8 ml-1" fill="currentColor" />
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <span className="px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/[0.05] text-[10px] font-medium tracking-wider text-zinc-400 uppercase">
                {track.genre.name}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-white/[0.05] border border-white/[0.05] text-[10px] font-medium tracking-wider text-amber-400 uppercase">
                От ${startingPrice === Infinity ? 0 : startingPrice}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white">{track.title}</h1>
            
            <div className="flex items-center justify-center md:justify-start gap-2 text-sm">
              <span className="text-zinc-400">Produced by</span>
              <Link href={`/producer/${track.producer.username}`} className="font-semibold text-white hover:text-amber-400 transition-colors">
                {track.producer.displayName || `@${track.producer.username}`}
              </Link>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4 pt-4">
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Activity className="h-4 w-4" /> <span className="font-mono text-sm">{track.bpm} BPM</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Music className="h-4 w-4" /> <span className="font-mono text-sm">{track.musicKey}</span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400">
                <Clock className="h-4 w-4" /> <span className="font-mono text-sm">{formatDuration(track.duration)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ЛИЦЕНЗИИ */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-white">Выбор лицензии</h2>
          </div>

          <div className="space-y-4">
            {track.licenses.map((license) => (
              <div key={license.id} className="p-5 rounded-2xl bg-zinc-900/30 border border-white/[0.04] hover:border-white/[0.1] hover:bg-zinc-900/50 transition-all flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-bold text-white">{license.template.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1">Формат: {license.template.fileType.replace('_', ' ')}</p>
                </div>
                
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="text-2xl font-mono font-bold text-white">${license.price ?? 0}</div>
                  <button className="w-full sm:w-auto h-12 px-6 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2">
                    <ShoppingBag className="h-4 w-4" /> В корзину
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-zinc-900/20 border border-white/[0.04] space-y-4">
            <button className="w-full h-12 rounded-xl bg-white/[0.05] border border-white/[0.05] hover:bg-white/[0.1] text-white font-medium flex items-center justify-center gap-2 transition-colors">
              <Heart className="h-4 w-4" /> В избранное
            </button>
            <button className="w-full h-12 rounded-xl bg-white/[0.05] border border-white/[0.05] hover:bg-white/[0.1] text-white font-medium flex items-center justify-center gap-2 transition-colors">
              <Share2 className="h-4 w-4" /> Поделиться
            </button>
            
            <div className="pt-4 border-t border-white/[0.05] flex items-center justify-between text-sm text-zinc-400">
              <span>Прослушиваний</span>
              <span className="font-mono font-medium text-white">{track.plays.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
