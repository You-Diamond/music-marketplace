"use client"

import * as React from "react"
import { usePlayerStore, PlayerTrack } from "@/stores/player-store"
import { addToCart } from "@/app/actions/cart"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Play, Pause, Heart, ShoppingBag, Music, Calendar, Disc, Activity, Eye, Flame, Check, ShieldCheck, Sparkles, FolderHeart } from "lucide-react"
import { FullTrackPayload, RelatedTrackPayload } from "@/app/beats/[id]/page"

interface ClientProps {
  track: FullTrackPayload
  sameProducer: RelatedTrackPayload[]
  similarStyle: RelatedTrackPayload[]
}

export default function BeatDetailsClient({ track, sameProducer, similarStyle }: ClientProps) {
  const router = useRouter()
  const { track: currentTrack, isPlaying, togglePlay, play } = usePlayerStore()
  
  const [isLiked, setIsLiked] = React.useState(false)
  const [addingLicenseId, setAddingLicenseId] = React.useState<string | null>(null)
  const [activeTab, setActiveTab] = React.useState<"producer" | "similar">("producer")

  const isCurrentPlaying = currentTrack?.id === track.id && isPlaying

  const handleMainPlayToggle = () => {
    if (currentTrack?.id === track.id) {
      togglePlay()
    } else {
      // БУТЫЛОЧНОЕ ГОРЛЫШКО ИСПРАВЛЕНО: Преобразуем null-цены в safe-числа для стейт-менеджера плеера
      const playerTrackFormat: PlayerTrack = {
        id: track.id,
        title: track.title,
        image: track.image,
        audio: track.audio,
        musicKey: track.musicKey,
        bpm: track.bpm,
        producer: {
          username: track.producer.username,
          displayName: track.producer.displayName
        },
        licenses: track.licenses.map(l => ({ 
          id: l.id, 
          price: l.price ?? 0 // Если цена договорная, плеер видит 0, но логика корзины обрабатывает ее отдельно
        }))
      }
      play(playerTrackFormat, [playerTrackFormat])
    }
  }

  const handleBuyLicense = async (licenseId: string, licenseName: string) => {
    setAddingLicenseId(licenseId)
    try {
      const res = await addToCart(track.id, licenseId)
      if (res.success) {
        toast.success(`Лицензия "${licenseName}" добавлена в корзину!`)
        router.refresh()
      } else {
        toast.error(res.error || "Не удалось добавить бит")
      }
    } catch {
      toast.error("Ошибка при добавлении в корзину")
    } finally {
      setAddingLicenseId(null)
    }
  }

  return (
    <div className="relative min-h-screen bg-zinc-950 text-white pb-36 overflow-hidden pt-4">
      
      {/* LIQUID GLASS: Адаптивный бэкграунд-градиент */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none select-none z-0">
        {track.image && (
          <div 
            className="absolute inset-0 opacity-20 blur-[140px] rounded-full scale-90 transition-all duration-1000"
            style={{ 
              background: `radial-gradient(circle, rgba(147,51,234,0.5) 0%, rgba(9,9,11,0) 70%)`,
              backgroundImage: `url(${track.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 relative z-10 space-y-12">
        
        {/* ================= 1. HERO РАЗДЕЛ ================= */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 md:gap-12 pt-8 border-b border-white/[0.04] pb-12">
          
          <div className="relative w-60 h-60 sm:w-64 sm:h-64 rounded-2xl overflow-hidden bg-zinc-900 border border-white/[0.08] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] shrink-0 group">
            {track.image ? (
              <img src={track.image} alt={track.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-700"><Music size={64} /></div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
              <button 
                onClick={handleMainPlayToggle}
                className="h-16 w-16 rounded-full bg-white text-black flex items-center justify-center shadow-2xl transform scale-95 group-hover:scale-100 transition-all active:scale-90"
              >
                {isCurrentPlaying ? <Pause size={24} className="fill-current" /> : <Play size={24} className="fill-current translate-x-0.5" />}
              </button>
            </div>
          </div>

          <div className="flex-1 text-center md:text-left min-w-0 w-full space-y-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 text-[11px] text-purple-400 font-bold tracking-wider font-mono uppercase">
                <span className="bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 flex items-center gap-1 text-purple-300">
                  <Flame size={12} className="text-purple-400" /> HOT PRODUCT
                </span>
                <span className="text-zinc-400 bg-white/[0.03] px-2 py-0.5 rounded border border-white/[0.04]">{track.genre.name}</span>
                {track.moods.map(m => (
                  <span key={m.id} className="text-zinc-500 bg-white/[0.01] px-2 py-0.5 rounded border border-white/[0.02]">{m.name}</span>
                ))}
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-50">{track.title}</h1>
              <p className="text-sm sm:text-base text-zinc-400">
                Создатель <span className="text-purple-400 font-semibold hover:text-purple-300 cursor-pointer transition-colors">@{track.producer.username}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <button
                onClick={handleMainPlayToggle}
                className="flex items-center gap-2 px-6 h-12 bg-white text-black rounded-xl font-bold text-sm shadow-xl hover:bg-zinc-200 transition-all active:scale-95"
              >
                {isCurrentPlaying ? <Pause size={16} className="fill-current" /> : <Play size={16} className="fill-current translate-x-0.5" />}
                {isCurrentPlaying ? "Пауза" : "Воспроизвести"}
              </button>
              
              <button
                onClick={() => {
                  setIsLiked(!isLiked)
                  toast.info(!isLiked ? "Добавлено в медиатеку" : "Удалено")
                }}
                className={`flex items-center justify-center gap-2 px-5 h-12 rounded-xl text-sm border font-medium transition-all ${isLiked ? 'text-red-400 bg-red-500/10 border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'text-zinc-300 border-white/[0.08] hover:bg-white/[0.04]'}`}
              >
                <Heart size={16} className={isLiked ? "fill-current" : ""} />
                {isLiked ? "В избранном" : "В избранное"}
              </button>
            </div>
          </div>
        </div>

        {/* ================= 2. СПЕЦИФИКАЦИИ (Используем plays вместо playsCount) ================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <SpecCard icon={<Activity size={18} />} label="Темп" value={`${track.bpm} BPM`} iconClass="text-purple-400 bg-purple-500/10 border-purple-500/20" />
          <SpecCard icon={<Disc size={18} />} label="Тональность" value={track.musicKey || "Не указана"} iconClass="text-emerald-400 bg-emerald-500/10 border-emerald-500/20" />
          <SpecCard icon={<Calendar size={18} />} label="Дата релиза" value={new Date(track.createdAt).toLocaleDateString('ru-RU', { year: 'numeric', month: 'long' })} iconClass="text-blue-400 bg-blue-500/10 border-blue-500/20" />
          <SpecCard icon={<Eye size={18} />} label="Прослушивания" value={`${track.plays || 0} раз`} iconClass="text-amber-400 bg-amber-500/10 border-amber-500/20" />
        </div>

        {/* ================= 3. КАРТОЧКИ ЛИЦЕНЗИЙ ================= */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
              <ShieldCheck className="text-purple-500" size={24} /> Коммерческие лицензии
            </h2>
            <p className="text-xs text-zinc-400">Выберите тип использования. После оплаты вы мгновенно получаете файлы без звуковых тегов.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {track.licenses.map((license) => (
              <div 
                key={license.id}
                className="relative bg-zinc-900/20 border border-white/[0.06] backdrop-blur-md rounded-2xl p-6 flex flex-col justify-between hover:border-purple-500/30 hover:bg-zinc-900/40 transition-all shadow-xl group"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-zinc-100 group-hover:text-purple-400 transition-colors truncate">{license.template.name}</h3>
                      <span className="text-[10px] font-mono font-bold bg-white/[0.04] border border-white/[0.06] text-purple-300 px-2 py-0.5 rounded mt-1.5 inline-block uppercase tracking-wide">
                        {license.template.fileType}
                      </span>
                    </div>
                    {/* КОРРЕКТНЫЙ ВЫВОД ЦЕНЫ: Если price === null, выводим Договорная */}
                    <p className="text-lg font-black font-mono text-white whitespace-nowrap">
                      {license.price !== null ? `${license.price.toLocaleString('ru-RU')} ₽` : "Договорная"}
                    </p>
                  </div>

                  <div className="border-t border-white/[0.04] pt-4 space-y-2.5 text-xs text-zinc-300 font-normal">
                    <LicenseFeature check={true} text={license.template.distributionCopies ? `Дистрибуция: до ${license.template.distributionCopies.toLocaleString()} экз.` : "Безлимитный тираж"} />
                    <LicenseFeature check={true} text={license.template.audioStreams ? `Стримы: до ${license.template.audioStreams.toLocaleString()}` : "Безлимитные стримы"} />
                    <LicenseFeature check={license.template.radioBroadcastingRights} text="Права на радиоротации" />
                    <LicenseFeature check={true} isShield={true} text="100% Защита от авторских клеймов" />
                  </div>
                </div>

                <button
                  disabled={addingLicenseId === license.id}
                  onClick={() => handleBuyLicense(license.id, license.template.name)}
                  className="w-full mt-6 h-11 rounded-xl bg-white text-black font-bold text-xs tracking-wide hover:bg-purple-600 hover:text-white transition-all active:scale-98 flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <ShoppingBag size={14} className={addingLicenseId === license.id ? "animate-pulse" : ""} />
                  {addingLicenseId === license.id ? "Обработка..." : "В корзину"}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ================= 4. ПРОДВИНУТЫЕ УМНЫЕ РЕКОМЕНДАЦИИ ================= */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.05] pb-3">
            <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
              <Sparkles className="text-purple-400" size={20} /> Рекомендованные биты
            </h2>
            
            <div className="flex bg-zinc-900/60 border border-white/[0.06] p-0.5 rounded-xl text-xs font-medium self-start sm:self-auto">
              <button 
                onClick={() => setActiveTab("producer")}
                className={`px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${activeTab === "producer" ? 'bg-white text-black font-bold shadow-md' : 'text-zinc-400 hover:text-white'}`}
              >
                <Music size={13} /> Ещё от продюсера
              </button>
              <button 
                onClick={() => setActiveTab("similar")}
                className={`px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${activeTab === "similar" ? 'bg-white text-black font-bold shadow-md' : 'text-zinc-400 hover:text-white'}`}
              >
                <FolderHeart size={13} /> Похожие по стилю
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {activeTab === "producer" ? (
              sameProducer.length > 0 ? (
                sameProducer.map(relTrack => <RecommendationRow key={relTrack.id} relTrack={relTrack} />)
              ) : (
                <EmptyRecommendations text="Других активных битов автора пока нет" />
              )
            ) : (
              similarStyle.length > 0 ? (
                similarStyle.map(relTrack => <RecommendationRow key={relTrack.id} relTrack={relTrack} />)
              ) : (
                <EmptyRecommendations text="Похожих по жанру или настроениям битов не найдено" />
              )
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ С ЗАЩИТОЙ ОТ ПЕРЕРИСОВОК ---

function SpecCard({ icon, label, value, iconClass }: { icon: React.ReactNode; label: string; value: string; iconClass: string }) {
  return (
    <div className="bg-zinc-900/30 border border-white/[0.05] backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 shadow-sm">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${iconClass}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase font-bold text-zinc-500 font-mono tracking-wider truncate">{label}</p>
        <p className="text-sm font-black text-zinc-100 font-mono truncate">{value}</p>
      </div>
    </div>
  )
}

function LicenseFeature({ check, text, isShield = false }: { check: boolean; text: string; isShield?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${check ? 'text-zinc-300' : 'text-zinc-500 line-through'}`}>
      {check ? (
        isShield ? <ShieldCheck size={14} className="text-emerald-400 shrink-0" /> : <Check size={14} className="text-purple-400 shrink-0" />
      ) : (
        <span className="text-zinc-600 text-[10px] uppercase font-mono tracking-wider shrink-0">[x]</span>
      )}
      <span className="truncate">{text}</span>
    </div>
  )
}

function RecommendationRow({ relTrack }: { relTrack: RelatedTrackPayload }) {
  const router = useRouter()
  const { track: currentTrack, isPlaying, togglePlay, play } = usePlayerStore()
  const isRelPlaying = currentTrack?.id === relTrack.id && isPlaying

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentTrack?.id === relTrack.id) {
      togglePlay()
    } else {
      const fmt: PlayerTrack = {
        id: relTrack.id,
        title: relTrack.title,
        image: relTrack.image,
        audio: relTrack.audio,
        musicKey: relTrack.musicKey,
        bpm: relTrack.bpm,
        producer: relTrack.producer,
        licenses: []
      }
      play(fmt, [fmt])
    }
  }

  return (
    <div 
      onClick={() => router.push(`/beats/${relTrack.id}`)}
      className="bg-zinc-900/20 border border-white/[0.04] rounded-xl p-3 flex items-center justify-between hover:bg-zinc-900/40 transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-12 w-12 rounded-lg overflow-hidden bg-zinc-800 shrink-0 relative">
          {relTrack.image ? (
            <img src={relTrack.image} alt={relTrack.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600"><Music size={16} /></div>
          )}
          <button 
            onClick={handlePlay}
            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
          >
            {isRelPlaying ? <Pause size={14} className="fill-current" /> : <Play size={14} className="fill-current translate-x-0.5" />}
          </button>
        </div>
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-zinc-200 group-hover:text-purple-400 transition-colors truncate">{relTrack.title}</h4>
          <p className="text-[10px] text-zinc-400 truncate">@{relTrack.producer.username}</p>
          <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-mono mt-0.5">
            <span>{relTrack.bpm} BPM</span>
            {relTrack.musicKey && <span>• {relTrack.musicKey}</span>}
          </div>
        </div>
      </div>

      <button
        className="h-8 px-3 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.06] text-zinc-300 font-bold text-[11px] transition-all shrink-0"
        onClick={(e) => {
          e.stopPropagation()
          router.push(`/beats/${relTrack.id}`)
        }}
      >
        Открыть
      </button>
    </div>
  )
}

function EmptyRecommendations({ text }: { text: string }) {
  return (
    <div className="col-span-1 sm:col-span-2 py-8 text-center bg-zinc-900/10 border border-dashed border-white/[0.04] rounded-xl text-xs text-zinc-500">
      {text}
    </div>
  )
}