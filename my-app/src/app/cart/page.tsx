import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ShoppingBag, ShieldCheck, Music, ArrowRight } from "lucide-react"
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

  // ИСПРАВЛЕНИЕ: Безопасно складываем цены, заменяя null на 0
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.license.price ?? 0), 0)

  // СОСТОЯНИЕ: КОРЗИНА ПУСТА
  if (cartItems.length === 0) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 space-y-5 relative z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-red-500/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="h-16 w-16 rounded-2xl bg-white/[0.01] border border-white/[0.04] flex items-center justify-center text-zinc-500 backdrop-blur-md shadow-inner">
          <ShoppingBag className="h-5 w-5" />
        </div>
        
        <div className="space-y-1 text-center">
          <h1 className="text-lg font-black text-white uppercase tracking-[0.2em]">Корзина пуста</h1>
          <p className="text-zinc-500 text-[11px] max-w-xs leading-relaxed">
            Перейдите в каталог, чтобы выбрать подходящие биты, лицензии или сэмпл-паки.
          </p>
        </div>

        <Link 
          href="/beats" /* ИСПРАВЛЕНО: Роут ведет строго на рабочую страницу битов */
          className="h-9 px-6 rounded-xl bg-white text-black hover:bg-zinc-200 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
        >
          В каталог <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    )
  }

  // СОСТОЯНИЕ: В КОРЗИНЕ ЕСТЬ ТОВАРЫ
  return (
    <div className="max-w-5xl w-full mx-auto px-4 py-8 md:py-14 space-y-8 relative z-10">
      {/* Задний неоновый фоновый шлейф для атмосферы */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Заголовок страницы */}
      <div className="flex items-end justify-between border-b border-white/[0.04] pb-5">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-black text-white uppercase tracking-wider">Ваша корзина</h1>
          <p className="text-zinc-500 text-[11px] font-medium">Вы выбрали {cartItems.length} позиций для оформления заказа</p>
        </div>
        <ClearCartButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Список товаров (Левая колонка) */}
        <div className="lg:col-span-2 space-y-3">
          {cartItems.map((item) => (
            <div 
              key={item.id}
              className="flex items-center justify-between p-4 bg-[#0c0d12]/40 backdrop-blur-md border border-white/[0.03] rounded-2xl group hover:border-white/[0.08] hover:bg-[#0c0d12]/60 transition-all duration-300"
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Обложка трека */}
                <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-white/[0.05] overflow-hidden shrink-0 relative flex items-center justify-center shadow-md">
                  {item.track.image ? (
                    <img src={item.track.image} alt={item.track.title} className="w-full h-full object-cover" />
                  ) : (
                    <Music className="h-4 w-4 text-zinc-600" />
                  )}
                </div>

                {/* Инфо о треке */}
                <div className="min-w-0 space-y-1">
                  <h3 className="text-xs md:text-sm font-bold text-white truncate group-hover:text-red-400 transition-colors">
                    {item.track.title}
                  </h3>
                  <p className="text-[10px] font-mono tracking-wide text-zinc-500 truncate">
                    by {item.track.producer.displayName || `@${item.track.producer.username}`}
                  </p>
                  
                  {/* Тег лицензии */}
                  <div className="pt-0.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-purple-500/5 border border-purple-500/10 text-[8px] font-black font-mono text-purple-400 uppercase tracking-widest">
                      Лицензия: {item.license.template.name}
                    </span>
                  </div>
                </div>
              </div>

              {/* Правая часть: Цена и Кнопка удаления */}
              <div className="flex items-center gap-4 md:gap-6 shrink-0">
                <span className="text-xs md:text-sm font-mono font-black text-white bg-white/[0.02] border border-white/[0.04] px-3 py-1 rounded-xl">
                  {/* ИСПРАВЛЕНИЕ: Безопасный вывод цены отдельного товара */}
                  {item.license.price ?? 0} ₽ 
                </span>
                <RemoveFromCartButton itemId={item.id} />
              </div>
            </div>
          ))}
        </div>

        {/* Сводка заказа (Правая колонка / Саммари) */}
        <div className="p-6 bg-[#0c0d12]/50 backdrop-blur-xl border border-white/[0.04] rounded-2xl space-y-5 sticky top-24 shadow-2xl">
          <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500">// Сводка заказа</h2>
          
          <div className="space-y-3 border-b border-white/[0.04] pb-4">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-zinc-500">Выбранных позиций:</span>
              <span className="text-white font-bold">{cartItems.length}</span>
            </div>
            <div className="flex justify-between text-xs md:text-sm font-mono items-center pt-1">
              <span className="text-zinc-400 font-bold">Итого к оплате:</span>
              <span className="text-red-400 font-black text-base drop-shadow-[0_0_15px_rgba(239,68,68,0.15)]">
                {cartTotal.toLocaleString("ru-RU")} ₽
              </span>
            </div>
          </div>

          {/* Плашка безопасной сделки */}
          <div className="p-3.5 rounded-xl bg-purple-500/[0.02] border border-purple-500/10 flex items-start gap-3">
            <ShieldCheck className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-[9px] font-black text-purple-300 uppercase tracking-widest">Aura Secure Escrow</h4>
              <p className="text-[9px] text-zinc-500 leading-normal font-medium">
                Прямой P2P перевод автору под защитой модерации платформы. Файлы бита заблокированы системой и станут доступны автоматически сразу после подтверждения транзакции.
              </p>
            </div>
          </div>

          {/* Передаем серверные данные в интерактивную клиентскую кнопку покупки */}
          <div className="pt-2">
            <CheckoutButton items={cartItems} />
          </div>
        </div>

      </div>
    </div>
  )
}
