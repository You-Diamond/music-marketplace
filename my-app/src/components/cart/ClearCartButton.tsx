"use client"

import { useState } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { clearCartServer } from "@/app/actions/cart"
import { useRouter } from "next/navigation"

export default function ClearCartButton() {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const handleClear = async () => {
    if (!confirm("Вы уверены, что хотите полностью очистить корзину?")) return

    try {
      setIsPending(true)
      const res = await clearCartServer()
      if (res.success) {
        router.refresh()
      } else {
        alert(res.error || "Произошла ошибка")
      }
    } catch (err) {
      alert("Что-то пошло не так")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <button 
      onClick={handleClear}
      disabled={isPending}
      className="text-zinc-500 hover:text-red-400 disabled:text-zinc-700 transition-colors text-xs font-mono uppercase flex items-center gap-1.5"
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Trash2 className="h-3.5 w-3.5" />
      )}
      Очистить
    </button>
  )
}