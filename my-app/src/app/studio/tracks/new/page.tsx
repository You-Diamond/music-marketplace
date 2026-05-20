import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import TrackFormClient from "@/components/studio/TrackFormClient"

export default async function NewTrackPage() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "PRODUCER") redirect("/")

  // Получаем список активных жанров для выпадающего списка
  const genres = await prisma.genre.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  })

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Загрузка нового бита</h1>
        <p className="text-zinc-500 text-xs mt-1">
          Заполните метаданные и загрузите файлы. MP3-превью будет доступно для прослушивания всем, а WAV откроется покупателю после оплаты.
        </p>
      </div>

      {/* Передаем жанры в клиентскую форму */}
      <TrackFormClient genres={genres} />
    </div>
  )
}