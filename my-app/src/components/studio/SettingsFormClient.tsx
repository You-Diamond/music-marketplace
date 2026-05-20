"use client"

import { useState } from "react"
import { updateProducerProfile } from "@/app/actions/profile"
import { CreditCard, Send, User, Check, Loader2, Info } from "lucide-react"

interface SettingsFormClientProps {
  user: {
    displayName: string | null
    username: string | null
    telegram: string | null
    paymentDetails: string | null
  }
}

export default function SettingsFormClient({ user }: SettingsFormClientProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  // Инициализируем стейты дефолтными значениями из БД
  const [displayName, setDisplayName] = useState(user.displayName || "")
  const [telegram, setTelegram] = useState(user.telegram || "")
  const [paymentDetails, setPaymentDetails] = useState(user.paymentDetails || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSuccess(false)

    const res = await updateProducerProfile({
      displayName,
      telegram,
      paymentDetails,
    })

    setIsSaving(false)
    if (res.success) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    } else {
      alert(res.error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      
      {/* Основной блок настроек */}
      <div className="p-6 bg-[#0c0d12]/40 border border-white/[0.04] rounded-2xl space-y-4 backdrop-blur-md">
        
        {/* Публичное имя */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono uppercase text-zinc-500 flex items-center gap-1.5">
            <User className="h-3 w-3 text-red-500" /> Публичный Псевдоним (Продюсерское имя)
          </label>
          <input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Например: Aura Producer"
            className="w-full h-10 px-4 rounded-xl bg-black/40 border border-white/[0.05] text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-red-600/50 transition-colors"
          />
        </div>

        {/* Telegram Link */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono uppercase text-zinc-500 flex items-center gap-1.5">
            <Send className="h-3 w-3 text-blue-400" /> Юзернейм в Telegram (без @)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-2.5 text-xs font-mono text-zinc-600">@</span>
            <input
              type="text"
              required
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              placeholder="aura_beatmaker"
              className="w-full h-10 pl-8 pr-4 rounded-xl bg-black/40 border border-white/[0.05] text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-red-600/50 transition-colors"
            />
          </div>
          <p className="text-[9px] text-zinc-600 font-mono">
            Необходим, чтобы покупатель мог мгновенно связаться с вами для обсуждения сделки.
          </p>
        </div>

        {/* Реквизиты для оплаты */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono uppercase text-zinc-500 flex items-center gap-1.5">
            <CreditCard className="h-3 w-3 text-purple-400" /> Ваши Реквизиты для Оплаты (P2P)
          </label>
          <textarea
            required
            rows={4}
            value={paymentDetails}
            onChange={(e) => setPaymentDetails(e.target.value)}
            placeholder="Укажите ваши платежные шлюзы, например:&#13;• Т-Банк / Сбербанк (По номеру телефона: +7... или номер карты...)&#13;• Crypto (USDT TRC20: TXXxxxx...)&#13;• Кастомные инструкции к переводу"
            className="w-full p-4 rounded-xl bg-black/40 border border-white/[0.05] text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-red-600/50 transition-colors resize-none leading-relaxed"
          />
        </div>

      </div>

      {/* Информационный виджет-подсказка */}
      <div className="p-4 rounded-xl bg-white/[0.01] border border-white/[0.03] flex gap-3">
        <Info className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
        <p className="text-[10px] text-zinc-500 leading-normal font-mono">
          Безопасность: Платформа Aura не хранит данные ваших CVV/паролей. Вы указываете исключительно публичные реквизиты, на которые артисты будут отправлять прямые P2P-переводы.
        </p>
      </div>

      {/* Кнопка отправки */}
      <button
        type="submit"
        disabled={isSaving}
        className={`w-full h-11 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
          success
            ? "bg-emerald-600 text-white"
            : "bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.15)]"
        }`}
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Сохранение данных...
          </>
        ) : success ? (
          <>
            <Check className="h-4 w-4" /> Данные успешно обновлены
          </>
        ) : (
          "Сохранить платежный профиль"
        )}
      </button>

    </form>
  )
}