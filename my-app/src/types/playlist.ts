export type PlaylistBeat = {
  id: number

  publicId: string

  title: string

  author: string

  image: string

  duration: string
}

export type Playlist = {
  id: string

  title: string

  description: string

  image: string

  creator: {
    username: string

    displayName: string
  }

  beats: PlaylistBeat[]

  followers: number
}