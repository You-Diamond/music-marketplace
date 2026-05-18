import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const trendingTracks = await prisma.track.findMany({
      // Для примера берем 5 треков с наибольшим числом прослушиваний
      orderBy: {
        plays: 'desc',
      },
      take: 5,
      include: {
        producer: {
          select: {
            username: true,
            displayName: true,
          }
        },
        licenses: true,
      },
    })

    return NextResponse.json(trendingTracks)
  } catch (error) {
    console.error("Ошибка при получении популярных треков:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}