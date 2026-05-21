"use client"

import { useState } from "react"
import { updateLicenseTemplate } from "@/app/actions/licenses"
import { Shield, Save, Radio, Infinity as InfinityIcon, Check, HelpCircle, Video, Download, Music } from "lucide-react"

export default function LicenseCardForm({ template }: { template: any }) {
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  // Стейт полей
  const [name, setName] = useState(template.name)
  const [isNegotiable, setIsNegotiable] = useState(template.isPriceNegotiable || false)
  // Безопасное приведение к строке, если цена null
  const [price, setPrice] = useState(template.defaultPrice !== null && template.defaultPrice !== undefined ? template.defaultPrice.toString() : "")
  
  const [streams, setStreams] = useState(template.audioStreams?.toString() || "")
  const [copies, setCopies] = useState(template.distributionCopies?.toString() || "")
  const [radio, setRadio] = useState(template.radioBroadcastingRights)

  const [downloads, setDownloads] = useState(template.freeDownloads?.toString() || "")
  const [mvMonetized, setMvMonetized] = useState(template.musicVideosMonetized?.toString() || "")
  const [videoStreams, setVideoStreams] = useState(template.videoStreamsMonetized?.toString() || "")
  const [liveProfit, setLiveProfit] = useState(template.livePerformancesForProfit || false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSuccess(false)

    const res = await updateLicenseTemplate(template.id, {
      name,
      isPriceNegotiable: isNegotiable,
      defaultPrice: isNegotiable ? null : price,
      audioStreams: streams === "" ? null : streams,
      distributionCopies: copies === "" ? null : copies,
      radioBroadcastingRights: radio,
      freeDownloads: downloads === "" ? null : downloads,
      musicVideosMonetized: mvMonetized === "" ? null : mvMonetized,
      videoStreamsMonetized: videoStreams === "" ? null : videoStreams,
      livePerformancesForProfit: liveProfit
    })

    setIsSaving(false)
    if (res.success) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2000)
    } else {
      alert(res.error)
    }
  }

return (
    <form 
      onSubmit={handleSave}
      className="p-5 bg-[#0c0d12]/40 border border-white/[0.04] rounded-2xl space-y-4 backdrop-blur-md relative group hover:border-white/[0.08] transition-all"
    >
      {/* Шапка карточки */}
      <div className="flex items-center justify-between border-b border-white/[0.04] pb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-red-500" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-transparent font-bold text-xs text-white uppercase tracking-wider border-none p-0 focus:outline-none focus:ring-0 w-40"
          />
        </div>
        <span className="text-[9px] font-mono bg-white/[0.02] border border-white/[0.05] text-zinc-500 px-1.5 py-0.5 rounded uppercase">
          {template.slug}
        </span>
      </div>

      {/* Переключатель: Договорная цена */}
      <div className="flex items-center justify-between p-2 bg-black/20 rounded-xl border border-white/[0.02]">
        <div className="flex items-center gap-1.5">
          <HelpCircle className="h-3.5 w-3.5 text-zinc-500" />
          <span className="text-[10px] font-mono uppercase text-zinc-400">Договорная цена</span>
        </div>
        <input
          type="checkbox"
          checked={isNegotiable}
          onChange={(e) => {
            setIsNegotiable(e.target.checked)
            if (e.target.checked) setPrice("")
          }}
          className="rounded bg-black border-white/[0.1] text-red-600 focus:ring-0 focus:ring-offset-0 h-3.5 w-3.5 cursor-pointer"
        />
      </div>

      {/* Цена */}
      <div className={isNegotiable ? "opacity-30 transition-opacity" : "transition-opacity"}>
        <label className="text-[10px] font-mono uppercase text-zinc-500 mb-1 block">Цена (₽)</label>
        <div className="relative flex items-center">
          <span className="absolute left-3 text-xs text-zinc-600 font-mono">₽</span>
          <input
            type="number"
            disabled={isNegotiable}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full h-9 pl-8 pr-4 rounded-xl bg-black/40 border border-white/[0.05] text-xs text-white focus:outline-none focus:border-red-600/50 transition-colors font-mono"
            placeholder={isNegotiable ? "Договорная" : "0"}
          />
        </div>
      </div>

      <div className="h-px bg-white/[0.03] my-2" />

      {/* Сетка лимитов */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[9px] font-mono uppercase text-zinc-500 flex items-center justify-between">
            <span>Аудио-Стримы</span>
            {!streams && <InfinityIcon className="h-2.5 w-2.5 text-emerald-500" />}
          </label>
          <input
            type="number"
            placeholder="Безлимит"
            value={streams}
            onChange={(e) => setStreams(e.target.value)}
            className="w-full h-8 px-2.5 rounded-lg bg-black/40 border border-white/[0.05] text-xs font-mono text-white placeholder-zinc-700 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-mono uppercase text-zinc-500 flex items-center justify-between">
            <span>Тираж копий</span>
            {!copies && <InfinityIcon className="h-2.5 w-2.5 text-emerald-500" />}
          </label>
          <input
            type="number"
            placeholder="Безлимит"
            value={copies}
            onChange={(e) => setCopies(e.target.value)}
            className="w-full h-8 px-2.5 rounded-lg bg-black/40 border border-white/[0.05] text-xs font-mono text-white placeholder-zinc-700 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-mono uppercase text-zinc-500 flex items-center justify-between">
            <span>Скачивания</span>
            {!downloads && <InfinityIcon className="h-2.5 w-2.5 text-emerald-500" />}
          </label>
          <input
            type="number"
            placeholder="Безлимит"
            value={downloads}
            onChange={(e) => setDownloads(e.target.value)}
            className="w-full h-8 px-2.5 rounded-lg bg-black/40 border border-white/[0.05] text-xs font-mono text-white placeholder-zinc-700 focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[9px] font-mono uppercase text-zinc-500 flex items-center justify-between">
            <span>Видео-Стримы</span>
            {!videoStreams && <InfinityIcon className="h-2.5 w-2.5 text-emerald-500" />}
          </label>
          <input
            type="number"
            placeholder="Безлимит"
            value={videoStreams}
            onChange={(e) => setVideoStreams(e.target.value)}
            className="w-full h-8 px-2.5 rounded-lg bg-black/40 border border-white/[0.05] text-xs font-mono text-white placeholder-zinc-700 focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-[9px] font-mono uppercase text-zinc-500 flex items-center justify-between">
          <span>Макс. Муз. Клипов (YouTube)</span>
        </label>
        <input
          type="number"
          placeholder="Количество клипов"
          value={mvMonetized}
          onChange={(e) => setMvMonetized(e.target.value)}
          className="w-full h-8 px-2.5 rounded-lg bg-black/40 border border-white/[0.05] text-xs font-mono text-white placeholder-zinc-700 focus:outline-none"
        />
      </div>

      {/* Чекбоксы прав */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between p-2 bg-black/20 rounded-xl border border-white/[0.02]">
          <div className="flex items-center gap-2">
            <Radio className="h-3.5 w-3.5 text-zinc-500" />
            <span className="text-[10px] font-mono uppercase text-zinc-400">Радиовещание</span>
          </div>
          <input
            type="checkbox"
            checked={radio}
            onChange={(e) => setRadio(e.target.checked)}
            className="rounded bg-black border-white/[0.1] text-red-600 focus:ring-0 focus:ring-offset-0 h-4 w-4 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between p-2 bg-black/20 rounded-xl border border-white/[0.02]">
          <div className="flex items-center gap-2">
            <Music className="h-3.5 w-3.5 text-zinc-500" />
            <span className="text-[10px] font-mono uppercase text-zinc-400">Выступления с доходом</span>
          </div>
          <input
            type="checkbox"
            checked={liveProfit}
            onChange={(e) => setLiveProfit(e.target.checked)}
            className="rounded bg-black border-white/[0.1] text-red-600 focus:ring-0 focus:ring-offset-0 h-4 w-4 cursor-pointer"
          />
        </div>
      </div>

      {/* Кнопка сохранения */}
      <button
        type="submit"
        disabled={isSaving}
        className={`w-full h-9 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
          success 
            ? "bg-emerald-600 text-white" 
            : "bg-white/[0.03] hover:bg-red-600 border border-white/[0.05] hover:border-transparent text-zinc-400 hover:text-white"
        }`}
      >
        {isSaving ? "Сохранение..." : success ? <><Check className="h-3.5 w-3.5" /> Сохранено</> : <><Save className="h-3.5 w-3.5" /> Сохранить контракт</>}
      </button>
    </form>
  )
}