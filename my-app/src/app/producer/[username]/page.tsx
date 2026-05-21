import { notFound } from "next/navigation"
import Link from "next/link"
import prisma from "@/lib/prisma"
import { Music, Layers, Star, SlidersHorizontal, ArrowUpRight } from "lucide-react"

// Компоненты клиентской части
import TrendingTracks from "@/components/home/TrendingTracks"
import SoundPackGrid from "@/components/home/SoundPackGrid"
import FeaturedPlaylists from "@/components/home/FeaturedPlaylists"

export const revalidate = 60

export default async function ProducerProfilePage({ 
  params 
}: { 
  params: Promise<{ username: string }> 
}) {
  const { username } = await params

  // 1. Получаем данные продюсера с включением связей (треки, паки, плейлисты)
  const producer = await prisma.user.findUnique({
    where: { username },
    include: {
      tracks: {
        where: { isActive: true },
        include: { genre: true, licenses: { orderBy: { price: "asc" } } }
      },
      soundPacks: { orderBy: { createdAt: "desc" } },
      playlists: { // Добавили связь с плейлистами
        where: { isPrivate: false },
        include: { _count: { select: { tracks: true } } }
      },
      _count: {
        select: { tracks: true, followers: true }
      }
    }
  })

  if (!producer || producer.role !== "PRODUCER") {
    notFound()
  }

  // 2. Логика разделения контента
  const featuredTracks = producer.tracks.filter((track: any) => track.isFeatured || track.featured)
  const regularTracks = producer.tracks.filter((track: any) => !(track.isFeatured || track.featured))

  const formatTracksForComponent = (tracksArray: any[]) => {
    return tracksArray.map(t => ({
      id: t.id,
      title: t.title,
      image: t.image,
      bpm: t.bpm,
      musicKey: t.musicKey || "N/A",
      startingPrice: t.licenses[0]?.price || 0,
      producer: {
        username: producer.username,
        displayName: producer.displayName
      }
    }))
  }

  return (
    <div className="min-h-screen bg-[#0c0d12] text-zinc-100 pb-20">
      
      {/* HERO-БАННЕР */}
      <div className="relative h-[45vh] min-h-[350px] w-full overflow-hidden flex items-end">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0d12] via-[#0c0d12]/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-cover bg-center scale-105 blur-2xl opacity-35" style={{ backgroundImage: `url(${producer.avatar || '/default-avatar.png'})` }} />

        <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-12 pb-8 relative z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl overflow-hidden border border-white/[0.08] bg-zinc-900 shrink-0 shadow-2xl">
              <img src={producer.avatar || "/default-avatar.png"} alt={producer.displayName || producer.username} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white">{producer.displayName || producer.username}</h1>
              <p className="text-sm text-purple-400 font-medium font-mono">@{producer.username}</p>
              <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 pt-1">
              <div><span className="text-white font-bold">{producer._count.tracks}</span> битов</div>
              <div className="h-3 w-[1px] bg-white/[0.08]" />
              <div><span className="text-white font-bold">{producer._count.followers}</span> фолловеров</div>
            </div>
            </div>
          </div>
          <Link href={`/beats?producer=${producer.username}`} className="h-11 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-sm transition-all flex items-center gap-2">
            Открыть весь каталог <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 mt-12 space-y-16">
        
        {/* БИОГРАФИЯ */}
        {producer.biography && (
          <div className="p-6 rounded-2xl bg-zinc-900/20 border border-white/[0.04] max-w-3xl">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-2">О продюсере</h3>
            <p className="text-sm text-zinc-400 leading-relaxed font-light">{producer.biography}</p>
          </div>
        )}

        {/* FEATURED ТРЕКИ */}
        {featuredTracks.length > 0 && (
          <section className="w-full space-y-6">
            <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
              <Star size={20} className="text-purple-400 fill-purple-400" /> Рекомендуемые релизы
            </h2>
            <TrendingTracks tracks={formatTracksForComponent(featuredTracks)} />
          </section>
        )}

        {/* ПЛЕЙЛИСТЫ */}
        {Array.isArray(producer.playlists) && producer.playlists.length > 0 && (
        <section className="w-full">
          <FeaturedPlaylists playlists={producer.playlists as any} />
        </section>
      )}

        {/* ВСЕ ТРЕКИ */}
        {regularTracks.length > 0 && (
          <section className="w-full space-y-6">
            <div className="flex items-end justify-between border-b border-white/[0.04] pb-4">
              <h2 className="text-2xl font-semibold text-white">Все биты продюсера</h2>
              <Link href={`/beats?producer=${producer.username}`} className="text-xs font-medium text-zinc-400 hover:text-white flex items-center gap-1.5">
                <SlidersHorizontal size={14} /> Расширенный фильтр
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {regularTracks.slice(0, 6).map((track) => (
                <div key={track.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/10 border border-white/[0.04] hover:bg-zinc-900/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-zinc-900 overflow-hidden">
                      {track.image && <img src={track.image} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white">{track.title}</h4>
                      <p className="text-xs text-zinc-500 font-mono">{track.bpm} BPM</p>
                    </div>
                  </div>
                  <Link href={`/beats/${track.id}`} className="h-8 px-4 bg-white/[0.03] hover:bg-white hover:text-black rounded-lg text-xs font-medium transition-all flex items-center">
                    {/* ИСПРАВЛЕНИЕ: Безопасно получаем цену лицензии и форматируем число */}
                    Купить ${(track.licenses[0]?.price ?? 0).toFixed(2)}
                  </Link>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* СЭМПЛ-ПАКИ */}
        {producer.soundPacks.length > 0 && (
          <section className="w-full space-y-6">
            <h2 className="text-2xl font-semibold text-white">Сэмпл-паки</h2>
            <SoundPackGrid packs={producer.soundPacks as any} />
          </section>
        )}
      </div>
    </div>
  )
}
