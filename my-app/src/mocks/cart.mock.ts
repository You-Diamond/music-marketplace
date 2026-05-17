import { CartItem } from "@/types/cart"

export const cartMock: CartItem[] =
  [
    {
      id: "1",

      beatId: 1,

      publicId:
        "dark-night",

      title:
        "Dark Night",

      producerUsername:
        "nightfall",

      producerDisplayName:
        "Nightfall",

      image:
        "/images/beat-1.jpg",

      bpm: 140,

      musicKey:
        "F Minor",

      price: 79,

      license: {
        id: "premium",

        title:
          "Premium",

        price: 79,

        wavIncluded: true,

        stemsIncluded: true,

        trackoutIncluded: true,

        unlimitedStreams: false,
      },
    },

    {
      id: "2",

      beatId: 2,

      publicId:
        "rage-world",

      title:
        "Rage World",

      producerUsername:
        "nightfall",

      producerDisplayName:
        "Nightfall",

      image:
        "/images/beat-2.jpg",

      bpm: 154,

      musicKey:
        "D Minor",

      price: 199,

      license: {
        id: "unlimited",

        title:
          "Unlimited",

        price: 199,

        wavIncluded: true,

        stemsIncluded: true,

        trackoutIncluded: true,

        unlimitedStreams: true,
      },
    },
  ]