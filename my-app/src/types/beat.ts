export type BeatLicense = {
  id: string
  title: string
  price: number
  wavIncluded: boolean
  stemsIncluded: boolean
  trackoutIncluded: boolean
  unlimitedStreams: boolean
}

export type Beat = {
  id: number
  publicId: string
  title: string
  producerUsername: string
  producerDisplayName: string
  genre: string
  bpm: number
  musicKey: string
  image: string
  audio: string
  duration: number // Всегда число (секунды)
  plays: number
  likes: number
  downloads: number
  featured: boolean
  exclusiveAvailable: boolean
  tags: string[]
  licenses: BeatLicense[]
}