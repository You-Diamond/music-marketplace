"use client"

import AppHeader from "./AppHeader"
import AppFooter from "./AppFooter"
import MobileBottomNav from "./MobileBottomNav"
import AppSidebar from "./AppSidebar"
import { UIProvider } from "@/context/UIContext"
import { CartProvider } from "@/context/CartContext" // Импортируем провайдер корзины

interface AppShellProps {
  children: React.ReactNode
}

function ShellContent({ children }: AppShellProps) {
  return (
    <div className="relative z-10 flex min-h-screen flex-col w-full overflow-x-hidden">
      <AppHeader />
      
      {/* Сайдбар теперь накладывается поверх как стеклянный виджет */}
      <AppSidebar />
      
      {/* ИСПРАВЛЕНО: Никаких сдвигов интерфейса, разметка всегда стабильна (w-full) */}
      <main className="flex-1 w-full flex flex-col z-10">
        {children}
      </main>

      <AppFooter />
    </div>
  )
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <UIProvider>
      <CartProvider> {/* Оборачиваем здесь */}
        <div className="relative min-h-screen bg-[#07080b] text-zinc-300 font-sans antialiased selection:bg-white/10 selection:text-white max-w-full overflow-x-hidden">
          {/* Жидкий бэкграунд */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff02_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none z-0" />
          <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[140px] pointer-events-none z-0 animate-[pulse_8s_infinite]" />
          <div className="absolute bottom-[10%] right-1/4 w-[600px] h-[600px] bg-blue-600/4 rounded-full blur-[160px] pointer-events-none z-0 animate-[pulse_10s_infinite]" />
          
          <ShellContent>{children}</ShellContent>
            
          <MobileBottomNav />
        </div>
      </CartProvider>
    </UIProvider>
  )
}