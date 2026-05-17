export type BeatStatus =
  | "published"
  | "draft"
  | "scheduled"

export type StudioBeat = {
  id: number

  publicId: string

  title: string

  image: string

  bpm: number

  musicKey: string

  genre: string

  createdAt: string

  plays: number

  sales: number

  revenue: number

  status: BeatStatus
}

export type StudioAnalytics = {
  totalRevenue: number

  totalSales: number

  totalPlays: number

  followers: number
}