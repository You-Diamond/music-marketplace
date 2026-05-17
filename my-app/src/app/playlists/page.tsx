import Image from "next/image"

import Link from "next/link"

import {
  Play,
  Users,
  Music2,
} from "lucide-react"

import { playlistsMock } from "@/mocks/playlists.mock"

function formatNumber(
  value: number
) {
  return new Intl.NumberFormat(
    "en",
    {
      notation: "compact",
      maximumFractionDigits: 1,
    }
  ).format(value)
}

export default function PlaylistsPage() {
  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-white/5 blur-[180px]" />
        </div>

        <div className="relative mx-auto max-w-[1800px] px-6 py-24 lg:px-10">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
              Discovery
            </p>

            <h1 className="mt-6 text-6xl font-black uppercase leading-none md:text-7xl">
              Playlists
            </h1>
          </div>

          <div className="mt-16 space-y-10">
            {playlistsMock.map(
              (
                playlist
              ) => (
                <div
                  key={
                    playlist.id
                  }
                  className="overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.03]"
                >
                  <div className="grid xl:grid-cols-[420px_1fr]">
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={
                          playlist.image
                        }
                        alt={
                          playlist.title
                        }
                        fill
                        className="object-cover"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                      <button className="absolute bottom-8 right-8 flex h-20 w-20 items-center justify-center rounded-full bg-white text-black transition hover:scale-105">
                        <Play
                          size={34}
                        />
                      </button>
                    </div>

                    <div className="p-10">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                            Curated Playlist
                          </p>

                          <h2 className="mt-5 text-6xl font-black uppercase leading-none">
                            {
                              playlist.title
                            }
                          </h2>

                          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-zinc-400">
                            {
                              playlist.description
                            }
                          </p>

                          <Link
                            href={`/${playlist.creator.username}`}
                            className="mt-8 inline-block text-sm uppercase tracking-[0.25em] text-zinc-500 transition hover:text-white"
                          >
                            by @
                            {
                              playlist.creator.username
                            }
                          </Link>
                        </div>

                        <div className="flex flex-wrap gap-4">
                          <div className="rounded-[28px] border border-white/10 bg-black/30 px-6 py-5">
                            <div className="flex items-center gap-3">
                              <Users
                                size={
                                  18
                                }
                              />

                              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                                Followers
                              </p>
                            </div>

                            <h3 className="mt-4 text-3xl font-black">
                              {formatNumber(
                                playlist.followers
                              )}
                            </h3>
                          </div>

                          <div className="rounded-[28px] border border-white/10 bg-black/30 px-6 py-5">
                            <div className="flex items-center gap-3">
                              <Music2
                                size={
                                  18
                                }
                              />

                              <p className="text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                                Beats
                              </p>
                            </div>

                            <h3 className="mt-4 text-3xl font-black">
                              {
                                playlist
                                  .beats
                                  .length
                              }
                            </h3>
                          </div>
                        </div>
                      </div>

                      <div className="mt-14 overflow-hidden rounded-[32px] border border-white/10">
                        <div className="grid grid-cols-[1fr_160px_120px] border-b border-white/10 bg-black/30 px-6 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
                          <p>Track</p>

                          <p>Producer</p>

                          <p>Duration</p>
                        </div>

                        <div>
                          {playlist.beats.map(
                            (
                              beat
                            ) => (
                              <Link
                                key={
                                  beat.id
                                }
                                href={`/beat/${beat.publicId}`}
                                className="grid grid-cols-[1fr_160px_120px] items-center border-b border-white/5 px-6 py-5 transition hover:bg-white/[0.03]"
                              >
                                <div className="flex items-center gap-5">
                                  <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/10">
                                    <Image
                                      src={
                                        beat.image
                                      }
                                      alt={
                                        beat.title
                                      }
                                      fill
                                      className="object-cover"
                                    />
                                  </div>

                                  <div>
                                    <h3 className="text-xl font-black uppercase">
                                      {
                                        beat.title
                                      }
                                    </h3>

                                    <p className="mt-2 text-[10px] uppercase tracking-[0.25em] text-zinc-500">
                                      Beat
                                    </p>
                                  </div>
                                </div>

                                <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">
                                  @
                                  {
                                    beat.author
                                  }
                                </p>

                                <p className="text-sm uppercase tracking-[0.2em] text-zinc-400">
                                  {
                                    beat.duration
                                  }
                                </p>
                              </Link>
                            )
                          )}
                        </div>
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