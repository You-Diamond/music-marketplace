export type UploadVisibility =
  | "public"
  | "private"
  | "unlisted"

export type BeatLicenseType = {
  id: string

  title: string

  price: number

  enabled: boolean
}

export type BeatUploadForm = {
  title: string

  description: string

  genre: string

  bpm: number

  musicKey: string

  tags: string[]

  visibility: UploadVisibility

  coverImage?: string

  audioFile?: string

  stemsFile?: string

  licenses: BeatLicenseType[]
}