export type ProfileSettings =
  {
    firstName: string

    lastName: string

    displayName: string

    username: string

    biography: string

    location: string

    avatar?: string

    banner?: string
  }

export type CredentialsSettings =
  {
    email: string

    phoneNumber: string
  }

export type SocialLinksSettings =
  {
    instagram?: string

    youtube?: string

    tiktok?: string

    soundcloud?: string

    twitch?: string

    telegram?: string

    vk?: string
  }

export type Address =
  {
    companyName?: string

    firstName: string

    lastName: string

    phone: string

    unit?: string

    streetAddress: string

    city: string

    stateOrProvince: string

    country: string

    zipCode: string
  }

export type NotificationPreferences =
  {
    likes: boolean

    follows: boolean

    playlistAdds: boolean

    purchases: boolean

    comments: boolean

    marketingEmails: boolean

    collaborationRequests: boolean

    productUpdates: boolean
  }

export type SecuritySettings =
  {
    twoFactorEnabled: boolean

    loginAlerts: boolean
  }

export type UserSettings =
  {
    profile: ProfileSettings

    credentials: CredentialsSettings

    socials: SocialLinksSettings

    billingAddress: Address

    shippingAddress: Address

    notifications: NotificationPreferences

    security: SecuritySettings
  }