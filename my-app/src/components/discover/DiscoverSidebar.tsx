import FilterChip from "./FilterChip"

import {
  GENRES,
  MOODS,
  MUSIC_KEYS,
} from "@/constants/discover"

export default function DiscoverSidebar() {
  return (
    <aside className="h-fit rounded-[40px] border border-white/10 bg-white/[0.03] p-8">
      <div>
        <h2 className="text-2xl font-black uppercase">
          Filters
        </h2>

        <div className="mt-8">
          <input
            placeholder="Search beats..."
            className="h-16 w-full rounded-2xl border border-white/10 bg-black/30 px-6 outline-none"
          />
        </div>
      </div>

      <div className="mt-10">
        <h3 className="text-sm font-black uppercase tracking-[0.25em] text-zinc-500">
          Genres
        </h3>

        <div className="mt-5 flex flex-wrap gap-3">
          {GENRES.map(
            (
              genre
            ) => (
              <FilterChip
                key={
                  genre
                }
                label={
                  genre
                }
              />
            )
          )}
        </div>
      </div>

      <div className="mt-10">
        <h3 className="text-sm font-black uppercase tracking-[0.25em] text-zinc-500">
          Moods
        </h3>

        <div className="mt-5 flex flex-wrap gap-3">
          {MOODS.map(
            (
              mood
            ) => (
              <FilterChip
                key={
                  mood
                }
                label={
                  mood
                }
              />
            )
          )}
        </div>
      </div>

      <div className="mt-10">
        <h3 className="text-sm font-black uppercase tracking-[0.25em] text-zinc-500">
          Keys
        </h3>

        <div className="mt-5 flex flex-wrap gap-3">
          {MUSIC_KEYS.map(
            (
              key
            ) => (
              <FilterChip
                key={
                  key
                }
                label={
                  key
                }
              />
            )
          )}
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-[0.25em] text-zinc-500">
            BPM Range
          </h3>

          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
            120 - 180
          </p>
        </div>

        <div className="mt-5">
          <input
            type="range"
            min={120}
            max={180}
            className="w-full"
          />
        </div>
      </div>

      <div className="mt-10">
        <h3 className="text-sm font-black uppercase tracking-[0.25em] text-zinc-500">
          Sort By
        </h3>

        <select className="mt-5 h-16 w-full rounded-2xl border border-white/10 bg-black/30 px-5 outline-none">
          <option>
            Trending
          </option>

          <option>
            Newest
          </option>

          <option>
            Most Popular
          </option>

          <option>
            Price: Low To High
          </option>

          <option>
            Price: High To Low
          </option>
        </select>
      </div>
    </aside>
  )
}