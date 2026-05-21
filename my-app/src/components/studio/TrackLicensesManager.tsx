"use client"

import { useState } from "react"
import { toggleTrackLicense } from "@/app/actions/licenses"
import { Shield, ChevronDown, ChevronUp, DollarSign } from "lucide-react"

interface TrackLicensesManagerProps {
  trackTitle: string
  licenses: any[]
}

export default function TrackLicensesManager({ trackTitle, licenses }: TrackLicensesManagerProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="w-full">
      {/* Кнопка-переключатель раскрытия панели */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full h-9 px-4 flex items-center justify-between text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors uppercase tracking-wider"
      >
        <span className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-zinc-500" />
          Связанные контракты и кастомные цены ({licenses.filter(l => l.isActive).length}/{licenses.length})
        </span>
        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {/* Выпадающая сетка управления */}
      {isExpanded && (
        <div className="p-4 pt-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 border-t border-white/[0.02] bg-black/40 animate-in slide-in-from-top-2 duration-150">
          {licenses.map((lic) => (
            <LicenseRow key={lic.id} initialLicense={lic} />
          ))}
        </div>
      )}
    </div>
  )
}

function LicenseRow({ initialLicense }: { initialLicense: any }) {
  const [isActive, setIsActive] = useState(initialLicense.isActive)
  const [price, setPrice] = useState(initialLicense.price !== null ? initialLicense.price.toString() : "")
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdate = async (activeState: boolean, priceValue: string) => {
    setIsUpdating(true)
    const res = await toggleTrackLicense(initialLicense.id, {
      isActive: activeState,
      price: initialLicense.template.isPriceNegotiable ? null : priceValue
    })
    setIsUpdating(false)
    if (!res.success) alert(res.error)
  }

  return (
    <div className={`p-3 rounded-xl border transition-all flex flex-col justify-between h-24 ${
      isActive 
        ? "bg-[#0c0d12]/80 border-white/[0.04]" 
        : "bg-black/10 border-dashed border-white/[0.02] opacity-35"
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-[11px] font-bold text-white uppercase tracking-wider truncate">
            {initialLicense.template.name}
          </h4>
          <span className="text-[9px] font-mono text-zinc-500 uppercase">
            {initialLicense.template.fileType}
          </span>
        </div>

        {/* Тумблер Вкл / Выкл продажи лицензии для конкретного трека */}
        <input
          type="checkbox"
          checked={isActive}
          disabled={isUpdating}
          onChange={(e) => {
            setIsActive(e.target.checked)
            handleUpdate(e.target.checked, price)
          }}
          className="rounded bg-black border-white/[0.1] text-red-600 h-3.5 w-3.5 cursor-pointer focus:ring-0 focus:ring-offset-0"
        />
      </div>

      {/* Поле переопределения прайса */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/[0.02]">
        <span className="text-[9px] font-mono text-zinc-600 uppercase">
          {initialLicense.template.isPriceNegotiable ? "Цена договорная" : "Цена трека"}
        </span>

        {!initialLicense.template.isPriceNegotiable && (
          <div className="relative flex items-center max-w-[110px]">
            <span className="absolute left-2.5 text-[9px] text-zinc-600 font-mono">₽</span>
            <input
              type="number"
              disabled={!isActive || isUpdating}
              placeholder={initialLicense.template.defaultPrice?.toString() || "0"}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onBlur={() => handleUpdate(isActive, price)}
              className="w-full h-7 pl-5 pr-2 rounded-lg bg-black/60 border border-white/[0.05] text-[11px] font-mono text-white text-right focus:outline-none focus:border-red-600/40 disabled:cursor-not-allowed"
            />
          </div>
        )}
      </div>
    </div>
  )
}