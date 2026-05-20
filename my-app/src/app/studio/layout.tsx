import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import StudioSidebar from "@/components/studio/StudioSidebar" // Создай его отдельно

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  
  // Доступ только для авторизованных продюсеров
  if (!session?.user || session.user.role !== "PRODUCER") {
    redirect("/") 
  }

  return (
    <div className="flex min-h-screen bg-[#07080b]">
      {/* Специфичный сайдбар для студии */}
      <StudioSidebar /> 
      <main className="flex-1 p-4 md:p-10">
        {children}
      </main>
    </div>
  )
}