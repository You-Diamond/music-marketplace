import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import TrackFormClient from "@/components/studio/TrackFormClient"

export default async function NewTrackPage() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "PRODUCER") redirect("/")

  // Получаем жанры, настроения и дефолтные шаблоны лицензий продюсера
  const [genres, moods, licenseTemplates] = await Promise.all([
    prisma.genre.findMany({ orderBy: { name: "asc" } }),
    prisma.mood.findMany({ orderBy: { name: "asc" } }),
    prisma.licenseTemplate.findMany({
      where: { producerId: session.user.id },
      orderBy: { defaultPrice: "asc" }
    })
  ])

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-6">
      <div>
        <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Загрузка нового бита</h1>
        <p className="text-zinc-500 text-xs mt-1">
          Заполните метаданные, загрузите аудиофайлы и настройте стоимость контрактов перед публикацией.
        </p>
      </div>

      {/* Передаем шаблоны лицензий в форму */}
      <TrackFormClient 
        genres={genres} 
        moods={moods} 
        licenseTemplates={licenseTemplates} 
        initialData={null} 
      />
    </div>
  )
}