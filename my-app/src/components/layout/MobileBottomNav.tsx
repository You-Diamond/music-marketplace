"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUI } from "@/context/UIContext" 
import { Home, Radio, FolderHeart, User } from "lucide-react"

export default function MobileBottomNav() {
  const pathname = usePathname()
  const { toggleSidebar } = useUI() 

  const navItems = [
    { name: "Главная", href: "/" },
    { name: "Каталог", href: "/catalog" },
    { name: "Любимое", href: "/favorites" },
    { name: "Профиль", href: "#profile" },
  ]

  const getIcon = (name: string, className: string) => {
    switch (name) {
      case "Главная": return <Home className={className} />
      case "Каталог": return <Radio className={className} />
      case "Любимое": return <FolderHeart className={className} />
      case "Профиль": return <User className={className} />
      default: return null
    }
  }

  return (
    // ИСПРАВЛЕНО: Жидкое размытое матовое стекло для мобильного меню
    <nav className="fixed bottom-0 left-0 z-40 w-[100vw] border-t border-white/[0.03] bg-[#0c0d12]/50 backdrop-blur-xl pb-safe md:hidden">
      <div className="w-full max-w-md mx-auto px-2 h-14 flex items-center justify-between">
        {navItems.map((item) => {
          const isProfileButton = item.name === "Профиль"
          const active = pathname === item.href && !isProfileButton

          const buttonContent = (
            <div className={`flex flex-col items-center justify-center gap-1 w-full min-w-0 transition-all duration-300 ${
              active ? "text-white animate-[pulse_3s_infinite]" : "text-zinc-500 hover:text-zinc-300"
            }`}>
              {getIcon(item.name, `h-4 w-4 shrink-0 transition-transform ${active ? "scale-110" : ""}`)}
              <span className="text-[9px] font-black uppercase tracking-wider truncate w-full text-center px-0.5">
                {item.name}
              </span>
              {active && (
                <div className="h-[2px] w-[2px] rounded-full mt-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,1)]" />
              )}
            </div>
          )

          if (isProfileButton) {
            return (
              <button 
                key={item.name} 
                onClick={toggleSidebar} 
                className="flex-1 min-w-0 py-1 flex items-center justify-center focus:outline-none bg-transparent appearance-none border-none"
              >
                {buttonContent}
              </button>
            )
          }

          return (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex-1 min-w-0 py-1 flex items-center justify-center"
            >
              {buttonContent}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}