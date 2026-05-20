"use server"

import prisma from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function getBeats(searchParams: any) {
  const { query, genre, bpmMin, bpmMax, sortBy } = searchParams;

  const where: Prisma.TrackWhereInput = { isActive: true };
  
  if (genre && genre !== "all") where.genre = { slug: genre };
  
  if (query) {
    where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { producer: { username: { contains: query, mode: "insensitive" } } }
    ];
  }

  if (bpmMin || bpmMax) {
    where.bpm = { 
      gte: parseInt(bpmMin || "60"), 
      lte: parseInt(bpmMax || "180") 
    };
  }

  // Исправленная сортировка
  const orderBy: Prisma.TrackOrderByWithRelationInput = 
    sortBy === "plays" ? { plays: "desc" } : { createdAt: "desc" };

  return await prisma.track.findMany({
    where,
    orderBy,
    include: { producer: true, genre: true, licenses: true }
  });
}