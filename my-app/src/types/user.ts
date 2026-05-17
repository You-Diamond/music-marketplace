export type UserStats = {
  followers: number

  totalPlays: number

  totalBeats: number
}

export type UserSocials = {
  instagram?: string

  youtube?: string

  soundcloud?: string

  tiktok?: string

  telegram?: string

  twitch?: string

  vk?: string
}

export type BillingAddress = {
  companyName?: string

  firstName: string

  lastName: string

  phone: string

  apartment?: string

  streetAddress: string

  city: string

  state: string

  country: string

  zipCode: string
}

export type ShippingAddress = {
  firstName: string

  lastName: string

  phone: string

  apartment?: string

  streetAddress: string

  city: string

  state: string

  country: string

  zipCode: string
}

export type UserNotifications = {
  likes: boolean

  playlists: boolean

  followers: boolean

  purchases: boolean

  comments: boolean

  marketing: boolean
}

export type User = {
  id: string

  username: string

  displayName: string

  firstName?: string

  lastName?: string

  email: string

  phone?: string

  biography?: string

  location?: string

  avatar?: string

  stats: UserStats

  socials: UserSocials

  billingAddress?: BillingAddress

  shippingAddress?: ShippingAddress

  notifications: UserNotifications
}