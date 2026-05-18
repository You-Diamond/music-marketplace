import HomeDataInitializer from "@/components/home/HomeDataInitializer"
import HeroPromoBanner from "@/components/home/HeroPromoBanner"
import TrendingBeatsSection from "@/components/home/TrendingBeatsSection"
import GenresSection from "@/components/home/GenresSection"
import TopProducersSection from "@/components/home/TopProducersSection"
import SoundPacksSection from "@/components/home/SoundPacksSection"
import PlaylistsSection from "@/components/home/PlaylistsSection"

export default function HomePage() {
  return (
    <main className="space-y-14 pt-0 pb-24 bg-transparent relative z-10">
      {/* Инициализатор стейта */}
      <HomeDataInitializer />
      
      {/* Секции домашней страницы */}
      <HeroPromoBanner />
      <TrendingBeatsSection />
      <GenresSection />
      <TopProducersSection />
      <SoundPacksSection />
      <PlaylistsSection />
    </main>
  )
}