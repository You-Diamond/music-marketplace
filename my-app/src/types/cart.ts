import { BeatLicense } from "./beat"

export type CartItem = {
  id: string

  beatId: number

  publicId: string

  title: string

  producerUsername: string

  producerDisplayName: string

  image: string

  bpm: number

  musicKey: string

  license: BeatLicense

  price: number
}

export type CartSummary = {
  subtotal: number

  taxes: number

  discount: number

  total: number
}