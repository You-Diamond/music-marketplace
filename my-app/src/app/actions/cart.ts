"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// 1. Добавление трека в корзину с учетом конкретной лицензии
export async function addToCart(trackId: string, licenseId?: string) {
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

    let finalLicenseId = licenseId

    if (!finalLicenseId) {
      // Если лицензия не передана, ищем самую дешевую активную лицензию этого трека
      const defaultLicense = await prisma.license.findFirst({
        where: { trackId: track.id, isActive: true },
        orderBy: { price: "asc" }
      })
      
      if (defaultLicense) {
        finalLicenseId = defaultLicense.id
      } else {
        return { success: false, error: "Для этого трека не настроены активные лицензии." }
      }
    }

    // Проверяем, нет ли уже точно такого же товара с этой же лицензией в корзине пользователя
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId: session.user.id,
        trackId: trackId,
        licenseId: finalLicenseId
      }
    })

    if (existingItem) {
      return { success: false, error: "Этот бит с выбранной лицензией уже добавлен в корзину." }
    }

    // Создаем запись в корзине
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
        userId: session.user.id
      }
    })

    revalidatePath("/cart")
    return { success: true }
  } catch (error) {
    console.error("Ошибка при удалении из корзины:", error)
    return { success: false, error: "Не удалось удалить элемент из корзины" }
  }
}