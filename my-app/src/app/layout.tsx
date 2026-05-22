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
      <body className={`${inter.className} bg-[#070709] text-white antialiased max-w-full overflow-x-hidden w-full min-h-screen`}>
          <Providers>
            <AppShell>
              {children}
            </AppShell>
          </Providers>
      </body>
    </html>
  )
}