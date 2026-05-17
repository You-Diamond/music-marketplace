"use client"

import Image from "next/image"

import Link from "next/link"

import {
  Trash2,
  Music2,
} from "lucide-react"

import { CartItem } from "@/types/cart"

type Props = {
  item: CartItem

  onRemove: (
    id: string
  ) => void
}

export default function CartItemCard({
  item,
  onRemove,
}: Props) {
  return (
    <div className="flex flex-col gap-6 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 lg:flex-row">
      <div className="relative h-[220px] w-full overflow-hidden rounded-[24px] lg:w-[220px]">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-6">
            <div>
              <Link
                href={`/beat/${item.publicId}`}
              >
                <h2 className="text-3xl font-black uppercase transition hover:text-zinc-300">
                  {item.title}
                </h2>
              </Link>

              <Link
                href={`/${item.producerUsername}`}
              >
                <p className="mt-3 text-sm uppercase tracking-[0.25em] text-zinc-500 transition hover:text-white">
                  {
                    item.producerDisplayName
                  }
                </p>
              </Link>
            </div>

            <button
              onClick={() =>
                onRemove(
                  item.id
                )
              }
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition hover:border-red-500 hover:text-red-500"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-300">
              <Music2 size={14} />

              {
                item.license
                  .title
              }
            </div>

            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-300">
              BPM {item.bpm}
            </div>

            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-zinc-300">
              {
                item.musicKey
              }
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
              License Price
            </p>

            <h3 className="mt-2 text-4xl font-black">
              ${item.price}
            </h3>
          </div>
        </div>
      </div>
    </div>
  )
}