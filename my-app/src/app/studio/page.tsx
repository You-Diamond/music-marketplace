import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"

export default async function StudioDashboard() {
  const session = await auth()
  
  // Получаем данные для аналитики
  const stats = await prisma.user.findUnique({
    where: { id: session?.user?.id },
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Добро пожаловать в Студию</h1>
        <p className="text-zinc-500 text-sm mt-1">Управляйте своим контентом и заказами</p>
      </div>

      {/* Сетка карточек */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <h3 className="text-zinc-500 text-xs uppercase">Всего треков</h3>
          <p className="text-3xl font-bold text-white mt-2">{stats?._count.tracks || 0}</p>
        </div>
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <h3 className="text-zinc-500 text-xs uppercase">Новые запросы</h3>
          <p className="text-3xl font-bold text-white mt-2">{stats?._count.receivedInquiries || 0}</p>
        </div>
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
          <h3 className="text-zinc-500 text-xs uppercase">Подписчиков</h3>
          <p className="text-3xl font-bold text-white mt-2">{stats?._count.followers || 0}</p>
        </div>
      </div>
    </div>
  )
}