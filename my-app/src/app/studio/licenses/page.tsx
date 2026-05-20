import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { seedDefaultTemplates } from "@/app/actions/licenses"
import LicenseCardForm from "@/components/studio/LicenseCardForm"
import { ShieldAlert, Scale } from "lucide-react"

export default async function StudioLicensesPage() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "PRODUCER") redirect("/")

  // Ищем шаблоны лицензий текущего продюсера
  let templates = await prisma.licenseTemplate.findMany({
    where: { producerId: session.user.id },
    orderBy: { defaultPrice: "asc" }
  })

  // Если у продюсера еще нет ни одного шаблона, генерируем базовый набор
  if (templates.length === 0) {
    await seedDefaultTemplates(session.user.id)
    templates = await prisma.licenseTemplate.findMany({
      where: { producerId: session.user.id },
      orderBy: { defaultPrice: "asc" }
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Лицензии и Контракты</h1>
        <p className="text-zinc-500 text-xs mt-1">
          Настройте типы соглашений, права и цены по умолчанию. Эти параметры будут автоматически генерировать юридический бланк при покупке ваших битов.
        </p>
      </div>

      <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 flex items-start gap-3 max-w-3xl">
        <Scale className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
        <p className="text-[11px] text-zinc-400 leading-relaxed">
          <strong className="text-purple-300">Важно:</strong> Изменения цен по умолчанию повлияют только на новые загружаемые треки. Права (лимиты стримов, копий) обновятся для всего каталога мгновенно. При изменении статуса сделки на «Оплачено», система генерирует контракт на основе данных параметров.
        </p>
      </div>

      {/* Сетка контрактов */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {templates.map((template) => (
          <LicenseCardForm key={template.id} template={template} />
        ))}
      </div>
    </div>
  )
}