export type Review = {
  id: string

  user: {
    id: string

    username: string

    displayName: string

    avatar?: string
  }

  rating: number

  comment: string

  createdAt: string
}