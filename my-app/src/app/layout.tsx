import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import AppShell from "@/components/layout/AppShell"
import Providers from "@/components/providers"

const inter = Inter({ subsets: ['latin', 'latin-ext'] as const });

export const metadata: Metadata = {
  title: "AURA",
  description: "Платформа прямого взаимодействия артистов и продюсеров",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // Добавляем жесткие ограничения на html, чтобы предотвратить горизонтальный зум/скролл
    <html lang="ru" className="max-w-full overflow-x-hidden scrollbar-none w-full">
      {/* 1. Убираем класс relative с body, чтобы он не служил опорной точкой для вылетающих элементов.
        2. Добавляем жесткий запрет overflow-x-hidden и w-full.
      */}
      <body className={`${inter.className} bg-[#070709] text-white antialiased max-w-full overflow-x-hidden w-full min-h-screen`}>
        
        {/* Создаем изолированный контейнер для фонового контента. 
          Именно сюда мы вешаем relative и overflow-hidden.
          Теперь любые вылеты картинок или анимаций будут намертво заперты внутри этого блока 
          и физически не смогут раздвинуть границы экрана телефона.
        */}
        <div className="relative min-h-screen w-full max-w-full overflow-hidden flex flex-col">
          {/* Деликатное фоновое ambient-свечение */}
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
          <div className="absolute top-[40%] right-1/4 w-[600px] h-[600px] bg-red-500/[0.03] rounded-full blur-[150px] pointer-events-none z-0" />
          <div className="absolute bottom-0 left-10 w-[400px] h-[400px] bg-blue-500/[0.03] rounded-full blur-[100px] pointer-events-none z-0" />

          <Providers>
            <AppShell>
              {children}
            </AppShell>
          </Providers>
        </div>

      </body>
    </html>
  )
}