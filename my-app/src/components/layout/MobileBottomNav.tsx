"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import clsx from "clsx"
import { sidebarNavigation } from "@/config/navigation"

export default function MobileBottomNav() {
  const pathname = usePathname()

  return (
    /* Мобильный таббар: Перевод на концепцию Glassmorphism */
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/20 dark:border-white/5 bg-white/60 dark:bg-white/[0.02] backdrop-blur-xl xl:hidden text-zinc-950 dark:text-zinc-50 transition-colors duration-200">
      <div className="grid grid-cols-5 h-16">
        {sidebarNavigation.slice(0, 5).map((item) => {
          const Icon = item.icon
          const active = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex flex-col items-center justify-center gap-1 transition-colors relative",
                active ? "text-brand-red" : "text-zinc-400 dark:text-zinc-500 hover:text-zinc-900"
              )}
            >
              <Icon size={18} />
              <span className="text-[8px] font-bold uppercase tracking-wider">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}