"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { getBeats } from "@/app/actions/beats"
import { TrackSkeleton } from "@/components/TrackSkeleton" // Ваш компонент скелетона

export function BeatsClient({ initialBeats }: { initialBeats: any[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [beats, setBeats] = useState(initialBeats)
  const [isLoading, setIsLoading] = useState(false)

  // Функция для обновления URL без перезагрузки страницы
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all" || !value) params.delete(key)
    else params.set(key, value)
    
    router.push(`/beats?${params.toString()}`, { scroll: false })
  }

  // Обновление списка при смене URL параметров
  useEffect(() => {
    const refreshData = async () => {
      setIsLoading(true)
      const data = await getBeats(Object.fromEntries(searchParams.entries()))
      setBeats(data)
      setIsLoading(false)
    }
    refreshData()
  }, [searchParams])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Панель фильтров */}
      <aside className="space-y-6">
        <input 
          placeholder="Поиск..." 
          className="w-full p-3 rounded-xl bg-white dark:bg-zinc-900 border"
          onChange={(e) => updateFilter("query", e.target.value)}
        />
        {/* Добавьте остальные селекты с onChange = (e) => updateFilter("genre", e.target.value) */}
      </aside>

      {/* Список битов */}
      <main className="lg:col-span-3 space-y-4">
        {isLoading ? (
          [1,2,3].map(i => <TrackSkeleton key={i} />)
        ) : (
          beats.map(track => (
            <div key={track.id} className="p-4 border rounded-2xl">
              {track.title} - {track.producer.username}
            </div>
          ))
        )}
      </main>
    </div>
  )
}