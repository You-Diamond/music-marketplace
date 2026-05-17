import { Collection } from "@/types/collection"

export const collectionsMock: Collection[] =
  [
    {
      id: 1,

      title:
        "Dark Night Pack",

      description:
        "Dark cinematic trap collection for modern artists.",

      cover:
        "/images/beat-1.jpg",

      creatorUsername:
        "Night808",

      beatsCount: 12,

      totalPlays:
        184000,

      createdAt:
        "2025-01-12",

      tags: [
        "Trap",
        "Dark",
        "Phonk",
      ],
    },

    {
      id: 2,

      title:
        "Phonk Essentials",

      description:
        "Hard phonk and drift-ready instrumentals.",

      cover:
        "/images/beat-2.jpg",

      creatorUsername:
        "Night808",

      beatsCount: 8,

      totalPlays:
        92000,

      createdAt:
        "2025-02-04",

      tags: [
        "Phonk",
        "Drift",
      ],
    },
  ]