"use client"

import * as React from "react"
import { useParams } from "next/navigation"
import { Play, Pause, Heart, Share2, Calendar, Disc, Activity, Key, ShieldCheck } from "lucide-react"
import { ExtendedTrack } from "@/stores/usePromoTracksStore"
import { usePlayerStore } from "@/stores/player-store"

export default function BeatSinglePage() {
  const { id } = useParams()
  const [beat, setBeat] = React.useState<ExtendedTrack | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [selectedLicenseId, setSelectedLicenseId] = React.useState<string>("")

  // Хранилище глобального плеера
  const { play, pause, track: currentTrack, isPlaying } = usePlayerStore()

  React.useEffect(() => {
    if (!id) return
    setIsLoading(true)
    fetch(`/api/beats/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setBeat(data)
          // По умолчанию выбираем первую (самую дешевую) лицензию
          if (data.licenses?.length > 0) {
            setSelectedLicenseId(data.licenses[0].id)
          }
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false))
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!beat) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-zinc-500">
        Бит не найден или был удален.
      </div>
    )
  }

  const isCurrent = currentTrack?.id === beat.id
  const activeLicense = beat.licenses.find(l => l.id === selectedLicenseId)

  const handlePlayToggle = () => {
  if (!beat) return;

  // Создаем объект, адаптированный под требования PlayerTrack
  const playerReadyTrack = {
    ...beat,
    author: beat.producer.displayName || beat.producer.username,
    publicId: beat.id
  };

  if (isCurrent) {
    isPlaying ? pause() : play(playerReadyTrack as any)
  } else {
    play(playerReadyTrack as any, [playerReadyTrack] as any)
  }
}

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 sm:p-12 transition-colors">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Главный блок: Обложка и Информация */}
        <div className="flex flex-col md:flex-row gap-8 items-center md:items-end border-b border-zinc-200 dark:border-zinc-800 pb-10">
          {/* Обложка */}
          <div className="relative h-64 w-64 sm:h-72 sm:w-72 rounded-3xl overflow-hidden shadow-2xl bg-zinc-800 flex-shrink-0 group">
            {beat.image && (
              <img src={beat.image} alt={beat.title} className="object-cover h-full w-full group-hover:scale-105 transition-transform duration-500" />
            )}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <button
                onClick={handlePlayToggle}
                className="bg-brand-red hover:scale-110 text-white p-5 rounded-full shadow-xl transition-all active:scale-95"
              >
                {isCurrent && isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} className="ml-1" fill="currentColor" />}
              </button>
            </div>
          </div>

          {/* Мета-информация */}
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-red bg-brand-red/10 px-3 py-1 rounded-full">
                {beat.genre?.name || "Бит"}
              </span>
              {beat.tags.map((tag) => (
                <span key={tag} className="text-[10px] font-bold uppercase tracking-wider bg-zinc-200 dark:bg-zinc-800 px-3 py-1 rounded-full text-zinc-600 dark:text-zinc-400">
                  #{tag}
                </span>
              ))}
            </div>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight uppercase leading-none">
              {beat.title}
            </h1>

            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="h-7 w-7 rounded-full overflow-hidden bg-zinc-700">
                {beat.producer.avatar && <img src={beat.producer.avatar} alt="producer" className="object-cover h-full w-full" />}
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 font-semibold">
                {beat.producer.displayName || beat.producer.username}
              </p>
            </div>

            {/* Быстрые фичи */}
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm font-bold text-zinc-400 pt-2">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-brand-red" />
                <span>{beat.bpm} BPM</span>
              </div>
              <div className="flex items-center gap-2">
                <Key size={18} className="text-brand-red" />
                <span>{beat.musicKey}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-brand-red" />
                <span>{new Date(beat.createdAt).toLocaleDateString("ru-RU")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Сетка: Выбор Лицензий vs Описание автора */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Левая колонка: Выбор и покупка лицензии */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-black uppercase tracking-wide flex items-center gap-2">
              <ShieldCheck className="text-brand-red" /> Выберите лицензию
            </h2>

            <div className="space-y-3">
              {beat.licenses.map((license: any) => {
                // Безопасное извлечение данных из шаблона
                const templateInfo = license.template
                if (!templateInfo) return null

                return (
                  <div
                    key={license.id}
                    onClick={() => setSelectedLicenseId(license.id)}
                    className={`p-5 bg-white dark:bg-zinc-900 border rounded-2xl cursor-pointer transition-all flex items-center justify-between ${
                      selectedLicenseId === license.id
                        ? "border-brand-red ring-1 ring-brand-red"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${selectedLicenseId === license.id ? "border-brand-red" : "border-zinc-400"}`}>
                          {selectedLicenseId === license.id && <div className="h-2 w-2 bg-brand-red rounded-full" />}
                        </div>
                        {/* СТАЛО: Берем имя из вложенного шаблона */}
                        <h3 className="font-bold text-base">{templateInfo.name}</h3>
                      </div>
                      <p className="text-xs text-zinc-400 pl-7">
                        {/* СТАЛО: Читаем новые свойства из схемы (fileType, распределение копий и стримов) */}
                        {[
                          templateInfo.fileType?.replace("_", " ") || "Audio",
                          templateInfo.audioStreams === null ? "Безлимитные стримы" : `До ${templateInfo.audioStreams.toLocaleString()} стримов`,
                          templateInfo.distributionCopies === null ? "Unlimited копий" : `До ${templateInfo.distributionCopies.toLocaleString()} копий`
                        ].filter(Boolean).join(" • ")}
                      </p>
                    </div>
                    <span className="font-black text-lg text-brand-red">
                      ${license.price.toFixed(2)}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Кнопка действия добавления в корзину */}
            {activeLicense && (
              <button className="w-full bg-zinc-900 hover:bg-brand-red dark:bg-zinc-100 dark:hover:bg-brand-red text-white dark:text-zinc-900 dark:hover:text-white py-4 rounded-2xl font-black uppercase tracking-wide text-sm transition-all active:scale-[0.99] shadow-lg mt-4">
                Добавить в корзину — ${activeLicense.price.toFixed(2)}
              </button>
            )}
          </div>

          {/* Правая колонка: Профиль Продюсера и Соц-кнопки */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl space-y-4 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                О продюсере
              </h3>
              <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                {beat.producer.biography || "Этот битмейкер пока не добавил описание своего профиля."}
              </p>
            </div>

            {/* Панель шеринга и лайков */}
            <div className="flex gap-3">
              <button className="flex-1 bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors">
                <Heart size={16} className="text-brand-red" /> Избранное
              </button>
              <button className="bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 p-3.5 rounded-xl transition-colors">
                <Share2 size={16} />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}