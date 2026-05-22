import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")?.toLowerCase() || ""

    if (!query) {
      return NextResponse.json([])
    }

    // Ищем активные треки, у которых есть теги, частично совпадающие с запросом
    const tracksWithTags = await prisma.track.findMany({
      where: {
        isActive: true,
        tags: {
          hasSome: [query] 
        }
      },
      select: { tags: true }
    })

    // Если топорный hasSome от Prisma не покрыл подстроки (contains),
    // добираем данные и фильтруем массив на стороне сервера:
    const allTracks = await prisma.track.findMany({
      where: { isActive: true },
      select: { tags: true }
    })

    const uniqueTags = new Set<string>()
    allTracks.forEach(track => {
      if (Array.isArray(track.tags)) {
        track.tags.forEach(tag => {
          const cleanTag = tag.toLowerCase().trim()
          if (cleanTag.includes(query)) {
            uniqueTags.add(cleanTag)
          }
        })
      }
    })

    // Ограничиваем выдачу 7 элементами, чтобы не перегружать интерфейс
    return NextResponse.json(Array.from(uniqueTags).slice(0, 7))
  } catch (error) {
    console.error("Ошибка автокомплита тегов:", error)
    return NextResponse.json([], { status: 500 })
  }
}