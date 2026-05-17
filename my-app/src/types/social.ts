export type SocialPlatform =
  | "instagram"
  | "youtube"
  | "tiktok"
  | "soundcloud"
  | "telegram"
  | "twitch"
  | "vk"
  | "spotify"
  | "appleMusic"
  | "website"

export type SocialLink = {
  platform: SocialPlatform

  url: string
}