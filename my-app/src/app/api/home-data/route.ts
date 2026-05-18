import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const [genres, playlists, soundPacks, topProducers] = await Promise.all([
      // 1. Динамические Жанры
      prisma.genre.findMany({
        where: { isActive: true },
        take: 10,
        include: { _count: { select: { tracks: true } } }
      }),

      // 2. Кураторские плейлисты (Избранные коллекции)
      prisma.playlist.findMany({
        where: { isFeatured: true, isActive: true },
        take: 3,
        include: { _count: { select: { tracks: true } } }
      }),

      // 3. Саунд-паки/Драм-киты
      prisma.soundPack.findMany({
        where: { isFeatured: true, isActive: true },
        take: 4,
        include: {
          producer: {
            select: { username: true, displayName: true }
          }
        }
      }),

      // 4. Топ продюсеров недели
      prisma.user.findMany({
        where: { isTopProducer: true },
        take: 6,
        select: {
          id: true,
          username: true,
          displayName: true,
          avatar: true,
          verified: true,
          _count: { select: { tracks: true } }
        }
      })
    ])

    return NextResponse.json({ genres, playlists, soundPacks, topProducers })
  } catch (error) {
    console.error("Home data fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard modules" }, { status: 500 })
  }
}