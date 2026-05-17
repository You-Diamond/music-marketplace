import { ProducerDashboard } from "@/types/dashboard"

export const dashboardMock: ProducerDashboard =
  {
    stats: {
      totalRevenue:
        18420,

      totalSales: 492,

      totalFollowers:
        21400,

      totalPlays:
        1840000,

      totalBeats: 38,
    },

    revenueChart: [
      {
        month: "Jan",
        revenue: 1200,
      },

      {
        month: "Feb",
        revenue: 1800,
      },

      {
        month: "Mar",
        revenue: 2400,
      },

      {
        month: "Apr",
        revenue: 2200,
      },

      {
        month: "May",
        revenue: 3100,
      },

      {
        month: "Jun",
        revenue: 3900,
      },
    ],

    recentSales: [
      {
        id: "sale_1",

        beatTitle:
          "Dark Horizon",

        licenseTitle:
          "Unlimited",

        buyerUsername:
          "artistx",

        amount: 149,

        createdAt:
          "2h ago",
      },

      {
        id: "sale_2",

        beatTitle:
          "Neon Rage",

        licenseTitle:
          "WAV Lease",

        buyerUsername:
          "nightvibe",

        amount: 59,

        createdAt:
          "5h ago",
      },
    ],

    beats: [
      {
        id: 1,

        publicId:
          "1-dark-horizon",

        title:
          "Dark Horizon",

        image:
          "/images/beat-1.jpg",

        genre:
          "Dark Trap",

        bpm: 140,

        musicKey: "Fm",

        plays: 184000,

        sales: 82,

        revenue: 6400,

        createdAt:
          "2025-01-04",

        featured: true,
      },

      {
        id: 2,

        publicId:
          "2-neon-rage",

        title:
          "Neon Rage",

        image:
          "/images/beat-2.jpg",

        genre:
          "Phonk",

        bpm: 154,

        musicKey: "Dm",

        plays: 92000,

        sales: 43,

        revenue: 3100,

        createdAt:
          "2025-02-11",

        featured: false,
      },
    ],
  }