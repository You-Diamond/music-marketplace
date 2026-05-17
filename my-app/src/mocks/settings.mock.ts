import { UserSettings } from "@/types/settings"

export const settingsMock: UserSettings =
  {
    profile: {
      firstName:
        "Alex",

      lastName:
        "Vision",

      displayName:
        "VISION",

      username:
        "vision",

      biography:
        "Producer focused on dark trap, rage and cinematic sound design.",

      location:
        "Berlin, Germany",

      avatar:
        "/images/avatar-1.jpg",

      banner:
        "/images/banner-1.jpg",
    },

    credentials: {
      email:
        "vision@gmail.com",

      phoneNumber:
        "+49 000 000 000",
    },

    socials: {
      instagram:
        "https://instagram.com/vision",

      youtube:
        "https://youtube.com/@vision",

      soundcloud:
        "https://soundcloud.com/vision",

      telegram:
        "https://t.me/vision",
    },

    billingAddress:
      {
        companyName:
          "VISION STUDIO",

        firstName:
          "Alex",

        lastName:
          "Vision",

        phone:
          "+49 000 000 000",

        unit:
          "12A",

        streetAddress:
          "Main Street 1",

        city:
          "Berlin",

        stateOrProvince:
          "Berlin",

        country:
          "Germany",

        zipCode:
          "10115",
      },

    shippingAddress:
      {
        firstName:
          "Alex",

        lastName:
          "Vision",

        phone:
          "+49 000 000 000",

        unit:
          "12A",

        streetAddress:
          "Main Street 1",

        city:
          "Berlin",

        stateOrProvince:
          "Berlin",

        country:
          "Germany",

        zipCode:
          "10115",
      },

    notifications:
      {
        likes: true,

        follows: true,

        playlistAdds: true,

        purchases: true,

        comments: true,

        marketingEmails: false,

        collaborationRequests: true,

        productUpdates: true,
      },

    security: {
      twoFactorEnabled: false,

      loginAlerts: true,
    },
  }