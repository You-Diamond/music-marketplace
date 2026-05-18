"use client"

import Image from "next/image"
import { FolderPlus, ShoppingCart } from "lucide-react"
import { useHomeStore } from "@/stores/useHomeStore"

export default function SoundPacksSection() {
  const { soundPacks } = useHomeStore()

  if (soundPacks.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 bg-transparent">
      <div className="flex items-center gap-2 text-brand-red mb-6">
        <FolderPlus size={16} />
        <h2 className="text-xs md:text-sm font-black uppercase tracking-wider text-zinc-950 dark:text-white">
          Sound Packs & Drum Kits
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {soundPacks.map((pack) => (
          <div 
            key={pack.id} 
            className="group flex items-center p-3.5 rounded-[32px] bg-white/40 dark:bg-white/[0.02] backdrop-blur-2xl border border-white/40 dark:border-white/5 transition-all duration-300 hover:-translate-y-1 hover:bg-white/60 dark:hover:bg-white/[0.05]"
          >
            <div className="relative h-20 w-20 rounded-[20px] overflow-hidden border border-zinc-200/50 dark:border-white/10 shrink-0 bg-zinc-900">
              <Image 
                src={pack.image || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400"} 
                alt={pack.title} 
                fill 
                className="object-cover" 
              />
            </div>

            <div className="ml-4 flex-1 min-w-0">
              <h3 className="font-black text-sm uppercase truncate text-zinc-950 dark:text-white tracking-tight leading-none group-hover:text-brand-red transition-colors">
                {pack.title}
              </h3>
              <p className="text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.15em] font-bold mt-2">
                By {pack.producer?.displayName || pack.producer?.username} • {pack.soundsCount} Sounds
              </p>
            </div>

            <button className="ml-4 flex h-11 items-center gap-2 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest bg-zinc-950 text-white hover:bg-brand-red dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-brand-red dark:hover:text-white transition-all active:scale-95 shadow-md shrink-0">
              <ShoppingCart size={12} strokeWidth={2.5} />
              <span>${pack.price}</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  )
}