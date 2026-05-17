export type AccountRole =
  | "user"
  | "producer"
  | "admin"

export type SubscriptionPlan =
  | "free"
  | "pro"
  | "unlimited"

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing"

export type AccountSettings =
  {
    emailVerified: boolean

    phoneVerified: boolean

    twoFactorEnabled: boolean

    onboardingCompleted: boolean

    role: AccountRole

    subscriptionPlan: SubscriptionPlan

    subscriptionStatus?: SubscriptionStatus
  }