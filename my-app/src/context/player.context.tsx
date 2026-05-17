"use client"

import {
  createContext,
  useContext,
  useRef,
  useState,
  ReactNode,
  useEffect,
} from "react"

type Track = {
  id: number

  title: string

  author: string

  image: string

  audio: string
}

type PlayerContextType = {
  track: Track | null

  isPlaying: boolean

  currentTime: number

  duration: number

  play: (
    track: Track
  ) => void

  toggle: () => void
}

const PlayerContext =
  createContext<PlayerContextType | null>(
    null
  )

export function PlayerProvider({
  children,
}: {
  children: ReactNode
}) {
  const audioRef =
    useRef<HTMLAudioElement | null>(
      null
    )

  const [track, setTrack] =
    useState<Track | null>(
      null
    )

  const [isPlaying, setIsPlaying] =
    useState(false)

  const [currentTime, setCurrentTime] =
    useState(0)

  const [duration, setDuration] =
    useState(0)

  useEffect(() => {
    if (!audioRef.current)
      return

    const audio =
      audioRef.current

    const handleTimeUpdate =
      () => {
        setCurrentTime(
          audio.currentTime
        )

        setDuration(
          audio.duration || 0
        )
      }

    audio.addEventListener(
      "timeupdate",
      handleTimeUpdate
    )

    return () => {
      audio.removeEventListener(
        "timeupdate",
        handleTimeUpdate
      )
    }
  }, [track])

  function play(
    newTrack: Track
  ) {
    if (
      track?.id ===
      newTrack.id
    ) {
      toggle()
      return
    }

    setTrack(newTrack)

    setTimeout(() => {
      if (
        audioRef.current
      ) {
        audioRef.current.play()

        setIsPlaying(
          true
        )
      }
    }, 0)
  }

  function toggle() {
    if (!audioRef.current)
      return

    if (isPlaying) {
      audioRef.current.pause()

      setIsPlaying(false)
    } else {
      audioRef.current.play()

      setIsPlaying(true)
    }
  }

  return (
    <PlayerContext.Provider
      value={{
        track,

        isPlaying,

        currentTime,

        duration,

        play,

        toggle,
      }}
    >
      {children}

      {track && (
        <audio
          ref={audioRef}
          src={track.audio}
        />
      )}
    </PlayerContext.Provider>
  )
}

export function usePlayer() {
  const context =
    useContext(
      PlayerContext
    )

  if (!context) {
    throw new Error(
      "usePlayer must be used within PlayerProvider"
    )
  }

  return context
}