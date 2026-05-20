import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import OrderChatContainer from "@/components/studio/OrderChatContainer"

// Обновляем тип пропсов: params теперь Promise
interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BuyerOrderPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  // Ожидаем разрешение параметров
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id: id },
    include: {
      items: { 
        include: { 
          track: true, 
          license: { include: { template: true } } 
        } 
      },
      messages: { orderBy: { createdAt: "asc" } }
    }
  })

  // Если ордер не найден или текущий пользователь не покупатель
  if (!order || order.buyerId !== session.user.id) notFound()

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
      <OrderChatContainer 
        order={order} 
        currentUserId={session.user.id} 
        isSeller={false} 
      />
    </div>
  )
}