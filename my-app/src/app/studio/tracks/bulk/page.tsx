import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import BulkUploadClient from "@/components/studio/BulkUploadClient"

export default async function StudioBulkUploadPage() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "PRODUCER") redirect("/")

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      <div className="flex items-center gap-4 border-b border-white/[0.04] pb-5">
        <Link
          href="/studio/tracks"
          className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] text-zinc-400 hover:text-white transition-all"
          title="Назад в каталог"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Пакетный импорт</h1>
          <p className="text-zinc-500 text-xs mt-0.5">
            Быстрая массовая заливка аудиоматериала для генерации каталога черновиков.
          </p>
        </div>
      </div>

      <BulkUploadClient />
    </div>
  )
}