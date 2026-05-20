"use client"

import { Trash2, Loader2 } from "lucide-react"
import { useState } from "react"
import { removeFromCartServer } from "@/app/actions/cart"
import { useRouter } from "next/navigation"

export default function RemoveFromCartButton({ itemId }: { itemId: string }) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const handleRemove = async () => {
    try {
      setIsPending(true)
      const res = await removeFromCartServer(itemId)
      if (res.success) {
        router.refresh()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsPending(false)
    }
  }

  return (
    <button 
      onClick={handleRemove} 
      disabled={isPending}
      className="text-zinc-600 hover:text-red-400 transition-colors p-1 disabled:opacity-50"
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  )
}