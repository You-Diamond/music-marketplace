"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { UploadDropzone } from "@/lib/uploadthing"
import { createTrack } from "@/app/actions/tracks"
import { Music, Image as ImageIcon, CheckCircle, Loader2 } from "lucide-react"

interface TrackFormClientProps {
  genres: { id: string; name: string }[]
}

export default function TrackFormClient({ genres }: TrackFormClientProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Состояние полей формы
  const [title, setTitle] = useState("")
  const [bpm, setBpm] = useState("")
  const [musicKey, setMusicKey] = useState("A Minor")
  const [genreId, setGenreId] = useState(genres[0]?.id || "")
  const [stemsUrl, setStemsUrl] = useState("") // Ссылка на Google Drive

  // Состояние загруженных файлов (храним URL)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [wavUrl, setWavUrl] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !bpm || !genreId || !previewUrl) {
      alert("Пожалуйста, заполните обязательные поля и загрузите MP3-превью!")
      return
    }

    try {
      setIsSubmitting(true)
      const res = await createTrack({
        title,
        bpm: Number(bpm),
        musicKey,
        genreId,
        image: imageUrl,
        audio: previewUrl, // Основной файл для воспроизведения
        stemsUrl, // (Для будущего расширения)
      })

      if (res.success) {
        router.push("/studio/tracks")
      } else {
        alert(res.error)
      }
    } catch (err) {
      alert("Произошла ошибка при отправке")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* Сетка основных полей */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-[#0c0d12]/40 border border-white/[0.04] rounded-2xl">
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono uppercase text-zinc-500">Название трека *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Cyberpunk Type Beat"
            className="w-full h-10 px-4 rounded-xl bg-black/40 border border-white/[0.05] text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-red-600/50 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-mono uppercase text-zinc-500">Жанр *</label>
          <select
            value={genreId}
            onChange={(e) => setGenreId(e.target.value)}
            className="w-full h-10 px-4 rounded-xl bg-black/40 border border-white/[0.05] text-xs text-white focus:outline-none focus:border-red-600/50 transition-colors"
          >
            {genres.map((g) => (
              <option key={g.id} value={g.id} className="bg-[#0c0d12]">
                {g.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-mono uppercase text-zinc-500">BPM (Темп) *</label>
          <input
            type="number"
            required
            value={bpm}
            onChange={(e) => setBpm(e.target.value)}
            placeholder="140"
            className="w-full h-10 px-4 rounded-xl bg-black/40 border border-white/[0.05] text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-red-600/50 transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-mono uppercase text-zinc-500">Тональность</label>
          <input
            type="text"
            value={musicKey}
            onChange={(e) => setMusicKey(e.target.value)}
            placeholder="C Minor, G Major..."
            className="w-full h-10 px-4 rounded-xl bg-black/40 border border-white/[0.05] text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-red-600/50 transition-colors"
          />
        </div>

        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[10px] font-mono uppercase text-zinc-500">Ссылка на Stems (Google Drive / Dropbox)</label>
          <input
            type="url"
            value={stemsUrl}
            onChange={(e) => setStemsUrl(e.target.value)}
            placeholder="https://drive.google.com/drive/folders/..."
            className="w-full h-10 px-4 rounded-xl bg-black/40 border border-white/[0.05] text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-red-600/50 transition-colors"
          />
        </div>
      </div>

      {/* ЗОНЫ ЗАГРУЗКИ ФАЙЛОВ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* 1. ЗАГРУЗКА ОБЛОЖКИ */}
        <div className="p-4 bg-[#0c0d12]/20 border border-white/[0.04] rounded-2xl flex flex-col justify-between min-h-[220px]">
          <span className="text-[10px] font-mono uppercase text-zinc-500 mb-2 block">1. Обложка (Изображение)</span>
          {imageUrl ? (
            <div className="relative flex-1 rounded-xl overflow-hidden border border-white/[0.05]">
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          ) : (
            <UploadDropzone
              endpoint="trackImage"
              onClientUploadComplete={(res) => setImageUrl(res[0].url)}
              className="flex-1 border-dashed border-white/[0.08] ut-button:bg-red-600 ut-label:text-zinc-400 text-xs py-4"
            />
          )}
        </div>

        {/* 2. MP3 ПРЕВЬЮ */}
        <div className="p-4 bg-[#0c0d12]/20 border border-white/[0.04] rounded-2xl flex flex-col justify-between min-h-[220px]">
          <span className="text-[10px] font-mono uppercase text-zinc-500 mb-2 block">2. MP3-Превью (С тегами) *</span>
          {previewUrl ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-emerald-400 gap-1.5 text-center p-2">
              <CheckCircle className="h-6 w-6" />
              <span className="text-[10px] font-mono uppercase tracking-wider">MP3 Загружен</span>
            </div>
          ) : (
            <UploadDropzone
              endpoint="previewAudio"
              onClientUploadComplete={(res) => setPreviewUrl(res[0].url)}
              className="flex-1 border-dashed border-white/[0.08] ut-button:bg-purple-600 ut-label:text-zinc-400 text-xs py-4"
            />
          )}
        </div>

        {/* 3. WAV ВЕРСИЯ */}
        <div className="p-4 bg-[#0c0d12]/20 border border-white/[0.04] rounded-2xl flex flex-col justify-between min-h-[220px]">
          <span className="text-[10px] font-mono uppercase text-zinc-500 mb-2 block">3. Оригинал (HQ WAV)</span>
          {wavUrl ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-blue-500/5 border border-blue-500/10 rounded-xl text-blue-400 gap-1.5 text-center p-2">
              <CheckCircle className="h-6 w-6" />
              <span className="text-[10px] font-mono uppercase tracking-wider">WAV Загружен</span>
            </div>
          ) : (
            <UploadDropzone
              endpoint="wavAudio"
              onClientUploadComplete={(res) => setWavUrl(res[0].url)}
              className="flex-1 border-dashed border-white/[0.08] ut-button:bg-blue-600 ut-label:text-zinc-400 text-xs py-4"
            />
          )}
        </div>

      </div>

      {/* Кнопка отправки формы */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-11 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(220,38,38,0.15)]"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Сохранение бита на платформе...
          </>
        ) : (
          "Выставить бит на продажу"
        )}
      </button>

    </form>
  )
}