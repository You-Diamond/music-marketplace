import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const query = searchParams.get("query") || ""
    const type = searchParams.get("type") || "all"
    const sortBy = searchParams.get("sortBy") || "createdAt"

    const whereClause: Prisma.PlaylistWhereInput = {
      isActive: true, // Показываем только активные плейлисты
    }

    // 1. Полнотекстовый поиск по названию или описанию плейлиста
    if (query) {
      whereClause.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } }
      ]
    }

    // 2. Фильтрация по типу плейлиста (согласно вашей логике в схеме и сайдбаре)
    if (type !== "all") {
      if (type === "featured") {
        whereClause.isFeatured = true
      } else {
        // Фильтр по полю type в модели Playlist ("albums", "moods" и т.д.)
        whereClause.type = type
      }
    }

    // 3. Сортировка плейлистов
    let orderByClause: Prisma.PlaylistOrderByWithRelationInput = {}
    
    if (sortBy === "popular") {
      // Так как у плейлистов нет счетчика лайков, сортируем по популярности треков внутри них
      // Либо временно оставляем сортировку по новизне/просмотрам, если поле будет добавлено.
      // Для стабильности отсортируем по дате обновления (самые свежие подборки)
      orderByClause = { updatedAt: "desc" }
    } else {
      // По умолчанию сортируем по дате создания (sortBy === 'createdAt')
      orderByClause = { createdAt: "desc" }
    }

    const playlists = await prisma.playlist.findMany({
      where: whereClause,
      include: {
        // Подтягиваем настроения, привязанные к плейлисту
        moods: true,
        // Считаем количество треков для вывода "{playlist._count.tracks} треков" в page.tsx
        _count: {
          select: { tracks: true }
        }
      },
      orderBy: orderByClause,
    })

    return NextResponse.json(playlists)
  } catch (error) {
    console.error("Ошибка при поиске плейлистов:", error)
    return NextResponse.json({ error: "Ошибка сервера при поиске" }, { status: 500 })
  }
}