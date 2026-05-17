"use client"

import Image from "next/image"
import Link from "next/link"
import { Crown, Check } from "lucide-react"
import { producersMock } from "@/mocks/producers.mock"

function formatNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

export default function ProducersSection() {
  return (
    <section className="px-6 py-24 lg:px-10">
      <div className="mx-auto max-w-[1800px]">
        <div className="flex items-end justify-between gap-10">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
              Community
            </p>
            <h2 className="mt-4 text-5xl font-black uppercase md:text-6xl">
              Top Producers
            </h2>
          </div>
          <Link
            href="/producers"
            className="hidden rounded-full border border-white/10 bg-white/[0.03] px-8 py-4 text-xs font-black uppercase tracking-[0.2em] transition hover:border-white/20 lg:flex"
          >
            View All
          </Link>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {producersMock.slice(0, 4).map((producer) => (
            <Link
              key={producer.id}
              href={`/${producer.username}`}
              className="group overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.03] transition duration-500 hover:-translate-y-1 hover:border-white/20"
            >
              <div className="relative h-[320px] overflow-hidden">
                <Image
                  src={producer.avatar || "/images/default-avatar.jpg"}
                  alt={producer.displayName}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                {producer.verified && (
                  <div className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full border border-yellow-500/20 bg-yellow-500/10 text-yellow-400 backdrop-blur-xl">
                    <Crown size={18} />
                  </div>
                )}
              </div>

              <div className="p-8">
                <div className="flex items-center gap-3">
                  <h3 className="text-3xl font-black uppercase">{producer.displayName}</h3>
                  {producer.verified && <Check size={18} className="text-blue-400" />}
                </div>

                <p className="mt-3 text-sm uppercase tracking-[0.25em] text-zinc-500">
                  @{producer.username}
                </p>

                <div className="mt-8 flex flex-wrap gap-2">
                  {producer.genres.map((genre) => (
                    <div
                      key={genre}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300"
                    >
                      {genre}
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex items-center justify-between text-sm uppercase tracking-[0.2em] text-zinc-500">
                  <span>{producer.stats.totalBeats} Beats</span>
                  <span>⭐ {producer.stats.rating}</span>
                  <span>{formatNumber(producer.stats.totalSales)} Sales</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}