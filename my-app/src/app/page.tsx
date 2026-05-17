"use client"

import * as React from "react"
import Link from "next/link"
import HeroPromoBanner from "@/components/home/HeroPromoBanner"
import BeatCard from "@/components/BeatCard"
import { Flame, Music2, ListMusic, ArrowRight } from "lucide-react"

// Имитация данных: теперь генерируем 5 карточек для компактного ряда
const mockBeats = Array(5).fill(null) 

export default function HomePage() {
  const pageModules = [
    { id: "hero-promo", component: <HeroPromoBanner key="hero" /> },
    
    { 
      id: "trending-beats", 
      component: (
        /* МЕНЯЕМ: Передаем action в HomeSection для рендеринга кнопки перехода */
        <HomeSection 
          key="trending" 
          title="Trending Beats" 
          subtitle="Top charts right now" 
          icon={<Flame size={16} />}
          action={
            <Link 
              href="/charts" 
              className="group flex items-center gap-1.5 rounded-xl border border-white/40 dark:border-white/5 bg-white/30 dark:bg-white/[0.01] backdrop-blur-md px-3.5 py-2 text-[10px] font-black uppercase tracking-widest text-zinc-950 dark:text-white hover:text-brand-red dark:hover:text-brand-red transition-all active:scale-95"
            >
              <span>See Top Charts</span>
              <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" strokeWidth={2.5} />
            </Link>
          }
        >
          {/* СЕТКА ТРЕКОВ: 
              - Пережали под мелкий шаг гаджетов и вышли на 5 колонок (xl:grid-cols-5) на десктопе.
              - Уменьшили отступы gap-6 до gap-4 для maximalной компактности.
          */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {mockBeats.map((_, i) => (
              <BeatCard 
                key={i} 
                beat={{ 
                  id: `b-${i}`, 
                  title: "Genesis", 
                  producerDisplayName: "Vision Studio", 
                  producerUsername: "visionstudio",
                  image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400&auto=format&fit=crop",
                  licenses: [{ price: 29 }] 
                } as any} 
              />
            ))}
          </div>
        </HomeSection>
      )
    },

    {
      id: "genres",
      component: (
        <HomeSection key="genres" title="Explore Genres" subtitle="Find your signature sound" icon={<Music2 size={16} />}>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {["Hip Hop", "Trap", "Hyperpop", "R&B", "Drill", "Cyberpunk"].map((genre) => (
              <button 
                key={genre} 
                className="group relative aspect-[16/10] overflow-hidden rounded-2xl p-5 text-left transition-all duration-300
                  bg-white/30 dark:bg-white/[0.01] 
                  backdrop-blur-xl 
                  border border-white/40 dark:border-white/5
                  hover:bg-white/50 dark:hover:bg-white/[0.04]
                  hover:border-white/60 dark:hover:border-white/10
                  hover:-translate-y-1 hover:shadow-lg hover:shadow-zinc-200/20 dark:hover:shadow-none"
              >
                <span className="text-xs font-black uppercase tracking-wider text-zinc-950 dark:text-white group-hover:text-brand-red transition-colors">
                  {genre}
                </span>
              </button>
            ))}
          </div>
        </HomeSection>
      )
    },

    {
      id: "featured-playlists",
      component: (
        <HomeSection key="playlists" title="Curated Playlists" subtitle="Handpicked by industry pros" icon={<ListMusic size={16} />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {["Platinum Placements", "Late Night Studio", "Aggressive 808s"].map((title, i) => (
              <div 
                key={i} 
                className="group relative aspect-[21/10] sm:aspect-[21/9] rounded-3xl overflow-hidden p-6 flex flex-col justify-between transition-all duration-300
                  bg-white/30 dark:bg-white/[0.01] 
                  backdrop-blur-xl 
                  border border-white/40 dark:border-white/5
                  hover:bg-white/50 dark:hover:bg-white/[0.04]
                  hover:border-white/60 dark:hover:border-white/10
                  hover:-translate-y-1.5 hover:shadow-xl hover:shadow-zinc-200/30 dark:hover:shadow-none"
              >
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-zinc-950 dark:text-white">
                    {title}
                  </h3>
                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-bold mt-1.5">
                    25 Tracks
                  </p>
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-brand-red group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 cursor-pointer">
                  Listen Now →
                </span>
              </div>
            ))}
          </div>
        </HomeSection>
      )
    }
  ]

  return (
    /* ИСПРАВЛЕНО: pt-0 гарантирует, что баннер встанет намертво в стык к Header.
       Зазоры между последующими секциями теперь будут контролироваться за счет space-y-12 автоматически. */
    <main className="space-y-12 pt-0 pb-24 bg-transparent relative z-10">
      {pageModules.map((mod) => mod.component)}
    </main>
  )
}

// УНИВЕРСАЛЬНЫЙ ОБЕРТОЧНЫЙ КОМПОНЕНТ
function HomeSection({ 
  title, 
  subtitle, 
  icon, 
  action, 
  children 
}: { 
  title: string
  subtitle?: string
  icon: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode 
}) {
  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 bg-transparent">
      <div className="flex items-center justify-between mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand-red">
            <span className="shrink-0">{icon}</span>
            <h2 className="text-xs md:text-sm font-black uppercase tracking-wider text-zinc-950 dark:text-white">
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-[10px] md:text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1.5">
              {subtitle}
            </p>
          )}
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  )
}