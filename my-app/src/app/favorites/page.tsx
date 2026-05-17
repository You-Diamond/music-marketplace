import Image from "next/image"

import Link from "next/link"

import {
  Heart,
  Play,
  ShoppingCart,
} from "lucide-react"

import { favoritesMock } from "@/mocks/favorites.mock"

function formatCurrency(
  value: number
) {
  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }
  ).format(value)
}

export default function FavoritesPage() {
  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-white/5 blur-[180px]" />
        </div>

        <div className="relative mx-auto max-w-[1800px] px-6 py-24 lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
                Collection
              </p>

              <h1 className="mt-6 text-6xl font-black uppercase leading-none md:text-7xl">
                Favorites
              </h1>
            </div>

            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] px-6 py-4 text-sm font-black uppercase tracking-[0.2em]">
              <Heart size={18} />

              {favoritesMock.length} Saved
            </div>
          </div>

          <div className="mt-16 grid gap-8 xl:grid-cols-2">
            {favoritesMock.map(
              (beat) => (
                <div
                  key={beat.id}
                  className="group overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.03] transition hover:border-white/20"
                >
                  <div className="grid md:grid-cols-[320px_1fr]">
                    <Link
                      href={`/beat/${beat.publicId}`}
                      className="relative aspect-square overflow-hidden"
                    >
                      <Image
                        src={
                          beat.image
                        }
                        alt={
                          beat.title
                        }
                        fill
                        className="object-cover transition duration-700 group-hover:scale-105"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                      <button className="absolute bottom-6 right-6 flex h-16 w-16 items-center justify-center rounded-full bg-white text-black transition hover:scale-105">
                        <Play
                          size={28}
                        />
                      </button>
                    </Link>

                    <div className="flex flex-col justify-between p-8">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                          {
                            beat.genre
                          }
                        </p>

                        <Link
                          href={`/beat/${beat.publicId}`}
                        >
                          <h2 className="mt-5 text-5xl font-black uppercase leading-none transition hover:text-zinc-300">
                            {
                              beat.title
                            }
                          </h2>
                        </Link>

                        <Link
                          href={`/${beat.author}`}
                        >
                          <p className="mt-5 text-sm uppercase tracking-[0.25em] text-zinc-400 transition hover:text-white">
                            @
                            {
                              beat.author
                            }
                          </p>
                        </Link>

                        <div className="mt-10 flex flex-wrap gap-4">
                          <div className="rounded-full border border-white/10 bg-black/30 px-5 py-3">
                            <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                              BPM
                            </p>

                            <h3 className="mt-2 text-lg font-black">
                              {
                                beat.bpm
                              }
                            </h3>
                          </div>

                          <div className="rounded-full border border-white/10 bg-black/30 px-5 py-3">
                            <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                              Key
                            </p>

                            <h3 className="mt-2 text-lg font-black">
                              {
                                beat.musicKey
                              }
                            </h3>
                          </div>
                        </div>
                      </div>

                      <div className="mt-10 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                            Starting From
                          </p>

                          <h3 className="mt-3 text-4xl font-black">
                            {formatCurrency(
                              beat.price
                            )}
                          </h3>
                        </div>

                        <button className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-black transition hover:scale-105">
                          <ShoppingCart
                            size={24}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>
    </main>
  )
}