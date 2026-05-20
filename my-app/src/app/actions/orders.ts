"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export interface OrderInput {
  trackId: string
  trackTitle: string
  licenseId: string
  licenseName: string
  price: number
  producerId: string
}

export async function createOrdersFromCart(cartItems: OrderInput[]) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: "Вы должны быть авторизованы" }
  }

  const buyerId = session.user.id

  if (!cartItems || cartItems.length === 0) {
    return { success: false, error: "Корзина пуста" }
  }

  try {
    // 1. Группируем элементы корзины по продюсерам
    const groupedByProducer: Record<string, OrderInput[]> = {}
    
    cartItems.forEach((item) => {
      if (!item.producerId) {
        console.error("Ошибка: у трека в корзине нет producerId", item)
        return
      }

      if (!groupedByProducer[item.producerId]) {
        groupedByProducer[item.producerId] = []
      }
      groupedByProducer[item.producerId].push(item)
    })

    const createdOrderIds: string[] = []

    // 2. Выполняем транзакцию в БД
    await prisma.$transaction(async (tx) => {
      for (const producerId in groupedByProducer) {
        const itemsForProducer = groupedByProducer[producerId]

        // Получаем данные продюсера
        const producer = await tx.user.findUnique({
          where: { id: producerId },
          select: { id: true, displayName: true, telegram: true }
        })

        if (!producer) {
          console.error(`Критическая ошибка: Пользователь с ID ${producerId} не найден в БД!`)
          throw new Error("Продавец не найден")
        }

        // Создаем ордер
        const order = await tx.order.create({
          data: {
            buyerId,
            sellerId: producerId,
            status: "PENDING_PAYMENT",
            items: {
              create: itemsForProducer.map((item) => ({
                trackId: item.trackId,
                licenseId: item.licenseId,
              }))
            }
          }
        })

        const orderTotal = itemsForProducer.reduce((sum, item) => sum + item.price, 0)
        
        const tracksListString = itemsForProducer
          .map((item) => `• ${item.trackTitle} [Лицензия: ${item.licenseName}] — $${item.price}`)
          .join("\n")

        // 3. Создаем автоматическое стартовое системное сообщение в чат
        const systemText = `👋 Сделка инициирована!\n\nПокупатель @${session.user.name || "User"} хочет приобрести следующие треки:\n${tracksListString}\n\n💰 Итого к оплате напрямую продюсеру: $${orderTotal}\n\n👉 Инструкция для покупателя: Свяжитесь с продюсером (TG: ${producer?.telegram || "не указан"}), переведите средства по договоренности, прикрепите чек оплаты (кнопка ниже) и ожидайте подтверждения сделки от автора.`

        await tx.chatMessage.create({
          data: {
            orderId: order.id,
            senderId: buyerId,
            text: systemText,
            isSystem: true
          }
        })

        // Создаем уведомление для продюсера в CRM
        await tx.notification.create({
          data: {
            userId: producerId,
            type: "INQUIRY_RECEIVED",
            title: "Новый запрос на покупку",
            description: `Пользователь хочет купить ваши биты на сумму $${orderTotal}. Перейдите в Студию.`
          }
        })

        createdOrderIds.push(order.id)
      }

      // 4. Очищаем корзину в БАЗЕ ДАННЫХ после успешного создания всех ордеров
      await tx.cartItem.deleteMany({
        where: { userId: buyerId }
      })
    })

    revalidatePath("/cart")
    return { success: true, orderIds: createdOrderIds }

  } catch (error: any) {
    console.error("Ошибка при создании ордера в транзакции:", error)
    return { success: false, error: "Не удалось оформить запрос. Попробуйте позже." }
  }
}