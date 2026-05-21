import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import TrackFormClient from "@/components/studio/TrackFormClient"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditTrackPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "PRODUCER") redirect("/")

  const { id } = await params

  // 1. Ищем трек в базе данных, проверяем владельца и подтягиваем связанные moods
  const track = await prisma.track.findUnique({
    where: { id: id },
    include: { 
      genre: true,
      moods: {
        select: { id: true } // Подтягиваем только ID для корректного маппинга initialData?.moods
      }
    }
  })

  if (!track || track.producerId !== session.user.id) {
    notFound()
  }

  // 2. Получаем список всех активных жанров для выпадающего списка
  const genres = await prisma.genre.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  })

  // 3. Получаем список всех настроений из базы данных для рендеринга кнопок-тегов
  const moods = await prisma.mood.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" }
  })

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Редактирование бита</h1>
        <p className="text-zinc-500 text-xs mt-1">
          Обновите метаданные, измените стоимость или замените аудиофайлы вашего трека.
        </p>
      </div>

      {/* 4. Передаем genres, moods и предзаполненный track со всеми связями */}
      <TrackFormClient genres={genres} moods={moods} initialData={track} />
    </div>
  )
}