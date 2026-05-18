import { NextResponse, NextRequest } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    // Ищем продюсера в базе данных по юзернейму
    const producer = await prisma.user.findUnique({
      where: { username: username },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        biography: true,
        verified: true,
        // Считаем количество его битов, не выкачивая их все сразу
        _count: {
          select: { tracks: true } 
        }
      }
    })

    // Проверяем, существует ли пользователь и является ли он продюсером
    if (!producer) {
      return NextResponse.json({ error: "Продюсер не найден" }, { status: 404 })
    }

    // Отдельно подгружаем все биты этого продюсера со всеми связями
    const beats = await prisma.track.findMany({
      where: { producerId: producer.id },
      include: {
        genre: true,
        licenses: {
          orderBy: { price: "asc" }
        },
        producer: {
          select: {
            username: true,
            displayName: true,
            avatar: true,
          }
        }
      },
      orderBy: { createdAt: "desc" } // Свежие биты вверху
    })

    return NextResponse.json({
      profile: producer,
      beats: beats
    })
  } catch (error) {
    console.error("Ошибка при получении профиля продюсера:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}