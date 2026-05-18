import { NextResponse, NextRequest } from "next/server" // Используем NextRequest по стандарту
import prisma from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // Указываем, что params — это Promise
) {
  try {
    // Ждем разрешения Promise, чтобы достать id
    const { id } = await params

    const beat = await prisma.track.findUnique({
      where: { id: id },
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
    })

    if (!beat) {
      return NextResponse.json({ error: "Бит не найден" }, { status: 404 })
    }

    return NextResponse.json(beat)
  } catch (error) {
    console.error("Ошибка при получении бита:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}