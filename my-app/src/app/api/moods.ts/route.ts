import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    const moods = await prisma.mood.findMany({
      orderBy: { name: "asc" }
    })
    return NextResponse.json(moods)
  } catch (error) {
    console.error("Ошибка при получении настроений:", error)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 })
  }
}