"use client"

import Link from "next/link"
import { ListMusic } from "lucide-react"
import { useHomeStore } from "@/stores/useHomeStore"

export default function PlaylistsSection() {
  const { playlists } = useHomeStore()

  if (playlists.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 bg-transparent">
      <div className="flex items-center gap-2 text-brand-red mb-6">
        <ListMusic size={16} />
        <h2 className="text-xs md:text-sm font-black uppercase tracking-wider text-zinc-950 dark:text-white">
          Curated Collections
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {playlists.map((pl) => (
          <Link
            href={`/playlists/${pl.id}`}
            key={pl.id}
            className="group relative h-36 rounded-[32px] overflow-hidden border border-white/40 dark:border-white/5 bg-zinc-900/50 backdrop-blur-md cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 opacity-40"
              style={{ backgroundImage: `url(${pl.image || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600'})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />

            <div className="absolute bottom-5 left-6 right-6">
              <h3 className="font-black text-base uppercase tracking-tight text-white group-hover:text-brand-red transition-colors">
                {pl.title}
              </h3>
              <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest mt-1">
                {pl._count?.tracks || 0} tracks
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}