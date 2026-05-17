export type SamplePack = {
  id: number

  title: string

  genre: string

  image: string

  price: number

  sounds: number

  tags: string[]
}

export const samplePacksMock: SamplePack[] =
  [
    {
      id: 1,

      title: "Dark Drift Kit",

      genre: "Phonk",

      image:
        "/images/defaults/default-pack.jpg",

      price: 29,

      sounds: 120,

      tags: [
        "cowbells",
        "dark",
        "drift",
        "phonk",
      ],
    },

    {
      id: 2,

      title: "Rage Essentials",

      genre: "Hyperpop",

      image:
        "/images/defaults/default-pack.jpg",

      price: 35,

      sounds: 95,

      tags: [
        "rage",
        "distorted",
        "hyper",
        "club",
      ],
    },

    {
      id: 3,

      title: "Ambient Dreams",

      genre: "Ambient",

      image:
        "/images/defaults/default-pack.jpg",

      price: 24,

      sounds: 70,

      tags: [
        "ambient",
        "space",
        "pads",
        "emotional",
      ],
    },
  ]