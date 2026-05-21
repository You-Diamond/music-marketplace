import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { MessageSquare, ArrowRight, Calendar, User, DollarSign, Clock, CheckCircle, ShieldAlert } from "lucide-react"
import InquiryFilters from "@/components/studio/InquiryFilters"

export const dynamic = "force-dynamic"

export default async function StudioInquiriesPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "PRODUCER") redirect("/")

  const statusFilter = searchParams.status

  // 1. Сначала запрашиваем ВСЕ заказы продюсера без фильтрации по статусу, чтобы собрать точную аналитику
  const allProducerOrders = await prisma.order.findMany({
    where: { sellerId: session.user.id },
    include: {
      items: { include: { license: true } }
    }
  })

  // Высчитываем аналитику для CRM панелей
  let totalEarnings = 0
  let pendingCount = 0
  let actionRequiredCount = 0 // Статус PAYMENT_SUBMITTED (Покупатель прислал чек)

  allProducerOrders.forEach(order => {
    // ИСПРАВЛЕНИЕ: Добавляем оператор ?? 0 для безопасного сложения цены, которая может быть null
    const orderTotal = order.items.reduce((sum, item) => sum + (item.license.price ?? 0), 0)
    
    if (order.status === "PAID" || order.status === "COMPLETED") {
      totalEarnings += orderTotal
    } else if (order.status === "PENDING_PAYMENT") {
      pendingCount++
    } else if (order.status === "PAYMENT_SUBMITTED") {
      actionRequiredCount++
    }
  })

  // 2. Формируем условия фильтрации для текущего вывода в таблицу
  const whereCondition: any = {
    sellerId: session.user.id,
  }

  if (statusFilter && statusFilter !== "ALL") {
    whereCondition.status = statusFilter
  }

  // Получаем отфильтрованный список входящих заказов
  const orders = await prisma.order.findMany({
    where: whereCondition,
    include: {
      buyer: { select: { displayName: true, username: true } },
      items: { 
        include: { 
          track: { select: { title: true } },
          license: { include: { template: { select: { name: true } } } }
        } 
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white uppercase tracking-wider">CRM: Запросы на покупку</h1>
        <p className="text-zinc-500 text-xs mt-1">
          Отслеживайте статус P2P-переводов и управляйте доступом к исходникам битов.
        </p>
      </div>

      {/* Блок аналитики прибыли */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-[#0c0d12]/40 border border-white/[0.04] rounded-2xl flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Чистый заработок</span>
            <h3 className="text-lg font-bold font-mono text-white mt-0.5">${totalEarnings.toFixed(2)}</h3>
          </div>
        </div>

        <div className="p-4 bg-[#0c0d12]/40 border border-white/[0.04] rounded-2xl flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Требуют проверки (Чеки)</span>
            <h3 className="text-lg font-bold font-mono text-white mt-0.5">{actionRequiredCount} шт.</h3>
          </div>
        </div>

        <div className="p-4 bg-[#0c0d12]/40 border border-white/[0.04] rounded-2xl flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">Ожидают оплаты</span>
            <h3 className="text-lg font-bold font-mono text-white mt-0.5">{pendingCount} шт.</h3>
          </div>
        </div>
      </div>

      {/* Панель фильтров */}
      <InquiryFilters />

      {/* Если заказов нет */}
      {orders.length === 0 ? (
        <div className="p-12 border border-white/[0.04] bg-[#0c0d12]/20 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
          <MessageSquare className="h-8 w-8 text-zinc-600" />
          <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400">Ничего не найдено</h3>
          <p className="text-[11px] text-zinc-500 max-w-xs leading-normal">
            В этой категории пока нет запросов от артистов.
          </p>
        </div>
      ) : (
        /* Таблица заказов */
        <div className="border border-white/[0.04] bg-[#0c0d12]/30 backdrop-blur-md rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.04] bg-white/[0.01] text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                  <th className="p-4">ID / Дата</th>
                  <th className="p-4">Покупатель</th>
                  <th className="p-4">Биты (Контент)</th>
                  <th className="p-4">Сумма</th>
                  <th className="p-4">Статус</th>
                  <th className="p-4 text-right">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03] text-xs">
                {orders.map((order) => {
                  const trackTitles = order.items.map((i) => i.track.title).join(", ")
                  // ИСПРАВЛЕНИЕ: Также защищаем калькулятор суммы внутри метода .map() для таблицы
                  const orderTotal = order.items.reduce((sum, item) => sum + (item.license.price ?? 0), 0)

                  return (
                    <tr key={order.id} className="hover:bg-white/[0.01] transition-colors group">
                      <td className="p-4 space-y-1">
                        <span className="font-mono text-[11px] text-zinc-400">#{order.id.slice(0, 8)}</span>
                        <div className="flex items-center gap-1 text-[10px] text-zinc-600">
                          <Calendar className="h-3 w-3" />
                          {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-1.5 font-medium text-white">
                          <User className="h-3.5 w-3.5 text-zinc-500" />
                          {order.buyer.displayName || `@${order.buyer.username}`}
                        </div>
                      </td>

                      <td className="p-4 max-w-xs truncate">
                        <span className="text-zinc-300 font-medium">{trackTitles}</span>
                        <span className="block text-[10px] text-zinc-500 font-mono mt-0.5">
                          Позиций: {order.items.length}
                        </span>
                      </td>

                      <td className="p-4 font-mono font-bold text-white">
                        ${orderTotal.toFixed(2)}
                      </td>

                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                          order.status === "PENDING_PAYMENT" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                          order.status === "PAYMENT_SUBMITTED" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse" :
                          order.status === "PAID" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" :
                          order.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          {order.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <Link 
                          href={`/studio/inquiries/${order.id}`}
                          className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-zinc-300 hover:text-white hover:bg-white/[0.08] font-medium transition-all text-[11px]"
                        >
                          Детали <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
