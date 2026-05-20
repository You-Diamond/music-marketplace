import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus, Music, BarChart2, Eye, EyeOff, Trash2, Sliders } from "lucide-react"

export default async function StudioTracksPage() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "PRODUCER") redirect("/")

  // Получаем треки автора с подсчетом лайков
  const tracks = await prisma.track.findMany({
    where: { producerId: session.user.id },
    include: {
      genre: { select: { name: true } },
      _count: { select: { likes: true } }
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <div className="space-y-6">
      {/* Верхняя панель действий */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.04] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Мои Треки</h1>
          <p className="text-zinc-500 text-xs mt-1">Управляйте своим каталогом битов, стоимостью и приватностью.</p>
        </div>
        
        <Link
          href="/studio/tracks/new"
          className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(220,38,38,0.15)] shrink-0"
        >
          <Plus className="h-4 w-4" /> Загрузить бит
        </Link>
      </div>

      {/* Если треков еще нет */}
      {tracks.length === 0 ? (
        <div className="p-16 border border-white/[0.04] bg-[#0c0d12]/20 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-white/[0.01] border border-white/[0.05] flex items-center justify-center text-zinc-600">
            <Music className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400">Каталог пуст</h3>
            <p className="text-[11px] text-zinc-500 max-w-xs leading-normal">
              Вы еще не загрузили ни одного трека. Нажмите кнопку выше, чтобы выставить свой первый бит на продажу.
            </p>
          </div>
        </div>
      ) : (
        /* Список треков */
        <div className="grid grid-cols-1 gap-3">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-[#0c0d12]/30 backdrop-blur-md border border-white/[0.04] rounded-2xl gap-4 hover:border-white/[0.08] transition-all group"
            >
              {/* Левая часть: Инфо о треке */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-12 w-12 rounded-xl bg-zinc-800 overflow-hidden shrink-0 relative flex items-center justify-center border border-white/[0.05]">
                  {track.image ? (
                    <img src={track.image} alt={track.title} className="w-full h-full object-cover" />
                  ) : (
                    <Music className="h-5 w-5 text-zinc-600" />
                  )}
                </div>
                
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white truncate">{track.title}</h3>
                    {!track.isActive && (
                      <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[8px] font-mono text-zinc-500 uppercase">
                        Скрыт
                      </span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-mono text-zinc-500">
                    <span className="text-purple-400">{track.genre.name}</span>
                    <span>•</span>
                    <span>{track.bpm} BPM</span>
                    <span>•</span>
                    <span className="text-amber-500">{track.musicKey}</span>
                  </div>
                </div>
              </div>

              {/* Средняя часть: Статистика трека */}
              <div className="flex items-center gap-6 md:mx-auto shrink-0 border-t border-b border-white/[0.02] md:border-none py-2 md:py-0">
                <div className="text-center md:text-left">
                  <span className="block text-[9px] font-mono text-zinc-600 uppercase tracking-wider">Прослушивания</span>
                  <span className="text-xs font-bold text-zinc-300 font-mono">{track.plays}</span>
                </div>
                <div className="text-center md:text-left">
                  <span className="block text-[9px] font-mono text-zinc-600 uppercase tracking-wider">Скачивания</span>
                  <span className="text-xs font-bold text-zinc-300 font-mono">{track.downloads}</span>
                </div>
                <div className="text-center md:text-left">
                  <span className="block text-[9px] font-mono text-zinc-600 uppercase tracking-wider">Лайки</span>
                  <span className="text-xs font-bold text-zinc-300 font-mono">{track._count.likes}</span>
                </div>
              </div>

              {/* Правая часть: Управление */}
              <div className="flex items-center justify-end gap-2 shrink-0">
                <Link
                  href={`/studio/tracks/${track.id}/edit`}
                  className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-all"
                  title="Редактировать"
                >
                  <Sliders className="h-4 w-4" />
                </Link>

                {/* Кнопки переключения видимости и удаления мы сделаем интерактивными на следующем шаге */}
                <button
                  className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-all"
                  title={track.isActive ? "Скрыть с сайта" : "Показать на сайте"}
                >
                  {track.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-zinc-600" />}
                </button>

                <button
                  className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] text-zinc-500 hover:text-red-400 hover:bg-red-500/5 hover:border-red-500/10 transition-all"
                  title="Удалить трек"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}