import { Conversation } from "@/types/message"

export const conversationsMock: Conversation[] =
  [
    {
      id: "conv_1",

      participants: [
        {
          id: "user_2",

          username:
            "artistx",

          displayName:
            "ARTISTX",

          avatar:
            "/images/avatar-1.jpg",

          verified: true,
        },
      ],

      lastMessage:
        "Can you send stems version?",

      lastMessageAt:
        "2m ago",

      unreadCount: 2,

      messages: [
        {
          id: "msg_1",

          senderId:
            "user_2",

          content:
            "Yo bro, I bought the unlimited license.",

          createdAt:
            "12:42",

          read: true,
        },

        {
          id: "msg_2",

          senderId:
            "me",

          content:
            "Appreciate it 🙏",

          createdAt:
            "12:44",

          read: true,
        },

        {
          id: "msg_3",

          senderId:
            "user_2",

          content:
            "Can you send stems version?",

          createdAt:
            "12:48",

          read: false,
        },
      ],
    },

    {
      id: "conv_2",

      participants: [
        {
          id: "user_3",

          username:
            "nightvibe",

          displayName:
            "NIGHTVIBE",

          avatar:
            "/images/avatar-2.jpg",
        },
      ],

      lastMessage:
        "This beat is insane.",

      lastMessageAt:
        "1h ago",

      unreadCount: 0,

      messages: [],
    },
  ]