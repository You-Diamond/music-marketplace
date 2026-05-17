import {
  StudioAnalytics,
  StudioBeat,
} from "@/types/studio"

export const studioAnalyticsMock: StudioAnalytics =
  {
    totalRevenue: 12490,

    totalSales: 192,

    totalPlays: 482391,

    followers: 21491,
  }

export const studioBeatsMock: StudioBeat[] =
  [
    {
      id: 1,

      publicId:
        "1-dark-horizon",

      title:
        "Dark Horizon",

      image:
        "/images/beat-1.jpg",

      bpm: 140,

      musicKey:
        "F Minor",

      genre:
        "Dark Trap",

      createdAt:
        "2 days ago",

      plays: 28491,

      sales: 18,

      revenue: 1422,

      status:
        "published",
    },

    {
      id: 2,

      publicId:
        "2-neon-rage",

      title:
        "Neon Rage",

      image:
        "/images/beat-2.jpg",

      bpm: 154,

      musicKey:
        "D Minor",

      genre:
        "Rage",

      createdAt:
        "5 days ago",

      plays: 18392,

      sales: 11,

      revenue: 904,

      status:
        "published",
    },

    {
      id: 3,

      publicId:
        "3-lost-memory",

      title:
        "Lost Memory",

      image:
        "/images/beat-3.jpg",

      bpm: 128,

      musicKey:
        "A Minor",

      genre:
        "Ambient",

      createdAt:
        "Today",

      plays: 0,

      sales: 0,

      revenue: 0,

      status:
        "draft",
    },
  ]