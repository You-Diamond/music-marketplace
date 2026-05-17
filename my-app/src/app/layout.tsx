// src/app/layout.tsx
import type { Metadata } from "next"
import { ThemeProvider } from "@/providers/ThemeProvider"
import AppShell from "@/components/layout/AppShell"
import "./globals.css"

export const metadata: Metadata = {
  title: "BEATSO | Premium Music Marketplace",
  description: "Buy and license premium, industry-ready instrumentals from top global producers.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* 1. Переносим базовые стили фона на body.
        Светлая тема: bg-zinc-50 (мягкий белый) | Темная тема: #070708 (глубокий бархатный черный)
      */}
      <body className="relative min-h-screen w-full bg-zinc-50 dark:bg-[#070708] text-zinc-950 dark:text-zinc-50 transition-colors duration-300 overflow-x-hidden antialiased">
        
        <ThemeProvider>
          
          {/* ─── 2. ФОНОВЫЕ СФЕРЫ ДЛЯ ЭФФЕКТА ЖИДКОГО СТЕКЛА (Z-0) ─── */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            
            {/* Сфера 1: Фирменный красный градиент (вверху слева) с мягкой пульсацией */}
            <div 
              className="absolute top-[-8%] left-[-10%] md:left-[5%] w-[600px] h-[600px] rounded-full mix-blend-multiply filter blur-[140px] opacity-25 dark:opacity-[0.12] animate-pulse bg-gradient-to-tr from-brand-red to-rose-400" 
              style={{ animationDuration: '10s' }}
            />

            {/* Сфера 2: Глубокий неоновый индиго (ближе к центру справа для проявки карточек) */}
            <div 
              className="absolute top-[20%] right-[-10%] w-[700px] h-[700px] rounded-full mix-blend-multiply filter blur-[160px] opacity-20 dark:opacity-[0.10]"
              style={{
                background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, rgba(168,85,247,0) 70%)'
              }}
            />

            {/* Сфера 3: Мягкий янтарный свет в нижней части страницы */}
            <div 
              className="absolute bottom-[10%] left-[-5%] w-[550px] h-[550px] rounded-full mix-blend-multiply filter blur-[140px] opacity-[0.15] dark:opacity-[0.06]"
              style={{
                background: 'radial-gradient(circle, rgba(245,158,11,0.25) 0%, rgba(251,191,36,0) 75%)'
              }}
            />
          </div>

          {/* ─── 3. КОНТЕНТ ПРИЛОЖЕНИЯ (Z-10) ─── */}
          {/* Оборачиваем AppShell в относительный контейнер с z-10, чтобы он лег строго поверх сфер */}
          <div className="relative z-10">
            <AppShell>
              {children}
            </AppShell>
          </div>

        </ThemeProvider>
      </body>
    </html>
  )
}