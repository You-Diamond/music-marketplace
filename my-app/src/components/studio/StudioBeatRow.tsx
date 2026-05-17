import Image from "next/image"

import Link from "next/link"

import {
  MoreHorizontal,
} from "lucide-react"

import clsx from "clsx"

import { StudioBeat } from "@/types/studio"

type Props = {
  beat: StudioBeat
}

export default function StudioBeatRow({
  beat,
}: Props) {
  return (
    <div className="grid grid-cols-[1fr_120px_120px_120px_140px_80px] items-center border-b border-white/5 px-6 py-5">
      <div className="flex items-center gap-5">
        <div className="relative h-20 w-20 overflow-hidden rounded-2xl border border-white/10">
          <Image
            src={beat.image}
            alt={beat.title}
            fill
            className="object-cover"
          />
        </div>

        <div>
          <Link
            href={`/beat/${beat.publicId}`}
          >
            <h2 className="text-xl font-black uppercase transition hover:text-zinc-300">
              {beat.title}
            </h2>
          </Link>

          <div className="mt-3 flex flex-wrap gap-2">
            <div className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              {beat.genre}
            </div>

            <div className="rounded-full border border-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              {beat.bpm} BPM
            </div>
          </div>
        </div>
      </div>

      <p className="text-sm uppercase tracking-[0.15em] text-zinc-400">
        {beat.plays.toLocaleString()}
      </p>

      <p className="text-sm uppercase tracking-[0.15em] text-zinc-400">
        {beat.sales}
      </p>

      <p className="text-sm uppercase tracking-[0.15em] text-zinc-400">
        ${beat.revenue}
      </p>

      <div>
        <div
          className={clsx(
            "inline-flex rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em]",
            beat.status ===
              "published" &&
              "bg-white text-black",

            beat.status ===
              "draft" &&
              "border border-white/10 text-zinc-400",

            beat.status ===
              "scheduled" &&
              "bg-zinc-800 text-white"
          )}
        >
          {beat.status}
        </div>
      </div>

      <button className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 transition hover:border-white/20">
        <MoreHorizontal
          size={18}
        />
      </button>
    </div>
  )
}