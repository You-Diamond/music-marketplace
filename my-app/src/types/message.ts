export type ConversationUser = {
  id: string

  username: string

  displayName: string

  avatar?: string

  verified?: boolean
}

export type Message = {
  id: string

  senderId: string

  content: string

  createdAt: string

  read: boolean
}

export type Conversation = {
  id: string

  participants: ConversationUser[]

  lastMessage: string

  lastMessageAt: string

  unreadCount: number

  messages: Message[]
}