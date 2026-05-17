"use client"

import { useState } from "react"
import AppSidebar from "./AppSidebar"
import AppHeader from "./AppHeader"
import MobileBottomNav from "./MobileBottomNav"
import AppFooter from "./AppFooter"
import GlobalSearchModal from "@/components/GlobalSearchModal"

export default function AppShell({
  children,
}: {
  children: React.ReactNode
}) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <>
      <div className="flex min-h-screen bg-transparent text-zinc-950 dark:text-zinc-50 antialiased selection:bg-brand-red selection:text-white">
        
        <div className="flex min-w-0 flex-1 flex-col relative">
          <AppHeader 
            onSearchOpen={() => setSearchOpen(true)} 
            onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          />

          {/* ИСПРАВЛЕНО: Добавлены классы p-0 m-0, чтобы исключить любые 
            внутренние/внешние отступы, которые могут прилетать из страниц.
            Теперь контент {children} (и наш баннер) встанет ровно в стык к AppHeader.
          */}
          <main className="flex-1 bg-transparent p-0 m-0 block">
            {children}
          </main>

          {/* Вставляем стеклянный футер строго внизу структуры */}
          <AppFooter />
        </div>

      </div>

      <AppSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />

      <MobileBottomNav />

      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  )
}