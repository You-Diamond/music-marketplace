import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import TrackListClient from "@/components/studio/TrackListClient"

export const dynamic = "force-dynamic"

export default async function StudioTracksPage() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "PRODUCER") redirect("/")

  const tracks = await prisma.track.findMany({
    where: { producerId: session.user.id },
    include: {
      genre: { select: { name: true } },
      _count: { select: { likes: true } },
      licenses: {
        include: { template: true },
        orderBy: { template: { defaultPrice: "asc" } }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return <TrackListClient initialTracks={tracks} />
}