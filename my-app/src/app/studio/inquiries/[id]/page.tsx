import prisma from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { notFound, redirect } from "next/navigation"
import OrderChatContainer from "@/components/studio/OrderChatContainer"

// Типизируем params как Promise
interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SellerInquiryPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== "PRODUCER") redirect("/")

  // Ожидаем разрешение параметров
  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id: id }, // Теперь id гарантированно строка
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

  if (!order || order.sellerId !== session.user.id) notFound()

  return (
    <div className="w-full">
      <OrderChatContainer 
        order={order} 
        currentUserId={session.user.id} 
        isSeller={true} 
      />
    </div>
  )
}