"use client"

import Link from "next/link"
import { useUI } from "@/context/UIContext"
import { 
  X, LayoutDashboard, Settings, LogOut, 
  User, CreditCard, FolderHeart, 
  MessageSquare, Sparkles, ShieldCheck, ShoppingBag 
} from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { usePathname } from "next/navigation"

export default function AppSidebar() {
  const { isSidebarOpen, closeSidebar } = useUI()
  const { data: session } = useSession()
  const pathname = usePathname()

  const isVerified = session?.user?.verified ?? false
  const subStatus = session?.user?.subscriptionStatus
  const isSubscribed = subStatus === "ACTIVE" || subStatus === "CANCELED"
  const isProducer = session?.user?.role === "PRODUCER" && isSubscribed;

  const personalMenu = [
    { name: "Мой аккаунт", href: "/profile", icon: User },
    { name: "Купленные", href: "/downloads", icon: ShoppingBag },
    { name: "Избранное", href: "/favorites", icon: FolderHeart },
  ]

  const businessMenu = [
    { name: "Студия / CRM", href: "/studio", icon: LayoutDashboard, primary: true },
    { name: "Запросы", href: "/inquiries", icon: MessageSquare },
    { name: "Биллинг", href: "/billing", icon: CreditCard },
  ]

  

  return (
    <>
      {/* Стекловидный оверлей */}
      <div 
        onClick={closeSidebar} 
        className={`fixed inset-0 z-45 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`} 
      />

      {/* Парящий стеклянный виджет */}
      <aside className={`fixed z-50 transition-all duration-500 ease-in-out
        /* Мобильные стили: аккуратная остекленная шторка */
        bottom-0 top-0 right-0 w-full sm:w-85 bg-[#07080b]/90 backdrop-blur-2xl p-4 sm:p-6 flex flex-col border-l border-white/[0.04]
        /* Десктопные стили: воздушный виджет */
        md:top-20 md:right-6 md:bottom-6 md:h-[calc(100vh-112px)] md:w-80 md:rounded-3xl md:border md:border-white/[0.06] md:shadow-[0_20px_50px_rgba(0,0,0,0.5)] md:bg-[#0c0d12]/60
        ${isSidebarOpen 
          ? "translate-x-0 opacity-100 scale-100" 
          : "translate-x-12 opacity-0 pointer-events-none md:scale-95"
        }
      `}>
        
        {/* Кнопка закрытия */}
        <button 
          onClick={closeSidebar} 
          className="absolute top-4 right-4 p-2 rounded-xl border border-white/[0.04] text-zinc-400 hover:text-white hover:bg-white/5 transition-all z-50"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex-1 flex flex-col justify-between overflow-y-auto pb-20 md:pb-0 scrollbar-none mt-10 space-y-5">
          {session && (
            <div className="space-y-5 flex-1">
              
              {/* ХЕДЕР ПРОФИЛЯ: Вертикальный на ПК / Компактный горизонтальный на мобильных */}
              <div className="flex flex-row md:flex-col items-center md:text-center p-3 md:p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04] relative overflow-hidden backdrop-blur-md gap-3 md:gap-0">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
                
                {/* Круглый аватар */}
                <div className={`relative h-11 w-11 md:h-14 md:w-14 rounded-full p-[2px] shrink-0 md:mb-3 ${
                  isSubscribed ? "bg-gradient-to-tr from-purple-500 via-pink-500 to-red-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]" : "bg-zinc-800"
                }`}>
                  <div className="w-full h-full rounded-full bg-[#07080b] flex items-center justify-center border border-white/5 font-black text-xs md:text-sm text-white select-none">
                    {session.user?.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  {isVerified && (
                    <div className="absolute bottom-0 right-0 bg-[#0c0d12] rounded-full p-0.5 border border-white/5 shadow-md">
                      <ShieldCheck className="h-3.5 w-3.5 text-blue-400 fill-blue-500/10" />
                    </div>
                  )}
                </div>

                {/* Текстовый блок юзера */}
                <div className="flex-1 min-w-0 text-left md:text-center">
                  <h3 className="text-xs font-bold text-white tracking-wide uppercase truncate">{session.user?.name}</h3>
                  <p className="text-[9px] text-zinc-500 truncate font-mono mt-0.5">{session.user?.email}</p>
                  
                  {/* Мобильный микро-статус подписки */}
                  {isSubscribed && (
                    <div className="inline-flex md:hidden items-center gap-1 mt-1 text-purple-400 text-[8px] font-black tracking-widest uppercase">
                      <Sparkles className="h-2 w-2 animate-pulse" /> PRO STATUS
                    </div>
                  )}
                </div>

                {/* Десктопный полноценный блок подписки (скрыт на мобилках) */}
                <div className="hidden md:block w-full mt-4 pt-3 border-t border-white/[0.04]">
                  {isSubscribed ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[8px] font-black tracking-widest uppercase shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                      <Sparkles className="h-2.5 w-2.5 animate-pulse" />
                      Aura Pro System Active
                    </div>
                  ) : (
                    <Link 
                      href="/premium" 
                      onClick={closeSidebar}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-zinc-400 hover:text-white hover:bg-white/[0.05] hover:border-white/10 transition-all text-[9px] font-bold tracking-wider uppercase w-full justify-center"
                    >
                      <Sparkles className="h-3 w-3 text-purple-400" />
                      Активировать PRO
                    </Link>
                  )}
                </div>
              </div>

              {/* Промо подписки для мобилок (показываем только если НЕТ подписки и только на мобилках) */}
              {!isSubscribed && (
                <Link 
                  href="/premium" 
                  onClick={closeSidebar}
                  className="flex md:hidden items-center justify-between p-3 rounded-xl bg-gradient-to-r from-purple-900/20 to-pink-900/10 border border-purple-500/20 text-white transition-all text-[10px] font-bold uppercase tracking-wider"
                >
                  <span className="flex items-center gap-2"><Sparkles className="h-3.5 w-3.5 text-purple-400" /> Стать участником PRO</span>
                  <span className="text-[8px] opacity-60">→</span>
                </Link>
              )}

              {/* МЕНЮ ЛИЧНОГО КАБИНЕТА: Сетка на мобилках / Список на ПК */}
              <div className="space-y-1.5">
                <p className="px-1 text-[9px] font-mono uppercase tracking-widest text-zinc-500 mb-1">// Личный кабинет</p>
                <div className="grid grid-cols-2 md:grid-cols-1 gap-1.5">
                  {personalMenu.map((item) => {
                    const active = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeSidebar}
                        className={`flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 rounded-xl p-3 md:px-3 md:py-2.5 text-[10px] md:text-xs font-mono uppercase tracking-wider transition-all ${
                          active 
                            ? "bg-white/[0.04] text-white border border-white/[0.08] backdrop-blur-md" 
                            : "bg-white/[0.01] border border-white/[0.02] md:bg-transparent md:border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]"
                        }`}
                      >
                        <item.icon className={`h-4 w-4 shrink-0 ${active ? "text-white" : "text-zinc-500"}`} />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>

                <div className="space-y-1.5 pt-1">
                  <p className="px-1 text-[9px] font-mono uppercase tracking-widest text-zinc-500 mb-1">
                    // {isProducer ? "Бизнес & Студия" : "Стать автором"}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-1 gap-1.5">
                    {isProducer ? (
                      // Показываем меню студии, если продюсер
                      businessMenu.map((item) => {
                        const active = pathname === item.href
                        return (
                          <Link key={item.href} href={item.href} onClick={closeSidebar} className="...">
                            {/* ... код ссылки ... */}
                          </Link>
                        )
                      })
                    ) : (
                      // Показываем кнопку "Стать автором", если нет
                      <Link
                        href="/premium"
                        onClick={closeSidebar}
                        className="col-span-2 md:col-span-1 flex items-center gap-3 rounded-xl p-3 bg-gradient-to-r from-purple-600/20 to-red-600/20 border border-purple-500/30 text-white text-xs font-bold uppercase tracking-wider transition-all hover:border-purple-500/50"
                      >
                        <Sparkles className="h-4 w-4 text-purple-400" />
                        <span>Открыть студию</span>
                      </Link>
                    )}
                  </div>
                </div>

            </div>
          )}

          {/* СИСТЕМНЫЙ БЛОК: Выстраиваем в ряд на мобилках ради экономии места */}
          {session && (
            <div className="border-t border-white/[0.04] pt-3 flex flex-row md:flex-col items-center gap-2">
              <Link 
                href="/settings" 
                onClick={closeSidebar} 
                className={`flex-1 flex items-center justify-center md:justify-start gap-2 rounded-xl p-2.5 md:px-3 text-[10px] md:text-xs font-mono uppercase tracking-wider transition-all bg-white/[0.01] md:bg-transparent border border-white/[0.02] md:border-transparent ${
                  pathname === "/settings" ? "text-white bg-white/[0.04]" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Settings className="h-3.5 w-3.5" /> <span className="md:inline">Настройки</span>
              </Link>
              
              <button 
                onClick={() => { closeSidebar(); signOut(); }} 
                className="flex-1 flex items-center justify-center md:justify-start gap-2 rounded-xl p-2.5 md:px-3 text-[10px] md:text-xs font-mono uppercase tracking-wider text-red-400 bg-red-500/5 md:bg-transparent md:hover:bg-red-500/5 transition-all"
              >
                <LogOut className="h-3.5 w-3.5" /> <span className="md:inline">Выйти</span>
              </button>
            </div>
          )}

        </div>
      </aside>
    </>
  )
}