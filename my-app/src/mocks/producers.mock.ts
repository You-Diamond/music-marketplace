import { Producer } from "@/types/producer"

export const producersMock: Producer[] =
  [
    {
      id: "1",

      username:
        "nightfall",

      displayName:
        "Nightfall",

      email:
        "nightfall@example.com",

      biography:
        "Dark trap producer creating cinematic and atmospheric beats.",

      location:
        "Toronto, Canada",

      avatar:
        "/images/avatar-1.jpg",

      verified: true,

      genres: [
        "Dark Trap",
        "Rage",
      ],

      website:
        "https://nightfall.com",

      socials: {
        instagram:
          "https://instagram.com/nightfall",

        youtube:
          "https://youtube.com/nightfall",

        soundcloud:
          "https://soundcloud.com/nightfall",
      },

      notifications:
        {
          likes: true,

          playlists: true,

          followers: true,

          purchases: true,

          comments: true,

          marketing: false,
        },

      stats: {
        followers:
          21400,

        totalPlays:
          482000,

        totalBeats:
          48,

        totalSales:
          1830,

        rating: 4.9,
      },
    },
  ]