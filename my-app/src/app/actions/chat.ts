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
export async function updateOrderStatus(orderId: string, newStatus: any) {
  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Не авторизован" }

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } })
      if (!order) throw new Error("Ордер не найден")

      // Добавляем проверку на покупателя
      const isBuyer = order.buyerId === session.user.id
      const isSeller = order.sellerId === session.user.id
      const isAdmin = session.user.role === "ADMIN"

      // Разрешаем действие, если это участник сделки ИЛИ админ
      // Если нужно ограничить, какой статус может ставить покупатель (например, только COMPLETED), 
      // можно добавить условие: if (isBuyer && newStatus !== "COMPLETED") ...
      if (!isSeller && !isAdmin && !isBuyer) throw new Error("Нет прав")

      await tx.order.update({
        where: { id: orderId },
        data: { status: newStatus }
      })

      let systemText = `⚙️ Статус сделки изменен на: **${newStatus}**`
      if (newStatus === "PAID") {
        systemText = `✅ Продюсер подтвердил получение средств! Сделка переведена в статус PAID.`
      } else if (newStatus === "COMPLETED") {
        systemText = `🎉 Сделка успешно завершена обеими сторонами. Спасибо за сотрудничество!`
      } else if (newStatus === "DISPUTE") {
        systemText = `🚨 Открыт официальный спор.`
      }

      await tx.chatMessage.create({
        data: {
          orderId,
          senderId: session.user.id,
          text: systemText,
          isSystem: true
        }
      })
    })

    revalidatePath(`/orders/${orderId}`)
    revalidatePath(`/studio/inquiries/${orderId}`)
    return { success: true }
  } catch (error: any) {
    console.error("Ошибка смены статуса:", error)
    return { success: false, error: error.message || "Ошибка смены статуса" }
  }
}