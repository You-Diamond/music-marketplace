import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const query = searchParams.get("query") || ""
    const genreSlug = searchParams.get("genre")
    const producerUsername = searchParams.get("producer") // Достаем продюсера из параметров
    const bpmMin = searchParams.get("bpmMin")
    const bpmMax = searchParams.get("bpmMax")
    const musicKey = searchParams.get("musicKey")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const order = searchParams.get("order") || "desc"

    const whereClause: Prisma.TrackWhereInput = {}

    // Чтобы в каталоге отображались только активные биты
    whereClause.isActive = true

    // Полнотекстовый поиск по названию или тегам
    if (query) {
      whereClause.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { tags: { has: query.toLowerCase() } }
      ]
    }

    // Фильтр по слагу жанра
    if (genreSlug && genreSlug !== "all") {
      whereClause.genre = {
        slug: genreSlug
      }
    }

    // Фильтр по юзернейму продюсера (Связываем с фронтендом профиля)
    if (producerUsername) {
      whereClause.producer = {
        username: producerUsername
      }
    }

    // Диапазон BPM
    if (bpmMin || bpmMax) {
      whereClause.bpm = {
        gte: bpmMin ? parseInt(bpmMin) : 0,
        lte: bpmMax ? parseInt(bpmMax) : 300,
      }
    }

    // Музыкальная тональность
    if (musicKey && musicKey !== "all") {
      whereClause.musicKey = musicKey
    }

    const beats = await prisma.track.findMany({
      where: whereClause,
      include: {
        producer: {
          select: {
            username: true,
            displayName: true,
            avatar: true,
            biography: true,  
          }
        },
        genre: true,
        licenses: {
          orderBy: { price: "asc" },
        },
      },
      orderBy: {
        [sortBy]: order as Prisma.SortOrder,
      },
    })

    return NextResponse.json(beats)
  } catch (error) {
    console.error("Ошибка при поиске битов:", error)
    return NextResponse.json({ error: "Ошибка сервера при поиске" }, { status: 500 })
  }
}