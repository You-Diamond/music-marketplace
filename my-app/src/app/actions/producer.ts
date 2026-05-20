// app/actions/producer.ts
"use server"

import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function activateProducerMode() {
  const session = await auth()
  if (!session?.user?.id) throw new Error("Не авторизован")

  // Обновляем роль пользователя на PRODUCER
  const updatedUser = await prisma.user.update({
    where: { id: session.user.id },
    data: { role: "PRODUCER" }
  })

  return { success: true, user: updatedUser }
}