"use client"

import BeatsGrid from "@/components/BeatsGrid"

import { useRecentStore } from "@/stores/recent-store"

export default function RecentlyPlayedSection() {
  const { items } =
    useRecentStore()

  if (!items.length)
    return null

  return (
    <section className="mt-32">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
          Your Activity
        </p>

        <h2 className="mt-3 text-5xl font-black uppercase">
          Recently Played
        </h2>
      </div>

      <div className="mt-16">
        <BeatsGrid
          beats={items}
        />
      </div>
    </section>
  )
}