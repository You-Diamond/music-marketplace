"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// 1. Создание дефолтных шаблонов для нового продюсера
export async function seedDefaultTemplates(producerId: string) {
  const defaults = [
    {
      name: "Standard MP3 Lease",
      slug: "mp3",
      defaultPrice: 29.99,
      fileType: "MP3_TAGGED" as const,
      distributionCopies: 5000,
      audioStreams: 100000,
      radioBroadcastingRights: false,
    },
    {
      name: "Premium WAV Lease",
      slug: "wav",
      defaultPrice: 49.99,
      fileType: "MP3_WAV" as const,
      distributionCopies: 10000,
      audioStreams: 500000,
      radioBroadcastingRights: true,
      radioStations: 2,
    },
    {
      name: "Exclusive Contract",
      slug: "exclusive",
      defaultPrice: 499.99,
      fileType: "STEMS" as const,
      termYears: null, // Безлимит
      distributionCopies: null, // Безлимит
      audioStreams: null, // Безлимит
      radioBroadcastingRights: true,
    }
  ]

  for (const t of defaults) {
    await prisma.licenseTemplate.create({
      data: {
        ...t,
        producerId,
      }
    })
  }
}

// 2. Обновление параметров шаблона лицензии
export async function updateLicenseTemplate(templateId: string, data: any) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "PRODUCER") {
    return { success: false, error: "Доступ запрещен" }
  }

  try {
    await prisma.licenseTemplate.update({
      where: { id: templateId, producerId: session.user.id },
      data: {
        name: data.name,
        defaultPrice: parseFloat(data.defaultPrice),
        distributionCopies: data.distributionCopies ? parseInt(data.distributionCopies) : null,
        audioStreams: data.audioStreams ? parseInt(data.audioStreams) : null,
        radioBroadcastingRights: data.radioBroadcastingRights === true,
        termYears: data.termYears ? parseInt(data.termYears) : null,
      }
    })

    revalidatePath("/studio/licenses")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Ошибка при обновлении юридических параметров" }
  }
}