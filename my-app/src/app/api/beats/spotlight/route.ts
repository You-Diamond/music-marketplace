import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
  try {
    let tracks = await prisma.track.findMany({
      where: { featured: true },
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
          include: { template: true } // Обязательно подтягиваем шаблон для фронтенда!
        },
      },
      take: 3,
    })

    if (tracks.length === 0) {
      const defaultProducer = await prisma.user.upsert({
        where: { username: "808mafia" },
        update: {},
        create: {
          email: "producer@beatmarket.com",
          username: "808mafia",
          displayName: "808 Mafia",
          role: "PRODUCER",
          verified: true,
        },
      })

      // Создаем базовый глобальный шаблон лицензии для этого продюсера
      const defaultTemplate = await prisma.licenseTemplate.upsert({
        where: { id: "default-mp3-template-uuid" },
        update: {},
        create: {
          id: "default-mp3-template-uuid",
          name: "Basic Lease",
          slug: "basic",
          defaultPrice: 29.99,
          fileType: "MP3_TAGGED",
          producerId: defaultProducer.id,
          distributionCopies: 5000
        }
      })

      const trapGenre = await prisma.genre.upsert({ where: { slug: "trap" }, update: {}, create: { name: "Trap", slug: "trap" } })
      const hyperpopGenre = await prisma.genre.upsert({ where: { slug: "hyperpop" }, update: {}, create: { name: "Hyperpop", slug: "hyperpop" } })
      const drillGenre = await prisma.genre.upsert({ where: { slug: "drill" }, update: {}, create: { name: "Drill", slug: "drill" } })

      const seedTracks = [
        { title: "OVERDRIVE", bpm: 140, musicKey: "A Minor", duration: 165, image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=1200", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", featured: true, producerId: defaultProducer.id, genreId: trapGenre.id },
        { title: "NEON DREAMS", bpm: 160, musicKey: "F# Minor", duration: 142, image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", featured: true, producerId: defaultProducer.id, genreId: hyperpopGenre.id },
        { title: "DARK MATTER", bpm: 142, musicKey: "D Minor", duration: 180, image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200", audio: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", featured: true, producerId: defaultProducer.id, genreId: drillGenre.id },
      ]

      for (const trackData of seedTracks) {
        await prisma.track.create({
          data: {
            ...trackData,
            licenses: {
              create: {
                price: 29.99,
                isActive: true,
                templateId: defaultTemplate.id // Привязываем к шаблону
              },
            },
          },
        })
      }

      tracks = await prisma.track.findMany({
        where: { featured: true },
        include: {
          producer: { select: { username: true, displayName: true, avatar: true, biography: true } },
          genre: true,
          licenses: { include: { template: true } },
        },
        take: 3,
      })
    }

    return NextResponse.json(tracks)
  } catch (error) {
    console.error("Ошибка при получении spotlight треков:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}