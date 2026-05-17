"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { 
  Play, Pause, Music, ChevronLeft, Disc, 
  Verified, Users, MapPin,
  Tv, MessageSquare, ExternalLink 
} from "lucide-react"
import { usePlayerStore } from "@/stores/player-store"
import { useRecentStore } from "@/stores/recent-store"
import { MOCK_BEATS } from "@/mocks/beats"
import { User } from "@/types/user"

export default function ProducerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string
  const { track, isPlaying, play, togglePlay } = usePlayerStore()
  const addToRecent = useRecentStore((state) => state.addItem)

  // Фильтруем биты этого автора
  const producerBeats = React.useMemo(() => {
    return MOCK_BEATS.filter(b => b.producerUsername === username)
  }, [username])

  // Динамически воссоздаем объект User на основе имеющихся моков битов для предотвращения крашей.
  // Когда у тебя появится реальный MOCK_USERS или fetch с бэкенда, просто замени этот блок.
  const user: User | null = React.useMemo(() => {
    if (producerBeats.length === 0) return null

    const firstBeat = producerBeats[0]
    return {
      id: firstBeat.publicId,
      username: firstBeat.producerUsername,
      displayName: firstBeat.producerDisplayName,
      email: `${firstBeat.producerUsername}@example.com`,
      avatar: firstBeat.image, // В качестве аватара используем картинку его трека
      biography: "Professional music producer creating high-quality industry instrumentals and sound kits.",
      location: "Los Angeles, CA",
      stats: {
        followers: 1240,
        totalPlays: firstBeat.plays * producerBeats.length || 45000,
        totalBeats: producerBeats.length
      },
      socials: {
        instagram: `https://instagram.com/${firstBeat.producerUsername}`,
        youtube: `https://youtube.com/c/${firstBeat.producerUsername}`,
        telegram: `https://t.me/${firstBeat.producerUsername}`,
      },
      notifications: {
        likes: true,
        playlists: true,
        followers: true,
        purchases: true,
        comments: true,
        marketing: false
      }
    }
  }, [producerBeats])

  if (!user || producerBeats.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white bg-brand-bg gap-6">
        <h1 className="text-4xl font-black uppercase tracking-widest text-zinc-600">Producer Not Found</h1>
        <button onClick={() => router.back()} className="text-brand-red font-bold uppercase text-sm tracking-wider hover:underline flex items-center gap-2">
          <ChevronLeft size={16} /> Go Back
        </button>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-brand-bg text-white pb-44">
      
      {/* ХЕДЕР ПРОФИЛЯ С БАННЕРОМ */}
      <div className="relative min-h-[480px] w-full bg-gradient-to-b from-brand-card/30 via-brand-bg to-brand-bg pt-32 px-6 border-b border-white/5 overflow-hidden flex items-center">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-red/5 blur-[140px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center md:items-end gap-10 h-full pb-10 relative z-10">
          
          {/* Большой круглый аватар из типа User */}
          <div className="relative h-36 w-36 md:h-44 md:w-44 rounded-full overflow-hidden border-2 border-brand-red/40 bg-zinc-900 shadow-[0_25px_50px_rgba(0,0,0,0.5)] flex-shrink-0">
            {user.avatar ? (
              <Image 
                src={user.avatar} 
                alt={user.displayName} 
                fill 
                className="object-cover filter grayscale hover:grayscale-0 transition-all duration-700"
              />
            ) : (
              <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500 font-bold">
                {user.displayName.slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>

          {/* Информация о пользователе */}
          <div className="text-center md:text-left min-w-0 flex-1">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3 text-brand-red font-black uppercase tracking-[0.3em] text-[10px]">
              <Verified size={14} className="text-brand-red" /> PRODUCER PROFILE
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none text-white mb-4">
              {user.displayName}
            </h1>

            {user.biography && (
              <p className="text-sm text-zinc-400 max-w-xl font-medium mb-4 leading-relaxed">
                {user.biography}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-3 mt-4">
              {/* Локация */}
              {user.location && (
                <span className="flex items-center gap-1.5 text-xs text-zinc-500 font-bold uppercase tracking-wider">
                  <MapPin size={14} className="text-zinc-600" /> {user.location}
                </span>
              )}
              
              {/* Рендеринг иконок соцсетей на базе user.socials */}
              <div className="flex items-center gap-4 text-zinc-500">
                {user.socials.instagram && (
                  <a href={user.socials.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    <span className="sr-only">Instagram</span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  </a>
                )}
                {user.socials.youtube && (
                  <a href={user.socials.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    <span className="sr-only">YouTube</span>
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
                      <path d="m10 15 5-3-5-3z" fill="currentColor" />
                    </svg>
                  </a>
                )}
                {user.socials.telegram && (
                  <a href={user.socials.telegram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    <span className="sr-only">Telegram</span>
                    <MessageSquare size={16} />
                  </a>
                )}
                {user.socials.twitch && (
                  <a href={user.socials.twitch} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                    <span className="sr-only">Twitch</span>
                    <Tv size={16} />
                  </a>
                )}
              </div>
            </div>

            {/* Статистика продюсера (UserStats) */}
            <div className="flex items-center justify-center md:justify-start gap-8 text-zinc-400 font-bold uppercase text-[11px] tracking-wider mt-8 pt-6 border-t border-white/5">
              <span className="flex items-center gap-2">
                <Music size={14} className="text-zinc-600" /> {user.stats.totalBeats} Beats
              </span>
              <span className="flex items-center gap-2">
                <Play size={14} className="text-zinc-600" /> {user.stats.totalPlays.toLocaleString()} Plays
              </span>
              <span className="flex items-center gap-2">
                <Users size={14} className="text-zinc-600" /> {user.stats.followers.toLocaleString()} Followers
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* СПИСОК ТРЕКОВ (ДИСКОГРАФИЯ) */}
      <div className="max-w-7xl mx-auto px-6 mt-16">
        <h2 className="text-[11px] font-black uppercase text-zinc-500 tracking-[0.4em] mb-8 flex items-center gap-2">
          <Disc size={14} className="text-brand-red animate-spin-slow" /> Discography
        </h2>
        
        <div className="grid gap-3">
          {producerBeats.map((beat, index) => {
            const isCurrent = track?.id === beat.id
            const minPrice = beat.licenses?.length > 0 ? Math.min(...beat.licenses.map(l => l.price)) : 0

            return (
              <div 
                key={beat.id} 
                className="group flex items-center justify-between p-4 rounded-2xl bg-brand-card/20 border border-white/5 hover:bg-brand-card/40 hover:border-brand-red/20 transition-all duration-300"
              >
                <div className="flex items-center gap-6 min-w-0">
                  {/* Номер трека */}
                  <span className="text-zinc-600 font-mono font-bold text-sm w-4 text-center group-hover:text-brand-red transition-colors">
                    {index + 1}
                  </span>

                  {/* Обложка с кнопкой Play/Pause */}
                  <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-zinc-900 border border-white/5 flex-shrink-0">
                    <Image src={beat.image} alt={beat.title} fill className="object-cover" />
                    <button 
                      onClick={() => {
                        if (isCurrent) {
                          togglePlay()
                        } else {
                          play({
                            id: beat.id,
                            publicId: beat.publicId,
                            title: beat.title,
                            author: beat.producerDisplayName,
                            image: beat.image,
                            audio: beat.audio
                          })
                          addToRecent(beat)
                        }
                      }}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white"
                    >
                      {isCurrent && isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} className="ml-0.5" fill="currentColor" />}
                    </button>
                  </div>

                  {/* Название и мета бита */}
                  <div className="min-w-0">
                    <Link href={`/beats/${beat.id}`} className="font-bold text-base text-white hover:text-brand-red transition-colors block truncate uppercase tracking-tight">
                      {beat.title}
                    </Link>
                    <div className="flex gap-4 text-[10px] text-zinc-500 uppercase tracking-widest font-medium mt-1">
                      <span>{beat.bpm} BPM</span>
                      {beat.musicKey && <span>• {beat.musicKey}</span>}
                      <span>• {beat.genre}</span>
                    </div>
                  </div>
                </div>

                {/* Цена и Кнопка перехода */}
                <div className="flex items-center gap-6">
                  <div className="text-right hidden sm:block">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block">Starting at</span>
                    <span className="font-black text-xl text-white tracking-tight">${minPrice}</span>
                  </div>
                  <Link href={`/beats/${beat.id}`} className="h-10 px-5 rounded-lg bg-zinc-900 text-zinc-400 group-hover:bg-brand-red group-hover:text-white font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-1.5 transition-all duration-300">
                    <span>View</span>
                    <ExternalLink size={10} />
                  </Link>
                </div>

              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}