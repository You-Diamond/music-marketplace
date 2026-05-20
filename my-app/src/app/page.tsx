import prisma from "@/lib/prisma"
import HeroDynamicSpotlight from "@/components/home/HeroDynamicSpotlight"
import TrendingTracks from "@/components/home/TrendingTracks"
import GenreGrid from "@/components/home/GenreGrid"
import SoundPackGrid from "@/components/home/SoundPackGrid"
import FeaturedPlaylists from "@/components/home/FeaturedPlaylists" 
import ProducerCarousel from "@/components/home/ProducerCarousel"


export const revalidate = 0

function getDailyTracks(allTracks: any[]): any[] {
  if (!allTracks || allTracks.length === 0) return []
  if (allTracks.length <= 5) return allTracks

  const todayStr = new Date().toISOString().split('T')[0]
  
  let seed = 0
  for (let i = 0; i < todayStr.length; i++) {
    seed = todayStr.charCodeAt(i) + ((seed << 5) - seed)
  }

  const randomWithSeed = () => {
    const x = Math.sin(seed++) * 10000
    return x - Math.floor(x)
  }

  const shuffled = [...allTracks].sort(() => randomWithSeed() - 0.5)
  return shuffled.slice(0, 5)
}

export default async function Home() {
  const [
    spotlightTracks, 
    trendingTracks, 
    popularGenres, 
    soundPacks, 
    activePlaylists, 
    mostFollowedProducers, 
    mostProductiveProducers
  ] = await Promise.all([
    
    // 1. Спотлайт-баннер
    prisma.track.findMany({
      where: { isSpotlight: true, isActive: true },
      include: { producer: { select: { username: true, displayName: true } } },
      orderBy: { createdAt: "desc" }
    }),

    // 2. Трендовые треки — подтягиваем цены лицензий
    prisma.track.findMany({
      where: { isActive: true },
      take: 10,
      include: { 
        producer: { select: { username: true, displayName: true } },
        licenses: { select: { price: true } }
      },
      orderBy: { plays: "desc" }
    }),

    // 3. Популярные жанры
    prisma.genre.findMany({
      where: { isActive: true },
      take: 6
    }),

    // 4. Сэмпл-паки
    prisma.soundPack.findMany({
      where: { isActive: true },
      take: 4,
      include: { producer: { select: { displayName: true, username: true } } }
    }),

    // 5. Активные плейлисты — добавляем подсчет количества треков внутри
    prisma.playlist.findMany({
      where: { isActive: true },
      take: 4,
      include: { 
        _count: { select: { tracks: true } }
      }
    }),

    // 6. Продюсеры по подписчикам — добавляем блок счетчиков агрегации _count
    prisma.user.findMany({
      where: { role: "PRODUCER" },
      take: 8,
      include: {
        _count: { select: { tracks: true } }
      },
      orderBy: { followersCount: "desc" }
    }),

    // 7. Продюсеры по трекам — добавляем блок счетчиков агрегации _count
    prisma.user.findMany({
      where: { role: "PRODUCER" },
      take: 8,
      include: {
        _count: { select: { tracks: true } }
      },
      orderBy: { tracks: { _count: "desc" } }
    })
  ])

  // Форматируем треки для Spotlight баннера
  const formattedSpotlightTracks = (spotlightTracks || []).map(track => ({
    id: track.id,
    title: track.title,
    image: track.image,
    producer: track.producer
  }))

  const dailySpotlightTracks = getDailyTracks(formattedSpotlightTracks)

  // ИСПРАВЛЕНИЕ: Вычисляем `startingPrice` для трендовых треков
  const formattedTrendingTracks = (trendingTracks || []).map(track => {
    // Ищем самую минимальную стоимость среди привязанных лицензий
    const prices = track.licenses.map(l => l.price)
    const startingPrice = prices.length > 0 ? Math.min(...prices) : 0

    return {
      ...track,
      startingPrice
    }
  })

  // ИСПРАВЛЕНИЕ: Гарантируем, что _count передан в типы для каруселей продюсеров
  const formattedFollowedProducers = (mostFollowedProducers || []).map(p => ({
    ...p,
    _count: p._count || { tracks: 0 }
  }))

  const formattedProductiveProducers = (mostProductiveProducers || []).map(p => ({
    ...p,
    _count: p._count || { tracks: 0 }
  }))

  return (
    <div className="w-full min-h-screen bg-[#0c0d12] text-zinc-100 space-y-20 pb-32 overflow-x-hidden">
      
      {/* СЕКЦИЯ HERO / SPOTLIGHT (AURA) */}
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 md:pt-6 overflow-hidden">
        <div className="rounded-2xl md:rounded-3xl overflow-hidden border border-white/[0.02] bg-zinc-900/10 backdrop-blur-md shadow-2xl">
          <HeroDynamicSpotlight tracks={dailySpotlightTracks} />
        </div>
      </div>

      {/* ОСТАЛЬНОЙ КОНТЕНТ САЙТА */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-24 relative z-20">
        
        {/* ТРЕНДЫ (Передаем отформатированные треки с полем startingPrice) */}
        {formattedTrendingTracks.length > 0 && (
          <section className="w-full">
            <TrendingTracks tracks={formattedTrendingTracks as any} />
          </section>
        )}

        {/* ЖАНРЫ */}
        {popularGenres && popularGenres.length > 0 && (
          <section className="w-full">
            <GenreGrid genres={popularGenres} />
          </section>
        )}

        {/* ДРАМ-КИТЫ */}
        {soundPacks && soundPacks.length > 0 && (
          <section className="w-full">
            <SoundPackGrid packs={soundPacks} />
          </section>
        )}

        {/* ПЛЕЙЛИСТЫ (С честным подсчетом _count) */}
        {activePlaylists && activePlaylists.length > 0 && (
          <section className="w-full">
            <FeaturedPlaylists playlists={activePlaylists as any} />
          </section>
        )}

        {/* ЛИДЕРЫ СООБЩЕСТВА */}
        {formattedFollowedProducers.length > 0 && (
          <section className="w-full space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-zinc-500">Мировой рейтинг</span>
              <h2 className="text-2xl font-semibold tracking-tight text-white">Лидеры сообщества</h2>
            </div>
            <ProducerCarousel producers={formattedFollowedProducers as any} displayType="followers" />
          </section>
        )}

        {/* ТОП АВТОРОВ ПО РЕЛИЗАМ */}
        {formattedProductiveProducers.length > 0 && (
          <section className="w-full space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-medium uppercase tracking-[0.25em] text-zinc-500">Продуктивность</span>
              <h2 className="text-2xl font-semibold tracking-tight text-white">По количеству релизов</h2>
            </div>
            <ProducerCarousel producers={formattedProductiveProducers as any} displayType="tracks" />
          </section>
        )}

      </div>
    </div>
  )
}