"use client"

import clsx from "clsx"

type Props = {
  genres?: string[]
  activeGenre?: string
  onSelect?: (genre: string) => void
}

export default function GenreFilters({
  genres = [],
  activeGenre = "",
  onSelect = () => {},
}: Props) {
  return (
    <div className="flex flex-wrap gap-3">
      {genres.map((genre) => {
        const isActive = activeGenre === genre
        return (
          <button
            key={genre}
            onClick={() => onSelect(genre)}
            className={clsx(
              "px-4 py-2 rounded-full text-sm font-black uppercase tracking-[0.2em] transition",
              isActive
                ? "bg-white text-black"
                : "bg-white/5 text-zinc-300 hover:bg-white/10"
            )}
          >
            {genre}
          </button>
        )
      })}
    </div>
  )
}