"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUI } from "@/context/UIContext" 
import { Home, Music, FolderHeart, User } from "lucide-react"

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { toggleSidebar } = useUI() 

  // Синхронизировали с актуальной структурой роутов приложения
  const navItems = [
    { name: "Главная", href: "/" },
    { name: "Биты", href: "/beats" },
    { name: "Любимое", href: "/favorites" },
    { name: "Профиль", href: "#profile" },
  ]

  const getIcon = (name: string, className: string) => {
    switch (name) {
      case "Главная": return <Home className={className} />
      case "Биты": return <Music className={className} /> // Поменяли иконку на Music
      case "Любимое": return <FolderHeart className={className} />
      case "Профиль": return <User className={className} />
      default: return null
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 z-40 w-[100vw] border-t border-white/[0.03] bg-[#0c0d12]/50 backdrop-blur-xl pb-safe md:hidden">
      <div className="mx-auto flex h-12 max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          const isProfileButton = item.href === "#profile"
          const active = pathname === item.href && !isProfileButton

          const buttonContent = (
            <div className={`flex flex-col items-center justify-center gap-0.5 w-full min-w-0 transition-all duration-300 ${
              active ? "text-white" : "text-zinc-500 hover:text-zinc-300"
            }`}>
              {getIcon(item.name, `h-3.5 w-3.5 shrink-0 transition-transform ${active ? "scale-110 text-white" : ""}`)}
              <span className="text-[8px] font-black uppercase tracking-wider truncate w-full text-center px-0.5">
                {item.name}
              </span>
            </div>
          )

          if (isProfileButton) {
            return (
              <button 
                key={item.name} 
                onClick={toggleSidebar} 
                className="flex-1 min-w-0 py-1 flex flex-col items-center justify-center focus:outline-none bg-transparent appearance-none border-none"
              >
                {buttonContent}
              </button>
            )
          }

          return (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex-1 min-w-0 py-1 flex flex-col items-center justify-center"
            >
              {buttonContent}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}