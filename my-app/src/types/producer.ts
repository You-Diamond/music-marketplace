import { User } from "./user"

export type ProducerStats = {
  totalSales: number

  rating: number
}

export type Producer = User & {
  verified: boolean

  genres: string[]

  stats: User["stats"] &
    ProducerStats

  website?: string
}