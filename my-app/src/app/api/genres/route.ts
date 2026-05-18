import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const genres = await prisma.genre.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" }
    })
    return NextResponse.json(genres)
  } catch (error) {
    return NextResponse.json({ error: "Не удалось загрузить жанры" }, { status: 500 })
  }
}