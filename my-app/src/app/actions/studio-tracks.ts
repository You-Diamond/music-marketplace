"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// 1. Экшен изменения видимости трека (Скрыть / Показать)
export async function toggleTrackVisibility(trackId: string, currentStatus: boolean) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "PRODUCER") {
      throw new Error("Unauthorized")
    }

    // Проверяем владельца трека
    const track = await prisma.track.findUnique({ where: { id: trackId } })
    if (!track || track.producerId !== session.user.id) {
      throw new Error("Access denied")
    }

    await prisma.track.update({
      where: { id: trackId },
      data: { isActive: !currentStatus }
    })

    // Сбрасываем кэш страницы, чтобы Next.js переотрендерил список
    revalidatePath("/studio/tracks")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Не удалось изменить видимость трека" }
  }
}

// 2. Экшен полного удаления трека
export async function deleteTrack(trackId: string) {
  try {
    const session = await auth()
    if (!session?.user?.id || session.user.role !== "PRODUCER") {
      throw new Error("Unauthorized")
    }

    const track = await prisma.track.findUnique({ where: { id: trackId } })
    if (!track || track.producerId !== session.user.id) {
      throw new Error("Access denied")
    }

    await prisma.track.delete({
      where: { id: trackId }
    })

    revalidatePath("/studio/tracks")
    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Не удалось удалить трек" }
  }
}