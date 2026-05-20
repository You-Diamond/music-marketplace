import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { Prisma, SoundPackCategory } from "@prisma/client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const query = searchParams.get("query") || ""
    const category = searchParams.get("category") || "all"
    const sortBy = searchParams.get("sortBy") || "createdAt"

    const whereClause: Prisma.SoundPackWhereInput = {
      isActive: true, // Показываем только активные сэмпл-паки
    }

    // 1. Полнотекстовый поиск по названию сэмпл-пака
    if (query) {
      whereClause.title = {
        contains: query,
        mode: "insensitive"
      }
    }

    // 2. Фильтрация по категории пака (из вашего Enum в schema.prisma)
    if (category !== "all") {
      // Приводим строку из URL к типу Enum, так как в базе они хранятся в верхнем регистре (DRUMKITS, LOOPS, PRESETS)
      whereClause.category = category.toUpperCase() as SoundPackCategory
    }

    // 3. Сортировка
    let orderByClause: Prisma.SoundPackOrderByWithRelationInput = {}
    
    if (sortBy === "popular") {
      // Если в будущем добавите счетчик скачиваний/просмотров пака, можно сортировать по нему.
      // Пока сделаем сортировку по цене (например, от дорогих к дешевым) или оставим по новизне.
      orderByClause = { createdAt: "desc" }
    } else if (sortBy === "price_asc") {
      orderByClause = { price: "asc" }
    } else if (sortBy === "price_desc") {
      orderByClause = { price: "desc" }
    } else {
      // По умолчанию: по дате создания (новые релизы)
      orderByClause = { createdAt: "desc" }
    }

    const soundPacks = await prisma.soundPack.findMany({
      where: whereClause,
      include: {
        // Обязательно подтягиваем автора пака, чтобы показать его на карточке
        producer: {
          select: {
            username: true,
            displayName: true,
            avatar: true,
          }
        }
      },
      orderBy: orderByClause,
    })

    return NextResponse.json(soundPacks)
  } catch (error) {
    console.error("Ошибка при поиске сэмпл-паков:", error)
    return NextResponse.json({ error: "Ошибка сервера при поиске паков" }, { status: 500 })
  }
}