import { Notification } from "@/types/notification"

export const notificationsMock: Notification[] =
  [
    {
      id: "notif_1",

      type: "purchase",

      title:
        "New Purchase",

      description:
        "ARTISTX purchased Unlimited License for Dark Horizon.",

      createdAt:
        "2m ago",

      read: false,

      href:
        "/orders",

      image:
        "/images/avatar-1.jpg",
    },

    {
      id: "notif_2",

      type: "follow",

      title:
        "New Follower",

      description:
        "NIGHTVIBE started following you.",

      createdAt:
        "12m ago",

      read: false,

      href:
        "/vision",

      image:
        "/images/avatar-2.jpg",
    },

    {
      id: "notif_3",

      type: "playlist",

      title:
        "Playlist Added",

      description:
        "Your beat was added to Night Drive playlist.",

      createdAt:
        "1h ago",

      read: true,

      href:
        "/playlists",
    },

    {
      id: "notif_4",

      type: "message",

      title:
        "New Message",

      description:
        "You received a new collaboration request.",

      createdAt:
        "3h ago",

      read: true,

      href:
        "/messages",
    },
  ]