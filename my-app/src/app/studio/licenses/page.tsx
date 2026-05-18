"use client"

import * as React from "react"
import { useState, useTransition } from "react"
import { 
  Shield, FileText, LayoutGrid, Check, 
  DollarSign, Loader2, Save, ToggleLeft, ToggleRight, Info 
} from "lucide-react"
import { updateTrackLicensePrice, toggleTrackLicenseVisibility } from "@/app/actions/studio"

// Демо-данные глобальных шаблонов продюсера (Вкладка 1 и 2)
const MOCK_TEMPLATES = [
  { id: "tmpl-1", name: "Basic Lease", slug: "mp3", defaultPrice: 29.99, isDefaultActive: true, copies: 5000, streams: 100000 },
  { id: "tmpl-2", name: "Premium WAV", slug: "wav", defaultPrice: 49.99, isDefaultActive: true, copies: 10000, streams: 500000 },
  { id: "tmpl-3", name: "Unlimited Rights", slug: "unlimited", defaultPrice: 199.99, isDefaultActive: true, copies: null, streams: null }, // null = Unlimited
]

// Демо-данные треков с их инстансами лицензий для Матрицы (Вкладка 3)
const MOCK_TRACKS_WITH_LICENSES = [
  {
    id: "track-1",
    title: "God Mode",
    bpm: 140,
    licenses: [
      { id: "lic-1-1", templateId: "tmpl-1", price: 29.99, isActive: true, templateName: "Basic Lease" },
      { id: "lic-1-2", templateId: "tmpl-2", price: 49.99, isActive: true, templateName: "Premium WAV" },
      { id: "lic-1-3", templateId: "tmpl-3", price: 149.99, isActive: false, templateName: "Unlimited Rights" }, // Тут цена занижена вручную
    ]
  },
  {
    id: "track-2",
    title: "Deep Waters",
    bpm: 128,
    licenses: [
      { id: "lic-2-1", templateId: "tmpl-1", price: 19.99, isActive: true, templateName: "Basic Lease" }, // Скидка на трек
      { id: "lic-2-2", templateId: "tmpl-2", price: 49.99, isActive: false, templateName: "Premium WAV" },
      { id: "lic-2-3", templateId: "tmpl-3", price: 199.99, isActive: true, templateName: "Unlimited Rights" },
    ]
  }
]

export default function LicensesPage() {
  const [activeTab, setActiveTab] = useState<"templates" | "contracts" | "matrix">("matrix")
  const [isPending, startTransition] = useTransition()
  
  // Состояние для матрицы цен (локальное изменение перед сохранением/отправкой)
  const [matrixTracks, setMatrixTracks] = useState(MOCK_TRACKS_WITH_LICENSES)

  // Переключение тумблера активности прямо в матрице
  const handleToggleLicense = (trackId: string, licenseId: string, currentStatus: boolean) => {
    // 1. Мгновенно обновляем UI для отзывчивости интерфейса (Optimistic UI)
    setMatrixTracks(prev => prev.map(track => {
      if (track.id !== trackId) return track
      return {
        ...track,
        licenses: track.licenses.map(lic => 
          lic.id === licenseId ? { ...lic, isActive: !currentStatus } : lic
        )
      }
    }))

    // 2. Отправляем изменения на бэкенд в фоновом режиме через Server Action
    startTransition(async () => {
      await toggleTrackLicenseVisibility(licenseId, !currentStatus)
    })
  }

  // Изменение цены в инпуте матрицы
  const handlePriceChange = (trackId: string, licenseId: string, newPrice: string) => {
    const parsedPrice = parseFloat(newPrice) || 0
    setMatrixTracks(prev => prev.map(track => {
      if (track.id !== trackId) return track
      return {
        ...track,
        licenses: track.licenses.map(lic => 
          lic.id === licenseId ? { ...lic, price: parsedPrice } : lic
        )
      }
    }))
  }

  // Сохранение кастомной цены по потере фокуса (onBlur) или Enter
  const handleSavePrice = (licenseId: string, price: number) => {
    startTransition(async () => {
      await updateTrackLicensePrice(licenseId, price)
    })
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 sm:p-10">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Хедер модуля */}
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">License Engine</h1>
          <p className="text-xs text-zinc-400 font-medium mt-0.5">
            Управляйте глобальными шаблонами прав, юридическими контрактами и индивидуальной сеткой цен для каждого бита.
          </p>
        </div>

        {/* Навигация по вкладкам (Tabs) */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          {[
            { id: "templates", label: "1. Global Templates", icon: Shield },
            { id: "contracts", label: "2. Contract Info", icon: FileText },
            { id: "matrix", label: "3. Pricing Matrix", icon: LayoutGrid },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                  isActive 
                    ? "border-brand-red text-brand-red" 
                    : "border-transparent text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            )
          })}
          {isPending && (
            <div className="ml-auto flex items-center gap-1.5 text-[10px] text-zinc-400 font-bold uppercase tracking-wider animate-pulse">
              <Loader2 size={12} className="animate-spin text-brand-red" />
              <span>Syncing with DB...</span>
            </div>
          )}
        </div>

        {/* Контент Вкладок */}
        <div className="mt-4">
          
          {/* ВКЛАДКА 1: ГЛОБАЛЬНЫЕ ШАБЛОНЫ */}
          {activeTab === "templates" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-in">
              {MOCK_TEMPLATES.map((tmpl) => (
                <div key={tmpl.id} className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-black tracking-tight">{tmpl.name}</h3>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Type: {tmpl.slug}</span>
                    </div>
                    <span className="text-sm font-black text-brand-red">${tmpl.defaultPrice}</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 space-y-1 font-medium bg-zinc-50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-100 dark:border-zinc-900">
                    <div>Copies Limit: <span className="text-zinc-800 dark:text-zinc-200 font-bold">{tmpl.copies ?? "Unlimited"}</span></div>
                    <div>Streams Limit: <span className="text-zinc-800 dark:text-zinc-200 font-bold">{tmpl.streams ? tmpl.streams.toLocaleString() : "Unlimited"}</span></div>
                  </div>
                  <button className="w-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700/80 text-zinc-700 dark:text-zinc-200 font-bold text-[10px] uppercase py-2 rounded-xl transition tracking-wider">
                    Edit Template
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ВКЛАДКА 2: ЮРИДИЧЕСКИЕ КОНТРАКТЫ (ИНФО) */}
          {activeTab === "contracts" && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-sm max-w-2xl space-y-4 animate-slide-in">
              <div className="flex items-start gap-3 bg-blue-500/5 border border-blue-500/10 p-3.5 rounded-xl text-blue-500 text-[11px] font-medium leading-relaxed">
                <Info size={16} className="shrink-0 mt-0.5" />
                <span>Здесь настраиваются глобальные параметры юрисдикции, которые Prisma подставит в автоматические PDF-контракты купли-продажи для всех типов лицензий.</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Governing Law Country</label>
                  <input type="text" defaultValue="United States" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Arbitration City/Country</label>
                  <input type="text" defaultValue="New York, US" className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none" />
                </div>
              </div>
              <button className="flex items-center gap-1.5 bg-brand-red hover:bg-brand-red/90 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-xl transition tracking-wider shadow-md shadow-brand-red/10">
                <Save size={13} strokeWidth={2.5} />
                <span>Save Contract Rules</span>
              </button>
            </div>
          )}

          {/* ВКЛАДКА 3: МАТРИЦА ЦЕН И УПРАВЛЕНИЯ */}
          {activeTab === "matrix" && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden animate-slide-in">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800/80">
                      <th className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-wider w-1/3">Track Title</th>
                      {MOCK_TEMPLATES.map(tmpl => (
                        <th key={tmpl.id} className="p-4 text-[10px] font-black text-zinc-400 uppercase tracking-wider text-center">
                          {tmpl.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {matrixTracks.map((track) => (
                      <tr key={track.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition">
                        {/* Название трека */}
                        <td className="p-4">
                          <div className="font-bold text-xs tracking-tight">{track.title}</div>
                          <div className="text-[10px] text-zinc-400 font-medium">{track.bpm} BPM</div>
                        </td>

                        {/* Ячейки лицензий этого трека */}
                        {MOCK_TEMPLATES.map((tmpl) => {
                          const lic = track.licenses.find(l => l.templateId === tmpl.id)
                          
                          if (!lic) {
                            return <td key={tmpl.id} className="p-4 text-center text-zinc-400 text-[10px] font-bold">—</td>
                          }

                          return (
                            <td key={tmpl.id} className="p-4">
                              <div className="flex flex-col items-center gap-2">
                                
                                {/* Поле ввода кастомной цены */}
                                <div className="relative flex items-center max-w-[85px]">
                                  <DollarSign size={11} className="absolute left-2 text-zinc-400 dark:text-zinc-500" />
                                  <input
                                    type="number"
                                    value={lic.price}
                                    disabled={!lic.isActive}
                                    onChange={(e) => handlePriceChange(track.id, lic.id, e.target.value)}
                                    onBlur={() => handleSavePrice(lic.id, lic.price)}
                                    onKeyDown={(e) => e.key === "Enter" && handleSavePrice(lic.id, lic.price)}
                                    className={`w-full bg-zinc-50 dark:bg-zinc-950 border rounded-lg pl-5 pr-1.5 py-1 text-center text-xs font-black focus:outline-none transition ${
                                      lic.isActive 
                                        ? "border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-brand-red" 
                                        : "border-transparent text-zinc-400 dark:text-zinc-600 cursor-not-allowed opacity-50"
                                    }`}
                                  />
                                </div>

                                {/* Тумблер переключения активности (Включение/Выключение на витрине) */}
                                <button
                                  onClick={() => handleToggleLicense(track.id, lic.id, lic.isActive)}
                                  className={`transition-colors focus:outline-none rounded-md ${
                                    lic.isActive ? "text-brand-red" : "text-zinc-300 dark:text-zinc-700"
                                  }`}
                                >
                                  {lic.isActive ? (
                                    <ToggleRight size={26} strokeWidth={1.5} />
                                  ) : (
                                    <ToggleLeft size={26} strokeWidth={1.5} />
                                  )}
                                </button>

                              </div>
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}