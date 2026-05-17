import BeatsGrid from "@/components/BeatsGrid"

import DiscoverSidebar from "@/components/discover/DiscoverSidebar"

import { MOCK_BEATS } from "@/mocks/beats"

export default function DiscoverPage() {
  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-white/5 blur-[180px]" />
        </div>

        <div className="relative mx-auto max-w-[1800px] px-6 py-20 lg:px-10">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
              Discovery Engine
            </p>

            <h1 className="mt-6 text-6xl font-black uppercase leading-none md:text-7xl">
              Discover Beats
            </h1>

            <p className="mt-8 max-w-[900px] text-lg leading-relaxed text-zinc-500">
              Explore trending beats, discover new producers
              and find the perfect sound for your next
              project.
            </p>
          </div>

          <div className="mt-16 grid gap-8 xl:grid-cols-[380px_1fr]">
            <DiscoverSidebar />

            <div>
              <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-3xl font-black uppercase">
                    Trending This Week
                  </h2>

                  <p className="mt-3 text-sm text-zinc-500">
                    Most played and purchased beats across
                    the platform.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button className="rounded-full border border-white bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-black">
                    Trending
                  </button>

                  <button className="rounded-full border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] transition hover:border-white/20">
                    New
                  </button>

                  <button className="rounded-full border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] transition hover:border-white/20">
                    Popular
                  </button>
                </div>
              </div>

              <BeatsGrid
                beats={MOCK_BEATS}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}