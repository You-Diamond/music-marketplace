"use client"

import { useState } from "react"
import { Eye, EyeOff, Trash2, Loader2 } from "lucide-react"
import { toggleTrackVisibility, deleteTrack } from "@/app/actions/studio-tracks"

interface TrackRowActionsProps {
  trackId: string
  isActive: boolean
}

export default function TrackRowActions({ trackId, isActive }: TrackRowActionsProps) {
  const [isPendingVisibility, setIsPendingVisibility] = useState(false)
  const [isPendingDelete, setIsPendingDelete] = useState(false)

  const handleToggleVisibility = async () => {
    if (isPendingVisibility) return
    setIsPendingVisibility(true)
    
    const res = await toggleTrackVisibility(trackId, isActive)
    if (!res.success) alert(res.error)
    
    setIsPendingVisibility(false)
  }

  const handleDelete = async () => {
    const confirmed = window.confirm("Вы уверены, что хотите навсегда удалить этот бит?")
    if (!confirmed) return
    
    setIsPendingDelete(true)
    const res = await deleteTrack(trackId)
    if (!res.success) alert(res.error)
    
    setIsPendingDelete(false)
  }

  return (
    <div className="flex items-center gap-2">
      {/* Кнопка видимости */}
      <button
        onClick={handleToggleVisibility}
        disabled={isPendingVisibility}
        className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-all disabled:opacity-50"
        title={isActive ? "Скрыть с сайта" : "Показать на сайте"}
      >
        {isPendingVisibility ? (
          <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
        ) : isActive ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4 text-zinc-600" />
        )}
      </button>

      {/* Кнопка удаления */}
      <button
        onClick={handleDelete}
        disabled={isPendingDelete}
        className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] text-zinc-500 hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/10 transition-all disabled:opacity-50"
        title="Удалить трек"
      >
        {isPendingDelete ? (
          <Loader2 className="h-4 w-4 animate-spin text-red-500" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </button>
    </div>
  )
}