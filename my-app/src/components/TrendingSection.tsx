"use client"

import BeatsGrid from "@/components/BeatsGrid"

import GenreFilters from "@/components/GenreFilters"

import { MOCK_BEATS } from "@/mocks/beats"

export default function TrendingSection() {
  return (
    <section className="mt-24">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
            Marketplace
          </p>

          <h2 className="mt-3 text-5xl font-black uppercase">
            Trending Beats
          </h2>
        </div>

        <p className="max-w-xl text-zinc-500">
          Explore trending trap,
          drill, phonk and
          ambient beats uploaded
          by producers from
          around the world.
        </p>
      </div>

      <GenreFilters />

      <div className="mt-16">
        <BeatsGrid
          beats={MOCK_BEATS}
        />
      </div>
    </section>
  )
}