export type DiscoverFilters = {
  search: string

  genres: string[]

  moods: string[]

  keys: string[]

  bpmRange: [number, number]

  sortBy:
    | "trending"
    | "newest"
    | "popular"
    | "price_low"
    | "price_high"
}