"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useUI } from "@/context/UIContext" 
import { ShieldCheck } from "lucide-react"

export default function AppHeader() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const { toggleSidebar } = useUI() 

  const isVerified = session?.user?.verified ?? false
  const subStatus = session?.user?.subscriptionStatus
  const isSubscribed = subStatus === "ACTIVE" || subStatus === "CANCELED"

  const navLinks = [
    { name: "Каталог", href: "/catalog" },
    { name: "Драм-киты", href: "/packs" },
    { name: "Плейлисты", href: "/playlists" },
  ]

  return (
    // ИСПРАВЛЕНО: Настоящее ультра-размытое жидкое стекло для шапки
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.03] bg-[#0c0d12]/40 backdrop-blur-xl">
      <div className="w-full h-[1px] bg-gradient-to-r from-red-500/40 via-purple-500/40 to-blue-500/40" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between">
        
        {/* Логотип */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-white text-black font-black text-xs tracking-tighter shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-transform group-hover:scale-105">
            A
          </div>
          <span className="font-black text-xs tracking-[0.3em] text-white uppercase hidden xs:block">
            AURA
          </span>
        </Link>

        {/* Десктопное меню */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  active 
                    ? "text-white bg-white/[0.04] border border-white/[0.06] backdrop-blur-md" 
                    : "text-zinc-400 hover:text-zinc-200 border border-transparent"
                }`}
              >
                {link.name}
              </Link>
            )
          })}
        </nav>

        {/* Блок Профиля */}
        <div className="flex items-center gap-4">
          {session ? (
            <button 
              onClick={toggleSidebar}
              className={`relative flex items-center justify-center rounded-full transition-all active:scale-95 p-[2px] ${
                isSubscribed 
                  ? "bg-gradient-to-tr from-purple-500 via-pink-500 to-red-500 shadow-[0_0_15px_rgba(168,85,247,0.25)] animate-[pulse_4s_infinite]" 
                  : "bg-transparent hover:bg-white/5"
              }`}
            >
              <div className={`relative h-7 w-7 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-900 flex items-center justify-center text-white font-black text-[10px] shadow-inner select-none ${
                !isSubscribed ? "border border-white/10" : ""
              }`}>
                {session.user?.name?.charAt(0).toUpperCase() || "U"}
                
                {isVerified && (
                  <div className="absolute -bottom-0.5 -right-0.5 bg-[#07080b] rounded-full p-[1px] shadow-sm z-10">
                    <ShieldCheck className="h-3 w-3 text-blue-400 fill-blue-500/10" />
                  </div>
                )}
              </div>
            </button>
          ) : (
            <div className="flex items-center gap-4 text-[10px] font-bold tracking-widest uppercase">
              <Link href="/login" className="text-zinc-400 hover:text-white transition-colors">Вход</Link>
              <Link href="/register" className="h-7 px-4 rounded-xl bg-white text-black hover:bg-zinc-200 transition-all duration-200 flex items-center justify-center font-black">
                Регистрация
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  )
}