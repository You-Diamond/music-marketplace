"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function updateProducerProfile(formData: {
  displayName: string
  telegram: string
  paymentDetails: string
}) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "PRODUCER") {
    return { success: false, error: "Доступ заблокирован" }
  }

  // Небольшая очистка юзернейма ТГ от знака @, если пользователь его ввел
  let cleanedTelegram = formData.telegram.trim()
  if (cleanedTelegram.startsWith("@")) {
    cleanedTelegram = cleanedTelegram.substring(1)
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        displayName: formData.displayName.trim(),
        // Убедись, что в твоей schema.prisma есть поля telegram и paymentDetails.
        // Если их нет, добавь их в модель User как String?
        telegram: cleanedTelegram,
        paymentDetails: formData.paymentDetails.trim(),
      },
    })

    revalidatePath("/studio/settings")
    return { success: true }
  } catch (error) {
    console.error("Ошибка обновления профиля:", error)
    return { success: false, error: "Не удалось сохранить настройки." }
  }
}