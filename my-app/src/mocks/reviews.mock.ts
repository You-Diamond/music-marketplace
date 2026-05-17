import { Review } from "@/types/review"

export const reviewsMock: Review[] =
  [
    {
      id: "review_1",

      user: {
        id: "user_1",

        username:
          "artistx",

        displayName:
          "ARTISTX",

        avatar:
          "/images/avatar-1.jpg",
      },

      rating: 5,

      comment:
        "Crazy quality. Mix is super clean and the melodies are insane.",

      createdAt:
        "2 days ago",
    },

    {
      id: "review_2",

      user: {
        id: "user_2",

        username:
          "nightvibe",

        displayName:
          "NIGHTVIBE",

        avatar:
          "/images/avatar-2.jpg",
      },

      rating: 5,

      comment:
        "One of the best producers on the platform. Instant purchase.",

      createdAt:
        "5 days ago",
    },

    {
      id: "review_3",

      user: {
        id: "user_3",

        username:
          "lilnova",

        displayName:
          "LILNOVA",
      },

      rating: 4,

      comment:
        "Very atmospheric beat. Would love stems included.",

      createdAt:
        "1 week ago",
    },
  ]