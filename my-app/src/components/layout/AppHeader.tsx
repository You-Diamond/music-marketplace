"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useUI } from "@/context/UIContext" 
import { useCart } from "@/context/CartContext"
import { ShieldCheck, ShoppingCart, Sparkles, Music, Disc, Radio } from "lucide-react"

export default function AppHeader() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const { toggleSidebar } = useUI() 
  
  // Извлекаем контекст корзины
  const cartContext = useCart()
  
  // Безопасное определение количества элементов в корзине
  const cartCount = 
    (cartContext as any).cartItems?.length || 
    (cartContext as any).cart?.length || 0

  // Соответствие со schema.prisma
  const isVerified = session?.user?.verified ?? false
  const subStatus = session?.user?.subscriptionStatus
  const isSubscribed = subStatus === "ACTIVE" || subStatus === "CANCELED"

  // Обновленные ссылки навигации с иконками согласно твоей структуре папок
  const navLinks = [
    { name: "Биты", href: "/beats", icon: Music },
    { name: "Сэмпл-паки", href: "/packs", icon: Disc },
    { name: "Плейлисты", href: "/playlists", icon: Radio },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.03] bg-[#0c0d12]/40 backdrop-blur-xl">
      {/* Тонкий неоновый градиент сверху */}
      <div className="w-full h-[1px] bg-gradient-to-r from-red-500/40 via-purple-500/40 to-blue-500/40" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 md:h-16 flex items-center justify-between">
        
        {/* Логотип и Название сайта */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-r from-red-500 via-purple-500 to-blue-500/40 text-black font-black text-xs tracking-tighter shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-transform group-hover:scale-105">
            <Radio className="h-4 w-4" />
          </div>
          <span className="font-black text-xs tracking-[0.3em] text-white uppercase block  ">
            AURA
          </span>
        </Link>

        {/* Десктопное меню навигации с иконками */}
        <nav className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const active = pathname === link.href
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 border ${
                  active 
                    ? "text-white bg-white/[0.04] border-white/[0.06] backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.02)]" 
                    : "text-zinc-400 border-transparent hover:text-zinc-200"
                }`}
              >
                <Icon className={`h-3 w-3 ${active ? "text-white" : "text-zinc-500"}`} />
                {link.name}
              </Link>
            )
          })}
        </nav>

        {/* Блок Функций, Корзины и Профиля */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* ИКОНКА КОРЗИНЫ */}
          <Link 
            href="/cart" 
            className={`relative flex h-8 w-8 items-center justify-center rounded-xl border transition-all ${
              pathname === "/cart" 
                ? "text-white border-white/10 bg-white/5 shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
                : "text-zinc-400 border-white/[0.04] bg-white/[0.01] hover:text-white hover:bg-white/5"
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-purple-500 px-1 text-[8px] font-black font-mono text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]">
                {cartCount}
              </span>
            )}
          </Link>

          {/* МАРКЕТИНГОВЫЙ СТА-ЭЛЕМЕНТ (PRO ТАРИФЫ) */}
          {session && !isSubscribed && (
            <Link 
              href="/premium" 
              className="hidden sm:flex items-center gap-1.5 h-8 px-3 rounded-xl bg-gradient-to-r from-purple-600/10 to-pink-600/10 border border-purple-500/20 text-purple-300 hover:text-white hover:border-purple-500/40 transition-all text-[9px] font-black tracking-widest uppercase shadow-[0_0_15px_rgba(168,85,247,0.05)] active:scale-95"
            >
              <Sparkles className="h-3 w-3 text-purple-400 animate-pulse" />
              PRO Тарифы
            </Link>
          )}

          {/* Блок Авторизации / Сайдбара */}
          {session ? (
            <div className="flex items-center gap-2">
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
                  
                  {/* Системная галочка верификации */}
                  {isVerified && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-[#07080b] rounded-full p-[1px] shadow-sm z-10">
                      <ShieldCheck className="h-3 w-3 text-blue-400 fill-blue-500/10" />
                    </div>
                  )}
                </div>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 sm:gap-4 text-[10px] font-bold tracking-widest uppercase">
              <Link href="/login" className="text-zinc-400 hover:text-white transition-colors">Вход</Link>
              <Link href="/register" className="h-8 px-4 rounded-xl bg-white text-black hover:bg-zinc-200 transition-all duration-200 flex items-center justify-center font-black">
                Регистрация
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  )
}