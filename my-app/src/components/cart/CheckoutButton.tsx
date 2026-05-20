"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2 } from "lucide-react"
import { createOrdersFromCart, OrderInput } from "@/app/actions/orders"

export default function CheckoutButton({ items }: { items: any[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleCheckout = async () => {
    try {
      setIsSubmitting(true)

      // Преобразуем данные из реляционной БД в плоскую структуру для экшена
      const formattedItems: OrderInput[] = items.map((item) => ({
        trackId: item.trackId,
        licenseId: item.licenseId,
        producerId: item.track.producerId, // Достаем ID автора из связи с треком
        price: item.license.price,
        trackTitle: item.track.title,
        licenseName: item.license.template.name,
      }))

      // Валидация на фронтенде перед отправкой
      if (formattedItems.some(i => !i.producerId)) {
        alert("Ошибка: У одного из треков не определен автор.")
        return
      }

      const result = await createOrdersFromCart(formattedItems)

      if (result.success && result.orderIds) {
        // Если купили биты только у одного продюсера — сразу редиректим в чат сделки
        if (result.orderIds.length === 1) {
          router.push(`/orders/${result.orderIds[0]}`)
        } else {
          // Если биты от разных авторов (создалось несколько чатов) — на страницу всех заказов
          router.push("/downloads?tab=orders")
        }
      } else {
        alert(result.error || "Произошла ошибка")
      }
    } catch (err) {
      console.error("Критическая ошибка чекаута:", err)
      alert("Что-то пошло не так")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={isSubmitting}
      className="w-full h-11 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all group/btn shadow-[0_0_20px_rgba(220,38,38,0.15)]"
    >
      {isSubmitting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Оформление запроса...
        </>
      ) : (
        <>
          Оформить запрос
          <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
        </>
      )}
    </button>
  )
}