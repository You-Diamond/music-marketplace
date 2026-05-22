import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const query = searchParams.get("query") || ""
    const tagsParam = searchParams.get("tags")
    const genreSlug = searchParams.get("genre")
    const moodSlug = searchParams.get("mood") // Получаем слаг выбранного настроения
    const producerUsername = searchParams.get("producer")
    const bpmMin = searchParams.get("bpmMin")
    const bpmMax = searchParams.get("bpmMax")
    const musicKey = searchParams.get("musicKey")
    const sortBy = searchParams.get("sortBy") || "createdAt"
    const order = searchParams.get("order") || "desc"

    const whereClause: Prisma.TrackWhereInput = {}

    // Отображаем только активные биты
    whereClause.isActive = true

    // Текстовый поиск по названию
    if (query) {
      whereClause.title = { contains: query, mode: "insensitive" }
    }

    // Множественный поиск по тегам (AND-логика)
    if (tagsParam) {
      const tagsArray = tagsParam.split(",").map(t => t.trim().toLowerCase()).filter(Boolean)
      if (tagsArray.length > 0) {
        whereClause.tags = {
          hasEvery: tagsArray
        }
      }
    }

    // Фильтр по слагу жанра
    if (genreSlug && genreSlug !== "all") {
      whereClause.genre = {
        slug: genreSlug
      }
    }

    // ИСПРАВЛЕНО: Фильтр по слагу настроения для связи «многие-ко-многим» (moods)
    if (moodSlug && moodSlug !== "all") {
      whereClause.moods = {
        some: {
          slug: moodSlug
        }
      }
    }

    // Фильтр по юзернейму продюсера
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
        moods: true, // ИСПРАВЛЕНО: Включаем массив moods вместо mood
        licenses: {
          orderBy: { price: "asc" },
          include: {
            template: true
          }
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