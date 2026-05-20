import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ShoppingBag, ShieldCheck, Music } from "lucide-react"
import Link from "next/link"
import CheckoutButton from "@/components/cart/CheckoutButton" 
import RemoveFromCartButton from "@/components/cart/RemoveFromCartButton"
import ClearCartButton from "@/components/cart/ClearCartButton"

export const dynamic = "force-dynamic"

export default async function CartPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/cart")
  }

  // Запрашиваем корзину из БД со всеми нужными связями для CheckoutButton
  const cartItems = await prisma.cartItem.findMany({
    where: { userId: session.user.id },
    include: {
      track: {
        include: {
          producer: { select: { displayName: true, username: true } }
        }
      },
      license: {
        include: {
          template: { select: { name: true } }
        }
      }
    }
  })

  const cartTotal = cartItems.reduce((sum, item) => sum + item.license.price, 0)

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 space-y-4">
        <div className="h-16 w-16 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center text-zinc-500">
          <ShoppingBag className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-white uppercase tracking-wider">Корзина пуста</h1>
        <p className="text-zinc-500 text-xs text-center max-w-xs">
          Перейдите в каталог треков, чтобы выбрать подходящие биты и лицензии.
        </p>
        <Link 
          href="/" 
          className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition-all"
        >
          В магазин
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <div className="flex items-center justify-between border-b border-white/[0.05] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Ваша корзина</h1>
          <p className="text-zinc-500 text-xs mt-1">Вы выбрали {cartItems.length} позиций</p>
        </div>
        <ClearCartButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Список товаров */}
        <div className="lg:col-span-2 space-y-3">
          {cartItems.map((item) => (
            <div 
              key={item.id}
              className="flex items-center justify-between p-4 bg-[#0c0d12]/60 backdrop-blur-md border border-white/[0.04] rounded-2xl group hover:border-white/[0.1] transition-all"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-12 w-12 rounded-xl bg-zinc-800 overflow-hidden shrink-0 relative flex items-center justify-center">
                  {item.track.image ? (
                    <img src={item.track.image} alt={item.track.title} className="w-full h-full object-cover" />
                  ) : (
                    <Music className="h-5 w-5 text-zinc-600" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate">{item.track.title}</h3>
                  <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                    by {item.track.producer.displayName || `@${item.track.producer.username}`}
                  </p>
                  <span className="inline-block mt-2 px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.05] text-[9px] font-mono text-purple-400 uppercase tracking-wider">
                    Лицензия: {item.license.template.name}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0">
                <span className="text-sm font-mono font-bold text-white">
                  ${item.license.price}
                </span>
                <RemoveFromCartButton itemId={item.id} />
              </div>
            </div>
          ))}
        </div>

        {/* Саммари */}
        <div className="p-6 bg-[#0c0d12]/40 border border-white/[0.04] rounded-2xl space-y-6">
          <h2 className="text-xs font-mono uppercase tracking-widest text-zinc-400">// Сводка заказа</h2>
          
          <div className="space-y-3 border-b border-white/[0.05] pb-4">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-zinc-500">Позиций:</span>
              <span className="text-white">{cartItems.length}</span>
            </div>
            <div className="flex justify-between text-sm font-mono font-bold">
              <span className="text-zinc-400">Итого к оплате:</span>
              <span className="text-red-400">${cartTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/10 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="text-[10px] font-bold text-purple-300 uppercase tracking-wide">Aura Secure Escrow</h4>
              <p className="text-[9px] text-zinc-400 leading-normal">
                Прямой P2P перевод автору под защитой модерации. Файлы бита блокируются системой и станут доступны сразу после подтверждения платежа.
              </p>
            </div>
          </div>

          {/* Передаем серверные данные прямо в интерактивную кнопку */}
          <CheckoutButton items={cartItems} />
        </div>
      </div>
    </div>
  )
}