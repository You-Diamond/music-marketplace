import { Order } from "@/types/order"

export const ordersMock: Order[] =
  [
    {
      id: "ORD-10491",

      createdAt:
        "2025-08-01",

      status: "paid",

      total: 149,

      beat: {
        id: 1,

        publicId:
          "1-dark-horizon",

        title:
          "Dark Horizon",

        image:
          "/images/beat-1.jpg",
      },

      license: {
        id: "unlimited",

        title:
          "Unlimited License",

        price: 149,
      },

      customer: {
        email:
          "artistx@gmail.com",

        firstName:
          "Alex",

        lastName:
          "Brown",

        country:
          "United States",
      },
    },

    {
      id: "ORD-10492",

      createdAt:
        "2025-08-02",

      status: "pending",

      total: 79,

      beat: {
        id: 2,

        publicId:
          "2-neon-rage",

        title:
          "Neon Rage",

        image:
          "/images/beat-2.jpg",
      },

      license: {
        id: "premium",

        title:
          "Premium Lease",

        price: 79,
      },

      customer: {
        email:
          "nightvibe@gmail.com",

        firstName:
          "Mark",

        lastName:
          "Stone",

        country:
          "Germany",
      },
    },
  ]