"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

// 1. Отправка сообщения в чат
export async function sendChatMessage(orderId: string, text: string) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Не авторизован" }

  if (!text.trim()) return { success: false, error: "Текст пуст" }

  try {
    const message = await prisma.chatMessage.create({
      data: {
        orderId,
        senderId: session.user.id,
        text,
        isSystem: false
      }
    })

    revalidatePath(`/orders/${orderId}`)
    revalidatePath(`/studio/inquiries/${orderId}`)
    return { success: true, message }
  } catch (error) {
    return { success: false, error: "Ошибка отправки" }
  }
}

// 2. Покупатель загружает чек и меняет статус на PAYMENT_SUBMITTED
export async function submitPaymentProof(orderId: string, proofUrl: string) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Не авторизован" }

  try {
    await prisma.$transaction(async (tx) => {
      // Обновляем ордер
      await tx.order.update({
        where: { id: orderId, buyerId: session.user.id },
        data: {
          status: "PAYMENT_SUBMITTED",
          paymentProof: proofUrl
        }
      })

      // Добавляем системное сообщение
      await tx.chatMessage.create({
        data: {
          orderId,
          senderId: session.user.id,
          text: `📸 Покупатель прикрепил чек об оплате и ожидает подтверждения от продюсера.`,
          isSystem: true
        }
      })
    })

    revalidatePath(`/orders/${orderId}`)
    revalidatePath(`/studio/inquiries/${orderId}`)
    return { success: true }
  } catch (error) {
    return { success: false, error: "Ошибка подтверждения оплаты" }
  }
}

// 3. Изменение статуса ордера (для Продюсера или Модератора)
export async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Не авторизован" }

    // Используем транзакцию для безопасности
    await prisma.$transaction(async (tx) => {
      // 1. Обновляем статус самого заказа
      const order = await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus as any },
        include: { 
          items: { 
            include: { license: { include: { template: true } } } 
          } 
        }
      })

      // 2. Если сделка успешно оплачена, проверяем на наличие Эксклюзива
      if (newStatus === "PAID") {
        const hasExclusive = order.items.some(
          item => item.license.template.slug === "exclusive"
        )

        // 3. Снимаем все треки из этого заказа с продажи
        if (hasExclusive) {
          for (const item of order.items) {
            await tx.track.update({
              where: { id: item.trackId },
              data: { 
                isActive: false, // Прячем из каталога платформы
                exclusiveAvailable: false // Блокируем повторную продажу эксклюзива
              }
            })
          }
        }
      }
      
      // Системное сообщение в чат
      await tx.chatMessage.create({
        data: {
          orderId: order.id,
          senderId: session.user.id,
          text: `Статус сделки изменен на: ${newStatus}`,
          isSystem: true
        }
      })
    })

    return { success: true }
  } catch (error) {
    console.error("Ошибка при обновлении статуса:", error)
    return { success: false, error: "Ошибка при обновлении статуса" }
  }
}