"use client"

import Link from "next/link"
import { Award, CheckCircle2 } from "lucide-react"
import { useHomeStore } from "@/stores/useHomeStore"

export default function TopProducersSection() {
  const { topProducers } = useHomeStore()

  if (topProducers.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 bg-transparent">
      <div className="flex items-center gap-2 text-brand-red mb-6">
        <Award size={16} />
        <h2 className="text-xs md:text-sm font-black uppercase tracking-wider text-zinc-950 dark:text-white">
          Top Producers of the Week
        </h2>
      </div>

      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3">
        {topProducers.map((p) => (
          <Link
            href={`/${p.username}`}
            key={p.id} 
            className="flex items-center p-3 rounded-[28px] bg-white/40 dark:bg-white/[0.02] backdrop-blur-2xl border border-white/40 dark:border-white/5 transition-all hover:bg-white/60 dark:hover:bg-white/[0.05] cursor-pointer"
          >
            <div 
              className="h-11 w-11 rounded-full bg-cover bg-center border border-zinc-200/50 dark:border-white/10 shrink-0 bg-zinc-800" 
              style={{ backgroundImage: p.avatar ? `url(${p.avatar})` : undefined }}
            />
            <div className="ml-3 min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <span className="font-black text-xs uppercase truncate text-zinc-950 dark:text-white tracking-tight">
                  {p.displayName || p.username}
                </span>
                {p.verified && <CheckCircle2 size={12} className="text-blue-500 fill-blue-500/10 shrink-0" strokeWidth={2.5} />}
              </div>
              <p className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-0.5">
                {p._count?.tracks || 0} Active Beats
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}