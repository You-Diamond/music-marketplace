"use server"

import prisma from "@/lib/prisma"

export async function getContent(type: "beats" | "playlists" | "packs", params: any) {
  switch (type) {
    case "beats":
      return await prisma.track.findMany({
        where: { isActive: true, ...(params.genre && { genre: { slug: params.genre } }) },
        include: { producer: true, genre: true }
      });
    case "playlists":
      return await prisma.playlist.findMany({
        where: { isActive: true },
        include: { _count: { select: { tracks: true } } }
      });
    case "packs":
      return await prisma.soundPack.findMany({
        where: { isActive: true }
      });
  }
}