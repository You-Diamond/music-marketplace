"use server"

import { revalidatePath } from "next/cache"
import prisma from "@/lib/prisma" 
import { LicenseTemplate } from "@prisma/client"

/**
 * 1. Получение данных для главной страницы Студии (/studio)
 */
export async function getStudioDashboardData(producerId: string) {
  try {
    const producer = await prisma.user.findUnique({
      where: { id: producerId },
      include: {
        tracks: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            genre: true,
            licenses: {
              include: { 
                template: true 
              }
            }
          }
        }
      }
    })

    if (!producer) throw new Error("Продюсер не найден")

    // Получаем количество треков продюсера
    const tracksCount = await prisma.track.count({
      where: { producerId }
    })

    // Вычисляем общую сумму успешных заказов, которые содержат лицензии на треки этого продюсера
    const orders = await prisma.order.findMany({
      where: {
        status: "COMPLETED",
        items: {
          some: {
            license: {
              track: { producerId }
            }
          }
        }
      },
      select: { totalAmount: true }
    })

    const grossEarnings = orders.reduce((sum: number, order: { totalAmount: number }) => {
      return sum + order.totalAmount
    }, 0)

    return {
      success: true,
      data: {
        grossEarnings,
        totalPlays: producer.totalPlays,
        tracksCount,
        recentTracks: producer.tracks,
      }
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * 2. Загрузка нового трека с автоматическим созданием лицензий по шаблонам продюсера
 */
export async function createTrackAction({
  producerId,
  title,
  bpm,
  musicKey,
  genreId,
  audioUrl,
  imageUrl,
  duration,
  tags
}: {
  producerId: string
  title: string
  bpm: number
  musicKey: string
  genreId: string
  audioUrl: string
  imageUrl?: string
  duration: number
  tags: string[]
}) {
  try {
    // Находим все глобальные шаблоны лицензий продюсера, которые должны включаться по умолчанию
    const defaultTemplates = await prisma.licenseTemplate.findMany({
      where: {
        producerId,
        isDefaultActive: true
      }
    })

    // Создаем трек и в этой же транзакции разворачиваем для него индивидуальные лицензии
    const newTrack = await prisma.track.create({
      data: {
        title,
        bpm,
        musicKey,
        audio: audioUrl,
        image: imageUrl,
        duration,
        tags,
        producerId,
        genreId,
        licenses: {
          create: defaultTemplates.map((template: LicenseTemplate) => ({
            templateId: template.id,
            price: template.defaultPrice, // Накатываем базовую цену из шаблона
            isActive: true
          }))
        }
      },
      include: {
        licenses: true
      }
    })

    revalidatePath("/studio")
    revalidatePath("/studio/tracks")
    revalidatePath("/studio/licenses")
    return { success: true, track: newTrack }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * 3. Изменение кастомной цены конкретной лицензии на треке
 */
export async function updateTrackLicensePrice(licenseId: string, newPrice: number) {
  try {
    const updatedLicense = await prisma.license.update({
      where: { id: licenseId },
      data: { price: newPrice }
    })

    revalidatePath("/studio/licenses")
    return { success: true, license: updatedLicense }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * 4. Переключение видимости/активности лицензии для конкретного трека в матрице
 */
export async function toggleTrackLicenseVisibility(licenseId: string, isActive: boolean) {
  try {
    const updatedLicense = await prisma.license.update({
      where: { id: licenseId },
      data: { isActive }
    })

    revalidatePath("/studio/licenses")
    return { success: true, license: updatedLicense }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * 5. Создание или обновление глобального шаблона контракта продюсера
 */
export async function upsertLicenseTemplateAction(
  producerId: string,
  templateId: string | undefined,
  data: {
    name: string
    slug: string
    defaultPrice: number
    isDefaultActive: boolean
    arbitrationCountry?: string
    governingLawCountry?: string
    termYears?: number | null
    distributionCopies?: number | null
    audioStreams?: number | null
    freeDownloads?: number | null
  }
) {
  try {
    if (templateId) {
      const updated = await prisma.licenseTemplate.update({
        where: { id: templateId },
        data
      })
      revalidatePath("/studio/licenses")
      return { success: true, template: updated }
    } else {
      const created = await prisma.licenseTemplate.create({
        data: {
          ...data,
          producerId
        }
      })
      revalidatePath("/studio/licenses")
      return { success: true, template: created }
    }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * 6. Полное удаление трека
 */
export async function deleteTrackAction(trackId: string) {
  try {
    await prisma.track.delete({
      where: { id: trackId }
    })

    revalidatePath("/studio/tracks")
    revalidatePath("/studio/licenses")
    revalidatePath("/studio")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

/**
 * 7. Вывод трека в секцию трендов (featured)
 */
export async function toggleTrackFeaturedStatus(trackId: string, featured: boolean) {
  try {
    const updated = await prisma.track.update({
      where: { id: trackId },
      data: { featured }
    })

    revalidatePath("/studio/tracks")
    return { success: true, track: updated }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}