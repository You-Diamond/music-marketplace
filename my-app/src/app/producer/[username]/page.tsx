import * as React from "react"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import   prisma   from "@/lib/prisma"
import ProducerProfileClient from "@/components/producer/producer-profile-client"
import { Prisma } from "@prisma/client"

// Строго описываем payload данных продюсера со всеми его активными релизами и связями согласно schema.prisma
export type FullProducerPayload = Prisma.UserGetPayload<{
  include: {
    tracks: {
      where: { isActive: true }
      include: {
        genre: true
        moods: true
        licenses: { where: { isActive: true }; include: { template: true } }
      }
    }
    soundPacks: {
      where: { isActive: true }
    }
  }
}>

interface PageProps {
  params: Promise<{ username: string }>
}

async function getProducerData(username: string) {
  try {
    // Ищем пользователя по уникальному юзернейму
    const producer = await prisma.user.findUnique({
      where: { username },
      include: {
        tracks: {
          where: { isActive: true },
          include: {
            genre: true,
            moods: true,
            licenses: {
              where: { isActive: true },
              include: { template: true }
            }
          },
          orderBy: { createdAt: "desc" }
        },
        soundPacks: {
          where: { isActive: true },
          orderBy: { createdAt: "desc" }
        }
      }
    })

    // Проверяем, является ли пользователь продюсером
    if (!producer || producer.role !== "PRODUCER") return null

    return producer as FullProducerPayload
  } catch (error) {
    console.error("Error fetching producer data:", error)
    return null
  }
}

// SEO-оптимизация: Страница продюсера будет отлично выглядеть при шеринге в соцсетях
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  const producer = await prisma.user.findUnique({
    where: { username },
    select: { displayName: true, username: true, biography: true }
  })

  if (!producer) return { title: "Продюсер не найден" }

  const name = producer.displayName || `@${producer.username}`

  return {
    title: `${name} — Купить биты, драмкиты и пресеты онлайн`,
    description: producer.biography || `Официальная страница musical продюсера ${name}. Эксклюзивные биты, лицензии, саунд-паки и трекауты.`,
    openGraph: {
      title: `Битмейкер ${name} | Музыкальный Маркетплейс`,
      description: producer.biography || `Слушай и покупай биты онлайн.`,
    }
  }
}

export default async function ProducerPage({ params }: PageProps) {
  const { username } = await params
  const producer = await getProducerData(username)

  if (!producer) {
    notFound()
  }

  return <ProducerProfileClient producer={producer} />
}