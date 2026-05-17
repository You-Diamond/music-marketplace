"use client"

import Link from "next/link"

import {
  ShoppingCart,
  ArrowRight,
} from "lucide-react"

import CartItemCard from "@/components/cart/CartItemCard"

import { useCartStore } from "@/stores/cart-store"

export default function CartPage() {
  const items = useCartStore(
    (state) => state.items
  )

  const removeItem =
    useCartStore(
      (state) =>
        state.removeItem
    )

  const subtotal =
    items.reduce(
      (acc, item) =>
        acc + item.price,
      0
    )

  const taxes =
    subtotal * 0.1

  const total =
    subtotal + taxes

  if (items.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]">
            <ShoppingCart
              size={42}
            />
          </div>

          <h1 className="mt-10 text-5xl font-black uppercase">
            Cart Is Empty
          </h1>

          <p className="mt-5 text-zinc-500">
            Add beats to your cart
            to continue
          </p>

          <Link
            href="/beats"
            className="mt-10 inline-flex items-center gap-3 rounded-full bg-white px-8 py-5 text-sm font-black uppercase tracking-[0.2em] text-black transition hover:scale-[1.02]"
          >
            Browse Beats

            <ArrowRight
              size={18}
            />
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen px-6 py-20 lg:px-10">
      <div className="mx-auto max-w-[1800px]">
        <div className="flex flex-col gap-16 xl:grid xl:grid-cols-[1fr_420px]">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-zinc-500">
                  Checkout
                </p>

                <h1 className="mt-4 text-6xl font-black uppercase">
                  Your Cart
                </h1>
              </div>

              <div className="rounded-full border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-black uppercase tracking-[0.2em] text-zinc-300">
                {
                  items.length
                }{" "}
                items
              </div>
            </div>

            <div className="mt-14 space-y-6">
              {items.map(
                (item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onRemove={
                      removeItem
                    }
                  />
                )
              )}
            </div>
          </div>

          <div>
            <div className="sticky top-28 rounded-[40px] border border-white/10 bg-white/[0.03] p-8">
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">
                Order Summary
              </p>

              <div className="mt-10 space-y-6">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>
                    Subtotal
                  </span>

                  <span>
                    $
                    {subtotal.toFixed(
                      2
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between text-zinc-400">
                  <span>
                    Taxes
                  </span>

                  <span>
                    $
                    {taxes.toFixed(
                      2
                    )}
                  </span>
                </div>

                <div className="h-px bg-white/10" />

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold uppercase tracking-[0.2em]">
                    Total
                  </span>

                  <span className="text-4xl font-black">
                    $
                    {total.toFixed(
                      2
                    )}
                  </span>
                </div>
              </div>

              <button className="mt-10 flex w-full items-center justify-center gap-3 rounded-full bg-white px-8 py-5 text-sm font-black uppercase tracking-[0.2em] text-black transition hover:scale-[1.02]">
                Proceed To Checkout

                <ArrowRight
                  size={18}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}