"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { UploadDropzone } from "@/lib/uploadthing"
import { createTrack, updateTrack } from "@/app/actions/tracks"
import { deleteUploadedFile } from "@/app/actions/upload"
import { CheckCircle, Loader2, X, Music, Shield, Keyboard } from "lucide-react"
import { verifyAudioMagicBytes } from "@/lib/file-signature"

// ⚡️ Enterprise-валидация через Zod контракт
const trackFormSchema = z.object({
  title: z.string().min(2, "Название трека слишком короткое (минимум 2 символа)"),
  bpm: z.string().refine((val) => {
    const num = Number(val)
    return !isNaN(num) && num >= 20 && num <= 300
  }, "Укажите реальный темп (BPM от 20 до 300)"),
  musicKey: z.string().min(1, "Выберите или укажите тональность"),
  genreId: z.string().min(1, "Выберите основной жанр"),
  stemsUrl: z.string().url("Введите корректную URL ссылку на облако").optional().or(z.literal("")),
})

type TrackFormValues = z.infer<typeof trackFormSchema>

interface TrackFormClientProps {
  genres: { id: string; name: string }[]
  moods: { id: string; name: string }[]
  licenseTemplates?: { id: string; name: string; defaultPrice: number | null; isPriceNegotiable: boolean; fileType: string }[]
  initialData?: any | null
}

export default function TrackFormClient({ genres, moods, licenseTemplates = [], initialData }: TrackFormClientProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const isEditMode = !!initialData

  // Логика Tap BPM
  const tapTimes = useRef<number[]>([])
  
  // Хранилище загруженных ключей текущей сессии
  const sessionUploadedKeys = useRef<string[]>([])

  // Файловые состояния
  const [image, setImage] = useState<{ url: string; key?: string } | null>(initialData?.image ? { url: initialData.image } : null)
  const [preview, setPreview] = useState<{ url: string; key?: string } | null>(initialData?.audio ? { url: initialData.audio } : null)
  const [wav, setWav] = useState<{ url: string; key?: string } | null>(initialData?.wavUrl ? { url: initialData.wavUrl } : null)

  const [selectedMoods, setSelectedMoods] = useState<string[]>(initialData?.moods?.map((m: any) => m.id) || [])
  const [trackLicenses, setTrackLicenses] = useState(() => {
    return licenseTemplates.map((template) => ({
      templateId: template.id,
      name: template.name,
      fileType: template.fileType,
      isPriceNegotiable: template.isPriceNegotiable,
      isActive: true,
      price: template.defaultPrice !== null ? template.defaultPrice.toString() : ""
    }))
  })

  // ⚡️ Инициализация React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TrackFormValues>({
    resolver: zodResolver(trackFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      bpm: initialData?.bpm ? String(initialData.bpm) : "",
      musicKey: initialData?.musicKey || "A Minor",
      genreId: initialData?.genreId || genres[0]?.id || "",
      stemsUrl: initialData?.stemsUrl || "",
    },
  })

  const watchedStemsUrl = watch("stemsUrl")
  const formValues = watch() // Следим за всеми текстовыми полями для автосохранения
  
  // Ключ для черновика, уникальный для создания и редактирования конкретного трека
  const DRAFT_KEY = isEditMode ? `track_draft_${initialData.id}` : "track_draft_new"

  // ⚡️ ВОССТАНОВЛЕНИЕ ЧЕРНОВИКА
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY)
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft)
        
        if (parsed.formValues) {
          Object.keys(parsed.formValues).forEach((key) => {
            setValue(key as keyof TrackFormValues, parsed.formValues[key], { shouldValidate: true })
          })
        }
        
        if (parsed.selectedMoods) setSelectedMoods(parsed.selectedMoods)
        if (parsed.trackLicenses) setTrackLicenses(parsed.trackLicenses)

        toast.info("Черновик восстановлен", { 
          description: "Мы вернули данные, которые вы не успели отправить.",
          icon: "📝"
        })
      } catch (err) {
        console.error("Ошибка чтения черновика", err)
      }
    }
  }, [DRAFT_KEY, setValue])

  // ⚡️ АВТОСОХРАНЕНИЕ ЧЕРНОВИКА (Debounce 1 сек)
  useEffect(() => {
    if (!formValues.title && selectedMoods.length === 0) return

    const timeoutId = setTimeout(() => {
      const draftData = {
        formValues,
        selectedMoods,
        trackLicenses
      }
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draftData))
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [formValues, selectedMoods, trackLicenses, DRAFT_KEY])

  // Защита от потери данных (BeforeUnload)
  useEffect(() => {
    const hasUnsavedUploads = sessionUploadedKeys.current.length > 0
    if (hasUnsavedUploads && !isSubmitting) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault()
        e.returnValue = ""
      }
      window.addEventListener("beforeunload", handleBeforeUnload)
      return () => window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [isSubmitting])

  // Фича: Вычисление BPM по кликам (Tap BPM)
  const handleTapBpm = () => {
    const now = Date.now()
    if (tapTimes.current.length > 0 && now - tapTimes.current[tapTimes.current.length - 1] > 2000) {
      tapTimes.current = []
    }

    tapTimes.current.push(now)
    if (tapTimes.current.length > 1) {
      const intervals = []
      for (let i = 1; i < tapTimes.current.length; i++) {
        intervals.push(tapTimes.current[i] - tapTimes.current[i - 1])
      }
      const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length
      const calculatedBpm = Math.round(60000 / avgInterval)
      
      if (calculatedBpm >= 20 && calculatedBpm <= 300) {
        setValue("bpm", String(calculatedBpm), { shouldValidate: true })
        toast.info(`Определен темп: ${calculatedBpm} BPM`, { id: "tap-bpm-toast" })
      }
    }
  }

  // Сборщик мусора (GC) в реальном времени
  const handleReplaceFile = (
    type: "image" | "preview" | "wav",
    currentData: { url: string; key?: string } | null
  ) => {
    if (currentData?.key && sessionUploadedKeys.current.includes(currentData.key)) {
      deleteUploadedFile(currentData.key).catch(console.error)
      sessionUploadedKeys.current = sessionUploadedKeys.current.filter((k) => k !== currentData.key)
    }

    if (type === "image") setImage(null)
    if (type === "preview") setPreview(null)
    if (type === "wav") setWav(null)
    toast.success("Файл успешно сброшен")
  }

  const handleMoodToggle = (moodId: string) => {
    setSelectedMoods((prev) => prev.includes(moodId) ? prev.filter((id) => id !== moodId) : [...prev, moodId])
  }

  const handleLicenseToggle = (index: number, checked: boolean) => {
    setTrackLicenses((prev) => prev.map((item, i) => (i === index ? { ...item, isActive: checked } : item)))
  }

  const handleLicensePriceChange = (index: number, val: string) => {
    setTrackLicenses((prev) => prev.map((item, i) => (i === index ? { ...item, price: val } : item)))
  }

  // Обработчик отправки формы
  const onFormSubmit = async (values: TrackFormValues) => {
    if (!preview?.url) {
      toast.error("Не хватает файлов!", { description: "Загрузка MP3-превью обязательна для публикации." })
      return
    }

    try {
      setIsSubmitting(true)
      const trackData = {
        title: values.title,
        bpm: Number(values.bpm),
        musicKey: values.musicKey,
        genreId: values.genreId,
        image: image?.url || null,
        audio: preview.url,
        wavUrl: wav?.url || null,
        stemsUrl: values.stemsUrl || null,
        moodIds: selectedMoods,
        licenses: trackLicenses.map(l => ({
          templateId: l.templateId,
          isActive: l.isActive,
          price: l.isPriceNegotiable || l.price === "" ? null : parseFloat(l.price)
        }))
      }

      const res = isEditMode && initialData 
        ? await updateTrack(initialData.id, trackData) 
        : await createTrack(trackData)

      if (res.success) {
        toast.success(isEditMode ? "Изменения сохранены!" : "Бит успешно опубликован!")
        
        // ⚡️ Очищаем черновик и сессионные ключи после успешной публикации
        localStorage.removeItem(DRAFT_KEY)
        sessionUploadedKeys.current = []
        
        router.push("/studio/tracks")
        router.refresh()
      } else {
        toast.error("Ошибка сохранения", { description: res.error })
      }
    } catch (err) {
      console.error(err)
      toast.error("Критическая ошибка", { description: "Что-то пошло не так во время обработки формы." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* ЛЕВАЯ КОЛОНКА */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-[#0c0d12]/40 border border-white/[0.04] rounded-2xl backdrop-blur-md">
            
            {/* Название трека */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-zinc-500">Название трека *</label>
              <input 
                type="text" 
                {...register("title")}
                className={`w-full h-10 px-4 rounded-xl bg-black/40 border ${errors.title ? 'border-red-500/50 focus:border-red-500' : 'border-white/[0.05] focus:border-red-600/50'} text-xs text-white focus:outline-none transition-colors`} 
              />
              {errors.title && <p className="text-[10px] text-red-500/90 font-mono pl-1">{errors.title.message}</p>}
            </div>

            {/* Жанр */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-zinc-500">Жанр *</label>
              <select 
                {...register("genreId")}
                className="w-full h-10 px-4 rounded-xl bg-black/40 border border-white/[0.05] text-xs text-white focus:outline-none focus:border-red-600/50"
              >
                {genres.map((g) => (
                  <option key={g.id} value={g.id} className="bg-[#0c0d12]">{g.name}</option>
                ))}
              </select>
              {errors.genreId && <p className="text-[10px] text-red-500/90 font-mono pl-1">{errors.genreId.message}</p>}
            </div>

            {/* BPM */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-zinc-500 flex justify-between items-center">
                <span>BPM (Темп) *</span>
                <button 
                  type="button" 
                  onClick={handleTapBpm}
                  className="flex items-center gap-1 text-[9px] text-zinc-400 hover:text-white bg-white/[0.03] border border-white/[0.05] px-2 py-0.5 rounded transition-colors uppercase tracking-wider font-sans"
                >
                  <Keyboard className="h-2.5 w-2.5 text-red-500" /> Tap
                </button>
              </label>
              <input 
                type="text" 
                {...register("bpm")}
                className={`w-full h-10 px-4 rounded-xl bg-black/40 border ${errors.bpm ? 'border-red-500/50 focus:border-red-500' : 'border-white/[0.05] focus:border-red-600/50'} text-xs text-white focus:outline-none transition-colors font-mono`} 
              />
              {errors.bpm && <p className="text-[10px] text-red-500/90 font-mono pl-1">{errors.bpm.message}</p>}
            </div>

            {/* Тональность */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase text-zinc-500">Тональность</label>
              <input 
                type="text" 
                {...register("musicKey")}
                className="w-full h-10 px-4 rounded-xl bg-black/40 border border-white/[0.05] text-xs text-white focus:outline-none focus:border-red-600/50" 
              />
              {errors.musicKey && <p className="text-[10px] text-red-500/90 font-mono pl-1">{errors.musicKey.message}</p>}
            </div>

            {/* Настроения */}
            <div className="md:col-span-2 space-y-2 pt-3 border-t border-white/[0.02]">
              <label className="text-[10px] font-mono uppercase text-zinc-500 flex items-center gap-1.5">
                <Music className="h-3 w-3 text-red-500" /> Настроение трека
              </label>
              <div className="flex flex-wrap gap-1.5">
                {moods.map((mood) => (
                  <button 
                    key={mood.id} 
                    type="button" 
                    onClick={() => handleMoodToggle(mood.id)} 
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono uppercase tracking-wider transition-all border ${selectedMoods.includes(mood.id) ? "bg-red-600 border-transparent text-white" : "bg-black/20 border-white/[0.04] text-zinc-400"}`}
                  >
                    {mood.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Ссылка на Стемсы */}
            <div className="md:col-span-2 space-y-1.5 pt-2">
              <label className="text-[10px] font-mono uppercase text-zinc-500">Ссылка на Track-Out / Stems (Облако)</label>
              <input 
                type="text" 
                {...register("stemsUrl")}
                placeholder="https://drive.google.com/..."
                className={`w-full h-10 px-4 rounded-xl bg-black/40 border ${errors.stemsUrl ? 'border-red-500/50 focus:border-red-500' : 'border-white/[0.05] focus:border-red-600/50'} text-xs text-white focus:outline-none transition-colors`} 
              />
              {errors.stemsUrl && <p className="text-[10px] text-red-500/90 font-mono pl-1">{errors.stemsUrl.message}</p>}
            </div>
          </div>

          {/* ЗОНЫ ЗАГРУЗКИ ФАЙЛОВ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* 1. ОБЛОЖКА */}
            <div className="p-4 bg-[#0c0d12]/40 border border-white/[0.04] rounded-2xl flex flex-col justify-between min-h-[200px]">
              <span className="text-[9px] font-mono uppercase text-zinc-500 block mb-2">1. Обложка</span>
              {image ? (
                <div className="relative flex-1 rounded-xl overflow-hidden border border-white/[0.05]">
                  <img src={image.url} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => handleReplaceFile("image", image)} className="absolute top-2 right-2 bg-black/60 p-1 rounded text-zinc-400 hover:text-white"><X className="h-3 w-3" /></button>
                </div>
              ) : (
                <UploadDropzone 
                  endpoint="trackImage" 
                  onUploadBegin={() => setIsUploading(true)}
                  onClientUploadComplete={(res) => {
                    setImage({ url: res[0].ufsUrl, key: res[0].key })
                    sessionUploadedKeys.current.push(res[0].key)
                    setIsUploading(false)
                    toast.success("Обложка успешно обработана")
                  }}
                  onUploadError={(err) => { setIsUploading(false); toast.error(`Ошибка загрузки обложки: ${err.message}`) }}
                />
              )}
            </div>

            {/* 2. MP3 ПРЕВЬЮ */}
            <div className="p-4 bg-[#0c0d12]/40 border border-white/[0.04] rounded-2xl flex flex-col justify-between min-h-[200px]">
              <span className="text-[9px] font-mono uppercase text-zinc-500 block mb-2">2. MP3-Превью *</span>
              {preview ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 gap-2 text-center w-full">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <span className="text-[9px] font-mono uppercase text-emerald-400">MP3 Готов</span>
                  <audio controls src={preview.url} className="w-full h-8 mt-2 opacity-80 scale-90 origin-center" />
                  <button type="button" onClick={() => handleReplaceFile("preview", preview)} className="text-zinc-500 text-[10px] underline mt-1 hover:text-zinc-300">Заменить</button>
                </div>
              ) : (
                <UploadDropzone
                  endpoint="singlePreviewMp3"
                  config={{ mode: "auto" }}
                  content={{ label: "Перетащите MP3-превью", allowedContent: "Только .MP3 до 32MB" }}
                  onUploadBegin={() => setIsUploading(true)}
                  onBeforeUploadBegin={async (files) => {
                    const validFiles = []
                    for (const file of files) {
                      const isRealMp3 = await verifyAudioMagicBytes(file, "mp3")
                      if (isRealMp3) {
                        validFiles.push(file)
                      } else {
                        toast.error("Бинарная верификация не пройдена!", { description: `Файл ${file.name} не является реальным MP3.` })
                        setIsUploading(false)
                      }
                    }
                    return validFiles
                  }}
                  onClientUploadComplete={(res) => {
                    setPreview({ url: res[0].ufsUrl, key: res[0].key })
                    sessionUploadedKeys.current.push(res[0].key)
                    setIsUploading(false)
                    toast.success("Превью-файл валидирован и сохранен")
                  }}
                  onUploadError={(error) => { setIsUploading(false); toast.error(`Ошибка: ${error.message}`) }}
                />
              )}
            </div>

            {/* 3. HQ WAV */}
            <div className="p-4 bg-[#0c0d12]/40 border border-white/[0.04] rounded-2xl flex flex-col justify-between min-h-[200px]">
              <span className="text-[9px] font-mono uppercase text-zinc-500 block mb-2">3. HQ WAV</span>
              {wav ? (
                <div className="flex-1 flex flex-col items-center justify-center bg-blue-500/5 border border-blue-500/10 rounded-xl p-3 gap-2 text-center w-full">
                  <CheckCircle className="h-5 w-5 text-blue-400" />
                  <span className="text-[9px] font-mono uppercase text-blue-400">WAV Готов</span>
                  <audio controls src={wav.url} className="w-full h-8 mt-2 opacity-80 scale-90 origin-center" />
                  <button type="button" onClick={() => handleReplaceFile("wav", wav)} className="text-zinc-500 text-[10px] underline mt-1 hover:text-zinc-300">Заменить</button>
                </div>
              ) : (
                <UploadDropzone
                  endpoint="singleCommercialWav"
                  config={{ mode: "auto" }}
                  content={{ label: "Перетащите HQ WAV", allowedContent: "Только .WAV до 256MB" }}
                  onUploadBegin={() => setIsUploading(true)}
                  onBeforeUploadBegin={async (files) => {
                    const validFiles = []
                    for (const file of files) {
                      const isRealWav = await verifyAudioMagicBytes(file, "wav")
                      if (isRealWav) {
                        validFiles.push(file)
                      } else {
                        toast.error("Бинарная верификация не пройдена!", { description: `Заголовок ${file.name} не совпадает с сигнатурой RIFF/WAVE.` })
                        setIsUploading(false)
                      }
                    }
                    return validFiles
                  }}
                  onClientUploadComplete={(res) => {
                    setWav({ url: res[0].ufsUrl, key: res[0].key })
                    sessionUploadedKeys.current.push(res[0].key)
                    setIsUploading(false)
                    toast.success("Коммерческий аудиофайл успешно привязан")
                  }}
                  onUploadError={(error) => { setIsUploading(false); toast.error(`Ошибка: ${error.message}`) }}
                />
              )}
            </div>
          </div>
        </div>

        {/* ПРАВАЯ КОЛОНКА */}
        <div className="space-y-4">
          {!isEditMode ? (
            <div className="p-5 bg-[#0c0d12]/40 border border-white/[0.04] rounded-2xl space-y-4 backdrop-blur-md">
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Shield className="h-4 w-4 text-red-500" /> Ценообразование бита
                </h3>
              </div>
              <div className="space-y-2.5">
                {trackLicenses.map((lic, idx) => {
                  const isStemsMissing = lic.fileType === "MP3_WAV_STEMS" && (!watchedStemsUrl || watchedStemsUrl.trim() === "")
                  const isWavMissing = lic.fileType === "MP3_WAV" && !wav?.url
                  const isDisabled = isStemsMissing || isWavMissing

                  return (
                    <div key={lic.templateId} className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${lic.isActive && !isDisabled ? "bg-black/40 border-white/[0.05] h-24" : "bg-black/5 border-white/[0.02] opacity-40 h-auto py-2.5"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-[11px] font-bold text-white uppercase tracking-wider truncate">{lic.name}</h4>
                          <span className="text-[9px] font-mono text-zinc-500 uppercase block">{lic.fileType}</span>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={lic.isActive && !isDisabled} 
                          disabled={isDisabled} 
                          onChange={(e) => handleLicenseToggle(idx, e.target.checked)} 
                          className="rounded bg-black border-white/[0.1] text-red-600 h-3.5 w-3.5 cursor-pointer focus:ring-0 focus:ring-offset-0 disabled:cursor-not-allowed" 
                        />
                      </div>
                      {isStemsMissing && <p className="text-[9px] text-amber-500/80 font-mono mt-1">⚠️ Укажите ссылку на Stems слева</p>}
                      {isWavMissing && <p className="text-[9px] text-amber-500/80 font-mono mt-1">⚠️ Загрузите HQ WAV файл</p>}
                      {lic.isActive && !isDisabled && !lic.isPriceNegotiable && (
                        <div className="flex items-center justify-between pt-1 border-t border-white/[0.02] mt-2">
                          <span className="text-[9px] font-mono text-zinc-600">Стоимость</span>
                          <div className="relative flex items-center max-w-[90px]">
                            <span className="absolute left-2 text-[9px] text-zinc-600 font-mono">₽</span>
                            <input 
                              type="number" 
                              placeholder="0" 
                              value={lic.price} 
                              onChange={(e) => handleLicensePriceChange(idx, e.target.value)} 
                              className="w-full h-6 pl-4 pr-1.5 rounded-md bg-black/60 border border-white/[0.05] text-[10px] font-mono text-white text-right focus:outline-none focus:border-red-600/40" 
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-zinc-900/20 border border-white/[0.02] text-zinc-500 text-[10px] rounded-xl font-mono text-center">
              Управление лицензиями доступно из таблицы каталога.
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="w-full h-11 bg-red-600 hover:bg-red-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(220,38,38,0.1)]"
          >
            {isUploading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Загрузка файлов...</>
            ) : isSubmitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Обработка бита...</>
            ) : (
              isEditMode ? "Сохранить изменения" : "Опубликовать на Маркетплейс"
            )}
          </button>
        </div>
      </div>
    </form>
  )
}