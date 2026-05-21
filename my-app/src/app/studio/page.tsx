import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Music, MessageSquare, Users, Disc, ShieldCheck } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function StudioDashboard() {
  const session = await auth()
  
  // ИСПРАВЛЕНО: Строгий Guard для защиты роута студии от гостей и обычных юзеров
  if (!session?.user?.id || session.user.role !== "PRODUCER") redirect("/")
  
  // Получаем данные для аналитики
  const stats = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: {
          tracks: true,
          receivedInquiries: true,
          followers: true
        }
      }
    }
  })

  return (
    <div className="space-y-8 relative z-10">
      {/* Приветственный блок с неоновым акцентом */}
      <div className="flex items-center justify-between border-b border-white/[0.04] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Рабочее пространство</h1>
            <span className="px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[8px] font-mono text-red-400 uppercase tracking-widest animate-pulse">
              Studio Mode
            </span>
          </div>
          <p className="text-zinc-500 text-xs mt-1">
            Добро пожаловать, <span className="text-zinc-300 font-semibold">{session.user.username || "Продюсер"}</span>. Управляйте своим цифровым каталогом и сделками.
          </p>
        </div>
        <div className="h-9 w-9 rounded-xl bg-purple-500/5 border border-purple-500/10 flex items-center justify-center text-purple-400">
          <Disc className="h-4 w-4 animate-[spin_8s_linear_infinite]" />
        </div>
      </div>

      {/* Сетка карточек аналитики в едином стиле AURA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Карточка 1: Треки */}
        <div className="p-5 rounded-2xl bg-[#0c0d12]/40 border border-white/[0.04] backdrop-blur-md flex items-center justify-between group hover:border-white/[0.08] transition-all">
          <div className="space-y-1">
            <h3 className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider">Всего треков в каталоге</h3>
            <p className="text-3xl font-bold font-mono text-white tracking-tight">{stats?._count.tracks || 0}</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 transition-transform group-hover:scale-105">
            <Music className="h-5 w-5" />
          </div>
        </div>

        {/* Карточка 2: Запросы */}
        <div className="p-5 rounded-2xl bg-[#0c0d12]/40 border border-white/[0.04] backdrop-blur-md flex items-center justify-between group hover:border-white/[0.08] transition-all">
          <div className="space-y-1">
            <h3 className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider">Входящие P2P запросы</h3>
            <p className="text-3xl font-bold font-mono text-white tracking-tight">{stats?._count.receivedInquiries || 0}</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 transition-transform group-hover:scale-105">
            <MessageSquare className="h-5 w-5" />
          </div>
        </div>

        {/* Карточка 3: Подписчики */}
        <div className="p-5 rounded-2xl bg-[#0c0d12]/40 border border-white/[0.04] backdrop-blur-md flex items-center justify-between group hover:border-white/[0.08] transition-all">
          <div className="space-y-1">
            <h3 className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider">Постоянные подписчики</h3>
            <p className="text-3xl font-bold font-mono text-white tracking-tight">{stats?._count.followers || 0}</p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 transition-transform group-hover:scale-105">
            <Users className="h-5 w-5" />
          </div>
        </div>

      </div>
    </div>
  )
}