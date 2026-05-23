import * as React from "react"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import prisma from "@/lib/prisma" // Ваш инстанс Prisma Client
import BeatDetailsClient from "@/components/beats/beat-details-client"
import { Prisma } from "@prisma/client"

// 1. Строгое описание типов на основе автогенерируемого Payload от Prisma
export type FullTrackPayload = Prisma.TrackGetPayload<{
  include: {
    producer: { select: { id: true; username: true; displayName: true } }
    genre: true
    moods: true
    licenses: { include: { template: true } }
  }
}>

export type RelatedTrackPayload = Prisma.TrackGetPayload<{
  include: {
    producer: { select: { id: true; username: true; displayName: true } }
  }
}>

interface PageProps {
  params: Promise<{ id: string }>
}

async function getBeatPageData(id: string) {
  try {
    // Получаем основной трек строго по схеме
    const track = await prisma.track.findUnique({
      where: { id, isActive: true },
      include: {
        producer: {
          select: { id: true, username: true, displayName: true }
        },
        genre: true, // Прямая связь 1:N
        moods: true, // Прямая связь M:N
        licenses: {
          where: { isActive: true },
          include: { template: true }
        }
      }
    })

    if (!track) return null

    const moodIds = track.moods.map((m) => m.id)

    // МАСШТАБНЫЕ РЕКОМЕНДАЦИИ в один проход
    // Берем до 16 кандидатов, чтобы распределить их на клиенте по вкладкам
    const candidateTracks = await prisma.track.findMany({
      where: {
        id: { not: track.id },
        isActive: true,
        OR: [
          { producerId: track.producerId }, // Тот же автор
          { genreId: track.genreId }, // Тот же жанр
          { moods: { some: { id: { in: moodIds } } } } // Пересекающиеся настроения
        ]
      },
      include: {
        producer: {
          select: { id: true, username: true, displayName: true }
        }
      },
      take: 16
    })

    // Разделение логики рекомендаций на стороне сервера
    const sameProducer: RelatedTrackPayload[] = []
    const similarStyle: RelatedTrackPayload[] = []

    candidateTracks.forEach((t) => {
      if (t.producerId === track.producerId) {
        sameProducer.push(t)
      } else {
        similarStyle.push(t)
      }
    })

    return {
      track: track as FullTrackPayload,
      recommendations: {
        sameProducer: sameProducer.slice(0, 4), // До 4 треков автора
        similarStyle: similarStyle.slice(0, 6) // До 6 треков по стилю
      }
    }
  } catch (error) {
    console.error("Critical error inside getBeatPageData:", error)
    return null
  }
}

// 2. Валидные SEO-метаданные без фантомных полей
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const data = await getBeatPageData(id)
  
  if (!data) return { title: "Бит не найден | Платформа" }

  const { track } = data
  const author = track.producer.displayName || `@${track.producer.username}`
  
  return {
    title: `Купить бит "${track.title}" (${track.bpm} BPM, ${track.musicKey}) - ${author}`,
    description: `Прослушать и приобрести коммерческие права на бит "${track.title}" в жанре ${track.genre.name} от музыкального продюсера ${author}.`,
    openGraph: {
      title: `Бит "${track.title}" от ${author}`,
      images: track.image ? [{ url: track.image }] : []
    }
  }
}

export default async function BeatPage({ params }: PageProps) {
  const { id } = await params
  const data = await getBeatPageData(id)

  if (!data) {
    notFound()
  }

  return (
    <BeatDetailsClient 
      track={data.track} 
      sameProducer={data.recommendations.sameProducer} 
      similarStyle={data.recommendations.similarStyle} 
    />
  )
}