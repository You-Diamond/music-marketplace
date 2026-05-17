import { ProducerAnalytics } from "@/types/analytics"

export const analyticsMock: ProducerAnalytics =
  {
    totalStreams: {
      label:
        "Total Streams",

      value: 2482193,

      growth: 12.4,
    },

    totalSales: {
      label:
        "Total Sales",

      value: 1842,

      growth: 8.2,
    },

    followers: {
      label:
        "Followers",

      value: 92841,

      growth: 21.1,
    },

    revenue: {
      label:
        "Revenue",

      value: 48291,

      growth: 18.7,
    },

    streamsChart: [
      {
        label: "Jan",
        value: 12000,
      },

      {
        label: "Feb",
        value: 18000,
      },

      {
        label: "Mar",
        value: 26000,
      },

      {
        label: "Apr",
        value: 31000,
      },

      {
        label: "May",
        value: 42000,
      },

      {
        label: "Jun",
        value: 51000,
      },
    ],

    salesChart: [
      {
        label: "Jan",
        value: 80,
      },

      {
        label: "Feb",
        value: 120,
      },

      {
        label: "Mar",
        value: 160,
      },

      {
        label: "Apr",
        value: 210,
      },

      {
        label: "May",
        value: 320,
      },

      {
        label: "Jun",
        value: 410,
      },
    ],

    topCountries: [
      {
        country:
          "United States",

        value: 42,
      },

      {
        country:
          "Germany",

        value: 18,
      },

      {
        country:
          "United Kingdom",

        value: 15,
      },

      {
        country:
          "France",

        value: 10,
      },
    ],

    topBeats: [
      {
        id: 1,

        publicId:
          "1-dark-horizon",

        title:
          "Dark Horizon",

        streams: 482193,

        revenue: 12491,
      },

      {
        id: 2,

        publicId:
          "2-neon-rage",

        title:
          "Neon Rage",

        streams: 291442,

        revenue: 8921,
      },
    ],
  }