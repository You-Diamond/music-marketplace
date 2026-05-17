export type AnalyticsMetric = {
  label: string

  value: number

  growth: number
}

export type AnalyticsChartPoint = {
  label: string

  value: number
}

export type TopCountry = {
  country: string

  value: number
}

export type TopBeatAnalytics = {
  id: number

  publicId: string

  title: string

  streams: number

  revenue: number
}

export type ProducerAnalytics = {
  totalStreams: AnalyticsMetric

  totalSales: AnalyticsMetric

  followers: AnalyticsMetric

  revenue: AnalyticsMetric

  streamsChart: AnalyticsChartPoint[]

  salesChart: AnalyticsChartPoint[]

  topCountries: TopCountry[]

  topBeats: TopBeatAnalytics[]
}