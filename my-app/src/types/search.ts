export type SearchCategory =
  | "beat"
  | "producer"
  | "playlist"

export type SearchResult = {
  id: string

  category: SearchCategory

  title: string

  subtitle?: string

  image?: string

  href: string
}

export type TrendingSearch = {
  id: string

  query: string
}