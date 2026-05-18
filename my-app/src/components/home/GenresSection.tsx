"use client"

import Link from "next/link"
import { Music2 } from "lucide-react"
import { useHomeStore } from "@/stores/useHomeStore"

export default function GenresSection() {
  const { genres, isLoading } = useHomeStore()

  if (isLoading && genres.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Array(5).fill(0).map((_, i) => <div key={i} className="h-24 animate-pulse bg-zinc-200 dark:bg-zinc-900 rounded-[24px]" />)}
      </section>
    )
  }

  if (genres.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 bg-transparent">
      <div className="flex items-center gap-2 text-brand-red mb-6">
        <Music2 size={16} />
        <h2 className="text-xs md:text-sm font-black uppercase tracking-wider text-zinc-950 dark:text-white">
          Browse by Genre
        </h2>
      </div>

      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {genres.map((genre) => (
          <Link
            href={`/beats?genre=${genre.slug}`}
            key={genre.id}
            className="group relative p-5 rounded-[24px] border border-white/40 dark:border-white/5 backdrop-blur-xl bg-gradient-to-br from-zinc-500/5 to-transparent transition-all duration-300 hover:-translate-y-1 hover:border-brand-red/30 cursor-pointer"
          >
            <h3 className="font-black text-sm uppercase tracking-tight text-zinc-950 dark:text-white group-hover:text-brand-red transition-colors">
              {genre.name}
            </h3>
            <p className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1">
              {genre._count?.tracks || 0} Tracks
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}