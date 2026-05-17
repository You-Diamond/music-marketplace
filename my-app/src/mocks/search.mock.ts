import {
  SearchResult,
  TrendingSearch,
} from "@/types/search"

export const trendingSearchesMock: TrendingSearch[] =
  [
    {
      id: "trend_1",
      query: "dark trap",
    },

    {
      id: "trend_2",
      query: "rage beats",
    },

    {
      id: "trend_3",
      query: "phonk",
    },

    {
      id: "trend_4",
      query: "drill",
    },
  ]

export const searchResultsMock: SearchResult[] =
  [
    {
      id: "beat_1",

      category: "beat",

      title:
        "Dark Horizon",

      subtitle:
        "vision",

      image:
        "/images/beat-1.jpg",

      href:
        "/beat/1-dark-horizon",
    },

    {
      id: "beat_2",

      category: "beat",

      title:
        "Neon Rage",

      subtitle:
        "vision",

      image:
        "/images/beat-2.jpg",

      href:
        "/beat/2-neon-rage",
    },

    {
      id: "producer_1",

      category: "producer",

      title:
        "VISION",

      subtitle:
        "@vision",

      image:
        "/images/avatar-1.jpg",

      href:
        "/vision",
    },

    {
      id: "playlist_1",

      category: "playlist",

      title:
        "Night Drive",

      subtitle:
        "Playlist",

      image:
        "/images/beat-1.jpg",

      href:
        "/playlists",
    },
  ]