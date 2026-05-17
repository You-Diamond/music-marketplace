export type OrderStatus =
  | "paid"
  | "pending"
  | "cancelled"
  | "refunded"

export type PurchasedLicense = {
  id: string

  title: string

  price: number
}

export type OrderBeat = {
  id: number

  publicId: string

  title: string

  image: string
}

export type CustomerInfo = {
  email: string

  firstName: string

  lastName: string

  country: string
}

export type Order = {
  id: string

  createdAt: string

  status: OrderStatus

  total: number

  beat: OrderBeat

  license: PurchasedLicense

  customer: CustomerInfo
}