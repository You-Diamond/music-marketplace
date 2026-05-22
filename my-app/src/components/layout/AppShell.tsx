"use client"

import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import AppHeader from "./AppHeader"
import AppFooter from "./AppFooter"
import MobileBottomNav from "./MobileBottomNav"
import AppSidebar from "./AppSidebar"
import { UIProvider } from "@/context/UIContext"
import { CartProvider } from "@/context/CartContext" 
import { Toaster } from "sonner"
import AudioPlayer from "../player/audio-player"

interface AppShellProps {
  children: React.ReactNode
}

function ShellContent({ children }: AppShellProps) {
  return (
    <div className="relative z-10 flex min-h-screen flex-col w-full overflow-x-hidden">
      <AppHeader />
      <AppSidebar />
      <main className="flex-1 w-full flex flex-col z-10">
        {children}
      </main>
      <Toaster position="bottom-center" richColors />
      <AudioPlayer />
      <AppFooter />
    </div>
  )
}

export default function AppShell({ children }: AppShellProps) {
  // Инициализируем QueryClient внутри React.useState, чтобы инстанс не пересоздавался при ререндерах
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // Кэш валиден 5 минут по умолчанию
            refetchOnWindowFocus: false, // Отключаем повторные тяжелые запросы при смене вкладок браузера
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <UIProvider>
        <CartProvider>
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
    </QueryClientProvider>
  )
}