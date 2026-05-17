import { Playlist } from "@/types/playlist"

export const playlistsMock: Playlist[] =
  [
    {
      id: "playlist_1",

      title:
        "Night Drive",

      description:
        "Dark atmospheric beats for late night sessions.",

      image:
        "/images/beat-1.jpg",

      creator: {
        username:
          "vision",

        displayName:
          "VISION",
      },

      followers: 12491,

      beats: [
        {
          id: 1,

          publicId:
            "1-dark-horizon",

          title:
            "Dark Horizon",

          author:
            "vision",

          image:
            "/images/beat-1.jpg",

          duration:
            "2:43",
        },

        {
          id: 2,

          publicId:
            "2-neon-rage",

          title:
            "Neon Rage",

          author:
            "vision",

          image:
            "/images/beat-2.jpg",

          duration:
            "3:12",
        },
      ],
    },
  ]