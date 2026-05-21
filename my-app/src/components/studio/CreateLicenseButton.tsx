"use client"

import { useState } from "react"
import { createLicenseTemplate } from "@/app/actions/licenses"
import { Plus, ShieldAlert, Sparkles, X } from "lucide-react"

export default function CreateLicenseButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [licenseName, setLicenseName] = useState("")
  const [fileType, setFileType] = useState("MP3")

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!licenseName.trim()) return

    setIsPending(true)
    const res = await createLicenseTemplate({
      name: licenseName,
      fileType: fileType as any
    })
    setIsPending(false)

    if (res.success) {
      setIsOpen(false)
      setLicenseName("")
      // Страница автоматически обновится благодаря revalidatePath на бэкенде
    } else if (res.requiresUpgrade) {
      setIsOpen(false)
      setShowPaywall(true) // Показываем предложение апгрейда
    } else {
      alert(res.error)
    }
  }

  return (
    <>
      {/* Кнопка создания в сетке */}
      <button
        onClick={() => setIsOpen(true)}
        className="h-[385px] w-full border border-dashed border-white/[0.08] hover:border-red-600/40 rounded-2xl bg-white/[0.01] hover:bg-red-600/[0.02] flex flex-col items-center justify-center gap-2 group transition-all"
      >
        <div className="h-10 w-10 rounded-full bg-white/[0.02] border border-white/[0.05] flex items-center justify-center group-hover:scale-110 group-hover:bg-red-600/10 group-hover:border-red-600/20 transition-all">
          <Plus className="h-4 w-4 text-zinc-400 group-hover:text-red-500 transition-colors" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-zinc-300 transition-colors">
          Добавить тип лицензии
        </span>
      </button>

      {/* Модальное окно создания шаблона */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="w-full max-w-sm bg-[#0c0d12] border border-white/[0.08] rounded-2xl p-5 space-y-4 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setIsOpen(false)} 
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
            
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Новый контракт</h3>
              <p className="text-[11px] text-zinc-500 mt-1">Создайте кастомные условия использования ваших битов</p>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-zinc-500">Название лицензии</label>
                <input
                  type="text"
                  required
                  placeholder="Напр. Лицензия для YouTube"
                  value={licenseName}
                  onChange={(e) => setLicenseName(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/[0.05] text-xs text-white focus:outline-none focus:border-red-600/50 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase text-zinc-500">Пакет файлов (Бандл)</label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl bg-black/40 border border-white/[0.05] text-xs text-white focus:outline-none focus:border-red-600/50 font-mono appearance-none"
                >
                  <option value="MP3">Только MP3</option>
                  <option value="MP3_WAV">MP3 + HQ WAV</option>
                  <option value="MP3_WAV_STEMS">MP3 + WAV + Трек-аут (Stems)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full h-10 bg-white text-black hover:bg-red-600 hover:text-white transition-colors rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-50"
              >
                {isPending ? "Создание..." : "Создать шаблон"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 🛑 SAAS PAYWALL POPUP (Т-Банк / ЮKassa интеграция в будущем) */}
      {showPaywall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-gradient-to-b from-purple-950/20 to-[#0c0d12] border border-purple-500/20 rounded-2xl p-6 text-center space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowPaywall(false)} 
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-purple-400" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">Перейдите на PRO аккаунт</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                Вы достигли лимита бесплатных контрактов. Тариф PRO снимает ограничения и открывает доступ к полной кастомизации бизнеса.
              </p>
            </div>

            <div className="bg-black/30 rounded-xl p-3 border border-white/[0.02] text-left space-y-2 max-w-sm mx-auto">
              <div className="flex items-center gap-2 text-[11px] text-zinc-300">
                <div className="h-1 w-1 rounded-full bg-purple-400" />
                <span>До 10 уникальных типов лицензий</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-300">
                <div className="h-1 w-1 rounded-full bg-purple-400" />
                <span>Рекуррентные (автоматические) выплаты</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-zinc-300">
                <div className="h-1 w-1 rounded-full bg-purple-400" />
                <span>Приоритетное размещение в ленте маркета</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  alert("Интеграция оплаты ЮKassa / Т-Банк: Перенаправление на форму выставления счета за подписку (499 ₽/мес)...")
                }}
                className="w-full h-11 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition-all rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-purple-600/10"
              >
                Оформить PRO — 499 ₽ / месяц
              </button>
              <p className="text-[10px] text-zinc-600 font-mono">Безопасная оплата картами РФ. Отмена в любой момент.</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}