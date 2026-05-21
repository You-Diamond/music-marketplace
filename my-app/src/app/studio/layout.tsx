import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import StudioSidebar from "@/components/studio/StudioSidebar"

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== "PRODUCER") {
    redirect("/") 
  }

  return (
    <div className="flex min-h-screen bg-[#07080b]">
      {/* Клиентский сайдбар с мобильным меню */}
      <StudioSidebar /> 
      
      {/* pt-16 на мобильных устройствах, чтобы контент не залезал под фиксированную шапку */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden pt-20 md:pt-10 p-4 md:p-10">
        {children}
      </main>
    </div>
  )
}