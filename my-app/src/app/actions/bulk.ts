"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

interface BulkTrackItem {
  title: string
  audioUrl: string
  detectedType: "MP3" | "WAV" // 🌟 Передаем тип файла с фронтенда
}

export async function createBulkTracks(tracks: BulkTrackItem[]) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "PRODUCER") {
    return { success: false, error: "Доступ запрещен" }
  }

  if (!tracks || tracks.length === 0) {
    return { success: false, error: "Нет данных для загрузки" }
  }

  try {
    const defaultGenre = await prisma.genre.findFirst()
    if (!defaultGenre) {
      return { success: false, error: "На платформе не создано ни одного жанра." }
    }

    const templates = await prisma.licenseTemplate.findMany({
      where: { producerId: session.user.id }
    })

    await prisma.$transaction(async (tx) => {
      for (const item of tracks) {
        // Формируем поля в зависимости от того, что загрузил пользователь
        const isWav = item.detectedType === "WAV"
        
        const track = await tx.track.create({
          data: {
            title: item.title,
            bpm: 140,
            musicKey: "C Minor",
            genreId: defaultGenre.id,
            // Если это MP3 — пишем в превью. Если WAV — пишем в wavUrl (а превью с фронта тоже настроим)
            audio: item.audioUrl, 
            wavUrl: isWav ? item.audioUrl : null,
            producerId: session.user.id,
            isActive: false, // Это черновик
            duration: 180,
          }
        })

        // Привязываем лицензии с УМНОЙ проверкой доступности файлов
        if (templates.length > 0) {
          const licensesToCreate = templates.map((t) => {
            let canBeActive = true

            // Если шаблон требует WAV, а загружен только MP3 — выключаем лицензию
            if (t.fileType === "MP3_WAV" && !isWav) {
              canBeActive = false
            }
            // Для эксклюзивов со Stems всегда выключаем при пакетной загрузке, так как ссылки еще нет
            if (t.fileType === "MP3_WAV_STEMS") {
              canBeActive = false
            }

            return {
              trackId: track.id,
              templateId: t.id,
              price: t.defaultPrice,
              isActive: canBeActive // 🌟 Теперь это безопасно для маркетплейса!
            }
          })

          await tx.license.createMany({
            data: licensesToCreate
          })
        }
      }
    })

    revalidatePath("/studio/tracks")
    return { success: true, count: tracks.length }
  } catch (error) {
    console.error("Bulk upload error:", error)
    return { success: false, error: "Ошибка при пакетном сохранении черновиков." }
  }
}