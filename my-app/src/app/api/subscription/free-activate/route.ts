import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await auth()

    // 1. Проверяем авторизацию пользователя
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // 2. Обновляем пользователя в базе данных PostgreSQL
    // Переводим роль в PRODUCER, а статус подписки в ACTIVE
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        role: "PRODUCER",
        subscriptionStatus: "ACTIVE",
        // Если в будущем добавишь SubscriptionPlan в БД, можно привязать ID здесь
      },
    })

    return NextResponse.json({
      success: true,
      message: "Режим продюсера успешно активирован",
      role: updatedUser.role,
      status: updatedUser.subscriptionStatus
    })

  } catch (error) {
    console.error("[FREE_ACTIVATE_ERROR]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}