export type DashboardStats =
  {
    totalRevenue: number

    totalSales: number

    totalFollowers: number

    totalPlays: number

    totalBeats: number
  }

export type RevenuePoint =
  {
    month: string

    revenue: number
  }

export type RecentSale =
  {
    id: string

    beatTitle: string

    licenseTitle: string

    buyerUsername: string

    amount: number

    createdAt: string
  }

export type ProducerBeat =
  {
    id: number

    publicId: string

    title: string

    image: string

    genre: string

    bpm: number

    musicKey: string

    plays: number

    sales: number

    revenue: number

    createdAt: string

    featured: boolean
  }

export type ProducerDashboard =
  {
    stats: DashboardStats

    revenueChart: RevenuePoint[]

    recentSales: RecentSale[]

    beats: ProducerBeat[]
  }