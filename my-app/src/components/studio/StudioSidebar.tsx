"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Music, MessageSquare, Package, Settings, ChevronLeft } from "lucide-react"

export default function StudioSidebar() {
  const pathname = usePathname()

  const menu = [
    { name: "Обзор", href: "/studio", icon: LayoutDashboard },
    { name: "Мои треки", href: "/studio/tracks", icon: Music },
    { name: "Запросы", href: "/studio/inquiries", icon: MessageSquare },
    { name: "Сэмплы", href: "/studio/soundpacks", icon: Package },
    { name: "Настройки", href: "/studio/settings", icon: Settings },
  ]

  return (
    <aside className="w-64 bg-[#07080b] border-r border-white/[0.06] p-6 flex flex-col hidden md:flex">
      <Link href="/" className="mb-8 flex items-center text-zinc-400 hover:text-white transition-colors">
        <ChevronLeft className="h-4 w-4 mr-2" /> Назад на сайт
      </Link>

      <nav className="space-y-2 flex-1">
        {menu.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive 
                  ? "bg-white/[0.05] text-white border border-white/[0.1]" 
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]"
              }`}
            >
              <item.icon className="h-4 w-4" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}