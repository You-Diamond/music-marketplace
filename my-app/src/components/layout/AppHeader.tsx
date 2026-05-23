"use client"

import * as React from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useUI } from "@/context/UIContext" 
import { useCart } from "@/context/CartContext"
import { ShieldCheck, ShoppingCart, Sparkles, Music, Disc, Radio, Menu } from "lucide-react"

export default function AppHeader() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const { toggleSidebar } = useUI() 
  
  const cartContext = useCart()
  const cartCount = 
    (cartContext as any).cartItems?.length || 
    (cartContext as any).cart?.length || 0

  const isVerified = session?.user?.verified ?? false
  const subStatus = session?.user?.subscriptionStatus
  const isSubscribed = subStatus === "ACTIVE" || subStatus === "CANCELED"

  // Стейт для локальной фиксации изменения количества товаров (для триггера анимации)
  const [animateCart, setAnimateCart] = React.useState(false)

  React.useEffect(() => {
    if (cartCount > 0) {
      setAnimateCart(true)
      const timer = setTimeout(() => setAnimateCart(false), 600)
      return () => clearTimeout(timer)
    }
  }, [cartCount])

  const navLinks = [
    { name: "Биты", href: "/beats", icon: Music },
    { name: "Сэмпл-паки", href: "/packs", icon: Disc },
    { name: "Плейлисты", href: "/playlists", icon: Radio },
  ]

  return (
    <header className="sticky top-0 z-50 w-full bg-[#050608]/40 backdrop-blur-xl border-b border-white/[0.03] transition-all duration-300">
      <div className="max-w-[1400px] mx-auto h-16 px-6 sm:px-10 flex items-center justify-between gap-4">
        
        {/* ЛЕВАЯ ЧАСТЬ: МЕНЮ И ЛОГОТИП */}
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleSidebar}
            className="p-2 -ml-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 lg:hidden transition-colors"
          >
            <Menu size={18} />
          </button>

          <Link href="/" className="flex items-center gap-2.5 group select-none">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300">
              <Sparkles size={13} className="text-white fill-white/10 animate-pulse" />
            </div>
            <span className="text-sm font-black tracking-widest uppercase text-white font-mono">
              AU<span className="text-purple-400">RA</span>
            </span>
          </Link>
        </div>

        {/* ЦЕНТРАЛЬНАЯ ЧАСТЬ: НАВИГАЦИЯ */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-white/[0.02] border border-white/[0.03] p-1 rounded-1.5xl backdrop-blur-md">
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`h-8 px-4 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all duration-200 ${
                  isActive 
                    ? "bg-white/5 text-purple-400 shadow-inner border border-white/[0.03]" 
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.01]"
                }`}
              >
                <Icon size={12} className={isActive ? "text-purple-400" : "text-zinc-500"} />
                <span>{link.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* ПРАВАЯ ЧАСТЬ: КОРЗИНА И АККАУНТ */}
        <div className="flex items-center gap-4">
          
          {/* ИНТЕРАКТИВНАЯ КОРЗИНА */}
          <Link 
            href="/cart" 
            className={`h-9 px-3.5 rounded-xl border flex items-center justify-center relative transition-all group ${
              animateCart 
                ? "scale-110 border-purple-500 bg-purple-500/10 text-purple-400" 
                : "border-white/[0.05] bg-white/[0.02] text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <ShoppingCart size={15} className={`${animateCart ? "animate-bounce" : "group-hover:scale-105 transition-transform"}`} />
            
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-md bg-purple-600 text-white text-[9px] font-black font-mono flex items-center justify-center border border-[#050608] shadow-lg shadow-purple-950/50 animate-in zoom-in duration-200">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="h-4 w-[1px] bg-white/[0.06] hidden sm:block" />

          {/* ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ */}
          {session ? (
            <div className="flex items-center gap-3">
              <button 
                className={`p-[2px] rounded-full transition-all active:scale-95 ${
                  isSubscribed 
                    ? "bg-gradient-to-tr from-purple-500 via-indigo-500 to-pink-500 shadow-lg shadow-purple-500/10 animate-[pulse_4s_infinite]" 
                    : "bg-transparent hover:bg-white/5"
                }`}
              >
                <div className="relative h-7 w-7 rounded-full bg-gradient-to-tr from-zinc-900 to-zinc-950 flex items-center justify-center text-white font-black text-[10px] shadow-inner select-none border border-white/5">
                  {session.user?.name?.charAt(0).toUpperCase() || "U"}
                  
                  {isVerified && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-[#050608] rounded-full p-[0.5px] shadow-md z-10">
                      <ShieldCheck className="h-3 w-3 text-purple-400 fill-purple-500/10" />
                    </div>
                  )}
                </div>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4 text-[10px] font-black tracking-widest uppercase font-mono">
              <Link href="/login" className="text-zinc-400 hover:text-zinc-200 transition-colors">Вход</Link>
              <Link 
                href="/register" 
                className="h-8 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-md shadow-purple-900/20 transition-all active:scale-95"
              >
                Регистрация
              </Link>
            </div>
          )}

        </div>
      </div>
    </header>
  )
}