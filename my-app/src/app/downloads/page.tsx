import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Download, Music, ShieldCheck, ArrowRight, FileText, ExternalLink, Calendar } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

interface PageProps {
  searchParams: Promise<{ tab?: string }>
}

export default async function DownloadsPage({ searchParams }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login?callbackUrl=/downloads")

  const resolvedSearchParams = await searchParams
  const activeTab = resolvedSearchParams.tab || "files"

  // 1. Получаем все оплаченные ордера для вкладки "Файлы"
  const paidOrders = await prisma.order.findMany({
    where: {
      buyerId: session.user.id,
      status: { in: ["PAID", "COMPLETED"] }
    },
    include: {
      seller: { select: { displayName: true, username: true } },
      items: {
        include: {
          track: true,
          license: { include: { template: true } }
        }
      }
    },
    orderBy: { updatedAt: "desc" }
  })

  // Извлекаем чистый плоский список купленных треков из всех успешных ордеров
  const purchasedTracks = paidOrders.flatMap(order => 
    order.items.map(item => ({
      orderId: order.id,
      sellerName: order.seller.displayName || `@${order.seller.username}`,
      track: item.track,
      licenseName: item.license.template.name,
    }))
  )

  // 2. Получаем абсолютно все ордера для вкладки "История сделок"
  const allOrders = await prisma.order.findMany({
    where: { buyerId: session.user.id },
    include: {
      seller: { select: { displayName: true, username: true } },
      items: { include: { track: { select: { title: true } } } }
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Купленный контент</h1>
        <p className="text-zinc-500 text-xs mt-1">Управляйте вашими лицензиями, скачивайте аудиофайлы высокого качества и трекауты.</p>
      </div>

      {/* Табы */}
      <div className="flex border-b border-white/[0.05] gap-6">
        <Link 
          href="/downloads?tab=files"
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === "files" ? "border-red-600 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Мои файлы ({purchasedTracks.length})
        </Link>
        <Link 
          href="/downloads?tab=orders"
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
            activeTab === "orders" ? "border-red-600 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          История сделок ({allOrders.length})
        </Link>
      </div>

      {/* ТАБ 1: Купленные треки / файлы */}
      {activeTab === "files" && (
        purchasedTracks.length === 0 ? (
          <div className="p-12 border border-white/[0.04] bg-[#0c0d12]/20 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
            <Music className="h-8 w-8 text-zinc-600" />
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400">Файлы отсутствуют</h3>
            <p className="text-[11px] text-zinc-500 max-w-xs">
              Здесь появятся ваши биты, как только продюсеры подтвердят факт получения оплаты в чате сделки.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {purchasedTracks.map((item, index) => (
              <div 
                key={`${item.track.id}-${index}`}
                className="p-5 bg-[#0c0d12]/40 backdrop-blur-md border border-white/[0.04] rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="h-12 w-12 rounded-xl bg-zinc-800 overflow-hidden shrink-0 relative flex items-center justify-center">
                    {item.track.image ? (
                      <img src={item.track.image} alt={item.track.title} className="w-full h-full object-cover" />
                    ) : (
                      <Music className="h-5 w-5 text-zinc-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">{item.track.title}</h3>
                    <p className="text-[10px] text-zinc-500 mt-0.5">Автор: {item.sellerName}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 rounded bg-purple-500/5 border border-purple-500/10 text-[9px] font-mono text-purple-400 uppercase tracking-wider">
                      Лицензия: {item.licenseName}
                    </span>
                  </div>
                </div>

                {/* Блок скачивания (Ссылки станут активными только при их наличии в схеме трека) */}
                <div className="flex flex-wrap items-center gap-2 md:justify-end">
                  <Link
                    href={`/orders/${item.orderId}`}
                    className="px-3 py-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] text-[10px] font-mono uppercase text-zinc-400 hover:text-white transition-all flex items-center gap-1"
                  >
                    Чат сделки
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                  
                  {/* Скачивание бита (Замени поля на свои реальные строки ссылок, если они у тебя в схеме называются по-другому) */}
                  <a
                    href={item.track.audio || "#"} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                      item.track.audio 
                        ? "bg-red-600 hover:bg-red-500 text-white" 
                        : "bg-zinc-800 text-zinc-500 cursor-not-allowed pointer-events-none"
                    }`}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Скачать файлы (.WAV/.MP3)
                  </a>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ТАБ 2: История всех сделок */}
      {activeTab === "orders" && (
        allOrders.length === 0 ? (
          <div className="p-12 border border-white/[0.04] bg-[#0c0d12]/20 rounded-2xl flex flex-col items-center justify-center text-center space-y-3">
            <FileText className="h-8 w-8 text-zinc-600" />
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400">История пуста</h3>
            <p className="text-[11px] text-zinc-500 max-w-xs">Вы еще не отправляли запросы продюсерам.</p>
          </div>
        ) : (
          <div className="border border-white/[0.04] bg-[#0c0d12]/30 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/[0.04] bg-white/[0.01] text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                    <th className="p-4">Заказ / Дата</th>
                    <th className="p-4">Продавец</th>
                    <th className="p-4">Биты</th>
                    <th className="p-4">Статус</th>
                    <th className="p-4 text-right">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {allOrders.map((order) => {
                    const tracks = order.items.map(i => i.track.title).join(", ")
                    return (
                      <tr key={order.id} className="hover:bg-white/[0.01] transition-colors group">
                        <td className="p-4 space-y-0.5">
                          <span className="font-mono text-zinc-400">#{order.id.slice(0, 8)}</span>
                          <div className="flex items-center gap-1 text-[10px] text-zinc-600">
                            <Calendar className="h-3 w-3" />
                            {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                          </div>
                        </td>
                        <td className="p-4 text-white font-medium">
                          {order.seller.displayName || `@${order.seller.username}`}
                        </td>
                        <td className="p-4 max-w-xs truncate text-zinc-300">
                          {tracks}
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                            order.status === "COMPLETED" || order.status === "PAID" ? "bg-emerald-500/10 text-emerald-400" :
                            order.status === "PENDING_PAYMENT" ? "bg-amber-500/10 text-amber-400" :
                            order.status === "PAYMENT_SUBMITTED" ? "bg-blue-500/10 text-blue-400" : "bg-red-500/10 text-red-400"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Link 
                            href={`/orders/${order.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.05] text-[10px] text-zinc-400 group-hover:text-white group-hover:bg-red-600 group-hover:border-transparent transition-all"
                          >
                            В чат
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  )
}