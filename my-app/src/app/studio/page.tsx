import Link from "next/link"

import {
  DollarSign,
  PlayCircle,
  Users,
  ShoppingCart,
  Plus,
} from "lucide-react"

import AnalyticsCard from "@/components/studio/AnalyticsCard"

import StudioBeatRow from "@/components/studio/StudioBeatRow"

import {
  studioAnalyticsMock,
  studioBeatsMock,
} from "@/mocks/studio.mock"

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

export default function StudioPage() {
  return (
    <main className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[700px] w-[700px] -translate-x-1/2 rounded-full bg-white/5 blur-[180px]" />
        </div>

        <div className="relative mx-auto max-w-[1800px] px-6 py-20 lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
                Creator Workspace
              </p>

              <h1 className="mt-6 text-6xl font-black uppercase leading-none md:text-7xl">
                Producer Studio
              </h1>
            </div>

            <Link
              href="/upload"
              className="flex h-16 items-center justify-center gap-4 rounded-2xl bg-white px-8 text-sm font-black uppercase tracking-[0.2em] text-black transition hover:scale-[1.02]"
            >
              <Plus size={18} />

              Upload Beat
            </Link>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <AnalyticsCard
              title="Revenue"
              value={`$${formatNumber(
                studioAnalyticsMock.totalRevenue
              )}`}
              description="Total creator earnings."
            />

            <AnalyticsCard
              title="Sales"
              value={formatNumber(
                studioAnalyticsMock.totalSales
              )}
              description="Total sold licenses."
            />

            <AnalyticsCard
              title="Plays"
              value={formatNumber(
                studioAnalyticsMock.totalPlays
              )}
              description="Streams and previews."
            />

            <AnalyticsCard
              title="Followers"
              value={formatNumber(
                studioAnalyticsMock.followers
              )}
              description="Audience growth."
            />
          </div>

          <div className="mt-16 overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.03]">
            <div className="flex items-center justify-between border-b border-white/10 px-8 py-8">
              <div>
                <h2 className="text-3xl font-black uppercase">
                  Beat Library
                </h2>

                <p className="mt-3 text-sm text-zinc-500">
                  Manage your published and draft beats.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button className="rounded-2xl border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] transition hover:border-white/20">
                  Drafts
                </button>

                <button className="rounded-2xl border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-[0.2em] transition hover:border-white/20">
                  Published
                </button>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_120px_120px_120px_140px_80px] border-b border-white/10 px-6 py-5 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
              <p>Beat</p>

              <p>Plays</p>

              <p>Sales</p>

              <p>Revenue</p>

              <p>Status</p>

              <p />
            </div>

            <div>
              {studioBeatsMock.map(
                (beat) => (
                  <StudioBeatRow
                    key={beat.id}
                    beat={beat}
                  />
                )
              )}
            </div>
          </div>

          <div className="mt-16 grid gap-6 xl:grid-cols-3">
            <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8">
              <div className="flex items-center gap-4">
                <DollarSign
                  size={24}
                />

                <h2 className="text-2xl font-black uppercase">
                  Payouts
                </h2>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-zinc-500">
                Future Stripe Connect infrastructure for
                creator withdrawals and revenue payouts.
              </p>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8">
              <div className="flex items-center gap-4">
                <PlayCircle
                  size={24}
                />

                <h2 className="text-2xl font-black uppercase">
                  Publishing
                </h2>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-zinc-500">
                Scheduled publishing and draft management
                architecture.
              </p>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/[0.03] p-8">
              <div className="flex items-center gap-4">
                <Users size={24} />

                <h2 className="text-2xl font-black uppercase">
                  Audience
                </h2>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-zinc-500">
                Audience analytics, engagement metrics and
                growth tracking systems.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}