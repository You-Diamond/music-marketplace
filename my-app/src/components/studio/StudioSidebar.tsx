"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Music, MessageSquare, Package, Settings, ChevronLeft, Menu, X } from "lucide-react"

export default function StudioSidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const menu = [
    { name: "Обзор", href: "/studio", icon: LayoutDashboard },
    { name: "Мои треки", href: "/studio/tracks", icon: Music },
    { name: "Запросы", href: "/studio/inquiries", icon: MessageSquare },
    { name: "Сэмплы", href: "/studio/soundpacks", icon: Package },
    { name: "Настройки", href: "/studio/settings", icon: Settings },
  ]

  const NavLinks = () => (
    <nav className="space-y-2 flex-1 w-full">
      {menu.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)} // Закрываем меню при клике на мобилке
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
  )

  return (
    <>
      {/* МОБИЛЬНАЯ ШАПКА */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#07080b]/90 backdrop-blur-md border-b border-white/[0.06] z-50 flex items-center justify-between px-4">
        <Link href="/" className="text-white font-bold text-sm tracking-widest uppercase">
          Aura Studio
        </Link>
        <button onClick={() => setIsOpen(!isOpen)} className="text-zinc-400 hover:text-white p-2">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* МОБИЛЬНОЕ МЕНЮ (Шторка) */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-[#07080b] z-40 p-4 border-t border-white/[0.02] flex flex-col">
          <Link href="/" className="mb-6 flex items-center text-zinc-400 hover:text-white transition-colors">
            <ChevronLeft className="h-4 w-4 mr-2" /> Назад на сайт
          </Link>
          <NavLinks />
        </div>
      )}

      {/* ДЕСКТОПНЫЙ САЙДБАР */}
      <aside className="w-64 bg-[#07080b] border-r border-white/[0.06] p-6 flex-col hidden md:flex min-h-screen sticky top-0">
        <Link href="/" className="mb-8 flex items-center text-zinc-400 hover:text-white transition-colors">
          <ChevronLeft className="h-4 w-4 mr-2" /> Назад на сайт
        </Link>
        <NavLinks />
      </aside>
    </>
  )
}