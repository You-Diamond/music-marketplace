"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, Search, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import clsx from "clsx"
import { sidebarNavigation } from "@/config/navigation"

type Props = {
  onSearchOpen: () => void
  onSidebarToggle: () => void
}

export default function AppHeader({ onSearchOpen, onSidebarToggle }: Props) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  const isLoggedIn = true 
  const currentUsername = "vision"

  return (
    /* ЭФФЕКТ СТЕКЛА ДЛЯ ШАПКИ: Используем ультра-прозрачность и матовое размытие */
    <header className="sticky top-0 z-40 border-b border-white/20 dark:border-white/5 bg-white/40 dark:bg-white/[0.02] backdrop-blur-xl transition-colors duration-200">
      <div className="flex h-20 items-center justify-between px-6 lg:px-8">
        
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-xl font-black uppercase tracking-[0.25em] text-zinc-950 dark:text-white hover:text-brand-red dark:hover:text-brand-red transition-colors"
          >
            BEATSO
          </Link>

          <nav className="hidden xl:flex items-center gap-1">
            {sidebarNavigation.slice(0, 3).map((item) => {
              const Icon = item.icon
              const active = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={clsx(
                    "flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all",
                    /* Прозрачные подложки для активных пунктов навигации */
                    active
                      ? "bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-sm"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5"
                  )}
                >
                  <Icon size={14} className="mr-1" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}

          <button
            onClick={onSearchOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition"
          >
            <Search size={16} />
          </button>

          {isLoggedIn ? (
            <>
              <Link
                href="/notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition"
              >
                <Bell size={16} />
                <div className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-brand-red" />
              </Link>

              <button
                onClick={onSidebarToggle}
                className="flex items-center gap-2.5 rounded-xl border border-white/40 dark:border-white/5 bg-white/60 dark:bg-white/5 pl-3 pr-4 py-1.5 transition hover:bg-white/80 dark:hover:bg-white/10 text-left"
              >
                <div className="h-7 w-7 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="hidden md:block">
                  <p className="text-[7px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-bold">Studio</p>
                  <h3 className="text-[11px] font-black uppercase text-zinc-800 dark:text-zinc-200">{currentUsername}</h3>
                </div>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2" />
          )}
        </div>

      </div>
    </header>
  )
}