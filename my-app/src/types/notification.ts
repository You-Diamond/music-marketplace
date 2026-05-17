export type NotificationType =
  | "like"
  | "purchase"
  | "follow"
  | "playlist"
  | "message"

export type Notification = {
  id: string

  type: NotificationType

  title: string

  description: string

  createdAt: string

  read: boolean

  href?: string

  image?: string
}