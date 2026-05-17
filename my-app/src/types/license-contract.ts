export type LicenseContract = {
  id: string

  orderId: string

  beatId: number

  producerId: string

  buyerId: string

  licenseTitle: string

  usageRights: string[]

  signedAt: string

  downloadablePdfUrl?: string
}