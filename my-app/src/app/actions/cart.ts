"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// 1. Добавление трека в корзину
export async function addToCart(trackId: string, licenseTemplateId?: string) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return { success: false, error: "Пожалуйста, войдите в аккаунт, чтобы добавлять биты в корзину." }
  }

  try {
    // Проверяем, существует ли трек
    const track = await prisma.track.findUnique({
      where: { id: trackId },
      include: { licenses: true }
    })

    if (!track) return { success: false, error: "Трек не найден" }

    // Определяем лицензию (если не передана, берем самую дешевую/первую базовую)
    let finalLicenseId = licenseTemplateId

    if (!finalLicenseId) {
      // Ищем дефолтную лицензию этого трека в БД
      const defaultLicense = await prisma.license.findFirst({
        where: { trackId: track.id },
        orderBy: { price: "asc" }
      })
      
      if (defaultLicense) {
        finalLicenseId = defaultLicense.id
      } else {
        return { success: false, error: "Для этого трека не настроены лицензии" }
      }
    }

    // Проверяем, нет ли уже этого трека в корзине пользователя
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId: session.user.id,
        trackId: trackId
      }
    })

    if (existingItem) {
      return { success: false, error: "Этот бит уже находится в вашей корзине" }
    }

    // Добавляем в корзину
    await prisma.cartItem.create({
      data: {
        userId: session.user.id,
        trackId: trackId,
        licenseId: finalLicenseId
      }
    })

    revalidatePath("/cart")
    return { success: true }

  } catch (error) {
    console.error("Ошибка добавления в корзину:", error)
    return { success: false, error: "Не удалось добавить товар в корзину" }
  }
}

// 2. Полная очистка корзины
export async function clearCartServer() {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Не авторизован" }

  try {
    await prisma.cartItem.deleteMany({
      where: { userId: session.user.id }
    })
    
    revalidatePath("/cart")
    return { success: true }
  } catch (error) {
    console.error("Ошибка при очистке корзины:", error)
    return { success: false, error: "Не удалось очистить корзину" }
  }
}

// 3. Удаление одного трека из корзины
export async function removeFromCartServer(cartItemId: string) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Не авторизован" }

  try {
    await prisma.cartItem.delete({
      where: { 
        id: cartItemId,
        userId: session.user.id // Безопасность: удаляем только свою запись
      }
    })
    
    revalidatePath("/cart")
    return { success: true }
  } catch (err) {
    console.error("Ошибка удаления позиции корзины:", err)
    return { success: false, error: "Ошибка при удалении" }
  }
}