"use client"

import { useState } from "react"
import { updateLicenseTemplate } from "@/app/actions/licenses"
import { Shield, Save, Disc, Radio, Infinity as InfinityIcon, Check } from "lucide-react"

export default function LicenseCardForm({ template }: { template: any }) {
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  // Стейт полей
  const [name, setName] = useState(template.name)
  const [price, setPrice] = useState(template.defaultPrice.toString())
  const [streams, setStreams] = useState(template.audioStreams?.toString() || "")
  const [copies, setCopies] = useState(template.distributionCopies?.toString() || "")
  const [radio, setRadio] = useState(template.radioBroadcastingRights)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSuccess(false)

    const res = await updateLicenseTemplate(template.id, {
      name,
      defaultPrice: price,
      audioStreams: streams === "" ? null : streams,
      distributionCopies: copies === "" ? null : copies,
      radioBroadcastingRights: radio
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
      {/* Шапка карточки типа контракта */}
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

      {/* Цена */}
      <div className="space-y-1">
        <label className="text-[9px] font-mono uppercase text-zinc-600">Цена по умолчанию ($)</label>
        <div className="relative">
          <span className="absolute left-3 top-2 text-xs font-mono text-zinc-500">$</span>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full h-8 pl-6 pr-3 rounded-lg bg-black/40 border border-white/[0.05] text-xs font-mono text-white focus:outline-none focus:border-red-600/40 transition-colors"
          />
        </div>
      </div>

      {/* Лимит аудио-стримов */}
      <div className="space-y-1">
        <label className="text-[9px] font-mono uppercase text-zinc-600 flex items-center justify-between">
          <span>Лимит Стримов (Spotify/Apple)</span>
          {!streams && <InfinityIcon className="h-3 w-3 text-emerald-500" />}
        </label>
        <input
          type="number"
          placeholder="Безлимитно (оставьте пустым)"
          value={streams}
          onChange={(e) => setStreams(e.target.value)}
          className="w-full h-8 px-3 rounded-lg bg-black/40 border border-white/[0.05] text-xs font-mono text-white placeholder-zinc-700 focus:outline-none"
        />
      </div>

      {/* Лимит дистрибуции копий (Тираж альбомов/треков) */}
      <div className="space-y-1">
        <label className="text-[9px] font-mono uppercase text-zinc-600 flex items-center justify-between">
          <span>Макс. тираж копий</span>
          {!copies && <InfinityIcon className="h-3 w-3 text-emerald-500" />}
        </label>
        <input
          type="number"
          placeholder="Безлимитно (оставьте пустым)"
          value={copies}
          onChange={(e) => setCopies(e.target.value)}
          className="w-full h-8 px-3 rounded-lg bg-black/40 border border-white/[0.05] text-xs font-mono text-white placeholder-zinc-700 focus:outline-none"
        />
      </div>

      {/* Радио-ротации */}
      <div className="flex items-center justify-between p-2.5 bg-black/20 rounded-xl border border-white/[0.02]">
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

      {/* Кнопка сохранения изменений в шаблоне */}
      <button
        type="submit"
        disabled={isSaving}
        className={`w-full h-9 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
          success 
            ? "bg-emerald-600 text-white" 
            : "bg-white/[0.03] hover:bg-red-600 border border-white/[0.05] hover:border-transparent text-zinc-400 hover:text-white"
        }`}
      >
        {isSaving ? (
          "Сохранение..."
        ) : success ? (
          <>
            <Check className="h-3.5 w-3.5" /> Изменения сохранены
          </>
        ) : (
          <>
            <Save className="h-3.5 w-3.5" /> Сохранить контракт
          </>
        )}
      </button>

    </form>
  )
}