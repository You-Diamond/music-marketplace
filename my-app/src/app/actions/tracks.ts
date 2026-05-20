"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createTrack(formData: {
  title: string
  bpm: number
  musicKey: string
  genreId: string
  image: string | null
  audio: string 
  stemsUrl?: string
}) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "PRODUCER") {
    return { success: false, error: "Доступ запрещен" }
  }

  try {
    // Используем транзакцию Prisma, чтобы трек и лицензии создавались неразрывно
    const newTrack = await prisma.$transaction(async (tx) => {
      // 1. Создаем сам трек
      const track = await tx.track.create({
        data: {
          title: formData.title,
          bpm: Number(formData.bpm),
          musicKey: formData.musicKey,
          genreId: formData.genreId,
          image: formData.image,
          audio: formData.audio, 
          duration: 180, 
          producerId: session.user.id,
        },
      })

      // 2. Находим все шаблоны лицензий этого продюсера
      const templates = await tx.licenseTemplate.findMany({
        where: { producerId: session.user.id }
      })

      // 3. Привязываем эти лицензии к созданному треку
      if (templates.length > 0) {
        await tx.license.createMany({
            data: templates.map((t) => ({
            trackId: track.id,
            templateId: t.id, // Использовано правильное системное поле templateId
            price: t.defaultPrice,
            }))
        })
        }

      return track
    })

    revalidatePath("/studio/tracks")
    return { success: true, trackId: newTrack.id }
  } catch (error: any) {
    console.error("Ошибка при создании трека:", error)
    return { success: false, error: "Не удалось сохранить трек и лицензии." }
  }
}