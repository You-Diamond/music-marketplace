"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { LicenseFileType } from "@prisma/client" // Импортируем нативный Enum для устранения ошибок TS

// 1. Создание дефолтных шаблонов для нового продюсера
export async function seedDefaultTemplates(producerId: string) {
  const defaultTemplatesData = [
    { 
      name: "MP3 Лезинг", 
      slug: "basic", 
      defaultPrice: 1500, 
      isPriceNegotiable: false,
      fileType: LicenseFileType.MP3, // Используем строгий Enum
      termYears: 1,
      audioStreams: 100000,
      distributionCopies: 3000,
      radioBroadcastingRights: false
    },
    { 
      name: "WAV Премиум", 
      slug: "premium", 
      defaultPrice: 3500, 
      isPriceNegotiable: false,
      fileType: LicenseFileType.MP3_WAV, // Используем строгий Enum
      termYears: null, 
      audioStreams: null, 
      distributionCopies: null,
      radioBroadcastingRights: true
    },
    { 
      name: "Эксклюзивные Права", 
      slug: "exclusive", 
      defaultPrice: null, 
      isPriceNegotiable: true, 
      fileType: LicenseFileType.MP3_WAV_STEMS, // Используем строгий Enum
      termYears: null,
      audioStreams: null,
      distributionCopies: null,
      radioBroadcastingRights: true
    },
  ]

  await prisma.licenseTemplate.createMany({
    data: defaultTemplatesData.map(t => ({
      ...t,
      producerId,
      arbitrationCountry: "Russia",
      governingLawCountry: "Russia",
      isDefaultActive: true,
    }))
  })
}

// 2. Обновление параметров шаблона лицензии
export async function updateLicenseTemplate(templateId: string, data: any) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "PRODUCER") {
    return { success: false, error: "Доступ запрещен" }
  }

  try {
    const parsedPrice = data.isPriceNegotiable || !data.defaultPrice 
      ? null 
      : parseFloat(data.defaultPrice)

    await prisma.licenseTemplate.update({
      where: { id: templateId, producerId: session.user.id },
      data: {
        name: data.name,
        isPriceNegotiable: data.isPriceNegotiable === true,
        defaultPrice: parsedPrice,
        distributionCopies: data.distributionCopies ? parseInt(data.distributionCopies) : null,
        audioStreams: data.audioStreams ? parseInt(data.audioStreams) : null,
        radioBroadcastingRights: data.radioBroadcastingRights === true,
        termYears: data.termYears ? parseInt(data.termYears) : null,
        
        // Новые расширенные поля
        freeDownloads: data.freeDownloads ? parseInt(data.freeDownloads) : null,
        musicVideosMonetized: data.musicVideosMonetized ? parseInt(data.musicVideosMonetized) : null,
        videoStreamsMonetized: data.videoStreamsMonetized ? parseInt(data.videoStreamsMonetized) : null,
        livePerformancesForProfit: data.livePerformancesForProfit === true,
      }
    })

    revalidatePath("/studio/licenses")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Ошибка при обновлении параметров контракта" }
  }
}

// 3. Создание кастомного шаблона лицензии с учетом SaaS-пейволла
export async function createLicenseTemplate(data: { name: string; fileType: LicenseFileType }) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "PRODUCER") {
    return { success: false, error: "Доступ запрещен" }
  }

  try {
    // 1. Получаем пользователя и считаем его текущие шаблоны лицензий
    const [user, templatesCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { subscriptionStatus: true } // Проверяем статус подписки
      }),
      prisma.licenseTemplate.count({
        where: { producerId: session.user.id }
      })
    ])

    // Порог бесплатного тарифа (активной подписки PRO нет)
    const isFreeUser = !user || user.subscriptionStatus !== "ACTIVE"

    // 2. Проверка лимитов тарифа
    if (isFreeUser && templatesCount >= 3) {
      return { 
        success: false, 
        error: "Достигнут лимит бесплатных контрактов (макс. 3). Оформите PRO-подписку, чтобы создавать до 10 кастомных типов лицензий.",
        requiresUpgrade: true // Флаг для фронтенда, чтобы открыть модалку оплаты
      }
    }

    if (!isFreeUser && templatesCount >= 10) {
      return { 
        success: false, 
        error: "Достигнут абсолютный лимит платформы (макс. 10 лицензий)." 
      }
    }

    // Очередной слаг генерируем на основе имени (базовый вариант)
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")

    // 3. Создаем новый шаблон, если проверки пройдены
    await prisma.licenseTemplate.create({
      data: {
        name: data.name,
        slug: slug || "custom-license",
        fileType: data.fileType,
        defaultPrice: 2000, // Дефолтная заглушка для кастомного тарифа
        isPriceNegotiable: false,
        producerId: session.user.id,
        arbitrationCountry: "Russia",
        governingLawCountry: "Russia",
        isDefaultActive: true
      }
    })

    revalidatePath("/studio/licenses")
    return { success: true }
  } catch (error) {
    console.error("Create template error:", error)
    return { success: false, error: "Не удалось создать шаблон лицензии" }
  }
}

export async function toggleTrackLicense(licenseId: string, data: { isActive: boolean; price?: string | null }) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "PRODUCER") {
    return { success: false, error: "Доступ запрещен" }
  }

  try {
    const updateData: any = { isActive: data.isActive }
    
    if (data.price !== undefined) {
      updateData.price = data.price === "" || data.price === null ? null : parseFloat(data.price)
    }

    await prisma.license.update({
      where: { id: licenseId },
      data: updateData
    })

    revalidatePath("/studio/tracks")
    revalidatePath("/beats")
    return { success: true }
  } catch (error) {
    console.error("Toggle license error:", error)
    return { success: false, error: "Не удалось обновить привязку лицензии" }
  }
}