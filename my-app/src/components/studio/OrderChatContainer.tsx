"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { sendChatMessage, submitPaymentProof, updateOrderStatus } from "@/app/actions/chat"
import { Shield, Send, CheckCircle2, AlertTriangle, FileDown, Clock, Image as ImageIcon } from "lucide-react"

interface OrderChatContainerProps {
  order: any
  currentUserId: string
  isSeller: boolean
}

export default function OrderChatContainer({ order, currentUserId, isSeller }: OrderChatContainerProps) {
  const router = useRouter()
  const [msgText, setMsgText] = useState("")
  const [isSending, setIsSending] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Плавный скролл вниз при новых сообщениях
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [order.messages])

  // ⚡️ Легковесный реалтайм (Polling)
  // Каждые 5 секунд Next.js будет тихо обновлять данные страницы в фоне
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [router])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!msgText.trim() || isSending) return

    setIsSending(true)
    const res = await sendChatMessage(order.id, msgText)
    if (res.success) setMsgText("")
    setIsSending(false)
  }

  const handleFakeUploadProof = async () => {
    const fakeUrl = "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=500"
    const res = await submitPaymentProof(order.id, fakeUrl)
    if (!res.success) alert("Ошибка при отправке чека")
  }

  const handleStatusChange = async (status: string) => {
    if (!confirm(`Вы уверены, что хотите перевести сделку в статус ${status}?`)) return
    const res = await updateOrderStatus(order.id, status)
    if (!res.success) alert(res.error)
  }

  const isPaidOrCompleted = order.status === "PAID" || order.status === "COMPLETED"

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)] items-stretch">
      
      {/* ЛЕВАЯ ПАНЕЛЬ: Детализация ордера */}
      <div className="bg-[#0c0d12]/50 border border-white/[0.04] p-6 rounded-2xl flex flex-col justify-between backdrop-blur-md overflow-y-auto scrollbar-none">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">// Сделка #{order.id.slice(0,8)}</span>
            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
              order.status === "PENDING_PAYMENT" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
              order.status === "PAYMENT_SUBMITTED" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
              order.status === "PAID" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]" :
              order.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
              "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}>
              {order.status}
            </span>
          </div>

          {/* Список купленных треков */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase text-zinc-400">Приобретаемый контент:</h4>
            {order.items.map((item: any) => (
              <div key={item.id} className="p-3 bg-white/[0.01] border border-white/[0.03] rounded-xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-white">{item.track.title}</p>
                    <p className="text-[9px] text-purple-400 font-mono uppercase mt-0.5">{item.license.template.name}</p>
                  </div>
                  {!isPaidOrCompleted && (
                    <div className="p-2 text-zinc-600" title="Доступ заблокирован до подтверждения оплаты">
                      <Clock className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {/* Блок скачивания чистого мастер-материала (показывается только после оплаты) */}
                {isPaidOrCompleted && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-white/[0.03]">
                    <a 
                      href={item.track.wavUrl || item.track.audio} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="w-full h-8 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white transition-all text-[10px] font-mono uppercase font-bold flex items-center justify-center gap-1.5 border border-emerald-500/10 hover:border-transparent"
                    >
                      <FileDown className="h-3.5 w-3.5" /> Скачать {item.track.wavUrl ? "HQ WAV" : "MP3 Мастер"}
                    </a>
                    
                    {item.track.stemsUrl && (
                      <a 
                        href={item.track.stemsUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-full h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all text-[10px] font-mono uppercase font-bold flex items-center justify-center gap-1.5 border border-white/[0.02]"
                      >
                        Скачать дорожки (Stems)
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Отображение прикрепленного чека */}
          {order.paymentProof && (
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase text-zinc-400">Доказательство оплаты (Чек):</h4>
              <a href={order.paymentProof} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[11px] text-zinc-400 hover:text-white transition-colors">
                <ImageIcon className="h-4 w-4 text-blue-400" /> Смотреть скриншот платежа
              </a>
            </div>
          )}
        </div>

        {/* Управление Системой Защиты / Кнопки действий */}
        <div className="pt-4 border-t border-white/[0.05] space-y-2 mt-4">
          {/* Действия для ПОКУПАТЕЛЯ */}
          {!isSeller && (
            <>
              {order.status === "PENDING_PAYMENT" && (
                <button onClick={handleFakeUploadProof} className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all">
                  Я оплатил (Прикрепить чек)
                </button>
              )}
              {order.status === "PAID" && (
                <button onClick={() => handleStatusChange("COMPLETED")} className="w-full h-10 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all">
                  Файлы получены, закрыть сделку
                </button>
              )}
              {(order.status === "PAYMENT_SUBMITTED" || order.status === "PENDING_PAYMENT") && (
                <button onClick={() => handleStatusChange("DISPUTE")} className="w-full h-10 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5" /> Открыть спор
                </button>
              )}
            </>
          )}

          {/* Действия для ПРОДАВЦА */}
          {isSeller && (
            <>
              {order.status === "PAYMENT_SUBMITTED" && (
                <button onClick={() => handleStatusChange("PAID")} className="w-full h-10 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                  <CheckCircle2 className="h-4 w-4" /> Деньги пришли, открыть доступ
                </button>
              )}
              {order.status === "PENDING_PAYMENT" && (
                <p className="text-[10px] text-zinc-500 font-mono text-center leading-relaxed">
                  Ожидайте, пока покупатель совершит перевод и прикрепит чек.
                </p>
              )}
              {order.status === "PAID" && (
                <p className="text-[10px] text-purple-400 font-mono text-center leading-relaxed">
                  Доступ предоставлен. Ожидаем финального подтверждения покупателя.
                </p>
              )}
              {order.status === "PAYMENT_SUBMITTED" && (
                <button onClick={() => handleStatusChange("DISPUTE")} className="w-full h-10 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5" /> Открыть спор
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ПРАВАЯ ПАНЕЛЬ: Мессенджер */}
      <div className="lg:col-span-2 bg-[#0c0d12]/30 border border-white/[0.04] rounded-2xl flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-white/[0.04] bg-white/[0.01] flex items-center gap-2">
          <Shield className="h-4 w-4 text-purple-400" />
          <span className="text-xs font-mono uppercase tracking-wider text-zinc-300">
            {isSeller ? "Чат с покупателем" : "Чат с автором бита"}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-none">
          {order.messages.map((msg: any) => {
            if (msg.isSystem) {
              return (
                <div key={msg.id} className="mx-auto max-w-md p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[11px] font-mono text-zinc-400 leading-relaxed text-center whitespace-pre-line">
                  {msg.text}
                </div>
              )
            }

            const myMsg = msg.senderId === currentUserId

            return (
              <div key={msg.id} className={`flex ${myMsg ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs md:max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                  myMsg 
                    ? "bg-red-600/90 text-white rounded-br-none" 
                    : "bg-white/[0.04] border border-white/[0.05] text-zinc-200 rounded-bl-none"
                }`}>
                  <p>{msg.text}</p>
                  <span className="block text-[8px] opacity-40 font-mono mt-1 text-right">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )
          })}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-3 border-t border-white/[0.04] bg-white/[0.01] flex gap-2">
          <input
            type="text"
            value={msgText}
            onChange={(e) => setMsgText(e.target.value)}
            placeholder="Напишите сообщение..."
            className="flex-1 h-10 px-4 rounded-xl bg-black/40 border border-white/[0.05] text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-red-600/50 transition-colors"
          />
          <button type="submit" disabled={isSending} className="h-10 w-10 shrink-0 bg-red-600 hover:bg-red-500 rounded-xl flex items-center justify-center text-white transition-all">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

    </div>
  )
}