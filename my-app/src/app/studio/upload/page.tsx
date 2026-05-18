"use client"

import * as React from "react"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { 
  Music, UploadCloud, Disc, HelpCircle, 
  CheckCircle2, AlertTriangle, Loader2, ArrowLeft 
} from "lucide-react"
import Link from "next/link"
import { createTrackAction } from "@/app/actions/studio"

// Временный хардкод жанров для демонстрации интерфейса.
// В реальном проекте их можно передавать пропсами из Server Component, загрузив из БД: prisma.genre.findMany()
const MOCK_GENRES = [
  { id: "genre-trap-id", name: "Trap" },
  { id: "genre-drill-id", name: "Drill" },
  { id: "genre-boombap-id", name: "Boom Bap" },
  { id: "genre-rnb-id", name: "R&B" },
]

const MUSICAL_KEYS = [
  "C Major", "C Minor", "C# Major", "C# Minor", "D Major", "D Minor",
  "D# Major", "D# Minor", "E Major", "E Minor", "F Major", "F Minor",
  "F# Major", "F# Minor", "G Major", "G Minor", "G# Major", "G# Minor",
  "A Major", "A Minor", "A# Major", "A# Minor", "B Major", "B Minor"
]

export default function UploadPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Статусы отправки
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: ""
  })

  // Поля формы
  const [title, setTitle] = useState("")
  const [bpm, setBpm] = useState<number>(140)
  const [musicKey, setMusicKey] = useState("A Minor")
  const [genreId, setGenreId] = useState(MOCK_GENRES[0].id)
  const [tagsInput, setTagsInput] = useState("") // Строка через запятую
  const [duration, setDuration] = useState<number>(180) // в секундах (например, 3:00)

  // Симуляция URL-адресов загруженных файлов (в будущем тут будет логика AWS S3 / Uploadthing)
  const [audioUrl, setAudioUrl] = useState("https://storage.vision.com/tracks/preview-mock.mp3")
  const [imageUrl, setImageUrl] = useState("https://storage.vision.com/covers/cover-mock.jpg")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setStatus({ type: null, message: "" })

    if (!title.trim()) {
      setStatus({ type: "error", message: "Название трека обязательно для заполнения" })
      return
    }

    // Превращаем строку тегов "trap, beats, fire" в массив ["trap", "beats", "fire"]
    const tagsArray = tagsInput
      .split(",")
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0)

    startTransition(async () => {
      // Имитируем ID текущего авторизованного продюсера 
      // (в продакшене берется из сессии, например: auth().user.id или через Clerk)
      const mockProducerId = "user-producer-uuid-here" 

      const result = await createTrackAction({
        producerId: mockProducerId,
        title,
        bpm: Number(bpm),
        musicKey,
        genreId,
        audioUrl,
        imageUrl,
        duration: Number(duration),
        tags: tagsArray
      })

      if (result.success) {
        setStatus({ 
          type: "success", 
          message: "Бит успешно загружен! Лицензии автоматически сгенерированы на основе ваших шаблонов." 
        })
        // Очищаем форму или редиректим в менеджер треков
        setTimeout(() => {
          router.push("/studio/tracks")
        }, 2000)
      } else {
        setStatus({ type: "error", message: result.error || "Произошла ошибка при сохранении" })
      }
    })
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 sm:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Хедер страницы */}
        <div className="flex items-center gap-4">
          <Link href="/studio" className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight">Upload New Track</h1>
            <p className="text-[11px] text-zinc-400 font-medium">Добавление нового аудио-контента в ваш каталог дистрибуции.</p>
          </div>
        </div>

        {/* Уведомления о статусе операции */}
        {status.type === "success" && (
          <div className="p-4 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl flex items-start gap-3 text-xs font-semibold animate-slide-in">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            <span>{status.message}</span>
          </div>
        )}
        {status.type === "error" && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-start gap-3 text-xs font-semibold animate-slide-in">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>{status.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Левая колонка: Основные файлы и информация */}
          <div className="md:col-span-2 space-y-5">
            
            {/* Карточка загрузки аудио (Визуальный симулятор) */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Music size={14} /> Audio Files
              </h3>
              
              <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-8 text-center bg-zinc-50/50 dark:bg-zinc-950/30 hover:border-brand-red/40 dark:hover:border-brand-red/40 transition group cursor-pointer">
                <UploadCloud size={28} className="mx-auto text-zinc-400 group-hover:text-brand-red transition mb-2" />
                <span className="text-xs font-bold block mb-1">Drag & Drop untagged WAV/MP3 here</span>
                <span className="text-[10px] text-zinc-400 font-medium">или нажмите для выбора файла на устройстве</span>
                <span className="text-[9px] text-zinc-400/60 block mt-3 font-semibold bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded w-max mx-auto">
                  Текущий демо-файл привязан автоматически
                </span>
              </div>
            </div>

            {/* Карточка базовой инфы */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">General Information</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide block mb-1">Track Title *</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Например: God Mode (Prod. by Vision)"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-3 text-xs font-semibold focus:outline-none focus:border-brand-red transition"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide block mb-1 flex items-center gap-1">
                    Tags <span className="text-zinc-400 font-normal">(разделяйте запятыми)</span>
                  </label>
                  <input 
                    type="text" 
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="trap, drill, dark, ambient"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-3 text-xs font-semibold focus:outline-none focus:border-brand-red transition"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Правая колонка: Метаданные трека */}
          <div className="space-y-5">
            
            {/* Обложка трека (Cover Art Simulator) */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-5 rounded-2xl shadow-sm text-center space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 text-left flex items-center gap-1.5">
                <Disc size={14} /> Artwork
              </h3>
              <div className="w-32 h-32 mx-auto bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl flex items-center justify-center text-zinc-400 shadow-inner relative overflow-hidden group cursor-pointer">
                <UploadCloud size={20} className="group-hover:scale-110 transition text-zinc-400/80" />
              </div>
              <span className="text-[10px] text-zinc-400 font-medium block">Рекомендуется: 1000x1000px, JPG или PNG</span>
            </div>

            {/* Спецификации аудио */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Metadata & Specs</h3>
              
              <div className="space-y-3">
                {/* BPM */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide block mb-1">BPM (Темп)</label>
                  <input 
                    type="number" 
                    value={bpm}
                    onChange={(e) => setBpm(Number(e.target.value))}
                    min={40}
                    max={300}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-3 text-xs font-semibold focus:outline-none focus:border-brand-red transition"
                  />
                </div>

                {/* Key (Тональность) */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide block mb-1">Тональность (Key)</label>
                  <select 
                    value={musicKey}
                    onChange={(e) => setMusicKey(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-3 text-xs font-semibold focus:outline-none focus:border-brand-red transition appearance-none cursor-pointer"
                  >
                    {MUSICAL_KEYS.map((key) => (
                      <option key={key} value={key}>{key}</option>
                    ))}
                  </select>
                </div>

                {/* Genre (Жанр) */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide block mb-1">Жанр трека</label>
                  <select 
                    value={genreId}
                    onChange={(e) => setGenreId(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-3 text-xs font-semibold focus:outline-none focus:border-brand-red transition appearance-none cursor-pointer"
                  >
                    {MOCK_GENRES.map((genre) => (
                      <option key={genre.id} value={genre.id}>{genre.name}</option>
                    ))}
                  </select>
                </div>

                {/* Duration (Длительность) */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide block mb-1">Длительность (в сек.)</label>
                  <input 
                    type="number" 
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-3 text-xs font-semibold focus:outline-none focus:border-brand-red transition"
                  />
                </div>
              </div>
            </div>

            {/* Информационный бокс */}
            <div className="bg-zinc-900 text-zinc-400 p-4 rounded-xl flex gap-2.5 text-[10px] font-medium leading-relaxed">
              <HelpCircle size={14} className="text-brand-red shrink-0 mt-0.5" />
              <span>
                При публикации этого трека, система автоматически свяжет его со всеми вашими активными шаблонами коммерческих лицензий. Изменить цены или скрыть типы лицензий для этого трека вы сможете в матрице лицензий.
              </span>
            </div>

            {/* Кнопка отправки */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-brand-red hover:bg-brand-red/90 disabled:bg-zinc-800 text-white font-bold text-xs uppercase py-3.5 rounded-xl tracking-wider transition shadow-lg shadow-brand-red/10 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Publishing Track...</span>
                </>
              ) : (
                <span>Publish Track</span>
              )}
            </button>

          </div>

        </form>

      </div>
    </div>
  )
}