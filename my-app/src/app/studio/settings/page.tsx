import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import SettingsFormClient from "@/components/studio/SettingsFormClient"

export default async function StudioSettingsPage() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "PRODUCER") redirect("/")

  // Запрашиваем актуальные данные пользователя
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      displayName: true,
      username: true,
      telegram: true,
      paymentDetails: true,
    },
  })

  if (!user) redirect("/")

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Настройки Студии</h1>
        <p className="text-zinc-500 text-xs mt-1">
          Укажите свои контактные данные и платежные реквизиты. Они будут автоматически отображаться покупателям в чате сделки для совершения P2P-переводов.
        </p>
      </div>

      <SettingsFormClient user={user} />
    </div>
  )
}