export type SubscriptionFeature = {
  title: string
}

export type SubscriptionPlan = {
  id: string

  title: string

  description: string

  monthlyPrice: number

  yearlyPrice: number

  popular?: boolean

  features: SubscriptionFeature[]
}