"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Sparkles, Check, Loader2, Zap, LayoutDashboard, ShieldCheck } from "lucide-react"

export default function PremiumPage() {
  const { data: session, update: updateSession } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const isProducer = session?.user?.role === "PRODUCER"
  const isSubscribed = session?.user?.subscriptionStatus === "ACTIVE"

  const handleActivateProducer = async () => {
    if (!session) {
      // Если не авторизован — отправляем на логин с возвратом сюда же
      router.push("/login?callbackUrl=/premium")
      return
    }

    try {
      setLoading(true)
      
      const response = await fetch("/api/subscription/free-activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      })

      if (!response.ok) throw new Error("Activation failed")

      // Триггерим обновление сессии NextAuth на клиенте, чтобы шапка и сайдбар сразу узнали о новой роли
      await updateSession()
      
      // Мгновенно перенаправляем в только что открывшуюся студию!
      router.push("/studio/dashboard")
      router.refresh()
    } catch (err) {
      console.error(err)
      alert("Не удалось активировать аккаунт продюсера. Попробуйте еще раз.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl w-full mx-auto px-4 py-12 md:py-20 space-y-12 relative z-10">
      {/* Эпическое неоновое фиолетовое свечение на бэкграунде */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Верхний текстовый блок */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/5 border border-purple-500/10 text-purple-400 text-[9px] font-black tracking-widest uppercase">
          <Sparkles className="h-3 w-3" /> Экосистема AURA Сreators
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-wider">
          Выбери свой формат <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-purple-400 to-blue-400">платформы</span>
        </h1>
        <p className="text-zinc-400 text-xs md:text-sm leading-relaxed max-w-lg mx-auto">
          Оставайся покупателем или активируй бесплатный тариф автора, чтобы загружать свои биты, сэмплы и получить доступ к CRM-студии.
        </p>
      </div>

      {/* Сетка двух тарифов */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto pt-4">
        
        {/* КАРТОЧКА 1: СЛУШАТЕЛЬ / ПОКУПАТЕЛЬ */}
        <div className="relative rounded-3xl p-6 md:p-8 bg-[#0c0d12]/30 border border-white/[0.03] backdrop-blur-xl flex flex-col justify-between transition-all hover:border-white/[0.06] group">
          <div className="space-y-6">
            <div>
              <div className="text-zinc-500 font-mono text-[9px] tracking-widest uppercase">// DEFAULT PLAN</div>
              <h3 className="text-base md:text-lg font-black text-white uppercase tracking-wider mt-1">Покупатель / Артист</h3>
              <p className="text-zinc-500 text-[11px] mt-1.5 leading-relaxed">Идеально для исполнителей, ищущих качественный эксклюзивный звук.</p>
            </div>

            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-2xl md:text-3xl font-black text-white">0</span>
              <span className="text-zinc-400 text-sm font-bold">₽</span>
              <span className="text-zinc-500 text-[9px] uppercase font-sans tracking-wider ml-1">/ всегда</span>
            </div>

            <ul className="space-y-3 border-t border-white/[0.04] pt-5">
              <li className="flex items-start gap-2.5 text-[11px] text-zinc-300">
                <Check className="h-3.5 w-3.5 text-zinc-500 shrink-0 mt-0.5" />
                <span>Покупка битов и скачивание файлов контрактов</span>
              </li>
              <li className="flex items-start gap-2.5 text-[11px] text-zinc-300">
                <Check className="h-3.5 w-3.5 text-zinc-500 shrink-0 mt-0.5" />
                <span>Создание собственных плейлистов избранного</span>
              </li>
              <li className="flex items-start gap-2.5 text-[11px] text-zinc-300">
                <Check className="h-3.5 w-3.5 text-zinc-500 shrink-0 mt-0.5" />
                <span>Личный кабинет с историей загрузок</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            <div className="w-full h-10 rounded-xl bg-white/[0.01] border border-white/[0.04] text-zinc-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center select-none">
              Активен по умолчанию
            </div>
          </div>
        </div>

        {/* КАРТОЧКА 2: ПРОДЮСЕР / АВТОР */}
        <div className={`relative rounded-3xl p-6 md:p-8 bg-[#0c0d12]/50 border backdrop-blur-xl flex flex-col justify-between transition-all duration-300 ${
          isProducer 
            ? "border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.04)]" 
            : "border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.06)]"
        }`}>
          {/* Плашка Топа */}
          <span className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white font-black text-[8px] uppercase tracking-widest shadow-lg flex items-center gap-1">
            <Zap className="h-2.5 w-2.5 fill-white" /> СТУДИЯ И ПРОДАЖИ
          </span>

          <div className="space-y-6">
            <div>
              <div className="text-purple-400 font-mono text-[9px] tracking-widest uppercase">// PRODUCTION MODE</div>
              <h3 className="text-base md:text-lg font-black text-white uppercase tracking-wider mt-1">AURA Битмейкер</h3>
              <p className="text-zinc-400 text-[11px] mt-1.5 leading-relaxed">Загружай свои работы, продавай напрямую артистам и управляй заказами через встроенную CRM.</p>
            </div>

            <div className="flex items-baseline gap-1 font-mono">
              <span className="text-2xl md:text-3xl font-black text-purple-400">0</span>
              <span className="text-purple-300 text-sm font-bold">₽</span>
              <span className="text-zinc-500 text-[9px] uppercase font-sans tracking-wider ml-1">/ старт без комиссий</span>
            </div>

            <ul className="space-y-3 border-t border-white/[0.04] pt-5">
              <li className="flex items-start gap-2.5 text-[11px] text-zinc-200">
                <Check className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span className="font-semibold text-white">Доступ к личной панели /studio</span>
              </li>
              <li className="flex items-start gap-2.5 text-[11px] text-zinc-300">
                <Check className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span>Загрузка битов, треков и Сэмпл-паков</span>
              </li>
              <li className="flex items-start gap-2.5 text-[11px] text-zinc-300">
                <Check className="h-3.5 w-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span>Управление лидами, P2P заявками и аналитикой</span>
              </li>
            </ul>
          </div>

          <div className="pt-8">
            {isProducer && isSubscribed ? (
              <button
                onClick={() => router.push("/studio/dashboard")}
                className="w-full h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <LayoutDashboard className="h-3.5 w-3.5" /> Панель Студии открыта
              </button>
            ) : (
              <button
                onClick={handleActivateProducer}
                disabled={loading}
                className="w-full h-10 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white hover:opacity-90 text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 shadow-[0_0_25px_rgba(168,85,247,0.2)]"
              >
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <>Стать продюсером и войти в Studio</>
                )}
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}